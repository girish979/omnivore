import { HStack, VStack, SpanBox, Box } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { styled, theme, ThemeId } from '../../tokens/stitches.config'
import { ArrowsHorizontal, ArrowsInLineHorizontal, Check } from 'phosphor-react'
import { TickedRangeSlider } from '../../elements/TickedRangeSlider'
import { showSuccessToast } from '../../../lib/toastHelpers'
import {
  ReaderSettings,
  useReaderSettings,
} from '../../../lib/hooks/useReaderSettings'
import { useCallback, useMemo, useState } from 'react'
import { currentThemeName, updateTheme } from '../../../lib/themeUpdater'
import { LineHeightIncreaseIcon } from '../../elements/images/LineHeightIncreaseIconProps'
import { LineHeightDecreaseIcon } from '../../elements/images/LineHeightDecreaseIcon'

type ReaderSettingsProps = {
  readerSettings: ReaderSettings
}

const HorizontalDivider = styled(SpanBox, {
  width: '100%',
  height: '1px',
  background: `${theme.colors.grayLine.toString()}`,
})

const FONT_FAMILIES = [
  'Inter',
  'System Default',
  'Merriweather',
  'Lora',
  'Open Sans',
  'Roboto',
  'Crimson Text',
  'OpenDyslexic',
  'Source Serif Pro',
]

export function ReaderSettingsControl(props: ReaderSettingsProps): JSX.Element {
  return (
    <VStack css={{ width: '100%' }}>
      <FontControls readerSettings={props.readerSettings} />

      <HorizontalDivider />

      <LayoutControls readerSettings={props.readerSettings} />

      <HorizontalDivider />

      <ThemeSelector {...props} />

      <HorizontalDivider />

      <HStack distribution="start" css={{ width: '100%', p: '20px' }}>
        <Button
          style="plainIcon"
          css={{
            p: '0px',
            display: 'flex',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'SF Pro Display',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
          onClick={() => {
            props.readerSettings.setFontFamily('Inter')
            props.readerSettings.setMarginWidth(290)
            props.readerSettings.setLineHeight(150)
            props.readerSettings.actionHandler('resetReaderSettings')
            showSuccessToast('Display settings reset', {
              position: 'bottom-right',
            })
          }}
        >
          Reset
        </Button>
      </HStack>
    </VStack>
  )
}

type FontControlsProps = {
  readerSettings: ReaderSettings
}

function FontControls(props: FontControlsProps): JSX.Element {
  const FontSelect = styled('select', {
    pl: '5px',
    height: '30px',
    minWidth: '100px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    background: '#FFFFFF',
    border: '1px sold #E1E1E1',
    fontFamily: props.readerSettings.fontFamily,
    textTransform: 'capitalize',
    borderRadius: '4px',
  })

  const handleFontSizeChange = useCallback(
    (value) => {
      props.readerSettings.actionHandler('setFontSize', value)
    },
    [props.readerSettings.actionHandler]
  )

  return (
    <VStack css={{ width: '100%', pb: '20px' }}>
      <HStack
        distribution="start"
        alignment="start"
        css={{ width: '100%', p: '20px', pb: '10px' }}
      >
        <StyledText style="displaySettingsLabel">Font</StyledText>
        <FontSelect
          css={{ marginLeft: 'auto' }}
          defaultValue={props.readerSettings.fontFamily}
          onChange={(e: React.FormEvent<HTMLSelectElement>) => {
            const font = e.currentTarget.value
            if (FONT_FAMILIES.indexOf(font) < 0) {
              return
            }
            props.readerSettings.setFontFamily(font)
          }}
        >
          {FONT_FAMILIES.map((family) => (
            <option key={`font-${family}`} value={family}>
              {family}
            </option>
          ))}
        </FontSelect>
      </HStack>
      <HStack
        css={{ px: '10px', width: '100%' }}
        distribution="start"
        alignment="center"
      >
        <SpanBox
          css={{
            fontFamily: 'SF Pro Display',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '20px',
            lineHeight: '20px',
            textAlign: 'center',
            color: '#969696',
            width: '50px',
            pr: '5px',
            pb: '5px',
          }}
        >
          a
        </SpanBox>
        <TickedRangeSlider
          min={10}
          max={34}
          step={2}
          value={props.readerSettings.fontSize}
          onChange={handleFontSizeChange}
        />
        <SpanBox
          css={{
            fontFamily: 'SF Pro Display',
            fontStyle: 'normal',
            fontWeight: '400',
            fontSize: '20px',
            lineHeight: '20px',

            textAlign: 'center',

            color: '#969696',
            width: '60px',
          }}
        >
          A
        </SpanBox>
      </HStack>
    </VStack>
  )
}

type LayoutControlsProps = {
  readerSettings: ReaderSettings
}

function LayoutControls(props: LayoutControlsProps): JSX.Element {
  const handleMarginWidthChange = useCallback(
    (value) => {
      props.readerSettings.setMarginWidth(value)
    },
    [props.readerSettings.actionHandler, props.readerSettings.setMarginWidth]
  )

  return (
    <>
      <VStack
        css={{
          m: '0px',
          px: '0px',
          pb: '10px',
          width: '100%',
          height: '100%',
        }}
      >
        <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
          Margin
        </StyledText>
        <HStack
          distribution="between"
          css={{
            width: '100%',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newMarginWith = Math.max(
                props.readerSettings.marginWidth - 45,
                200
              )
              props.readerSettings.setMarginWidth(newMarginWith)
            }}
          >
            <ArrowsHorizontal size={24} color="#969696" />
          </Button>
          <TickedRangeSlider
            min={200}
            max={560}
            step={45}
            value={props.readerSettings.marginWidth}
            onChange={handleMarginWidthChange}
          />
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newMarginWith = Math.min(
                props.readerSettings.marginWidth + 45,
                560
              )
              props.readerSettings.setMarginWidth(newMarginWith)
            }}
          >
            <ArrowsInLineHorizontal size={24} color="#969696" />
          </Button>
        </HStack>
      </VStack>

      <VStack
        css={{
          m: '0px',
          px: '0px',
          pb: '20px',
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <StyledText style="displaySettingsLabel" css={{ pl: '20px' }}>
          Line Height
        </StyledText>
        <HStack
          distribution="between"
          css={{
            width: '100%',
            alignItems: 'center',
            alignSelf: 'center',
          }}
        >
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newLineHeight = Math.max(
                props.readerSettings.lineHeight - 25,
                100
              )
              props.readerSettings.setLineHeight(newLineHeight)
            }}
          >
            <LineHeightDecreaseIcon
              strokeColor={theme.colors.readerFont.toString()}
            />
          </Button>
          <TickedRangeSlider
            min={100}
            max={300}
            step={25}
            value={props.readerSettings.lineHeight}
            onChange={(value) => {
              props.readerSettings.setLineHeight(value)
            }}
          />
          <Button
            style="plainIcon"
            css={{ py: '0px', width: '60px' }}
            onClick={() => {
              const newLineHeight = Math.min(
                props.readerSettings.lineHeight + 25,
                300
              )
              props.readerSettings.setLineHeight(newLineHeight)
            }}
          >
            <LineHeightIncreaseIcon
              strokeColor={theme.colors.readerFont.toString()}
            />
          </Button>
        </HStack>
      </VStack>
    </>
  )
}

function ThemeSelector(props: ReaderSettingsProps): JSX.Element {
  const [currentTheme, setCurrentTheme] = useState(currentThemeName())

  const isDark = useMemo(() => {
    return currentTheme === 'Dark' || currentTheme === 'Darker'
  }, [currentTheme])

  return (
    <VStack
      css={{
        px: '20px',
        m: '0px',
        pb: '10px',
        width: '100%',
        height: '100%',
      }}
    >
      <StyledText style="displaySettingsLabel">Themes</StyledText>
      <HStack
        distribution="start"
        css={{
          gap: '16px',
          pl: '5px',
        }}
      >
        <Button
          style="themeSwitch"
          css={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            background: '#F5F5F5',
            borderRadius: '50%',
            border: 'unset',
            '&:hover': {
              transform: 'scale(1.1)',
              border: '2px solid #6A6968',
            },
            '&[data-state="selected"]': {
              border: '2px solid #6A6968',
            },
          }}
          data-state={isDark ? 'unselected' : 'selected'}
          onClick={() => {
            updateTheme(ThemeId.Light)
            setCurrentTheme(currentThemeName())
          }}
        >
          {!isDark && <Check color="#6A6968" size={15} weight="bold" />}
        </Button>
        <Button
          style="themeSwitch"
          css={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            background: '#3B3938',
            borderRadius: '50%',
            border: 'unset',
            '&:hover': {
              transform: 'scale(1.1)',
              border: '2px solid #6A6968',
            },
            '&[data-state="selected"]': {
              border: '2px solid #6A6968',
            },
          }}
          data-state={isDark ? 'selected' : 'unselected'}
          onClick={() => {
            updateTheme(ThemeId.Dark)
            setCurrentTheme(currentThemeName())
          }}
        >
          {isDark && <Check color="#F9D354" size={20} />}
        </Button>
      </HStack>
    </VStack>
  )
}
