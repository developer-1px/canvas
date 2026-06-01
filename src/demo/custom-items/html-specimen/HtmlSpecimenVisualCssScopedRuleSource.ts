import {
  matchHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'
import {
  compareCssSource,
} from './HtmlSpecimenVisualCssCascade'
import {
  isSameCssDeclarationMatch,
} from './HtmlSpecimenVisualCssDeclarationMatch'
import {
  hasHtmlSpecimenWinningInlineStyleSource,
} from './HtmlSpecimenVisualCssInlineStyleSource'
import {
  findNode,
} from './HtmlSpecimenVisualCssNodeLookup'
import {
  getCssTokenGuardProperties,
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  parseCssRules,
} from './HtmlSpecimenVisualCssRuleParser'
import type {
  CssScopedDeclarationMatch,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenCssScopedRuleSource,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function resolveHtmlSpecimenCssScopedRuleSource({
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
}): HtmlSpecimenCssScopedRuleSource | null {
  const node = findNode(nodes, nodeId)

  if (!node) {
    return null
  }

  const winner = resolveHtmlSpecimenCssScopedDeclarationMatch({
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
    affectedNodeIds: getAffectedNodeIdsForScopedDeclarationMatch({
      css,
      match: winner,
      mediaContext,
      nodes,
      property,
    }),
    atRule: winner.atRule,
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

export function resolveHtmlSpecimenCssScopedDeclarationMatch({
  css,
  mediaContext,
  node,
  nodes,
  property,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): CssScopedDeclarationMatch | null {
  const properties = new Set([
    normalizeProperty(property),
    ...getCssTokenGuardProperties(property),
  ])
  let winner: CssScopedDeclarationMatch | null = null

  for (const scopedRule of parseScopedCssRules(css, mediaContext)) {
    const specificity = matchHtmlSpecimenCssSelectorList(
      scopedRule.rule.selector,
      node,
      nodes,
    )

    if (!specificity) {
      continue
    }

    for (const declaration of scopedRule.rule.declarations) {
      if (!properties.has(declaration.property)) {
        continue
      }

      if (
        !winner ||
        compareCssSource(
          {
            declarationIndex: declaration.declarationIndex,
            important: declaration.important,
            layer: scopedRule.rule.layer,
            ruleIndex: scopedRule.rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: winner.declaration.declarationIndex,
            important: winner.declaration.important,
            layer: winner.rule.layer,
            ruleIndex: winner.rule.ruleIndex,
            specificity: winner.specificity,
          },
        ) > 0
      ) {
        winner = {
          atRule: scopedRule.atRule,
          declaration,
          rule: scopedRule.rule,
          specificity,
        }
      }
    }
  }

  return winner
}

export function getAffectedNodeIdsForScopedDeclarationMatch({
  css,
  match,
  mediaContext,
  nodes,
  property,
}: {
  css: string
  match: CssScopedDeclarationMatch
  mediaContext?: HtmlSpecimenCssMediaContext
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}) {
  return nodes
    .filter((candidate) => {
      if (hasHtmlSpecimenWinningInlineStyleSource({
        css,
        mediaContext,
        node: candidate,
        nodes,
        properties: [property],
      })) {
        return false
      }

      const candidateMatch = resolveHtmlSpecimenCssScopedDeclarationMatch({
        css,
        mediaContext,
        node: candidate,
        nodes,
        property,
      })

      return candidateMatch !== null &&
        isSameCssScopedDeclarationMatch(candidateMatch, match)
    })
    .map((candidate) => candidate.id)
}

export function isSameCssScopedDeclarationMatch(
  left: CssScopedDeclarationMatch,
  right: CssScopedDeclarationMatch,
) {
  return left.atRule === right.atRule &&
    isSameCssDeclarationMatch(left, right)
}

export function parseScopedCssRules(
  css: string,
  mediaContext?: HtmlSpecimenCssMediaContext,
) {
  return parseCssRules(css, mediaContext)
    .filter((rule) => rule.atRule !== null)
    .map((rule) => ({
      atRule: rule.atRule ?? '',
      rule,
    }))
}
