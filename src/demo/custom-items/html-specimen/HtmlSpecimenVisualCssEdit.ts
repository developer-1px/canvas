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

export type HtmlSpecimenVisualCssEditResult =
  | {
      affectedNodeIds: string[]
      ok: false
      reason: 'node-not-found' | 'rule-not-found' | 'verification-failed'
      specimen: HtmlSpecimenData
    }
  | {
      affectedNodeIds: string[]
      ok: true
      previousSource: HtmlSpecimenCssDeclarationSource | null
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
  const patchedCss = previousSource
    ? patchExistingDeclaration({
        css: specimen.css,
        nextValue: intent.nextValue,
        source: previousSource,
      })
    : patchNewDeclaration({
        css: specimen.css,
        nextValue: intent.nextValue,
        node,
        property: intent.property,
      })

  if (!patchedCss) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'rule-not-found',
      specimen,
    }
  }

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
    previousSource,
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

  const normalizedProperty = normalizeProperty(property)
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
      if (declaration.property !== normalizedProperty) {
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

function patchExistingDeclaration({
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

  return [
    css.slice(0, declaration.valueStart),
    nextValue,
    css.slice(declaration.valueEnd),
  ].join('')
}

function patchNewDeclaration({
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
  const rule = resolveBestMatchingRule({
    css,
    node,
  })

  if (!rule) {
    return null
  }

  const indent = inferDeclarationIndent(rule)
  const needsLeadingNewline = css[rule.blockEnd - 1] !== '\n'
  const insertion = [
    needsLeadingNewline ? '\n' : '',
    `${indent}${normalizeProperty(property)}: ${nextValue};\n`,
  ].join('')

  return [
    css.slice(0, rule.blockEnd),
    insertion,
    css.slice(rule.blockEnd),
  ].join('')
}

function resolveBestMatchingRule({
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

  return best?.rule ?? null
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

  for (let index = blockStart; index <= blockEnd; index += 1) {
    if (index !== blockEnd && css[index] !== ';') {
      continue
    }

    const segment = css.slice(segmentStart, index)
    const colonOffset = segment.indexOf(':')

    if (colonOffset > 0) {
      const propertyStart = segmentStart + countLeadingWhitespace(segment)
      const rawProperty = css.slice(propertyStart, segmentStart + colonOffset)
      const valueSegmentStart = segmentStart + colonOffset + 1
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
  }

  return declarations
}

function findMatchingBrace(css: string, blockStart: number) {
  let depth = 0

  for (let index = blockStart; index < css.length; index += 1) {
    if (css[index] === '{') {
      depth += 1
    } else if (css[index] === '}') {
      depth -= 1

      if (depth === 0) {
        return index
      }
    }
  }

  return -1
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

function countLeadingWhitespace(value: string) {
  return value.length - value.trimStart().length
}

function countTrailingWhitespace(value: string) {
  return value.length - value.trimEnd().length
}
