import {
  advanceCssScannerState,
  createCssScannerState,
  findMatchingCssParenthesis,
  isCssScannerTopLevel,
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'
import type { HtmlSpecimenCssMediaContext } from './HtmlSpecimenVisualCssTypes'

export function splitCssMediaQueryList(queryList: string) {
  const queries: string[] = []
  const scanner = createCssScannerState()
  let start = 0
  let index = 0

  while (index < queryList.length) {
    if (queryList[index] === ',' && isCssScannerTopLevel(scanner)) {
      queries.push(queryList.slice(start, index).trim())
      start = index + 1
      index += 1
      continue
    }

    index = advanceCssScannerState(queryList, index, scanner)
  }

  queries.push(queryList.slice(start).trim())

  return queries.filter((query) => query.length > 0)
}

export function matchesCssMediaQuery(
  query: string,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  let source = query.trim().toLowerCase()
  let negated = false

  if (source.startsWith('not ')) {
    negated = true
    source = source.slice('not '.length).trim()
  }

  if (source.startsWith('only ')) {
    source = source.slice('only '.length).trim()
  }

  let active = matchesCssMediaType(source)

  for (const feature of readCssMediaFeatureExpressions(source)) {
    const result = matchesCssMediaFeatureExpression(feature, mediaContext)

    if (result === null) {
      active = false
      break
    }

    active = active && result
  }

  return negated ? !active : active
}

export function matchesCssMediaType(query: string) {
  const beforeFeature = query.split('(')[0]
  const mediaTypes = beforeFeature
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) =>
      token.length > 0 &&
      token !== 'and' &&
      token !== 'not' &&
      token !== 'only')

  if (mediaTypes.length === 0) {
    return true
  }

  return mediaTypes.some((mediaType) =>
    mediaType === 'all' || mediaType === 'screen')
}

export function parseCssMediaLengthPx(value: string | undefined, unit: string) {
  const parsed = Number.parseFloat(value ?? '0')

  return unit === 'em' || unit === 'rem' ? parsed * 16 : parsed
}

export function readCssMediaFeatureExpressions(source: string) {
  const features: string[] = []
  let index = 0

  while (index < source.length) {
    if (source[index] !== '(') {
      index += 1
      continue
    }

    const end = findMatchingCssParenthesis(source, index)

    if (end < 0) {
      return ['']
    }

    features.push(source.slice(index + 1, end).trim())
    index = end + 1
  }

  return features
}

export function matchesCssMediaFeatureExpression(
  feature: string,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  const source = stripCssComments(feature).trim().toLowerCase()

  if (source.length === 0) {
    return null
  }

  const legacyRange = source.match(
    /^(min|max)-(width|height)\s*:\s*([0-9]*\.?[0-9]+)(px|rem|em)?$/,
  )

  if (legacyRange) {
    const [, range, axis, rawValue, unit = 'px'] = legacyRange
    const actual = getCssMediaAxisValue(axis, mediaContext)
    const expected = parseCssMediaLengthPx(rawValue, unit)

    return range === 'min'
      ? actual >= expected
      : actual <= expected
  }

  const exactFeature = source.match(
    /^(width|height)\s*:\s*([0-9]*\.?[0-9]+)(px|rem|em)?$/,
  )

  if (exactFeature) {
    const [, axis, rawValue, unit = 'px'] = exactFeature

    return getCssMediaAxisValue(axis, mediaContext) ===
      parseCssMediaLengthPx(rawValue, unit)
  }

  const orientation = source.match(/^orientation\s*:\s*(landscape|portrait)$/)

  if (orientation) {
    const actual = mediaContext.viewportWidth >= mediaContext.viewportHeight
      ? 'landscape'
      : 'portrait'

    return orientation[1] === actual
  }

  return matchesCssMediaRangeExpression(source, mediaContext)
}

export function matchesCssMediaRangeExpression(
  source: string,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  const operator = '(<=|>=|<|>|=)'
  const length = '([0-9]*\\.?[0-9]+)(px|rem|em)?'
  const axis = '(width|height)'
  const axisFirst = source.match(new RegExp(
    `^${axis}\\s*${operator}\\s*${length}$`,
  ))

  if (axisFirst) {
    const [, rawAxis, rawOperator, rawValue, unit = 'px'] = axisFirst

    return compareCssMediaRangeValue(
      getCssMediaAxisValue(rawAxis, mediaContext),
      rawOperator,
      parseCssMediaLengthPx(rawValue, unit),
    )
  }

  const lengthFirst = source.match(new RegExp(
    `^${length}\\s*${operator}\\s*${axis}$`,
  ))

  if (lengthFirst) {
    const [, rawValue, unit = 'px', rawOperator, rawAxis] = lengthFirst

    return compareCssMediaRangeValue(
      parseCssMediaLengthPx(rawValue, unit),
      rawOperator,
      getCssMediaAxisValue(rawAxis, mediaContext),
    )
  }

  const chained = source.match(new RegExp(
    `^${length}\\s*${operator}\\s*${axis}\\s*${operator}\\s*${length}$`,
  ))

  if (chained) {
    const [
      ,
      rawLeft,
      leftUnit = 'px',
      leftOperator,
      rawAxis,
      rightOperator,
      rawRight,
      rightUnit = 'px',
    ] = chained
    const actual = getCssMediaAxisValue(rawAxis, mediaContext)

    return compareCssMediaRangeValue(
      parseCssMediaLengthPx(rawLeft, leftUnit),
      leftOperator,
      actual,
    ) &&
      compareCssMediaRangeValue(
        actual,
        rightOperator,
        parseCssMediaLengthPx(rawRight, rightUnit),
      )
  }

  return null
}

export function getCssMediaAxisValue(
  axis: string | undefined,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  return axis === 'height'
    ? mediaContext.viewportHeight
    : mediaContext.viewportWidth
}

export function compareCssMediaRangeValue(
  left: number,
  operator: string | undefined,
  right: number,
) {
  switch (operator) {
    case '<':
      return left < right
    case '<=':
      return left <= right
    case '>':
      return left > right
    case '>=':
      return left >= right
    case '=':
      return left === right
    default:
      return false
  }
}
