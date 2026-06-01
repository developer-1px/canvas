import {
  resolveBestMatchingRuleMatch,
} from './HtmlSpecimenVisualCssRuleSource'
import {
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  parseCssRules,
} from './HtmlSpecimenVisualCssRuleParser'
import type {
  CssRule,
  HtmlSpecimenCssDeclarationSource,
  HtmlSpecimenCssMediaContext,
  HtmlSpecimenCssPatchPlan,
  HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssTypes'

export function serializeHtmlSpecimenCssPatch(
  css: string,
  patch: HtmlSpecimenCssPatchPlan,
) {
  const replacement = patch.kind === 'insert-declaration'
    ? patch.replacement
    : patch.nextValue

  return [
    css.slice(0, patch.range.start),
    replacement,
    css.slice(patch.range.end),
  ].join('')
}

export function planExistingDeclarationPatch({
  css,
  mediaContext,
  nextValue,
  source,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  nextValue: string
  source: HtmlSpecimenCssDeclarationSource
}) {
  const rule = parseCssRules(css, mediaContext)[source.ruleIndex]
  const declaration = rule?.declarations[source.declarationIndex]

  if (!declaration) {
    return null
  }

  return {
    declarationIndex: source.declarationIndex,
    kind: 'replace-declaration-value',
    nextValue,
    previousValue: declaration.value,
    property: source.property,
    range: {
      end: declaration.valueEnd,
      start: declaration.valueStart,
    },
    ruleIndex: source.ruleIndex,
    selector: source.selector,
  } satisfies HtmlSpecimenCssPatchPlan
}

export function planNewDeclarationPatch({
  css,
  mediaContext,
  nextValue,
  node,
  nodes,
  property,
}: {
  css: string
  mediaContext?: HtmlSpecimenCssMediaContext
  nextValue: string
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}) {
  const match = resolveBestMatchingRuleMatch({
    css,
    mediaContext,
    node,
    nodes,
  })

  if (!match) {
    return null
  }

  const rule = match.rule
  const indent = inferDeclarationIndent(rule)
  const needsLeadingNewline = css[rule.blockEnd - 1] !== '\n'
  const insertion = [
    needsLeadingNewline ? '\n' : '',
    `${indent}${normalizeProperty(property)}: ${nextValue};\n`,
  ].join('')

  return {
    kind: 'insert-declaration',
    nextValue,
    property: normalizeProperty(property),
    range: {
      end: rule.blockEnd,
      start: rule.blockEnd,
    },
    replacement: insertion,
    ruleIndex: rule.ruleIndex,
    selector: rule.selector,
  } satisfies HtmlSpecimenCssPatchPlan
}

export function inferDeclarationIndent(rule: CssRule) {
  return rule.declarations.length > 0 ? '  ' : ''
}
