import {
  compareHtmlSpecimenCssSpecificity,
} from './HtmlSpecimenCssSelectorMatcher'
import type {
  CssCascadeLayer,
  CssDeclaration,
} from './HtmlSpecimenVisualCssTypes'

export function compareCssSource(
  left: {
    declarationIndex: number
    important?: boolean
    layer?: CssCascadeLayer | null
    ruleIndex: number
    specificity: [number, number, number]
  },
  right: {
    declarationIndex: number
    important?: boolean
    layer?: CssCascadeLayer | null
    ruleIndex: number
    specificity: [number, number, number]
  },
) {
  const important = Boolean(left.important)

  if (important !== Boolean(right.important)) {
    return important ? 1 : -1
  }

  const layer = compareCssCascadeLayerPrecedence(left, right, important)

  if (layer !== 0) {
    return layer
  }

  const specificity = compareHtmlSpecimenCssSpecificity(
    left.specificity,
    right.specificity,
  )

  if (specificity !== 0) {
    return specificity
  }

  if (left.ruleIndex !== right.ruleIndex) {
    return left.ruleIndex - right.ruleIndex
  }

  return left.declarationIndex - right.declarationIndex
}

export function compareCssCascadeLayerPrecedence(
  left: { layer?: CssCascadeLayer | null },
  right: { layer?: CssCascadeLayer | null },
  important: boolean,
) {
  const leftLayer = left.layer ?? null
  const rightLayer = right.layer ?? null

  if (leftLayer === null && rightLayer === null) {
    return 0
  }

  if (leftLayer === null || rightLayer === null) {
    if (important) {
      return leftLayer === null ? -1 : 1
    }

    return leftLayer === null ? 1 : -1
  }

  if (leftLayer.order === rightLayer.order) {
    return 0
  }

  return important
    ? rightLayer.order - leftLayer.order
    : leftLayer.order - rightLayer.order
}

export function compareCssInlineDeclaration(
  left: CssDeclaration,
  right: CssDeclaration,
) {
  if (left.important !== right.important) {
    return left.important ? 1 : -1
  }

  return left.declarationIndex - right.declarationIndex
}
