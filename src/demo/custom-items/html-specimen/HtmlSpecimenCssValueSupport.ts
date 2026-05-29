import { isHtmlSpecimenCssLengthUnit } from './HtmlSpecimenCssLengthValue'
import { isHtmlSpecimenCssNamedColor } from './HtmlSpecimenCssNamedColor'

const HTML_SPECIMEN_COLOR_CSS_PROPERTIES = new Set([
  'background',
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

const HTML_SPECIMEN_VALIDATED_CSS_PROPERTIES = new Set([
  ...HTML_SPECIMEN_COLOR_CSS_PROPERTIES,
  ...HTML_SPECIMEN_LENGTH_CSS_PROPERTIES,
  ...HTML_SPECIMEN_MARGIN_CSS_PROPERTIES,
])

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

export function shouldValidateHtmlSpecimenCssValue(property: string) {
  return HTML_SPECIMEN_VALIDATED_CSS_PROPERTIES.has(
    property.trim().toLowerCase(),
  )
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
    isSupportedRgbColorValue(value) ||
    isSupportedHslColorValue(value) ||
    /^(?:hwb|lab|lch|oklab|oklch|color)\s*\(.+\)$/.test(value) ||
    value === 'currentcolor' ||
    isHtmlSpecimenCssNamedColor(value) ||
    value === 'transparent'
}

function isSupportedRgbColorValue(value: string) {
  const match = /^rgba?\s*\((.+)\)$/.exec(value)

  if (!match) {
    return false
  }

  const components = splitCssColorFunctionComponents(match[1])

  return components !== null &&
    components.channels.length === 3 &&
    components.channels.every(isSupportedRgbChannel) &&
    (components.alpha === null || isSupportedAlphaValue(components.alpha))
}

function isSupportedHslColorValue(value: string) {
  const match = /^hsla?\s*\((.+)\)$/.exec(value)

  if (!match) {
    return false
  }

  const components = splitCssColorFunctionComponents(match[1])

  return components !== null &&
    components.channels.length === 3 &&
    isSupportedHueValue(components.channels[0]) &&
    isSupportedPercentageValue(components.channels[1]) &&
    isSupportedPercentageValue(components.channels[2]) &&
    (components.alpha === null || isSupportedAlphaValue(components.alpha))
}

function splitCssColorFunctionComponents(value: string) {
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

function isSupportedRgbChannel(value: string) {
  return value.endsWith('%')
    ? isSupportedPercentageValue(value)
    : isSupportedNumberRangeValue(value, 0, 255)
}

function isSupportedHueValue(value: string) {
  const match = /^([+-]?(?:\d+|\d*\.\d+))(deg|grad|rad|turn)?$/.exec(value)

  return match !== null
}

function isSupportedAlphaValue(value: string) {
  return value.endsWith('%')
    ? isSupportedPercentageValue(value)
    : isSupportedNumberRangeValue(value, 0, 1)
}

function isSupportedPercentageValue(value: string) {
  const match = /^([+-]?(?:\d+|\d*\.\d+))%$/.exec(value)

  return match !== null &&
    Number(match[1]) >= 0 &&
    Number(match[1]) <= 100
}

function isSupportedNumberRangeValue(
  value: string,
  min: number,
  max: number,
) {
  if (!/^[+-]?(?:\d+|\d*\.\d+)$/.test(value)) {
    return false
  }

  const numberValue = Number(value)

  return numberValue >= min && numberValue <= max
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
