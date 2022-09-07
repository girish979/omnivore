/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import express from 'express'
import { CreateArticleErrorCode } from '../generated/graphql'
import { isSiteBlockedForParse } from '../utils/blocked'
import cors from 'cors'
import { buildLogger } from '../utils/logger'
import { corsConfig } from '../utils/corsConfig'
import { createPageSaveRequest } from '../services/create_page_save_request'
import { initModels } from '../server'
import { kx } from '../datalayer/knex_config'
import { getClaimsByToken } from '../utils/auth'
import * as jwt from 'jsonwebtoken'
import { env } from '../env'
import { Claims } from '../resolvers/types'
import { getRepository } from '../entity/utils'
import { Speech, SpeechState } from '../entity/speech'
import { getPageById, updatePage } from '../elastic/pages'
import { generateDownloadSignedUrl } from '../utils/uploads'
import { enqueueTextToSpeech } from '../utils/createTask'
import { createPubSubClient } from '../datalayer/pubsub'
import { htmlToSsmlItems, SSMLItem } from '@omnivore/text-to-speech-handler'
import { WordPunctTokenizer } from 'natural'
import { htmlToText } from 'html-to-text'

interface Utterance {
  wordOffset: number
  wordsCount: number
  voice?: string
  text: string
  idx: number
}

interface SSMLOutput {
  wordsCount: number
  averageWPM: number
  language: string
  defaultVoice: string
  utterances: Utterance[]
}

const logger = buildLogger('app.dispatch')
const WORDS_PER_MINUTE = 200

export function articleRouter() {
  const router = express.Router()

  router.options('/save', cors<express.Request>({ ...corsConfig, maxAge: 600 }))
  router.post('/save', cors<express.Request>(corsConfig), async (req, res) => {
    const { url } = req.body as {
      url?: string
    }

    const token = req?.cookies?.auth || req?.headers?.authorization
    const claims = await getClaimsByToken(token)
    if (!claims) {
      return res.status(401).send('UNAUTHORIZED')
    }

    const { uid } = claims

    logger.info('Article saving request', {
      body: req.body,
      labels: {
        source: 'SaveEndpoint',
        userId: uid,
      },
    })

    if (!url) {
      return res.status(400).send({ errorCode: 'BAD_DATA' })
    }

    const models = initModels(kx, false)
    const result = await createPageSaveRequest(uid, url, models)

    if (isSiteBlockedForParse(url)) {
      return res
        .status(400)
        .send({ errorCode: CreateArticleErrorCode.NotAllowedToParse })
    }

    if (result.errorCode) {
      return res.status(400).send({ errorCode: result.errorCode })
    }

    return res.send({
      articleSavingRequestId: result.id,
    })
  })

  router.get(
    '/:id/:outputFormat/:priority/:voice?',
    cors<express.Request>(corsConfig),
    async (req, res) => {
      const articleId = req.params.id
      const outputFormat = req.params.outputFormat
      const voice = req.params.voice || 'en-US-JennyNeural'
      const priority = req.params.priority
      if (
        !articleId ||
        !['mp3', 'speech-marks', 'ssml'].includes(outputFormat) ||
        !['low', 'high'].includes(priority)
      ) {
        return res.status(400).send('Invalid data')
      }
      const token = req.cookies?.auth || req.headers?.authorization
      if (!token || !jwt.verify(token, env.server.jwtSecret)) {
        return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
      }
      const { uid } = jwt.decode(token) as Claims
      logger.info(`Get article speech in ${outputFormat} format`, {
        params: req.params,
        labels: {
          userId: uid,
          source: `GetArticleSpeech-${outputFormat}`,
        },
      })

      if (outputFormat === 'ssml') {
        const page = await getPageById(articleId)
        if (!page) {
          return res.status(404).send('Page not found')
        }
        const ssmlItems = htmlToSsmlItems(page.content, {
          primaryVoice: voice,
          secondaryVoice: 'en-US-GuyNeural',
          rate: '1',
          language: page.language || 'en-US',
        })
        const [utterances, wordsCount] = ssmlItemsToUtterances(ssmlItems)
        const ssmlOutput: SSMLOutput = {
          wordsCount,
          averageWPM: WORDS_PER_MINUTE,
          language: page.language || 'en-US',
          defaultVoice: voice,
          utterances,
        }
        return res.send(ssmlOutput)
      }

      const existingSpeech = await getRepository(Speech).findOne({
        where: {
          elasticPageId: articleId,
          voice,
        },
        order: {
          createdAt: 'DESC',
        },
        relations: ['user'],
      })
      if (existingSpeech) {
        if (existingSpeech.user.id !== uid) {
          logger.info('User is not allowed to access speech of the article', {
            userId: uid,
            articleId,
          })
          return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
        }
        if (existingSpeech.state === SpeechState.COMPLETED) {
          logger.info('Found existing completed speech', {
            audioUrl: existingSpeech.audioFileName,
            speechMarksUrl: existingSpeech.speechMarksFileName,
          })
          await updatePage(
            existingSpeech.elasticPageId,
            {
              listenedAt: new Date(),
            },
            { uid, pubsub: createPubSubClient() }
          )
          return res.redirect(await redirectUrl(existingSpeech, outputFormat))
        }
        if (existingSpeech.state === SpeechState.INITIALIZED) {
          logger.info('Found existing in progress speech')
          // retry later
          return res.status(202).send('Speech is in progress')
        }
      }

      logger.info('Create Text to speech task', { articleId })
      const page = await getPageById(articleId)
      if (!page) {
        return res.status(404).send('Page not found')
      }
      // initialize state
      const speech = await getRepository(Speech).save({
        user: { id: uid },
        elasticPageId: articleId,
        state: SpeechState.INITIALIZED,
        voice,
      })
      // enqueue a task to convert text to speech
      const taskName = await enqueueTextToSpeech({
        userId: uid,
        speechId: speech.id,
        text: page.content,
        voice: speech.voice,
        priority: priority as 'low' | 'high',
      })
      logger.info('Start Text to speech task', { taskName })
      res.status(202).send('Text to speech task started')
    }
  )

  return router
}

const redirectUrl = async (speech: Speech, outputFormat: string) => {
  switch (outputFormat) {
    case 'mp3':
      return generateDownloadSignedUrl(speech.audioFileName)
    case 'speech-marks':
      return generateDownloadSignedUrl(speech.speechMarksFileName)
    default:
      return generateDownloadSignedUrl(speech.audioFileName)
  }
}

const ssmlItemsToUtterances = (items: SSMLItem[]): [Utterance[], number] => {
  const tokenizer = new WordPunctTokenizer()
  let wordOffset = 0
  return [
    items.map((item) => {
      const text = htmlToText(item.textItems.join(''), { wordwrap: false })
      const wordsCount = tokenizer.tokenize(text).length
      const utterance: Utterance = {
        wordOffset,
        wordsCount,
        text,
        voice: item.voice,
        idx: item.idx,
      }
      wordOffset += wordsCount
      return utterance
    }),
    wordOffset,
  ]
}
