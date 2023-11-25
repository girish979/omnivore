import { styled } from "../tokens/stitches.config"

export const Button = styled('button', {
  fontFamily: 'inter',
  fontSize: '$2',
  lineHeight: '1.25',
  color: '$grayText',
  variants: {
    style: {
      ctaYellow: {
        borderRadius: '$3',
        px: '$3',
        py: '$2',
        border: '1px solid $yellow3',
        bg: '$yellow3',
        '&:hover': {
          bg: '$yellow4',
          border: '1px solid $grayBorderHover',
        },
      },
      ctaDarkYellow: {
        border: '1px solid transparent',
        fontSize: '14px',
        fontWeight: 500,
        fontFamily: 'Inter',
        borderRadius: '5px',
        cursor: 'pointer',
        color: '#3D3D3D',
        bg: '#FFEA9F',
        p: '10px 15px',
        '&:hover, &:focus': {
          bg: '$omnivoreCtaYellow',
          outline: '1px solid $omnivoreCtaYellow',
        },
      },
      cancelGeneric: {
        fontSize: '13px',
        fontWeight: 500,
        fontFamily: 'Inter',
        cursor: 'pointer',
        color: '#6A6968',
        borderRadius: '5px',
        border: '1px solid transparent',
        p: '10px 15px',
        bg: 'transparent',
        '&:hover, &:focus': {
          bg: '#EBEBEB',
          outline: '1px solid $omnivoreCtaYellow',
        },
      },
      ctaOutlineYellow: {
        boxSizing: 'border-box',
        borderColor: 'unset',
        border: '1px solid $omnivoreCtaYellow',
        fontSize: '14px',
        fontWeight: 500,
        fontStyle: 'normal',
        fontFamily: 'Inter',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '$utilityTextDefault',
        bg: 'transparent',
        p: '9px 12px',
      },
      ctaLightGray: {
        border: 0,
        fontSize: '14px',
        fontWeight: 500,
        fontStyle: 'normal',
        fontFamily: 'Inter',
        borderRadius: '8px',
        cursor: 'pointer',
        p: '10px 12px',
        color: '$thTextContrast2',
        bg: 'rgb(125, 125, 125, 0.3)',
        '&:hover': {
          bg: 'rgb(47, 47, 47, 0.1)',
          '.ctaButtonIcon': {
            visibility: 'visible',
          },
        },
        '.ctaButtonIcon': {
          visibility: 'hidden',
        },
      },
      ctaGray: {
        border: 0,
        fontSize: '14px',
        fontWeight: 500,
        fontStyle: 'normal',
        fontFamily: 'Inter',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '$omnivoreGray',
        bg: '$grayBgActive',
        p: '10px 12px',
      },
      ctaWhite: {
        borderRadius: '$3',
        px: '$3',
        py: '$2',
        gap: '5px',
        cursor: 'pointer',
        border: '1px solid $grayBgSubtle',
        bg: '$grayBgSubtle',
        '&:hover': {
          border: '1px solid $grayBorderHover',
        },
      },
      outline: {
        display: 'flex',
        borderRadius: '5px',
        alignItems: 'center',
        px: '15px',
        py: '5px',
        gap: '10px',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: '$inter',
        cursor: 'pointer',
        border: '1px solid $thBorderColor',
        bg: 'transparent',
        '&:hover': {
          border: '1px solid $grayBorderHover',
        },
      },
      cancel: {
        display: 'flex',
        borderRadius: '5px',
        alignItems: 'center',
        px: '15px',
        py: '5px',
        gap: '10px',
        fontSize: '12px',
        fontWeight: '600',
        fontFamily: '$inter',
        cursor: 'pointer',
        bg: '$thBackground4',
        border: '1px solid $thBackground4',
        '&:hover': {
          border: '1px solid $grayBorderHover',
        },
      },
      modalOption: {
        style: 'ghost',
        height: '52px',
        width: '100%',
        textAlign: 'left',
        verticalAlign: 'middle',
        color: '#0A0806',
        backgroundColor: 'unset',
        outlineColor: 'rgba(0, 0, 0, 0)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        cursor: 'pointer',
      },
      ctaModal: {
        height: '32px',
        verticalAlign: 'middle',
        color: '$thTextContrast',
        backgroundColor: '$grayBase',
        fontWeight: '600',
        padding: '0px 12px',
        fontSize: '16px',
        border: '1px solid $grayBorder',
        cursor: 'pointer',
        borderRadius: '8px',
      },
      ctaSecondary: {
        color: '$grayText',
        border: 'none',
        bg: 'transparent',
        '&:hover': {
          opacity: 0.8,
        },
      },
      ctaPill: {
        cursor: 'pointer',
        borderRadius: '15px',
        px: '12px',
        py: '5px',
        font: '$inter',
        fontSize: '12px',
        fontWeight: '700',
        whiteSpace: 'nowrap',
        color: '$thLibraryMenuPrimary',
        border: '1px solid $thLeftMenuBackground',
        backgroundColor: '$thLeftMenuBackground',
        '&:hover': {
          bg: '$thBackgroundActive',
          border: '1px solid $thBackgroundActive',
        },
      },
      ctaPillUnselected: {
        cursor: 'pointer',
        borderRadius: '15px',
        px: '12px',
        py: '5px',
        font: '$inter',
        fontSize: '12px',
        fontWeight: 'medium',
        whiteSpace: 'nowrap',
        border: '1px solid $thBackground4',
        backgroundColor: '$thBackground4',
        '&:hover': {
          bg: '$thBackgroundActive',
          border: '1px solid $thBackgroundActive',
        },
      },
      link: {
        border: 'none',
        bg: 'transparent',
        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: '$thLibraryMenuUnselected',
        cursor: 'pointer',
      },
      squareIcon: {
        mx: '$1',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 500,
        height: 44,
        width: 44,
        justifyContent: 'center',
        textAlign: 'center',
        background: '$grayBase',
        cursor: 'pointer',
        border: 'none',
        borderRight: '1px solid $grayText',
        opacity: 0.9,
        '&:hover': {
          opacity: 1,
        },
      },
      plainIcon: {
        bg: 'transparent',
        border: 'none',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.7,
        },
      },
      highlightBarIcon: {
        p: '0px',
        lineHeight: '0px',
        bg: 'transparent',
        border: 'none',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.5,
        },
      },
      articleActionIcon: {
        bg: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '5px',

        '&:hover': {
          opacity: 0.7,
        },
      },
      hoverActionIcon: {
        bg: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        height: '100%',
        pt: '5px',
        minWidth: '25px',

        '&:hover': {
          bg: '$grayBgHover',
        },
      },
      ghost: {
        color: 'transparent',
        border: 'none',
        bg: 'transparent',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.8,
        },
      },
      themeSwitch: {
        p: '0px',
        m: '0px',
        ml: '0px',
        width: '60px',
        height: '48px',
        fontSize: '14px',
        border: 'unset',
        borderRadius: '6px',
        '&:hover': {
          transform: 'scale(1.1)',
          border: '2px solid #F9D354',
        },
        '&[data-state="selected"]': {
          border: '2px solid #F9D354',
        },
      },
    },
  },
  defaultVariants: {
    style: 'ctaWhite',
  },
})

export const IconButton = styled(Button, {
  variants: {
    style: {
      ctaWhite: {
        color: 'red',
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid $grayBorder',
        boxSizing: 'border-box',
        borderRadius: 6,
        width: 40,
        height: 40,
      },
      searchButton: {
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: '0px',
        mr: '5px',
        width: '28px',
        height: '28px',
        color: '#898989',
        border: 'unset',
        background: 'transparent',
        boxSizing: 'border-box',
        borderRadius: 6,
      },
    },
  },
})
