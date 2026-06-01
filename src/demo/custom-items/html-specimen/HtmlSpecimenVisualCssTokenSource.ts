import {
  getAffectedNodeIdsForRelatedDeclarationMatch,
} from './HtmlSpecimenVisualCssAffectedNodes'
import {
  isSameCssDeclarationMatch,
  resolveHtmlSpecimenCssDeclarationMatchForProperties,
} from './HtmlSpecimenVisualCssDeclarationMatch'
import {
  resolveHtmlSpecimenCssCustomPropertyDeclarationMatch,
} from './HtmlSpecimenVisualCssCustomProperties'
import {
  findNode,
} from './HtmlSpecimenVisualCssNodeLookup'
import {
  getCssTokenGuardProperties,
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  canPatchHtmlSpecimenCssTokenSource,
  isHtmlSpecimenCssTokenValue,
  readSingleCssVarReference,
} from './HtmlSpecimenVisualCssTokenValue'
import type {
  CssDeclarationMatch,
  HtmlSpecimenCssDeclarationSource,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function resolveHtmlSpecimenCssTokenSource({
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
  const node = findNode(nodes, nodeId)

  if (!node) {
    return null
  }

  const properties = [
    normalizeProperty(property),
    ...getCssTokenGuardProperties(property),
  ]
  const winner = resolveHtmlSpecimenCssDeclarationMatchForProperties({
    css,
    mediaContext,
    node,
    nodes,
    properties,
  })

  if (!winner || !isHtmlSpecimenCssTokenValue(winner.declaration.value)) {
    return null
  }

  return {
    affectedNodeIds: getAffectedNodeIdsForRelatedDeclarationMatch({
      css,
      match: winner,
      mediaContext,
      nodes,
      properties,
    }),
    ...(winner.rule.atRule ? { atRule: winner.rule.atRule } : {}),
    declarationIndex: winner.declaration.declarationIndex,
    important: winner.declaration.important,
    ...(winner.rule.layer ? { layer: winner.rule.layer } : {}),
    property: winner.declaration.property,
    ruleIndex: winner.rule.ruleIndex,
    selector: winner.rule.selector,
    specificity: winner.specificity,
    value: winner.declaration.value,
  }
}

export function resolveHtmlSpecimenCssTokenDefinitionSource({
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
  const node = findNode(nodes, nodeId)
  const tokenSource = resolveHtmlSpecimenCssTokenSource({
    css,
    mediaContext,
    nodeId,
    nodes,
    property,
  })

  if (
    !tokenSource ||
    !canPatchHtmlSpecimenCssTokenSource(property, tokenSource.property)
  ) {
    return null
  }

  const tokenName = readSingleCssVarReference(tokenSource.value)

  if (!tokenName) {
    return null
  }

  const match = resolveHtmlSpecimenCssCustomPropertyDeclarationMatch({
    css,
    mediaContext,
    node,
    nodes,
    property: tokenName,
  })

  if (!match) {
    return null
  }

  return {
    affectedNodeIds: getAffectedNodeIdsForTokenDefinitionMatch({
      css,
      match,
      mediaContext,
      nodes,
      property: tokenName,
      tokenSource,
    }),
    ...(match.rule.atRule ? { atRule: match.rule.atRule } : {}),
    declarationIndex: match.declaration.declarationIndex,
    important: match.declaration.important,
    ...(match.rule.layer ? { layer: match.rule.layer } : {}),
    property: match.declaration.property,
    ruleIndex: match.rule.ruleIndex,
    selector: match.rule.selector,
    specificity: match.specificity,
    value: match.declaration.value,
  }
}

export function getAffectedNodeIdsForTokenDefinitionMatch({
  css,
  match,
  mediaContext,
  nodes,
  property,
  tokenSource,
}: {
  css: string
  match: CssDeclarationMatch
  mediaContext?: HtmlSpecimenCssMediaContext
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
  tokenSource: HtmlSpecimenCssDeclarationSource
}) {
  return tokenSource.affectedNodeIds.filter((nodeId) => {
    const node = findNode(nodes, nodeId)

    if (!node) {
      return false
    }

    const candidateMatch = resolveHtmlSpecimenCssCustomPropertyDeclarationMatch({
      css,
      mediaContext,
      node,
      nodes,
      property,
    })

    return candidateMatch !== null &&
      isSameCssDeclarationMatch(candidateMatch, match)
  })
}
