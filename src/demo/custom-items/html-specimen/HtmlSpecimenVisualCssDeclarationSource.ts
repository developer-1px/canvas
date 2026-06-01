import {
  getAffectedNodeIdsForDeclarationMatch,
} from './HtmlSpecimenVisualCssAffectedNodes'
import {
  resolveHtmlSpecimenCssDeclarationMatch,
} from './HtmlSpecimenVisualCssDeclarationMatch'
import {
  findNode,
} from './HtmlSpecimenVisualCssNodeLookup'
import type {
  HtmlSpecimenCssDeclarationSource,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function resolveHtmlSpecimenCssDeclarationSource({
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

  const winner = resolveHtmlSpecimenCssDeclarationMatch({
    css,
    mediaContext,
    node,
    nodes,
    property,
  })

  if (!winner) {
    return null
  }

  return {
    affectedNodeIds: getAffectedNodeIdsForDeclarationMatch({
      css,
      match: winner,
      mediaContext,
      nodes,
      property,
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
