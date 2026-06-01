import {
  matchHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'
import {
  getAffectedNodeIdsForRuleInsertion,
} from './HtmlSpecimenVisualCssAffectedNodes'
import {
  compareCssSource,
} from './HtmlSpecimenVisualCssCascade'
import {
  findNode,
} from './HtmlSpecimenVisualCssNodeLookup'
import {
  parseCssRules,
} from './HtmlSpecimenVisualCssRuleParser'
import type {
  CssRuleMatch,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenCssRuleSource,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function resolveHtmlSpecimenCssRuleSource({
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
}): HtmlSpecimenCssRuleSource | null {
  const node = findNode(nodes, nodeId)

  if (!node) {
    return null
  }

  const match = resolveBestMatchingRuleMatch({
    css,
    mediaContext,
    node,
    nodes,
  })

  return match
    ? {
        affectedNodeIds: getAffectedNodeIdsForRuleInsertion({
          css,
          match,
          mediaContext,
          nodes,
          property,
        }),
        ...(match.rule.atRule ? { atRule: match.rule.atRule } : {}),
        ...(match.rule.layer ? { layer: match.rule.layer } : {}),
        ruleIndex: match.rule.ruleIndex,
        selector: match.rule.selector,
        specificity: match.specificity,
      }
    : null
}

export function resolveBestMatchingRuleMatch({
  css,
  mediaContext,
  node,
  nodes,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
}) {
  let best: CssRuleMatch | null = null

  for (const rule of parseCssRules(css, mediaContext)) {
    const specificity = matchHtmlSpecimenCssSelectorList(rule.selector, node, nodes)

    if (
      specificity &&
      (
        !best ||
        compareCssSource(
          {
            declarationIndex: rule.declarations.length,
            layer: rule.layer,
            ruleIndex: rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: best.rule.declarations.length,
            layer: best.rule.layer,
            ruleIndex: best.rule.ruleIndex,
            specificity: best.specificity,
          },
        ) > 0
      )
    ) {
      best = { rule, specificity }
    }
  }

  return best
}
