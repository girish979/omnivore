import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + '/./../env' })

interface BackendEnv {
  pg: {
    host: string
    port: number
    userName: string
    password: string
    dbName: string
    pool: {
      max: number
    }
  }
  apiKey: string
  openAiApiKey: string
  imageProxy: {
    url: string
    secretKey: string
  }
}

const envParser =
  (env: { [key: string]: string | undefined }) =>
  (varName: string): string => {
    const value = env[varName]
    if (typeof value === 'string' && value) {
      return value
    }

    throw new Error(
      `Missing ${varName} with a non-empty value in process environment`,
    )
  }

export function getEnv(): BackendEnv {
  // Dotenv parses env file merging into proces.env which is then read into custom struct here.
  dotenv.config({ path: __dirname + '/./../.env' })
  const parse = envParser(process.env)
  const pg = {
    host: parse('PG_HOST'),
    port: parseInt(parse('PG_PORT'), 10),
    userName: parse('PG_USER'),
    password: parse('PG_PASSWORD'),
    dbName: parse('PG_DB'),
    pool: {
      max: parseInt(parse('PG_POOL_MAX'), 10),
    },
  }

  return {
    pg,
    apiKey: parse('OMNIVORE_API_KEY'),
    openAiApiKey: parse('OPEN_AI_KEY'),
    imageProxy: {
      url: parse('IMAGE_PROXY_URL'),
      secretKey: parse('IMAGE_PROXY_SECRET'),
    },
  }
}

export const env = getEnv()
