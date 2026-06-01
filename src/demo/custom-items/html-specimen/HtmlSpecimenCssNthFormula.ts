import type {
  CssNthFormula,
} from './HtmlSpecimenCssSelectorTypes'

export function parseCssNthFormula(source: string): CssNthFormula | null {
  const formula = source.toLowerCase().replace(/\s+/g, '')

  if (formula.length === 0) {
    return null
  }

  if (formula === 'odd') {
    return { a: 2, b: 1 }
  }

  if (formula === 'even') {
    return { a: 2, b: 0 }
  }

  if (/^[+-]?\d+$/.test(formula)) {
    return { a: 0, b: Number(formula) }
  }

  const match = /^([+-]?\d*)n([+-]\d+)?$/.exec(formula)

  if (!match) {
    return null
  }

  const coefficient = match[1] ?? ''
  const a = coefficient === '' || coefficient === '+'
    ? 1
    : coefficient === '-'
      ? -1
      : Number(coefficient)
  const b = match[2] ? Number(match[2]) : 0

  return Number.isSafeInteger(a) && Number.isSafeInteger(b)
    ? { a, b }
    : null
}

export function matchesCssNthFormula(
  position: number | null,
  formula: CssNthFormula,
) {
  if (position === null || position < 1) {
    return false
  }

  if (formula.a === 0) {
    return position === formula.b
  }

  const step = (position - formula.b) / formula.a

  return Number.isInteger(step) && step >= 0
}
