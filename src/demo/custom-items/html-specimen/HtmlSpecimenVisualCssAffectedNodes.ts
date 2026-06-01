import {
  matchHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'
import {
  compareCssSource,
} from './HtmlSpecimenVisualCssCascade'
import {
  isSameCssDeclarationMatch,
  resolveHtmlSpecimenCssDeclarationMatch,
  resolveHtmlSpecimenCssDeclarationMatchForProperties,
} from './HtmlSpecimenVisualCssDeclarationMatch'
import {
  hasHtmlSpecimenWinningInlineStyleSource,
} from './HtmlSpecimenVisualCssInlineStyleSource'
import type {
  CssDeclarationMatch,
  CssRuleMatch,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function getAffectedNodeIdsForDeclarationMatch({
  css,
  match,
  mediaContext,
  nodes,
  property,
}: {
  css: string
  match: CssDeclarationMatch
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

      const candidateMatch = resolveHtmlSpecimenCssDeclarationMatch({
        css,
        mediaContext,
        node: candidate,
        nodes,
        property,
      })

      return candidateMatch !== null &&
        isSameCssDeclarationMatch(candidateMatch, match)
    })
    .map((candidate) => candidate.id)
}

export function getAffectedNodeIdsForRelatedDeclarationMatch({
  css,
  match,
  mediaContext,
  nodes,
  properties,
}: {
  css: string
  match: CssDeclarationMatch
  mediaContext?: HtmlSpecimenCssMediaContext
  nodes: readonly HtmlSpecimenVisualCssNode[]
  properties: Iterable<string>
}) {
  const sourceProperties = [...properties]

  return nodes
    .filter((candidate) => {
      if (hasHtmlSpecimenWinningInlineStyleSource({
        css,
        mediaContext,
        node: candidate,
        nodes,
        properties: sourceProperties,
      })) {
        return false
      }

      const candidateMatch = resolveHtmlSpecimenCssDeclarationMatchForProperties({
        css,
        mediaContext,
        node: candidate,
        nodes,
        properties: sourceProperties,
      })

      return candidateMatch !== null &&
        isSameCssDeclarationMatch(candidateMatch, match)
    })
    .map((candidate) => candidate.id)
}

export function getAffectedNodeIdsForRuleInsertion({
  css,
  match,
  mediaContext,
  nodes,
  property,
}: {
  css: string
  match: CssRuleMatch
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

      const specificity = matchHtmlSpecimenCssSelectorList(
        match.rule.selector,
        candidate,
        nodes,
      )

      if (!specificity) {
        return false
      }

      const currentMatch = resolveHtmlSpecimenCssDeclarationMatch({
        css,
        mediaContext,
        node: candidate,
        nodes,
        property,
      })

      return currentMatch === null ||
        compareCssSource(
          {
            declarationIndex: match.rule.declarations.length,
            important: false,
            layer: match.rule.layer,
            ruleIndex: match.rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: currentMatch.declaration.declarationIndex,
            important: currentMatch.declaration.important,
            layer: currentMatch.rule.layer,
            ruleIndex: currentMatch.rule.ruleIndex,
            specificity: currentMatch.specificity,
          },
        ) > 0
    })
    .map((candidate) => candidate.id)
}
