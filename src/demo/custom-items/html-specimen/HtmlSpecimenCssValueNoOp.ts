import { isHtmlSpecimenCssLengthUnit } from './HtmlSpecimenCssLengthValue'

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

  return normalizeHtmlSpecimenHexColor(normalizedValue) ??
    normalizeHtmlSpecimenRgbColor(normalizedValue)
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
  if (!value || !/^\d+$/.test(value)) {
    return null
  }

  const channel = Number(value)

  return Number.isInteger(channel) && channel >= 0 && channel <= 255
    ? channel
    : null
}

function parseHtmlSpecimenCssAlphaChannel(value: string) {
  if (!/^(?:0|1|0?\.\d+)$/.test(value)) {
    return null
  }

  const alpha = Number(value)

  return alpha >= 0 && alpha <= 1
    ? Math.round(alpha * 255)
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
