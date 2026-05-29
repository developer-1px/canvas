import { isHtmlSpecimenCssLengthUnit } from './HtmlSpecimenCssLengthValue'

const HTML_SPECIMEN_COLOR_CSS_PROPERTIES = new Set([
  'background-color',
  'border-color',
  'color',
])

const HTML_SPECIMEN_LENGTH_CSS_PROPERTIES = new Set([
  'border-radius',
  'font-size',
  'padding',
])

const HTML_SPECIMEN_MARGIN_CSS_PROPERTIES = new Set(['margin'])

const HTML_SPECIMEN_CSS_WIDE_KEYWORDS = new Set([
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
])

const HTML_SPECIMEN_FONT_SIZE_KEYWORDS = new Set([
  'large',
  'larger',
  'medium',
  'small',
  'smaller',
  'x-large',
  'x-small',
  'xx-large',
  'xx-small',
])

export function isHtmlSpecimenCssSupportedValue({
  property,
  value,
}: {
  property: string
  value: string
}) {
  const normalizedProperty = property.trim().toLowerCase()
  const normalizedValue = value.trim()

  if (normalizedValue.length === 0) {
    return false
  }

  const browserSupported = getBrowserCssSupport(normalizedProperty, normalizedValue)

  if (browserSupported !== null) {
    return browserSupported
  }

  const lowerValue = normalizedValue.toLowerCase()

  if (HTML_SPECIMEN_CSS_WIDE_KEYWORDS.has(lowerValue) || isCssVarValue(lowerValue)) {
    return true
  }

  if (HTML_SPECIMEN_COLOR_CSS_PROPERTIES.has(normalizedProperty)) {
    return isSupportedColorValue(lowerValue)
  }

  if (normalizedProperty === 'font-size') {
    return HTML_SPECIMEN_FONT_SIZE_KEYWORDS.has(lowerValue) ||
      isSupportedLengthList(lowerValue, {
        allowAuto: false,
        allowNegative: false,
        maxValues: 1,
      })
  }

  if (HTML_SPECIMEN_LENGTH_CSS_PROPERTIES.has(normalizedProperty)) {
    return isSupportedLengthList(lowerValue, {
      allowAuto: false,
      allowNegative: false,
      maxValues: 4,
    })
  }

  if (HTML_SPECIMEN_MARGIN_CSS_PROPERTIES.has(normalizedProperty)) {
    return isSupportedLengthList(lowerValue, {
      allowAuto: true,
      allowNegative: true,
      maxValues: 4,
    })
  }

  return false
}

function getBrowserCssSupport(property: string, value: string) {
  const supports = globalThis.CSS?.supports

  return typeof supports === 'function'
    ? supports(property, value)
    : null
}

function isCssVarValue(value: string) {
  return /^var\(\s*--[a-z0-9_-]+(?:\s*,.+)?\)$/i.test(value)
}

function isSupportedColorValue(value: string) {
  return /^(?:#[0-9a-f]{3}|#[0-9a-f]{4}|#[0-9a-f]{6}|#[0-9a-f]{8})$/.test(value) ||
    /^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(.+\)$/.test(value) ||
    value === 'currentcolor' ||
    value === 'transparent'
}

function isSupportedLengthList(
  value: string,
  {
    allowAuto,
    allowNegative,
    maxValues,
  }: {
    allowAuto: boolean
    allowNegative: boolean
    maxValues: number
  },
) {
  if (/[(),/]/.test(value)) {
    return false
  }

  const parts = value.split(/\s+/)

  return parts.length > 0 &&
    parts.length <= maxValues &&
    parts.every((part) =>
      allowAuto && part === 'auto'
        ? true
        : isSupportedLengthValue(part, { allowNegative }))
}

function isSupportedLengthValue(
  value: string,
  { allowNegative }: { allowNegative: boolean },
) {
  const match = /^([+-]?(?:\d+|\d*\.\d+))([a-z%]*)$/.exec(value)

  if (!match) {
    return false
  }

  const numericValue = Number(match[1])
  const unit = match[2]

  if (!allowNegative && numericValue < 0) {
    return false
  }

  return numericValue === 0
    ? isHtmlSpecimenCssLengthUnit(unit)
    : unit.length > 0 && isHtmlSpecimenCssLengthUnit(unit)
}
