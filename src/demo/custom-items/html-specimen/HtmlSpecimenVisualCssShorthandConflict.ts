import {
  compareCssSource,
} from './HtmlSpecimenVisualCssCascade'
import {
  resolveHtmlSpecimenCssDeclarationSource,
} from './HtmlSpecimenVisualCssDeclarationSource'
import {
  CSS_WIDE_KEYWORDS,
  getCssShorthandConflictProperties,
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'
import type {
  HtmlSpecimenCssDeclarationSource,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function resolveHtmlSpecimenCssShorthandConflictSource({
  css,
  mediaContext,
  nodeId,
  nodes,
  property,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  nodeId: string
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): HtmlSpecimenCssDeclarationSource | null {
  const shorthandSource = resolveHtmlSpecimenCssDeclarationSource({
    css,
    mediaContext,
    nodeId,
    nodes,
    property,
  })
  let winner: HtmlSpecimenCssDeclarationSource | null = null

  if (isComplexBackgroundShorthandColorSource({
    property,
    source: shorthandSource,
  })) {
    winner = shorthandSource
  }

  for (const candidateProperty of getCssShorthandConflictProperties(property)) {
    const source = resolveHtmlSpecimenCssDeclarationSource({
      css,
      mediaContext,
      nodeId,
      nodes,
      property: candidateProperty,
    })

    if (
      source &&
      (
        !shorthandSource ||
        compareCssSource(source, shorthandSource) > 0
      ) &&
      (
        !winner ||
        compareCssSource(source, winner) > 0
      )
    ) {
      winner = source
    }
  }

  return winner
}

export function isComplexBackgroundShorthandColorSource({
  property,
  source,
}: {
  property: string
  source: HtmlSpecimenCssDeclarationSource | null
}) {
  return normalizeProperty(property) === 'background-color' &&
    source?.property === 'background' &&
    !isPlainBackgroundColorValue(source.value)
}

export function isPlainBackgroundColorValue(value: string) {
  const normalizedValue = stripCssComments(value).trim().toLowerCase()

  if (CSS_WIDE_KEYWORDS.has(normalizedValue)) {
    return false
  }

  if (/^#[\da-f]{3,8}$/i.test(normalizedValue)) {
    return true
  }

  if (/^(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\([^)]*\)$/.test(
    normalizedValue,
  )) {
    return true
  }

  if (!/^[a-z][a-z-]*$/i.test(normalizedValue)) {
    return false
  }

  return !new Set([
    'auto',
    'border-box',
    'bottom',
    'center',
    'contain',
    'content-box',
    'cover',
    'fixed',
    'left',
    'local',
    'no-repeat',
    'none',
    'padding-box',
    'repeat',
    'repeat-x',
    'repeat-y',
    'right',
    'round',
    'scroll',
    'space',
    'text',
    'top',
  ]).has(normalizedValue)
}
