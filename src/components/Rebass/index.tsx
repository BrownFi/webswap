import styled from 'styled-components'

export type TextProps = React.HTMLAttributes<HTMLDivElement> & {
  fontWeight?: number | string
  fontSize?: number | string
  color?: string
  textAlign?: string
  padding?: string
  lineHeight?: string
  fontStyle?: string
  fontFamily?: string
  ml?: string | number
  mr?: string | number
  mb?: string | number
  mt?: string | number
  my?: string | number
  px?: string
  py?: string
  pt?: string | number
  pb?: string | number
  margin?: string
  marginRight?: string | number
  marginLeft?: string | number
  width?: string
  display?: string
  backgroundColor?: string
  opacity?: string | number
}

export const Text = styled.div<TextProps>`
  ${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight};`}
  ${({ fontSize }) => fontSize && `font-size: ${typeof fontSize === 'number' ? `${fontSize}px` : fontSize};`}
  ${({ color }) => color && `color: ${color};`}
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`}
  ${({ padding }) => padding && `padding: ${padding};`}
  ${({ lineHeight }) => lineHeight && `line-height: ${lineHeight};`}
  ${({ fontStyle }) => fontStyle && `font-style: ${fontStyle};`}
  ${({ fontFamily }) => fontFamily && `font-family: ${fontFamily};`}
  ${({ ml }) => ml !== undefined && `margin-left: ${typeof ml === 'number' ? `${ml}px` : ml};`}
  ${({ mr }) => mr !== undefined && `margin-right: ${typeof mr === 'number' ? `${mr}px` : mr};`}
  ${({ mb }) => mb !== undefined && `margin-bottom: ${typeof mb === 'number' ? `${mb}px` : mb};`}
  ${({ mt }) => mt !== undefined && `margin-top: ${typeof mt === 'number' ? `${mt}px` : mt};`}
  ${({ my }) => my !== undefined && `margin-top: ${typeof my === 'number' ? `${my}px` : my}; margin-bottom: ${typeof my === 'number' ? `${my}px` : my};`}
  ${({ px }) => px && `padding-left: ${px}; padding-right: ${px};`}
  ${({ py }) => py && `padding-top: ${py}; padding-right: ${py};`}
  ${({ pt }) => pt !== undefined && `padding-top: ${typeof pt === 'number' ? `${pt}px` : pt};`}
  ${({ pb }) => pb !== undefined && `padding-bottom: ${typeof pb === 'number' ? `${pb}px` : pb};`}
  ${({ margin }) => margin && `margin: ${margin};`}
  ${({ marginRight }) => marginRight !== undefined && `margin-right: ${typeof marginRight === 'number' ? `${marginRight}px` : marginRight};`}
  ${({ marginLeft }) => marginLeft !== undefined && `margin-left: ${typeof marginLeft === 'number' ? `${marginLeft}px` : marginLeft};`}
  ${({ width }) => width && `width: ${width};`}
  ${({ display }) => display && `display: ${display};`}
  ${({ backgroundColor }) => backgroundColor && `background-color: ${backgroundColor};`}
  ${({ opacity }) => opacity !== undefined && `opacity: ${opacity};`}
`

export type FlexProps = React.HTMLAttributes<HTMLDivElement> & {
  alignItems?: string
  justifyContent?: string
  flexDirection?: string
  flexWrap?: string
  gap?: string
  width?: string
  sx?: Record<string, string>
}

export const Flex = styled.div<FlexProps>`
  display: flex;
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
  ${({ flexDirection }) => flexDirection && `flex-direction: ${flexDirection};`}
  ${({ flexWrap }) => flexWrap && `flex-wrap: ${flexWrap};`}
  ${({ gap }) => gap && `gap: ${gap};`}
  ${({ width }) => width && `width: ${width};`}
  ${({ sx }) =>
    sx &&
    Object.entries(sx)
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ')}
`
