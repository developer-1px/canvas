import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'

export type HtmlSpecimenVisualCssNode = {
  attributes: Readonly<Record<string, string>>
  classList: readonly string[]
  id: string
  tagName: string
}

export type HtmlSpecimenVisualCssEditIntent = {
  nextValue: string
  nodeId: string
  property: string
}

export type HtmlSpecimenCssDeclarationSource = {
  affectedNodeIds: string[]
  declarationIndex: number
  property: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
  value: string
}

export type HtmlSpecimenCssRuleSource = {
  affectedNodeIds: string[]
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
}

export type HtmlSpecimenCssScopedRuleSource = {
  affectedNodeIds: string[]
  atRule: string
  declarationIndex: number
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
  blockEnd: number
  declarations: CssDeclaration[]
  ruleIndex: number
  selector: string
}

type CssDeclaration = {
  declarationIndex: number
  property: string
  value: string
  valueEnd: number
  valueStart: number
}

type CssRuleMatch = {
  rule: CssRule
  specificity: [number, number, number]
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

  const scopedSource = resolveHtmlSpecimenCssScopedRuleSource({
    css: specimen.css,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })

  if (scopedSource) {
    return {
      affectedNodeIds: scopedSource.affectedNodeIds,
      ok: false,
      reason: 'scoped-rule',
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

  const matchedProperties = new Set(getCssDeclarationSourceProperties(property))
  const rules = parseCssRules(css)
  let winner: {
    declaration: CssDeclaration
    rule: CssRule
    specificity: [number, number, number]
  } | null = null

  for (const rule of rules) {
    const specificity = matchSelectorList(rule.selector, node)

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
            ruleIndex: rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: winner.declaration.declarationIndex,
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

  if (!winner) {
    return null
  }

  return {
    affectedNodeIds: nodes
      .filter((candidate) => matchSelectorList(winner.rule.selector, candidate))
      .map((candidate) => candidate.id),
    declarationIndex: winner.declaration.declarationIndex,
    property: winner.declaration.property,
    ruleIndex: winner.rule.ruleIndex,
    selector: winner.rule.selector,
    specificity: winner.specificity,
    value: winner.declaration.value,
  }
}

export function resolveHtmlSpecimenCssRuleSource({
  css,
  nodeId,
  nodes,
}: {
  css: string
  nodeId: string
  nodes: readonly HtmlSpecimenVisualCssNode[]
}): HtmlSpecimenCssRuleSource | null {
  const node = findNode(nodes, nodeId)

  if (!node) {
    return null
  }

  const match = resolveBestMatchingRuleMatch({ css, node })

  return match
    ? {
        affectedNodeIds: nodes
          .filter((candidate) => matchSelectorList(match.rule.selector, candidate))
          .map((candidate) => candidate.id),
        ruleIndex: match.rule.ruleIndex,
        selector: match.rule.selector,
        specificity: match.specificity,
      }
    : null
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
  const properties = new Set([
    normalizeProperty(property),
    ...getCssTokenGuardProperties(property),
  ])
  let winner: HtmlSpecimenCssDeclarationSource | null = null

  for (const candidateProperty of properties) {
    const source = resolveHtmlSpecimenCssDeclarationSource({
      css,
      nodeId,
      nodes,
      property: candidateProperty,
    })

    if (
      source &&
      isHtmlSpecimenCssTokenValue(source.value) &&
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
  let winner: HtmlSpecimenCssDeclarationSource | null = null

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
        !winner ||
        compareCssSource(source, winner) > 0
      )
    ) {
      winner = source
    }
  }

  return winner
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

  const properties = new Set([
    normalizeProperty(property),
    ...getCssTokenGuardProperties(property),
  ])
  let winner: {
    atRule: string
    declaration: CssDeclaration
    rule: CssRule
    specificity: [number, number, number]
  } | null = null

  for (const scopedRule of parseScopedCssRules(css)) {
    const specificity = matchSelectorList(scopedRule.rule.selector, node)

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
            ruleIndex: scopedRule.rule.ruleIndex,
            specificity,
          },
          {
            declarationIndex: winner.declaration.declarationIndex,
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

  if (!winner) {
    return null
  }

  return {
    affectedNodeIds: nodes
      .filter((candidate) => matchSelectorList(winner.rule.selector, candidate))
      .map((candidate) => candidate.id),
    atRule: winner.atRule,
    declarationIndex: winner.declaration.declarationIndex,
    property: winner.declaration.property,
    ruleIndex: winner.rule.ruleIndex,
    selector: winner.rule.selector,
    specificity: winner.specificity,
    value: winner.declaration.value,
  }
}

export function isHtmlSpecimenCssTokenValue(value: string) {
  return /\bvar\s*\(/i.test(value)
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
  property,
}: {
  css: string
  nextValue: string
  node: HtmlSpecimenVisualCssNode
  property: string
}) {
  const match = resolveBestMatchingRuleMatch({
    css,
    node,
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
}: {
  css: string
  node: HtmlSpecimenVisualCssNode
}) {
  let best: CssRuleMatch | null = null

  for (const rule of parseCssRules(css)) {
    const specificity = matchSelectorList(rule.selector, node)

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
  let cursor = 0

  while (cursor < css.length) {
    const blockStart = css.indexOf('{', cursor)

    if (blockStart < 0) {
      break
    }

    const blockEnd = findMatchingBrace(css, blockStart)

    if (blockEnd < 0) {
      break
    }

    const selector = css.slice(cursor, blockStart).trim()

    if (selector.length > 0 && !selector.startsWith('@')) {
      rules.push({
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

  return rules
}

function parseScopedCssRules(css: string) {
  const scopedRules: {
    atRule: string
    rule: CssRule
  }[] = []
  let cursor = 0

  while (cursor < css.length) {
    const blockStart = css.indexOf('{', cursor)

    if (blockStart < 0) {
      break
    }

    const blockEnd = findMatchingBrace(css, blockStart)

    if (blockEnd < 0) {
      break
    }

    const selector = css.slice(cursor, blockStart).trim()

    if (selector.startsWith('@')) {
      for (const rule of parseCssRules(css.slice(blockStart + 1, blockEnd))) {
        scopedRules.push({
          atRule: selector,
          rule: {
            ...rule,
            ruleIndex: scopedRules.length,
          },
        })
      }
    }

    cursor = blockEnd + 1
  }

  return scopedRules
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
        declarations.push({
          declarationIndex: declarations.length,
          property,
          value: css.slice(valueStart, valueEnd),
          valueEnd,
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

function findMatchingBrace(css: string, blockStart: number) {
  let depth = 0
  let index = blockStart
  const scanner = createCssScannerState()

  while (index < css.length) {
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

function matchSelectorList(
  selector: string,
  node: HtmlSpecimenVisualCssNode,
): [number, number, number] | null {
  let best: [number, number, number] | null = null

  for (const candidate of selector.split(',')) {
    const selectorPart = candidate.trim()

    if (!matchesSelector(selectorPart, node)) {
      continue
    }

    const specificity = calculateSpecificity(selectorPart)

    if (!best || compareSpecificity(specificity, best) > 0) {
      best = specificity
    }
  }

  return best
}

function matchesSelector(
  selector: string,
  node: HtmlSpecimenVisualCssNode,
) {
  const compound = getRightmostCompoundSelector(selector)

  if (compound.length === 0 || compound === '*') {
    return true
  }

  const classNames = [...compound.matchAll(/\.([_a-zA-Z][\w-]*)/g)].map(
    (match) => match[1],
  )
  const ids = [...compound.matchAll(/#([_a-zA-Z][\w-]*)/g)].map(
    (match) => match[1],
  )
  const nodeClasses = getNodeClassSet(node)
  const nodeId = node.attributes.id ?? ''

  if (ids.some((id) => id !== nodeId)) {
    return false
  }

  if (classNames.some((className) => !nodeClasses.has(className))) {
    return false
  }

  const tagName = getSelectorTagName(compound)

  return tagName === null || tagName === node.tagName.toLowerCase()
}

function getRightmostCompoundSelector(selector: string) {
  const withoutPseudo = selector.replace(/:{1,2}[_a-zA-Z][\w-]*(\([^)]*\))?/g, '')
  const parts = withoutPseudo
    .trim()
    .split(/[\s>+~]+/)
    .filter((part) => part.length > 0)

  return parts.at(-1) ?? ''
}

function getSelectorTagName(compound: string) {
  const tagName = compound
    .replace(/[#.][_a-zA-Z][\w-]*/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .trim()

  if (tagName.length === 0 || tagName === '*') {
    return null
  }

  return tagName.toLowerCase()
}

function getNodeClassSet(node: HtmlSpecimenVisualCssNode) {
  return new Set([
    ...node.classList,
    ...(node.attributes.class ?? '').split(/\s+/),
  ].filter((className) => className.length > 0))
}

function calculateSpecificity(selector: string): [number, number, number] {
  const idCount = selector.match(/#[\w-]+/g)?.length ?? 0
  const classCount = (
    (selector.match(/\.[\w-]+/g)?.length ?? 0) +
    (selector.match(/\[[^\]]+\]/g)?.length ?? 0) +
    (selector.match(/:[\w-]+/g)?.length ?? 0)
  )
  const tagCount = selector
    .split(/[\s>+~]+/)
    .filter((part) => getSelectorTagName(part) !== null)
    .length

  return [idCount, classCount, tagCount]
}

function compareCssSource(
  left: {
    declarationIndex: number
    ruleIndex: number
    specificity: [number, number, number]
  },
  right: {
    declarationIndex: number
    ruleIndex: number
    specificity: [number, number, number]
  },
) {
  const specificity = compareSpecificity(left.specificity, right.specificity)

  if (specificity !== 0) {
    return specificity
  }

  if (left.ruleIndex !== right.ruleIndex) {
    return left.ruleIndex - right.ruleIndex
  }

  return left.declarationIndex - right.declarationIndex
}

function compareSpecificity(
  left: [number, number, number],
  right: [number, number, number],
) {
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return left[index] - right[index]
    }
  }

  return 0
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
