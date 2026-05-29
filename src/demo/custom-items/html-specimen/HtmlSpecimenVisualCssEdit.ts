import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import {
  compareHtmlSpecimenCssSpecificity,
  matchHtmlSpecimenCssSelectorList,
  splitHtmlSpecimenCssSelectorList,
} from './HtmlSpecimenCssSelectorMatcher'
import {
  isHtmlSpecimenCssSupportedValue,
  shouldValidateHtmlSpecimenCssValue,
} from './HtmlSpecimenCssValueSupport'

export type HtmlSpecimenVisualCssNode = {
  attributes: Readonly<Record<string, string>>
  classList: readonly string[]
  id: string
  path?: readonly number[]
  tagName: string
}

export type HtmlSpecimenCssMediaContext = {
  viewportHeight: number
  viewportWidth: number
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
  layer?: CssCascadeLayer
  property: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
  value: string
}

export type HtmlSpecimenCssRuleSource = {
  affectedNodeIds: string[]
  atRule?: string
  layer?: CssCascadeLayer
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
}

export type HtmlSpecimenCssScopedRuleSource = {
  affectedNodeIds: string[]
  atRule: string
  declarationIndex: number
  important: boolean
  layer?: CssCascadeLayer
  property: string
  ruleIndex: number
  selector: string
  specificity: [number, number, number]
  value: string
}

export type HtmlSpecimenCssInlineStyleSource = {
  affectedNodeIds: string[]
  important: boolean
  property: string
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
        | 'inline-style'
        | 'rule-not-found'
        | 'scoped-rule'
        | 'shorthand-conflict'
        | 'token-value'
        | 'unsupported-value'
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
  layer: CssCascadeLayer | null
  declarations: CssDeclaration[]
  ruleIndex: number
  selector: string
}

type CssCascadeLayer = {
  name: string
  order: number
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

type CssSupportsEvaluation = boolean | null

type CssLayerRegistry = {
  createAnonymousLayer(): CssCascadeLayer
  getOrCreateLayer(name: string): CssCascadeLayer
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
  const mediaContext = getHtmlSpecimenCssMediaContext(specimen)

  if (!node) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'node-not-found',
      specimen,
    }
  }

  if (
    shouldValidateHtmlSpecimenCssValue(intent.property) &&
    !isHtmlSpecimenCssSupportedValue({
      property: intent.property,
      value: intent.nextValue,
    })
  ) {
    return {
      affectedNodeIds: [],
      ok: false,
      reason: 'unsupported-value',
      specimen,
    }
  }

  const previousSource = resolveHtmlSpecimenCssDeclarationSource({
    css: specimen.css,
    mediaContext,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })
  const inlineSource = resolveHtmlSpecimenCssInlineStyleSource({
    css: specimen.css,
    mediaContext,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })

  if (inlineSource) {
    return {
      affectedNodeIds: inlineSource.affectedNodeIds,
      ok: false,
      reason: 'inline-style',
      specimen,
    }
  }

  const tokenSource = resolveHtmlSpecimenCssTokenSource({
    css: specimen.css,
    mediaContext,
    nodeId: intent.nodeId,
    nodes,
    property: intent.property,
  })
  const tokenDefinitionSource = tokenSource
    ? resolveHtmlSpecimenCssTokenDefinitionSource({
        css: specimen.css,
        mediaContext,
        nodeId: intent.nodeId,
        nodes,
        property: intent.property,
      })
    : null

  if (tokenSource && !tokenDefinitionSource) {
    return {
      affectedNodeIds: tokenSource.affectedNodeIds,
      ok: false,
      reason: 'token-value',
      specimen,
    }
  }

  const shorthandConflictSource = tokenDefinitionSource
    ? null
    : resolveHtmlSpecimenCssShorthandConflictSource({
        css: specimen.css,
        mediaContext,
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

  const patchSource = tokenDefinitionSource ?? previousSource
  const patch = patchSource
    ? planExistingDeclarationPatch({
        css: specimen.css,
        mediaContext,
        nextValue: intent.nextValue,
        source: patchSource,
      })
    : planNewDeclarationPatch({
        css: specimen.css,
        mediaContext,
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
  const source = tokenDefinitionSource
    ? resolveHtmlSpecimenCssTokenDefinitionSource({
        css: patchedCss,
        mediaContext,
        nodeId: intent.nodeId,
        nodes,
        property: intent.property,
      })
    : resolveHtmlSpecimenCssDeclarationSource({
        css: patchedCss,
        mediaContext,
        nodeId: intent.nodeId,
        nodes,
        property: intent.property,
      })
  const verification = {
    actualValue: source?.value ?? null,
    expectedValue: intent.nextValue,
    passed: source?.value === intent.nextValue,
    property: tokenDefinitionSource
      ? source?.property ?? normalizeProperty(intent.property)
      : normalizeProperty(intent.property),
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
    previousSource: patchSource,
    serializedCss: patchedCss,
    source,
    specimen: nextSpecimen,
    verification,
  }
}

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

function resolveHtmlSpecimenCssDeclarationMatch({
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

function resolveHtmlSpecimenCssDeclarationMatchForProperties({
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

function getAffectedNodeIdsForDeclarationMatch({
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

function getAffectedNodeIdsForRelatedDeclarationMatch({
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

function getAffectedNodeIdsForRuleInsertion({
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

export function resolveHtmlSpecimenCssTokenSource({
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

  const properties = [
    normalizeProperty(property),
    ...getCssTokenGuardProperties(property),
  ]
  const winner = resolveHtmlSpecimenCssDeclarationMatchForProperties({
    css,
    mediaContext,
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
      mediaContext,
      nodes,
      properties,
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

export function resolveHtmlSpecimenCssTokenDefinitionSource({
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
  const tokenSource = resolveHtmlSpecimenCssTokenSource({
    css,
    mediaContext,
    nodeId,
    nodes,
    property,
  })

  if (
    !tokenSource ||
    !canPatchHtmlSpecimenCssTokenSource(property, tokenSource.property)
  ) {
    return null
  }

  const tokenName = readSingleCssVarReference(tokenSource.value)

  if (!tokenName) {
    return null
  }

  const match = resolveHtmlSpecimenCssCustomPropertyDeclarationMatch({
    css,
    mediaContext,
    node,
    nodes,
    property: tokenName,
  })

  if (!match) {
    return null
  }

  return {
    affectedNodeIds: getAffectedNodeIdsForTokenDefinitionMatch({
      css,
      match,
      mediaContext,
      nodes,
      property: tokenName,
      tokenSource,
    }),
    ...(match.rule.atRule ? { atRule: match.rule.atRule } : {}),
    declarationIndex: match.declaration.declarationIndex,
    important: match.declaration.important,
    ...(match.rule.layer ? { layer: match.rule.layer } : {}),
    property: match.declaration.property,
    ruleIndex: match.rule.ruleIndex,
    selector: match.rule.selector,
    specificity: match.specificity,
    value: match.declaration.value,
  }
}

function getAffectedNodeIdsForTokenDefinitionMatch({
  css,
  match,
  mediaContext,
  nodes,
  property,
  tokenSource,
}: {
  css: string
  match: CssDeclarationMatch
  mediaContext?: HtmlSpecimenCssMediaContext
  nodes: readonly HtmlSpecimenVisualCssNode[]
  property: string
  tokenSource: HtmlSpecimenCssDeclarationSource
}) {
  return tokenSource.affectedNodeIds.filter((nodeId) => {
    const node = findNode(nodes, nodeId)

    if (!node) {
      return false
    }

    const candidateMatch = resolveHtmlSpecimenCssCustomPropertyDeclarationMatch({
      css,
      mediaContext,
      node,
      nodes,
      property,
    })

    return candidateMatch !== null &&
      isSameCssDeclarationMatch(candidateMatch, match)
  })
}

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

  if (properties.length === 0) {
    return css
  }

  return [
    css,
    ':host, [data-preview-surface-root] {',
    ...properties.map((property) =>
      `  ${property.property}: ${property.value}${
        property.important ? ' !important' : ''
      };`),
    '}',
  ].join('\n')
}

function resolveHtmlSpecimenCssRootCustomProperties({
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

function canPatchHtmlSpecimenCssTokenSource(
  targetProperty: string,
  tokenSourceProperty: string,
) {
  const patchableProperties = new Set(
    getCssDeclarationSourceProperties(targetProperty),
  )

  return patchableProperties.has(normalizeProperty(tokenSourceProperty))
}

function readSingleCssVarReference(value: string) {
  const source = stripCssComments(value).trim()
  const match = /^var\s*\(/i.exec(source)

  if (!match) {
    return null
  }

  const openParenIndex = match[0].lastIndexOf('(')
  const closeParenIndex = findMatchingCssParenthesis(source, openParenIndex)

  if (closeParenIndex !== source.length - 1) {
    return null
  }

  const args = source.slice(openParenIndex + 1, closeParenIndex)
  const commaIndex = findTopLevelCssComma(args)
  const tokenName = (
    commaIndex < 0 ? args : args.slice(0, commaIndex)
  ).trim()

  if (!/^--[-_a-z0-9]+$/i.test(tokenName)) {
    return null
  }

  return normalizeProperty(tokenName)
}

function findTopLevelCssComma(source: string) {
  const scanner = createCssScannerState()
  let index = 0

  while (index < source.length) {
    if (source[index] === ',' && isCssScannerTopLevel(scanner)) {
      return index
    }

    index = advanceCssScannerState(source, index, scanner)
  }

  return -1
}

function resolveHtmlSpecimenCssCustomPropertyDeclarationMatch({
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

function resolveHtmlSpecimenCssRootCustomPropertyDeclarationMatch({
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

function getHtmlSpecimenNodeInheritanceChain({
  node,
  nodes,
}: {
  node: HtmlSpecimenVisualCssNode
  nodes: readonly HtmlSpecimenVisualCssNode[]
}) {
  const chain = [node]

  if (!node.path) {
    return chain
  }

  for (let depth = node.path.length - 1; depth > 0; depth -= 1) {
    const ancestorPath = node.path.slice(0, depth)
    const ancestor = nodes.find((candidate) =>
      areHtmlSpecimenNodePathsEqual(candidate.path, ancestorPath))

    if (ancestor) {
      chain.push(ancestor)
    }
  }

  return chain
}

function areHtmlSpecimenNodePathsEqual(
  left: readonly number[] | undefined,
  right: readonly number[],
) {
  return left !== undefined &&
    left.length === right.length &&
    left.every((part, index) => part === right[index])
}

function getHtmlSpecimenCssRootSelectorSpecificity(
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

function getHtmlSpecimenCssRootSelectorPartSpecificity(
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

export function resolveHtmlSpecimenCssInlineStyleSource({
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
}): HtmlSpecimenCssInlineStyleSource | null {
  const node = findNode(nodes, nodeId)

  if (!node) {
    return null
  }

  const inlineDeclaration = resolveHtmlSpecimenInlineDeclaration({
    node,
    property,
  })

  if (!inlineDeclaration) {
    return null
  }

  if (!inlineDeclaration.important) {
    const stylesheetSource = resolveHtmlSpecimenCssDeclarationMatch({
      css,
      mediaContext,
      node,
      nodes,
      property,
    })

    if (stylesheetSource?.declaration.important) {
      return null
    }
  }

  return {
    affectedNodeIds: [node.id],
    important: inlineDeclaration.important,
    property: inlineDeclaration.property,
    value: inlineDeclaration.value,
  }
}

function hasHtmlSpecimenWinningInlineStyleSource({
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
}) {
  return Array.from(properties).some((property) =>
    resolveHtmlSpecimenCssInlineStyleSource({
      css,
      mediaContext,
      nodeId: node.id,
      nodes,
      property,
    }) !== null)
}

function resolveHtmlSpecimenInlineDeclaration({
  node,
  property,
}: {
  node: HtmlSpecimenVisualCssNode
  property: string
}) {
  const style = node.attributes.style

  if (!style) {
    return null
  }

  const declarations = parseCssDeclarations({
    blockEnd: style.length + 1,
    blockStart: 1,
    css: `{${style}}`,
  })
  const properties = new Set(getCssInlineStyleSourceProperties(property))
  let winner: CssDeclaration | null = null

  for (const declaration of declarations) {
    if (!properties.has(declaration.property)) {
      continue
    }

    if (!winner || compareCssInlineDeclaration(declaration, winner) > 0) {
      winner = declaration
    }
  }

  return winner
}

export function resolveHtmlSpecimenCssShorthandConflictSource({
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
  const shorthandSource = resolveHtmlSpecimenCssDeclarationSource({
    css,
    mediaContext,
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
      mediaContext,
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

function resolveHtmlSpecimenCssScopedDeclarationMatch({
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

function getAffectedNodeIdsForScopedDeclarationMatch({
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

function planNewDeclarationPatch({
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

function resolveBestMatchingRuleMatch({
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

function parseCssRules(
  css: string,
  mediaContext?: HtmlSpecimenCssMediaContext,
): CssRule[] {
  const rules: CssRule[] = []
  const layerRegistry = createCssLayerRegistry(css)

  collectCssRules({
    atRule: null,
    css,
    end: css.length,
    layer: null,
    layerRegistry,
    mediaContext,
    rules,
    start: 0,
  })

  return rules
}

function collectCssRules({
  atRule,
  css,
  end,
  layer,
  layerRegistry,
  mediaContext,
  rules,
  start,
}: {
  atRule: string | null
  css: string
  end: number
  layer: CssCascadeLayer | null
  layerRegistry: CssLayerRegistry
  mediaContext?: HtmlSpecimenCssMediaContext
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

    const preludeStart = findCssRulePreludeStart(css, cursor, blockStart)
    const selector = stripCssComments(css.slice(preludeStart, blockStart)).trim()

    if (selector.startsWith('@')) {
      if (isCssAtRuleActive(selector, mediaContext)) {
        const ruleLayer = resolveCssAtRuleLayer({
          atRule: selector,
          blockStart,
          layer,
          layerRegistry,
        })

        collectCssRules({
          atRule: formatNestedCssAtRule(atRule, selector),
          css,
          end: blockEnd,
          layer: ruleLayer,
          layerRegistry,
          mediaContext,
          rules,
          start: blockStart + 1,
        })
      }
    } else if (selector.length > 0) {
      rules.push({
        atRule,
        blockEnd,
        declarations: parseCssDeclarations({
          blockEnd,
          blockStart: blockStart + 1,
          css,
        }),
        layer,
        ruleIndex: rules.length,
        selector,
      })
    }

    cursor = blockEnd + 1
  }
}

function createCssLayerRegistry(css: string): CssLayerRegistry {
  const layers = new Map<string, CssCascadeLayer>()
  let nextOrder = 0

  const getOrCreateLayer = (name: string): CssCascadeLayer => {
    const existing = layers.get(name)

    if (existing) {
      return existing
    }

    const layer = {
      name,
      order: nextOrder,
    }

    nextOrder += 1
    layers.set(name, layer)

    return layer
  }

  collectCssLayerOrderDeclarations(css, getOrCreateLayer)

  return {
    createAnonymousLayer() {
      const layer = {
        name: `(anonymous ${nextOrder})`,
        order: nextOrder,
      }

      nextOrder += 1

      return layer
    },
    getOrCreateLayer,
  }
}

function collectCssLayerOrderDeclarations(
  css: string,
  getOrCreateLayer: (name: string) => CssCascadeLayer,
) {
  const scanner = createCssScannerState()
  let index = 0

  while (index < css.length) {
    if (isCssScannerTopLevel(scanner) && isCssLayerKeywordAt(css, index)) {
      const preludeStart = index + '@layer'.length
      const terminator = findCssAtRulePreludeTerminator(css, preludeStart)

      if (!terminator) {
        return
      }

      for (const name of splitCssLayerNameList(
        stripCssComments(css.slice(preludeStart, terminator.index)).trim(),
      )) {
        getOrCreateLayer(name)
      }

      if (terminator.kind === 'block') {
        const blockEnd = findMatchingBrace(css, terminator.index)

        index = blockEnd >= 0 ? blockEnd + 1 : terminator.index + 1
        continue
      }

      index = terminator.index + 1
      continue
    }

    index = advanceCssScannerState(css, index, scanner)
  }
}

function resolveCssAtRuleLayer({
  atRule,
  blockStart,
  layer,
  layerRegistry,
}: {
  atRule: string
  blockStart: number
  layer: CssCascadeLayer | null
  layerRegistry: CssLayerRegistry
}) {
  if (!isCssLayerAtRule(atRule)) {
    return layer
  }

  const names = splitCssLayerNameList(
    stripCssComments(atRule.slice('@layer'.length)).trim(),
  )

  if (names.length === 0) {
    return layerRegistry.createAnonymousLayer()
  }

  const name = layer ? `${layer.name}.${names[0]}` : names[0]

  return layerRegistry.getOrCreateLayer(name ?? `(anonymous ${blockStart})`)
}

function isCssLayerAtRule(atRule: string) {
  return isCssLayerKeywordAt(stripCssComments(atRule).trim(), 0)
}

function isCssLayerKeywordAt(source: string, index: number) {
  return source.slice(index, index + '@layer'.length).toLowerCase() ===
    '@layer' &&
    !isCssIdentifierChar(source[index + '@layer'.length] ?? '')
}

function findCssAtRulePreludeTerminator(css: string, start: number) {
  const scanner = createCssScannerState()
  let index = start

  while (index < css.length) {
    if (isCssScannerTopLevel(scanner)) {
      if (css[index] === ';') {
        return {
          index,
          kind: 'statement' as const,
        }
      }

      if (css[index] === '{') {
        return {
          index,
          kind: 'block' as const,
        }
      }
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  return null
}

function splitCssLayerNameList(source: string) {
  const names: string[] = []
  const scanner = createCssScannerState()
  let start = 0
  let index = 0

  while (index < source.length) {
    if (source[index] === ',' && isCssScannerTopLevel(scanner)) {
      appendCssLayerName(names, source.slice(start, index))
      start = index + 1
      index += 1
      continue
    }

    index = advanceCssScannerState(source, index, scanner)
  }

  appendCssLayerName(names, source.slice(start))

  return names
}

function appendCssLayerName(names: string[], rawName: string) {
  const name = rawName.trim()

  if (/^[a-z_][\w-]*(?:\.[a-z_][\w-]*)*$/i.test(name)) {
    names.push(name)
  }
}

function findCssRulePreludeStart(
  css: string,
  start: number,
  end: number,
) {
  const scanner = createCssScannerState()
  let preludeStart = start
  let index = start

  while (index < end) {
    if (css[index] === ';' && isCssScannerTopLevel(scanner)) {
      preludeStart = index + 1
    }

    index = advanceCssScannerState(css, index, scanner)
  }

  return preludeStart
}

function formatNestedCssAtRule(parent: string | null, atRule: string) {
  return parent ? `${parent} / ${atRule}` : atRule
}

function isCssAtRuleActive(
  atRule: string,
  mediaContext: HtmlSpecimenCssMediaContext | undefined,
) {
  const source = stripCssComments(atRule).trim()

  if (isCssAtRuleKeyword(source, '@media')) {
    if (!mediaContext) {
      return true
    }

    const queryList = source.slice('@media'.length).trim()

    return splitCssMediaQueryList(queryList).some((query) =>
      matchesCssMediaQuery(query, mediaContext))
  }

  if (isCssAtRuleKeyword(source, '@supports')) {
    return matchesCssSupportsRule(source) ?? false
  }

  if (isCssLayerAtRule(source)) {
    return true
  }

  return false
}

function isCssAtRuleKeyword(source: string, keyword: string) {
  return source.slice(0, keyword.length).toLowerCase() === keyword &&
    !isCssIdentifierChar(source[keyword.length] ?? '')
}

function splitCssMediaQueryList(queryList: string) {
  const queries: string[] = []
  const scanner = createCssScannerState()
  let start = 0
  let index = 0

  while (index < queryList.length) {
    if (queryList[index] === ',' && isCssScannerTopLevel(scanner)) {
      queries.push(queryList.slice(start, index).trim())
      start = index + 1
      index += 1
      continue
    }

    index = advanceCssScannerState(queryList, index, scanner)
  }

  queries.push(queryList.slice(start).trim())

  return queries.filter((query) => query.length > 0)
}

function matchesCssMediaQuery(
  query: string,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  let source = query.trim().toLowerCase()
  let negated = false

  if (source.startsWith('not ')) {
    negated = true
    source = source.slice('not '.length).trim()
  }

  if (source.startsWith('only ')) {
    source = source.slice('only '.length).trim()
  }

  let active = matchesCssMediaType(source)

  for (const feature of readCssMediaFeatureExpressions(source)) {
    const result = matchesCssMediaFeatureExpression(feature, mediaContext)

    if (result === null) {
      active = false
      break
    }

    active = active && result
  }

  return negated ? !active : active
}

function matchesCssMediaType(query: string) {
  const beforeFeature = query.split('(')[0]
  const mediaTypes = beforeFeature
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) =>
      token.length > 0 &&
      token !== 'and' &&
      token !== 'not' &&
      token !== 'only')

  if (mediaTypes.length === 0) {
    return true
  }

  return mediaTypes.some((mediaType) =>
    mediaType === 'all' || mediaType === 'screen')
}

function parseCssMediaLengthPx(value: string | undefined, unit: string) {
  const parsed = Number.parseFloat(value ?? '0')

  return unit === 'em' || unit === 'rem' ? parsed * 16 : parsed
}

function readCssMediaFeatureExpressions(source: string) {
  const features: string[] = []
  let index = 0

  while (index < source.length) {
    if (source[index] !== '(') {
      index += 1
      continue
    }

    const end = findMatchingCssParenthesis(source, index)

    if (end < 0) {
      return ['']
    }

    features.push(source.slice(index + 1, end).trim())
    index = end + 1
  }

  return features
}

function matchesCssMediaFeatureExpression(
  feature: string,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  const source = stripCssComments(feature).trim().toLowerCase()

  if (source.length === 0) {
    return null
  }

  const legacyRange = source.match(
    /^(min|max)-(width|height)\s*:\s*([0-9]*\.?[0-9]+)(px|rem|em)?$/,
  )

  if (legacyRange) {
    const [, range, axis, rawValue, unit = 'px'] = legacyRange
    const actual = getCssMediaAxisValue(axis, mediaContext)
    const expected = parseCssMediaLengthPx(rawValue, unit)

    return range === 'min'
      ? actual >= expected
      : actual <= expected
  }

  const exactFeature = source.match(
    /^(width|height)\s*:\s*([0-9]*\.?[0-9]+)(px|rem|em)?$/,
  )

  if (exactFeature) {
    const [, axis, rawValue, unit = 'px'] = exactFeature

    return getCssMediaAxisValue(axis, mediaContext) ===
      parseCssMediaLengthPx(rawValue, unit)
  }

  const orientation = source.match(/^orientation\s*:\s*(landscape|portrait)$/)

  if (orientation) {
    const actual = mediaContext.viewportWidth >= mediaContext.viewportHeight
      ? 'landscape'
      : 'portrait'

    return orientation[1] === actual
  }

  return matchesCssMediaRangeExpression(source, mediaContext)
}

function matchesCssMediaRangeExpression(
  source: string,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  const operator = '(<=|>=|<|>|=)'
  const length = '([0-9]*\\.?[0-9]+)(px|rem|em)?'
  const axis = '(width|height)'
  const axisFirst = source.match(new RegExp(
    `^${axis}\\s*${operator}\\s*${length}$`,
  ))

  if (axisFirst) {
    const [, rawAxis, rawOperator, rawValue, unit = 'px'] = axisFirst

    return compareCssMediaRangeValue(
      getCssMediaAxisValue(rawAxis, mediaContext),
      rawOperator,
      parseCssMediaLengthPx(rawValue, unit),
    )
  }

  const lengthFirst = source.match(new RegExp(
    `^${length}\\s*${operator}\\s*${axis}$`,
  ))

  if (lengthFirst) {
    const [, rawValue, unit = 'px', rawOperator, rawAxis] = lengthFirst

    return compareCssMediaRangeValue(
      parseCssMediaLengthPx(rawValue, unit),
      rawOperator,
      getCssMediaAxisValue(rawAxis, mediaContext),
    )
  }

  const chained = source.match(new RegExp(
    `^${length}\\s*${operator}\\s*${axis}\\s*${operator}\\s*${length}$`,
  ))

  if (chained) {
    const [
      ,
      rawLeft,
      leftUnit = 'px',
      leftOperator,
      rawAxis,
      rightOperator,
      rawRight,
      rightUnit = 'px',
    ] = chained
    const actual = getCssMediaAxisValue(rawAxis, mediaContext)

    return compareCssMediaRangeValue(
      parseCssMediaLengthPx(rawLeft, leftUnit),
      leftOperator,
      actual,
    ) &&
      compareCssMediaRangeValue(
        actual,
        rightOperator,
        parseCssMediaLengthPx(rawRight, rightUnit),
      )
  }

  return null
}

function getCssMediaAxisValue(
  axis: string | undefined,
  mediaContext: HtmlSpecimenCssMediaContext,
) {
  return axis === 'height'
    ? mediaContext.viewportHeight
    : mediaContext.viewportWidth
}

function compareCssMediaRangeValue(
  left: number,
  operator: string | undefined,
  right: number,
) {
  switch (operator) {
    case '<':
      return left < right
    case '<=':
      return left <= right
    case '>':
      return left > right
    case '>=':
      return left >= right
    case '=':
      return left === right
    default:
      return false
  }
}

function matchesCssSupportsRule(atRule: string): CssSupportsEvaluation {
  return evaluateCssSupportsCondition(
    atRule.slice('@supports'.length).trim(),
  )
}

function evaluateCssSupportsCondition(
  condition: string,
): CssSupportsEvaluation {
  const source = unwrapCssSupportsOuterParens(condition)

  if (source.length === 0) {
    return null
  }

  const orParts = splitCssSupportsConditionByOperator(source, 'or')

  if (orParts.length > 1) {
    let hasUnknown = false

    for (const part of orParts) {
      const result = evaluateCssSupportsCondition(part)

      if (result === true) {
        return true
      }

      hasUnknown = hasUnknown || result === null
    }

    return hasUnknown ? null : false
  }

  const andParts = splitCssSupportsConditionByOperator(source, 'and')

  if (andParts.length > 1) {
    let hasUnknown = false

    for (const part of andParts) {
      const result = evaluateCssSupportsCondition(part)

      if (result === false) {
        return false
      }

      hasUnknown = hasUnknown || result === null
    }

    return hasUnknown ? null : true
  }

  const notCondition = readCssSupportsNotCondition(source)

  if (notCondition !== null) {
    const result = evaluateCssSupportsCondition(notCondition)

    return result === null ? null : !result
  }

  const declaration = parseCssSupportsDeclaration(source)

  return declaration
    ? evaluateCssSupportsDeclaration(declaration)
    : null
}

function unwrapCssSupportsOuterParens(condition: string) {
  let source = condition.trim()

  while (
    source.startsWith('(') &&
    findMatchingCssParenthesis(source, 0) === source.length - 1
  ) {
    source = source.slice(1, -1).trim()
  }

  return source
}

function splitCssSupportsConditionByOperator(
  condition: string,
  operator: 'and' | 'or',
) {
  const parts: string[] = []
  const scanner = createCssScannerState()
  let start = 0
  let index = 0

  while (index < condition.length) {
    if (
      isCssScannerTopLevel(scanner) &&
      isCssKeywordAt(condition, index, operator)
    ) {
      parts.push(condition.slice(start, index).trim())
      index += operator.length
      start = index
      continue
    }

    index = advanceCssScannerState(condition, index, scanner)
  }

  parts.push(condition.slice(start).trim())

  return parts.filter((part) => part.length > 0)
}

function readCssSupportsNotCondition(condition: string) {
  const source = condition.trim()

  return isCssKeywordAt(source, 0, 'not')
    ? source.slice('not'.length).trim()
    : null
}

function parseCssSupportsDeclaration(condition: string) {
  const colonIndex = findCssDeclarationColon({
    css: condition,
    end: condition.length,
    start: 0,
  })

  if (colonIndex <= 0) {
    return null
  }

  const property = normalizeProperty(condition.slice(0, colonIndex))
  const value = stripCssComments(condition.slice(colonIndex + 1)).trim()

  return property.length > 0 && value.length > 0
    ? { property, value }
    : null
}

function evaluateCssSupportsDeclaration({
  property,
  value,
}: {
  property: string
  value: string
}): CssSupportsEvaluation {
  const normalizedValue = value.trim().toLowerCase()

  switch (property) {
    case 'display':
      return new Set([
        'block',
        'contents',
        'flex',
        'flow-root',
        'grid',
        'inline',
        'inline-block',
        'inline-flex',
        'inline-grid',
        'none',
      ]).has(normalizedValue)
    default:
      return null
  }
}

function findMatchingCssParenthesis(source: string, start: number) {
  let comment = false
  let depth = 0
  let escaped = false
  let index = start
  let quote: '"' | "'" | null = null

  while (index < source.length) {
    const char = source[index] ?? ''
    const next = source[index + 1] ?? ''

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
      index += 1
      continue
    }

    if (char === '(') {
      depth += 1
    } else if (char === ')') {
      depth -= 1

      if (depth === 0) {
        return index
      }
    }

    index += 1
  }

  return -1
}

function isCssKeywordAt(source: string, index: number, keyword: string) {
  if (source.slice(index, index + keyword.length).toLowerCase() !== keyword) {
    return false
  }

  const before = source[index - 1] ?? ''
  const after = source[index + keyword.length] ?? ''

  return !isCssIdentifierChar(before) && !isCssIdentifierChar(after)
}

function isCssIdentifierChar(char: string) {
  return /[a-z0-9_-]/i.test(char)
}

function parseScopedCssRules(
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
    layer?: CssCascadeLayer | null
    ruleIndex: number
    specificity: [number, number, number]
  },
  right: {
    declarationIndex: number
    important?: boolean
    layer?: CssCascadeLayer | null
    ruleIndex: number
    specificity: [number, number, number]
  },
) {
  const important = Boolean(left.important)

  if (important !== Boolean(right.important)) {
    return important ? 1 : -1
  }

  const layer = compareCssCascadeLayerPrecedence(left, right, important)

  if (layer !== 0) {
    return layer
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

function compareCssCascadeLayerPrecedence(
  left: { layer?: CssCascadeLayer | null },
  right: { layer?: CssCascadeLayer | null },
  important: boolean,
) {
  const leftLayer = left.layer ?? null
  const rightLayer = right.layer ?? null

  if (leftLayer === null && rightLayer === null) {
    return 0
  }

  if (leftLayer === null || rightLayer === null) {
    if (important) {
      return leftLayer === null ? -1 : 1
    }

    return leftLayer === null ? 1 : -1
  }

  if (leftLayer.order === rightLayer.order) {
    return 0
  }

  return important
    ? rightLayer.order - leftLayer.order
    : leftLayer.order - rightLayer.order
}

function compareCssInlineDeclaration(
  left: CssDeclaration,
  right: CssDeclaration,
) {
  if (left.important !== right.important) {
    return left.important ? 1 : -1
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

function getHtmlSpecimenCssMediaContext(
  specimen: HtmlSpecimenData,
): HtmlSpecimenCssMediaContext {
  return {
    viewportHeight: specimen.viewportHeight,
    viewportWidth: specimen.viewportWidth,
  }
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

function getCssInlineStyleSourceProperties(property: string) {
  return [
    normalizeProperty(property),
    ...getCssDeclarationSourceProperties(property),
    ...getCssTokenGuardProperties(property),
    ...getCssShorthandConflictProperties(property),
  ]
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
