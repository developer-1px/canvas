import {
  findCssDeclarationColon,
} from './HtmlSpecimenVisualCssDeclarations'
import {
  advanceCssScannerState,
  createCssScannerState,
  findMatchingCssParenthesis,
  isCssKeywordAt,
  isCssScannerTopLevel,
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'
import {
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import type { CssSupportsEvaluation } from './HtmlSpecimenVisualCssTypes'

export function matchesCssSupportsRule(atRule: string): CssSupportsEvaluation {
  return evaluateCssSupportsCondition(
    atRule.slice('@supports'.length).trim(),
  )
}

export function evaluateCssSupportsCondition(
  condition: string,
): CssSupportsEvaluation {
  const source = unwrapCssSupportsOuterParens(condition)

  if (source.length === 0) {
    return null
  }

  const orParts = splitCssSupportsConditionByOperator(source, 'or')

  if (orParts.length > 1) {
    let hasUnknown = false

    for (const part of orParts) {
      const result = evaluateCssSupportsCondition(part)

      if (result === true) {
        return true
      }

      hasUnknown = hasUnknown || result === null
    }

    return hasUnknown ? null : false
  }

  const andParts = splitCssSupportsConditionByOperator(source, 'and')

  if (andParts.length > 1) {
    let hasUnknown = false

    for (const part of andParts) {
      const result = evaluateCssSupportsCondition(part)

      if (result === false) {
        return false
      }

      hasUnknown = hasUnknown || result === null
    }

    return hasUnknown ? null : true
  }

  const notCondition = readCssSupportsNotCondition(source)

  if (notCondition !== null) {
    const result = evaluateCssSupportsCondition(notCondition)

    return result === null ? null : !result
  }

  const declaration = parseCssSupportsDeclaration(source)

  return declaration
    ? evaluateCssSupportsDeclaration(declaration)
    : null
}

export function unwrapCssSupportsOuterParens(condition: string) {
  let source = condition.trim()

  while (
    source.startsWith('(') &&
    findMatchingCssParenthesis(source, 0) === source.length - 1
  ) {
    source = source.slice(1, -1).trim()
  }

  return source
}

export function splitCssSupportsConditionByOperator(
  condition: string,
  operator: 'and' | 'or',
) {
  const parts: string[] = []
  const scanner = createCssScannerState()
  let start = 0
  let index = 0

  while (index < condition.length) {
    if (
      isCssScannerTopLevel(scanner) &&
      isCssKeywordAt(condition, index, operator)
    ) {
      parts.push(condition.slice(start, index).trim())
      index += operator.length
      start = index
      continue
    }

    index = advanceCssScannerState(condition, index, scanner)
  }

  parts.push(condition.slice(start).trim())

  return parts.filter((part) => part.length > 0)
}

export function readCssSupportsNotCondition(condition: string) {
  const source = condition.trim()

  return isCssKeywordAt(source, 0, 'not')
    ? source.slice('not'.length).trim()
    : null
}

export function parseCssSupportsDeclaration(condition: string) {
  const colonIndex = findCssDeclarationColon({
    css: condition,
    end: condition.length,
    start: 0,
  })

  if (colonIndex <= 0) {
    return null
  }

  const property = normalizeProperty(condition.slice(0, colonIndex))
  const value = stripCssComments(condition.slice(colonIndex + 1)).trim()

  return property.length > 0 && value.length > 0
    ? { property, value }
    : null
}

export function evaluateCssSupportsDeclaration({
  property,
  value,
}: {
  property: string
  value: string
}): CssSupportsEvaluation {
  const normalizedValue = value.trim().toLowerCase()

  switch (property) {
    case 'display':
      return new Set([
        'block',
        'contents',
        'flex',
        'flow-root',
        'grid',
        'inline',
        'inline-block',
        'inline-flex',
        'inline-grid',
        'none',
      ]).has(normalizedValue)
    default:
      return null
  }
}
