import {
  compareHtmlSpecimenCssSpecificity,
  splitHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'
import {
  compareCssSource,
} from './HtmlSpecimenVisualCssCascade'
import {
  resolveHtmlSpecimenCssDeclarationMatchForProperties,
} from './HtmlSpecimenVisualCssDeclarationMatch'
import {
  getHtmlSpecimenNodeInheritanceChain,
} from './HtmlSpecimenVisualCssNodeLookup'
import {
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  parseCssRules,
} from './HtmlSpecimenVisualCssRuleParser'
import {
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'
import type {
  CssDeclarationMatch,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function createHtmlSpecimenShadowPreviewCss({
  css,
  mediaContext,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
}) {
  const properties = resolveHtmlSpecimenCssRootCustomProperties({
    css,
    mediaContext,
  })
  const viewportRootCss = [
    '[data-preview-surface-root] {',
    '  height: 100%;',
    '}',
  ].join('\n')

  if (properties.length === 0) {
    return [css, viewportRootCss].join('\n')
  }

  return [
    css,
    viewportRootCss,
    ':host, [data-preview-surface-root] {',
    ...properties.map((property) =>
      `  ${property.property}: ${property.value}${
        property.important ? ' !important' : ''
      };`),
    '}',
  ].join('\n')
}

export function resolveHtmlSpecimenCssRootCustomProperties({
  css,
  mediaContext,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
}) {
  const winners = new Map<string, CssDeclarationMatch>()

  for (const rule of parseCssRules(css, mediaContext)) {
    const specificity = getHtmlSpecimenCssRootSelectorSpecificity(rule.selector)

    if (!specificity) {
      continue
    }

    for (const declaration of rule.declarations) {
      if (!declaration.property.startsWith('--')) {
        continue
      }

      const previous = winners.get(declaration.property)

      if (
        !previous ||
        compareCssSource(
          {
            declarationIndex: declaration.declarationIndex,
            important: declaration.important,
            layer: rule.layer,
            ruleIndex: rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: previous.declaration.declarationIndex,
            important: previous.declaration.important,
            layer: previous.rule.layer,
            ruleIndex: previous.rule.ruleIndex,
            specificity: previous.specificity,
          },
        ) > 0
      ) {
        winners.set(declaration.property, {
          declaration,
          rule,
          specificity,
        })
      }
    }
  }

  return [...winners.values()]
    .map((match) => ({
      important: match.declaration.important,
      property: match.declaration.property,
      value: match.declaration.value,
    }))
    .sort((left, right) => left.property.localeCompare(right.property))
}

export function resolveHtmlSpecimenCssCustomPropertyDeclarationMatch({
  css,
  mediaContext,
  node,
  nodes,
  property,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  node: HtmlSpecimenVisualCssNode | null
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): CssDeclarationMatch | null {
  if (node) {
    for (const inheritedNode of getHtmlSpecimenNodeInheritanceChain({
      node,
      nodes,
    })) {
      const match = resolveHtmlSpecimenCssDeclarationMatchForProperties({
        css,
        mediaContext,
        node: inheritedNode,
        nodes,
        properties: [property],
      })

      if (match) {
        return match
      }
    }
  }

  return resolveHtmlSpecimenCssRootCustomPropertyDeclarationMatch({
    css,
    mediaContext,
    property,
  })
}

export function resolveHtmlSpecimenCssRootCustomPropertyDeclarationMatch({
  css,
  mediaContext,
  property,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  property: string
}): CssDeclarationMatch | null {
  const normalizedProperty = normalizeProperty(property)
  let winner: CssDeclarationMatch | null = null

  for (const rule of parseCssRules(css, mediaContext)) {
    const specificity = getHtmlSpecimenCssRootSelectorSpecificity(rule.selector)

    if (!specificity) {
      continue
    }

    for (const declaration of rule.declarations) {
      if (declaration.property !== normalizedProperty) {
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

export function getHtmlSpecimenCssRootSelectorSpecificity(
  selector: string,
): [number, number, number] | null {
  let best: [number, number, number] | null = null

  for (const selectorPart of splitHtmlSpecimenCssSelectorList(
    stripCssComments(selector),
  )) {
    const specificity = getHtmlSpecimenCssRootSelectorPartSpecificity(
      selectorPart,
    )

    if (
      specificity &&
      (!best || compareHtmlSpecimenCssSpecificity(specificity, best) > 0)
    ) {
      best = specificity
    }
  }

  return best
}

export function getHtmlSpecimenCssRootSelectorPartSpecificity(
  selector: string,
): [number, number, number] | null {
  switch (selector.replace(/\s+/g, ' ').trim()) {
    case ':root':
      return [0, 1, 0]
    case 'html':
      return [0, 0, 1]
    default:
      return null
  }
}
