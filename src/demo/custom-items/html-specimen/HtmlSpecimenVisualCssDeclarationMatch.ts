import {
  matchHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'
import {
  compareCssSource,
} from './HtmlSpecimenVisualCssCascade'
import {
  getCssDeclarationSourceProperties,
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  parseCssRules,
} from './HtmlSpecimenVisualCssRuleParser'
import type {
  CssDeclarationMatch,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function resolveHtmlSpecimenCssDeclarationMatch({
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
}): CssDeclarationMatch | null {
  return resolveHtmlSpecimenCssDeclarationMatchForProperties({
    css,
    mediaContext,
    node,
    nodes,
    properties: getCssDeclarationSourceProperties(property),
  })
}

export function resolveHtmlSpecimenCssDeclarationMatchForProperties({
  css,
  mediaContext,
  node,
  nodes,
  properties,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  properties: Iterable<string>
}): CssDeclarationMatch | null {
  const matchedProperties = new Set(
    Array.from(properties, (candidateProperty) =>
      normalizeProperty(candidateProperty)),
  )
  const rules = parseCssRules(css, mediaContext)
  let winner: CssDeclarationMatch | null = null

  for (const rule of rules) {
    const specificity = matchHtmlSpecimenCssSelectorList(rule.selector, node, nodes)

    if (!specificity) {
      continue
    }

    for (const declaration of rule.declarations) {
      if (!matchedProperties.has(declaration.property)) {
        continue
      }

      if (
        !winner ||
        compareCssSource(
          {
            declarationIndex: declaration.declarationIndex,
            important: declaration.important,
            layer: rule.layer,
            ruleIndex: rule.ruleIndex,
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
          declaration,
          rule,
          specificity,
        }
      }
    }
  }

  return winner
}

export function isSameCssDeclarationMatch(
  left: CssDeclarationMatch,
  right: CssDeclarationMatch,
) {
  return left.rule.ruleIndex === right.rule.ruleIndex &&
    left.declaration.declarationIndex === right.declaration.declarationIndex &&
    left.declaration.property === right.declaration.property
}
