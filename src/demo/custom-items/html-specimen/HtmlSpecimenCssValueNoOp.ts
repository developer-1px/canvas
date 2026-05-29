import { isHtmlSpecimenCssLengthUnit } from './HtmlSpecimenCssLengthValue'
import { getHtmlSpecimenCssNamedColor } from './HtmlSpecimenCssNamedColor'

const HTML_SPECIMEN_COLOR_CSS_PROPERTIES = new Set([
  'background-color',
  'border-color',
  'color',
])

const HTML_SPECIMEN_ZERO_LENGTH_CSS_PROPERTIES = new Set([
  'border-radius',
  'font-size',
  'margin',
  'padding',
])

export function isHtmlSpecimenCssComputedValueNoOp({
  computedValue,
  property,
  value,
}: {
  computedValue: string | undefined
  property: string
  value: string
}) {
  const normalizedProperty = property.trim().toLowerCase()
  const normalizedComputedValue = computedValue?.trim()
  const normalizedValue = value.trim()

  if (normalizedComputedValue === undefined) {
    return false
  }

  if (normalizedComputedValue === normalizedValue) {
    return true
  }

  if (isHtmlSpecimenCssColorProperty(normalizedProperty)) {
    const computedColor = normalizeHtmlSpecimenCssColor(normalizedComputedValue)

    return computedColor !== null &&
      computedColor === normalizeHtmlSpecimenCssColor(normalizedValue)
  }

  if (isHtmlSpecimenCssZeroLengthProperty(normalizedProperty)) {
    const computedLength = normalizeHtmlSpecimenCssZeroLengthList(
      normalizedComputedValue,
    )

    return computedLength !== null &&
      computedLength === normalizeHtmlSpecimenCssZeroLengthList(normalizedValue)
  }

  return false
}

function isHtmlSpecimenCssColorProperty(property: string) {
  return HTML_SPECIMEN_COLOR_CSS_PROPERTIES.has(property)
}

function isHtmlSpecimenCssZeroLengthProperty(property: string) {
  return HTML_SPECIMEN_ZERO_LENGTH_CSS_PROPERTIES.has(property)
}

function normalizeHtmlSpecimenCssColor(value: string) {
  const normalizedValue = value.trim().toLowerCase()

  if (normalizedValue === 'transparent') {
    return formatHtmlSpecimenCssColor(0, 0, 0, 0)
  }

  const namedColor = getHtmlSpecimenCssNamedColor(normalizedValue)

  if (namedColor) {
    return formatHtmlSpecimenCssColor(...namedColor)
  }

  return normalizeHtmlSpecimenHexColor(normalizedValue) ??
    normalizeHtmlSpecimenRgbColor(normalizedValue) ??
    normalizeHtmlSpecimenHslColor(normalizedValue)
}

function normalizeHtmlSpecimenHexColor(value: string) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(value)

  if (!match) {
    return null
  }

  let hex = match[1]

  if (hex.length === 3 || hex.length === 4) {
    hex = hex.split('').map((part) => part + part).join('')
  }

  return formatHtmlSpecimenCssColor(
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
    hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) : 255,
  )
}

function normalizeHtmlSpecimenRgbColor(value: string) {
  const match = /^rgba?\((.+)\)$/.exec(value)

  if (!match) {
    return null
  }

  const components = match[1].includes(',')
    ? match[1].split(',').map((part) => part.trim())
    : match[1].split('/').flatMap((part) => part.trim().split(/\s+/))

  if (components.length !== 3 && components.length !== 4) {
    return null
  }

  const red = parseHtmlSpecimenCssRgbChannel(components[0])
  const green = parseHtmlSpecimenCssRgbChannel(components[1])
  const blue = parseHtmlSpecimenCssRgbChannel(components[2])
  const alpha = components[3]
    ? parseHtmlSpecimenCssAlphaChannel(components[3])
    : 255

  if (red === null || green === null || blue === null || alpha === null) {
    return null
  }

  return formatHtmlSpecimenCssColor(red, green, blue, alpha)
}

function parseHtmlSpecimenCssRgbChannel(value: string | undefined) {
  if (!value) {
    return null
  }

  if (value.endsWith('%')) {
    const percentage = parseHtmlSpecimenCssPercentage(value)

    return percentage === null
      ? null
      : Math.round(percentage * 255)
  }

  if (!/^\d+$/.test(value)) {
    return null
  }

  const channel = Number(value)

  return Number.isInteger(channel) && channel >= 0 && channel <= 255
    ? channel
    : null
}

function parseHtmlSpecimenCssAlphaChannel(value: string) {
  if (value.endsWith('%')) {
    const percentage = parseHtmlSpecimenCssPercentage(value)

    return percentage === null
      ? null
      : Math.round(percentage * 255)
  }

  if (!/^(?:0|1|0?\.\d+)$/.test(value)) {
    return null
  }

  const alpha = Number(value)

  return alpha >= 0 && alpha <= 1
    ? Math.round(alpha * 255)
    : null
}

function normalizeHtmlSpecimenHslColor(value: string) {
  const match = /^hsla?\((.+)\)$/.exec(value)

  if (!match) {
    return null
  }

  const components = splitHtmlSpecimenCssColorFunctionComponents(match[1])

  if (components === null || components.channels.length !== 3) {
    return null
  }

  const hue = parseHtmlSpecimenCssHue(components.channels[0])
  const saturation = parseHtmlSpecimenCssPercentage(components.channels[1])
  const lightness = parseHtmlSpecimenCssPercentage(components.channels[2])
  const alpha = components.alpha === null
    ? 255
    : parseHtmlSpecimenCssAlphaChannel(components.alpha)

  if (hue === null || saturation === null || lightness === null || alpha === null) {
    return null
  }

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const huePrime = hue / 60
  const second = chroma * (1 - Math.abs(huePrime % 2 - 1))
  const matchValue = lightness - chroma / 2
  const [red, green, blue] = getHtmlSpecimenHslPrimeRgb({
    chroma,
    huePrime,
    second,
  })

  return formatHtmlSpecimenCssColor(
    Math.round((red + matchValue) * 255),
    Math.round((green + matchValue) * 255),
    Math.round((blue + matchValue) * 255),
    alpha,
  )
}

function splitHtmlSpecimenCssColorFunctionComponents(value: string) {
  const normalizedValue = value.trim()

  if (normalizedValue.length === 0) {
    return null
  }

  if (normalizedValue.includes(',')) {
    const parts = normalizedValue.split(',').map((part) => part.trim())

    return parts.length === 3 || parts.length === 4
      ? {
          alpha: parts[3] ?? null,
          channels: parts.slice(0, 3),
        }
      : null
  }

  const slashParts = normalizedValue.split('/').map((part) => part.trim())

  if (slashParts.length > 2) {
    return null
  }

  return {
    alpha: slashParts[1] ?? null,
    channels: slashParts[0].split(/\s+/).filter(Boolean),
  }
}

function parseHtmlSpecimenCssHue(value: string | undefined) {
  if (!value) {
    return null
  }

  const match = /^([+-]?(?:\d+|\d*\.\d+))(deg|grad|rad|turn)?$/.exec(value)

  if (!match) {
    return null
  }

  const hue = Number(match[1])
  const unit = match[2] ?? 'deg'
  const degrees = unit === 'turn'
    ? hue * 360
    : unit === 'rad'
      ? hue * 180 / Math.PI
      : unit === 'grad'
        ? hue * 0.9
        : hue

  return ((degrees % 360) + 360) % 360
}

function getHtmlSpecimenHslPrimeRgb({
  chroma,
  huePrime,
  second,
}: {
  chroma: number
  huePrime: number
  second: number
}) {
  if (huePrime < 1) {
    return [chroma, second, 0]
  }

  if (huePrime < 2) {
    return [second, chroma, 0]
  }

  if (huePrime < 3) {
    return [0, chroma, second]
  }

  if (huePrime < 4) {
    return [0, second, chroma]
  }

  if (huePrime < 5) {
    return [second, 0, chroma]
  }

  return [chroma, 0, second]
}

function parseHtmlSpecimenCssPercentage(value: string) {
  const match = /^(\d+|\d*\.\d+)%$/.exec(value)

  if (!match) {
    return null
  }

  const percentage = Number(match[1])

  return percentage >= 0 && percentage <= 100
    ? percentage / 100
    : null
}

function normalizeHtmlSpecimenCssZeroLengthList(value: string) {
  const normalizedValue = value.trim().toLowerCase()

  if (normalizedValue.length === 0 || /[(),/]/.test(normalizedValue)) {
    return null
  }

  return normalizedValue
    .split(/\s+/)
    .map(normalizeHtmlSpecimenCssZeroLengthToken)
    .join(' ')
}

function normalizeHtmlSpecimenCssZeroLengthToken(value: string) {
  const match = /^([+-]?(?:\d+|\d*\.\d+))([a-z%]*)$/.exec(value)

  if (!match) {
    return value
  }

  const unit = match[2]

  return Number(match[1]) === 0 && isHtmlSpecimenCssLengthUnit(unit)
    ? '0'
    : value
}

function formatHtmlSpecimenCssColor(
  red: number,
  green: number,
  blue: number,
  alpha: number,
) {
  return `${red},${green},${blue},${alpha}`
}
