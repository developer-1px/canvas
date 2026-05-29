import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import {
  compareHtmlSpecimenCssSpecificity,
  matchHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'

export type HtmlSpecimenVisualCssNode = {
  attributes: Readonly<Record<string, string>>
  classList: readonly string[]
  id: string
  path?: readonly number[]
  tagName: string
}

export type HtmlSpecimenVisualCssEditIntent = {
  nextValue: string
  nodeId: string
  property: string
}

export type HtmlSpecimenCssDeclarationSource = {
  affectedNodeIds: string[]
  atRule?: string
  declarationIndex: number
  important: boolean
  property: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
  value: string
}

export type HtmlSpecimenCssRuleSource = {
  affectedNodeIds: string[]
  atRule?: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
}

export type HtmlSpecimenCssScopedRuleSource = {
  affectedNodeIds: string[]
  atRule: string
  declarationIndex: number
  important: boolean
  property: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
  value: string
}

export type HtmlSpecimenCssPatchPlan =
  | {
      declarationIndex: number
      kind: 'replace-declaration-value'
      nextValue: string
      previousValue: string
      property: string
      range: {
        end: number
        start: number
      }
      ruleIndex: number
      selector: string
    }
  | {
      kind: 'insert-declaration'
      nextValue: string
      property: string
      range: {
        end: number
        start: number
      }
      replacement: string
      ruleIndex: number
      selector: string
    }

export type HtmlSpecimenVisualCssEditResult =
  | {
      affectedNodeIds: string[]
      ok: false
      reason:
        | 'node-not-found'
        | 'rule-not-found'
        | 'scoped-rule'
        | 'shorthand-conflict'
        | 'token-value'
        | 'verification-failed'
      specimen: HtmlSpecimenData
    }
  | {
      affectedNodeIds: string[]
      ok: true
      patch: HtmlSpecimenCssPatchPlan
      previousSource: HtmlSpecimenCssDeclarationSource | null
      serializedCss: string
      source: HtmlSpecimenCssDeclarationSource
      specimen: HtmlSpecimenData
      verification: {
        actualValue: string | null
        expectedValue: string
        passed: boolean
        property: string
      }
    }

type CssRule = {
  atRule: string | null
  blockEnd: number
  declarations: CssDeclaration[]
  ruleIndex: number
  selector: string
}

type CssDeclaration = {
  declarationIndex: number
  important: boolean
  property: string
  value: string
  valueEnd: number
  valueStart: number
}

type CssRuleMatch = {
  rule: CssRule
  specificity: [number, number, number]
}

type CssDeclarationMatch = {
  declaration: CssDeclaration
  rule: CssRule
  specificity: [number, number, number]
}

type CssScopedDeclarationMatch = CssDeclarationMatch & {
  atRule: string
}

type CssScannerState = {
  bracketDepth: number
  comment: boolean
  escaped: boolean
  parenDepth: number
  quote: '"' | "'" | null
}

export function applyHtmlSpecimenVisualCssEdit({
  intent,
  nodes,
  specimen,
}: {
  intent: HtmlSpecimenVisualCssEditIntent
  nodes: readonly HtmlSpecimenVisualCssNode[]
  specimen: HtmlSpecimenData
}): HtmlSpecimenVisualCssEditResult {
  const node = findNode(nodes, intent.nodeId)

  if (!node) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'node-not-found',
      specimen,
    }
  }

  const previousSource = resolveHtmlSpecimenCssDeclarationSource({
    css: specimen.css,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })
  const tokenSource = resolveHtmlSpecimenCssTokenSource({
    css: specimen.css,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })

  if (tokenSource) {
    return {
      affectedNodeIds: tokenSource.affectedNodeIds,
      ok: false,
      reason: 'token-value',
      specimen,
    }
  }

  const shorthandConflictSource =
    resolveHtmlSpecimenCssShorthandConflictSource({
      css: specimen.css,
      nodeId: intent.nodeId,
      nodes,
      property: intent.property,
    })

  if (shorthandConflictSource) {
    return {
      affectedNodeIds: shorthandConflictSource.affectedNodeIds,
      ok: false,
      reason: 'shorthand-conflict',
      specimen,
    }
  }

  const patch = previousSource
    ? planExistingDeclarationPatch({
        css: specimen.css,
        nextValue: intent.nextValue,
        source: previousSource,
      })
    : planNewDeclarationPatch({
        css: specimen.css,
        nextValue: intent.nextValue,
        node,
        nodes,
        property: intent.property,
      })

  if (!patch) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'rule-not-found',
      specimen,
    }
  }

  const patchedCss = serializeHtmlSpecimenCssPatch(specimen.css, patch)
  const nextSpecimen = {
    ...specimen,
    css: patchedCss,
  }
  const source = resolveHtmlSpecimenCssDeclarationSource({
    css: patchedCss,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })
  const verification = {
    actualValue: source?.value ?? null,
    expectedValue: intent.nextValue,
    passed: source?.value === intent.nextValue,
    property: normalizeProperty(intent.property),
  }

  if (!source || !verification.passed) {
    return {
      affectedNodeIds: source?.affectedNodeIds ?? [],
      ok: false,
      reason: 'verification-failed',
      specimen: nextSpecimen,
    }
  }

  return {
    affectedNodeIds: source.affectedNodeIds,
    ok: true,
    patch,
    previousSource,
    serializedCss: patchedCss,
    source,
    specimen: nextSpecimen,
    verification,
  }
}

export function resolveHtmlSpecimenCssDeclarationSource({
  css,
  nodeId,
  nodes,
  property,
}: {
  css: string
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
      nodes,
      property,
    }),
    ...(winner.rule.atRule ? { atRule: winner.rule.atRule } : {}),
    declarationIndex: winner.declaration.declarationIndex,
    important: winner.declaration.important,
    property: winner.declaration.property,
    ruleIndex: winner.rule.ruleIndex,
    selector: winner.rule.selector,
    specificity: winner.specificity,
    value: winner.declaration.value,
  }
}

function resolveHtmlSpecimenCssDeclarationMatch({
  css,
  node,
  nodes,
  property,
}: {
  css: string
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): CssDeclarationMatch | null {
  return resolveHtmlSpecimenCssDeclarationMatchForProperties({
    css,
    node,
    nodes,
    properties: getCssDeclarationSourceProperties(property),
  })
}

function resolveHtmlSpecimenCssDeclarationMatchForProperties({
  css,
  node,
  nodes,
  properties,
}: {
  css: string
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  properties: Iterable<string>
}): CssDeclarationMatch | null {
  const matchedProperties = new Set(
    Array.from(properties, (candidateProperty) =>
      normalizeProperty(candidateProperty)),
  )
  const rules = parseCssRules(css)
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
            ruleIndex: rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: winner.declaration.declarationIndex,
            important: winner.declaration.important,
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

function getAffectedNodeIdsForDeclarationMatch({
  css,
  match,
  nodes,
  property,
}: {
  css: string
  match: CssDeclarationMatch
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}) {
  return nodes
    .filter((candidate) => {
      const candidateMatch = resolveHtmlSpecimenCssDeclarationMatch({
        css,
        node: candidate,
        nodes,
        property,
      })

      return candidateMatch !== null &&
        isSameCssDeclarationMatch(candidateMatch, match)
    })
    .map((candidate) => candidate.id)
}

function getAffectedNodeIdsForRelatedDeclarationMatch({
  css,
  match,
  nodes,
  properties,
}: {
  css: string
  match: CssDeclarationMatch
  nodes: readonly HtmlSpecimenVisualCssNode[]
  properties: Iterable<string>
}) {
  return nodes
    .filter((candidate) => {
      const candidateMatch = resolveHtmlSpecimenCssDeclarationMatchForProperties({
        css,
        node: candidate,
        nodes,
        properties,
      })

      return candidateMatch !== null &&
        isSameCssDeclarationMatch(candidateMatch, match)
    })
    .map((candidate) => candidate.id)
}

function isSameCssDeclarationMatch(
  left: CssDeclarationMatch,
  right: CssDeclarationMatch,
) {
  return left.rule.ruleIndex === right.rule.ruleIndex &&
    left.declaration.declarationIndex === right.declaration.declarationIndex &&
    left.declaration.property === right.declaration.property
}

export function resolveHtmlSpecimenCssRuleSource({
  css,
  nodeId,
  nodes,
  property,
}: {
  css: string
  nodeId: string
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): HtmlSpecimenCssRuleSource | null {
  const node = findNode(nodes, nodeId)

  if (!node) {
    return null
  }

  const match = resolveBestMatchingRuleMatch({ css, node, nodes })

  return match
    ? {
        affectedNodeIds: getAffectedNodeIdsForRuleInsertion({
          css,
          match,
          nodes,
          property,
        }),
        ...(match.rule.atRule ? { atRule: match.rule.atRule } : {}),
        ruleIndex: match.rule.ruleIndex,
        selector: match.rule.selector,
        specificity: match.specificity,
      }
    : null
}

function getAffectedNodeIdsForRuleInsertion({
  css,
  match,
  nodes,
  property,
}: {
  css: string
  match: CssRuleMatch
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}) {
  return nodes
    .filter((candidate) => {
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
        node: candidate,
        nodes,
        property,
      })

      return currentMatch === null ||
        compareCssSource(
          {
            declarationIndex: match.rule.declarations.length,
            important: false,
            ruleIndex: match.rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: currentMatch.declaration.declarationIndex,
            important: currentMatch.declaration.important,
            ruleIndex: currentMatch.rule.ruleIndex,
            specificity: currentMatch.specificity,
          },
        ) > 0
    })
    .map((candidate) => candidate.id)
}

export function resolveHtmlSpecimenCssTokenSource({
  css,
  nodeId,
  nodes,
  property,
}: {
  css: string
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
      nodes,
      properties,
    }),
    ...(winner.rule.atRule ? { atRule: winner.rule.atRule } : {}),
    declarationIndex: winner.declaration.declarationIndex,
    important: winner.declaration.important,
    property: winner.declaration.property,
    ruleIndex: winner.rule.ruleIndex,
    selector: winner.rule.selector,
    specificity: winner.specificity,
    value: winner.declaration.value,
  }
}

export function resolveHtmlSpecimenCssShorthandConflictSource({
  css,
  nodeId,
  nodes,
  property,
}: {
  css: string
  nodeId: string
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): HtmlSpecimenCssDeclarationSource | null {
  const shorthandSource = resolveHtmlSpecimenCssDeclarationSource({
    css,
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

function isComplexBackgroundShorthandColorSource({
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

export function resolveHtmlSpecimenCssScopedRuleSource({
  css,
  nodeId,
  nodes,
  property,
}: {
  css: string
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
      nodes,
      property,
    }),
    atRule: winner.atRule,
    declarationIndex: winner.declaration.declarationIndex,
    important: winner.declaration.important,
    property: winner.declaration.property,
    ruleIndex: winner.rule.ruleIndex,
    selector: winner.rule.selector,
    specificity: winner.specificity,
    value: winner.declaration.value,
  }
}

function resolveHtmlSpecimenCssScopedDeclarationMatch({
  css,
  node,
  nodes,
  property,
}: {
  css: string
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}): CssScopedDeclarationMatch | null {
  const properties = new Set([
    normalizeProperty(property),
    ...getCssTokenGuardProperties(property),
  ])
  let winner: CssScopedDeclarationMatch | null = null

  for (const scopedRule of parseScopedCssRules(css)) {
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
            ruleIndex: scopedRule.rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: winner.declaration.declarationIndex,
            important: winner.declaration.important,
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

function getAffectedNodeIdsForScopedDeclarationMatch({
  css,
  match,
  nodes,
  property,
}: {
  css: string
  match: CssScopedDeclarationMatch
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}) {
  return nodes
    .filter((candidate) => {
      const candidateMatch = resolveHtmlSpecimenCssScopedDeclarationMatch({
        css,
        node: candidate,
        nodes,
        property,
      })

      return candidateMatch !== null &&
        isSameCssScopedDeclarationMatch(candidateMatch, match)
    })
    .map((candidate) => candidate.id)
}

function isSameCssScopedDeclarationMatch(
  left: CssScopedDeclarationMatch,
  right: CssScopedDeclarationMatch,
) {
  return left.atRule === right.atRule &&
    isSameCssDeclarationMatch(left, right)
}

export function isHtmlSpecimenCssTokenValue(value: string) {
  return /\bvar\s*\(/i.test(value)
}

function isPlainBackgroundColorValue(value: string) {
  const normalizedValue = stripCssComments(value).trim().toLowerCase()

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

function planExistingDeclarationPatch({
  css,
  nextValue,
  source,
}: {
  css: string
  nextValue: string
  source: HtmlSpecimenCssDeclarationSource
}) {
  const rule = parseCssRules(css)[source.ruleIndex]
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

function planNewDeclarationPatch({
  css,
  nextValue,
  node,
  nodes,
  property,
}: {
  css: string
  nextValue: string
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
}) {
  const match = resolveBestMatchingRuleMatch({
    css,
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

function resolveBestMatchingRuleMatch({
  css,
  node,
  nodes,
}: {
  css: string
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
}) {
  let best: CssRuleMatch | null = null

  for (const rule of parseCssRules(css)) {
    const specificity = matchHtmlSpecimenCssSelectorList(rule.selector, node, nodes)

    if (
      specificity &&
      (
        !best ||
        compareCssSource(
          {
            declarationIndex: rule.declarations.length,
            ruleIndex: rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: best.rule.declarations.length,
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

function parseCssRules(css: string): CssRule[] {
  const rules: CssRule[] = []

  collectCssRules({
    atRule: null,
    css,
    end: css.length,
    rules,
    start: 0,
  })

  return rules
}

function collectCssRules({
  atRule,
  css,
  end,
  rules,
  start,
}: {
  atRule: string | null
  css: string
  end: number
  rules: CssRule[]
  start: number
}) {
  let cursor = start

  while (cursor < end) {
    const blockStart = findNextCssBlockStart(css, cursor, end)

    if (blockStart < 0) {
      break
    }

    const blockEnd = findMatchingBrace(css, blockStart, end)

    if (blockEnd < 0) {
      break
    }

    const selector = stripCssComments(css.slice(cursor, blockStart)).trim()

    if (selector.startsWith('@')) {
      collectCssRules({
        atRule: formatNestedCssAtRule(atRule, selector),
        css,
        end: blockEnd,
        rules,
        start: blockStart + 1,
      })
    } else if (selector.length > 0) {
      rules.push({
        atRule,
        blockEnd,
        declarations: parseCssDeclarations({
          blockEnd,
          blockStart: blockStart + 1,
          css,
        }),
        ruleIndex: rules.length,
        selector,
      })
    }

    cursor = blockEnd + 1
  }
}

function formatNestedCssAtRule(parent: string | null, atRule: string) {
  return parent ? `${parent} / ${atRule}` : atRule
}

function parseScopedCssRules(css: string) {
  return parseCssRules(css)
    .filter((rule) => rule.atRule !== null)
    .map((rule) => ({
      atRule: rule.atRule ?? '',
      rule,
    }))
}

function findNextCssBlockStart(
  css: string,
  cursor: number,
  end = css.length,
) {
  const scanner = createCssScannerState()
  let index = cursor

  while (index < end) {
    if (css[index] === '{' && isCssScannerTopLevel(scanner)) {
      return index
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  return -1
}

function stripCssComments(css: string) {
  let result = ''
  let comment = false
  let quote: '"' | "'" | null = null
  let escaped = false
  let index = 0

  while (index < css.length) {
    const char = css[index] ?? ''
    const next = css[index + 1] ?? ''

    if (comment) {
      if (char === '*' && next === '/') {
        comment = false
        index += 2
        continue
      }

      index += 1
      continue
    }

    if (quote) {
      result += char

      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (char === '/' && next === '*') {
      comment = true
      index += 2
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
    }

    result += char
    index += 1
  }

  return result
}

function parseCssDeclarations({
  blockEnd,
  blockStart,
  css,
}: {
  blockEnd: number
  blockStart: number
  css: string
}): CssDeclaration[] {
  const declarations: CssDeclaration[] = []
  let segmentStart = blockStart
  let scanner = createCssScannerState()
  let index = blockStart

  while (index <= blockEnd) {
    if (
      index !== blockEnd &&
      (css[index] !== ';' || !isCssScannerTopLevel(scanner))
    ) {
      index = advanceCssScannerState(css, index, scanner)
      continue
    }

    const colonIndex = findCssDeclarationColon({
      css,
      end: index,
      start: segmentStart,
    })

    if (colonIndex > segmentStart) {
      const propertyStart = findCssDeclarationPropertyStart({
        css,
        end: colonIndex,
        start: segmentStart,
      })
      const rawProperty = css.slice(propertyStart, colonIndex)
      const valueSegmentStart = colonIndex + 1
      const rawValue = css.slice(valueSegmentStart, index)
      const valueStart = valueSegmentStart + countLeadingWhitespace(rawValue)
      const valueEnd = index - countTrailingWhitespace(rawValue)
      const property = normalizeProperty(rawProperty)

      if (property.length > 0 && valueStart <= valueEnd) {
        const importantStart = findCssTrailingImportant({
          css,
          end: valueEnd,
          start: valueStart,
        })
        const declarationValueEnd = importantStart === null
          ? valueEnd
          : importantStart - countTrailingWhitespace(
              css.slice(valueStart, importantStart),
            )

        declarations.push({
          declarationIndex: declarations.length,
          important: importantStart !== null,
          property,
          value: css.slice(valueStart, declarationValueEnd),
          valueEnd: declarationValueEnd,
          valueStart,
        })
      }
    }

    segmentStart = index + 1
    scanner = createCssScannerState()
    index += 1
  }

  return declarations
}

function findMatchingBrace(
  css: string,
  blockStart: number,
  end = css.length,
) {
  let depth = 0
  let index = blockStart
  const scanner = createCssScannerState()

  while (index < end) {
    if (css[index] === '{' && isCssScannerTopLevel(scanner)) {
      depth += 1
    } else if (css[index] === '}' && isCssScannerTopLevel(scanner)) {
      depth -= 1

      if (depth === 0) {
        return index
      }
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  return -1
}

function findCssDeclarationColon({
  css,
  end,
  start,
}: {
  css: string
  end: number
  start: number
}) {
  const scanner = createCssScannerState()
  let index = start

  while (index < end) {
    if (css[index] === ':' && isCssScannerTopLevel(scanner)) {
      return index
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  return -1
}

function findCssDeclarationPropertyStart({
  css,
  end,
  start,
}: {
  css: string
  end: number
  start: number
}) {
  let index = start

  while (index < end) {
    if (/\s/.test(css[index] ?? '')) {
      index += 1
      continue
    }

    if (css[index] === '/' && css[index + 1] === '*') {
      const commentEnd = css.indexOf('*/', index + 2)

      if (commentEnd < 0 || commentEnd >= end) {
        return index
      }

      index = commentEnd + 2
      continue
    }

    return index
  }

  return index
}

function findCssTrailingImportant({
  css,
  end,
  start,
}: {
  css: string
  end: number
  start: number
}) {
  const scanner = createCssScannerState()
  let importantStart: number | null = null
  let index = start

  while (index < end) {
    if (css[index] === '!' && isCssScannerTopLevel(scanner)) {
      importantStart = index
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  if (
    importantStart === null ||
    css.slice(importantStart + 1, end).trim().toLowerCase() !== 'important'
  ) {
    return null
  }

  return importantStart
}

function createCssScannerState(): CssScannerState {
  return {
    bracketDepth: 0,
    comment: false,
    escaped: false,
    parenDepth: 0,
    quote: null,
  }
}

function advanceCssScannerState(
  css: string,
  index: number,
  state: CssScannerState,
) {
  const char = css[index]
  const next = css[index + 1]

  if (state.comment) {
    if (char === '*' && next === '/') {
      state.comment = false
      return index + 2
    }

    return index + 1
  }

  if (state.quote) {
    if (state.escaped) {
      state.escaped = false
    } else if (char === '\\') {
      state.escaped = true
    } else if (char === state.quote) {
      state.quote = null
    }

    return index + 1
  }

  if (char === '/' && next === '*') {
    state.comment = true
    return index + 2
  }

  if (char === '"' || char === "'") {
    state.quote = char
    return index + 1
  }

  if (char === '(') {
    state.parenDepth += 1
  } else if (char === ')' && state.parenDepth > 0) {
    state.parenDepth -= 1
  } else if (char === '[') {
    state.bracketDepth += 1
  } else if (char === ']' && state.bracketDepth > 0) {
    state.bracketDepth -= 1
  }

  return index + 1
}

function isCssScannerTopLevel(state: CssScannerState) {
  return (
    !state.comment &&
    !state.quote &&
    state.parenDepth === 0 &&
    state.bracketDepth === 0
  )
}

function compareCssSource(
  left: {
    declarationIndex: number
    important?: boolean
    ruleIndex: number
    specificity: [number, number, number]
  },
  right: {
    declarationIndex: number
    important?: boolean
    ruleIndex: number
    specificity: [number, number, number]
  },
) {
  if (Boolean(left.important) !== Boolean(right.important)) {
    return left.important ? 1 : -1
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

function inferDeclarationIndent(rule: CssRule) {
  return rule.declarations.length > 0 ? '  ' : ''
}

function findNode(
  nodes: readonly HtmlSpecimenVisualCssNode[],
  nodeId: string,
) {
  return nodes.find((node) => node.id === nodeId) ?? null
}

function normalizeProperty(property: string) {
  return property.trim().toLowerCase()
}

function getCssDeclarationSourceProperties(property: string) {
  const normalizedProperty = normalizeProperty(property)

  switch (normalizedProperty) {
    case 'background-color':
      return [normalizedProperty, 'background']
    default:
      return [normalizedProperty]
  }
}

function getCssTokenGuardProperties(property: string) {
  switch (normalizeProperty(property)) {
    case 'background-color':
      return ['background']
    case 'border-color':
      return [
        'border',
        'border-bottom-color',
        'border-left-color',
        'border-right-color',
        'border-top-color',
      ]
    case 'border-radius':
      return [
        'border-bottom-left-radius',
        'border-bottom-right-radius',
        'border-top-left-radius',
        'border-top-right-radius',
      ]
    case 'font-size':
      return ['font']
    case 'margin':
      return ['margin-bottom', 'margin-left', 'margin-right', 'margin-top']
    case 'padding':
      return ['padding-bottom', 'padding-left', 'padding-right', 'padding-top']
    default:
      return []
  }
}

function getCssShorthandConflictProperties(property: string) {
  switch (normalizeProperty(property)) {
    case 'border-color':
      return [
        'border-bottom-color',
        'border-left-color',
        'border-right-color',
        'border-top-color',
      ]
    case 'border-radius':
    case 'margin':
    case 'padding':
      return getCssTokenGuardProperties(property)
    default:
      return []
  }
}

function countLeadingWhitespace(value: string) {
  return value.length - value.trimStart().length
}

function countTrailingWhitespace(value: string) {
  return value.length - value.trimEnd().length
}
