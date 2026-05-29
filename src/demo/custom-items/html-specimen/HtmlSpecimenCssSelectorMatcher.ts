export type HtmlSpecimenCssSelectorNode = {
  attributes: Readonly<Record<string, string>>
  classList: readonly string[]
  path?: readonly number[]
  tagName: string
}

type CssSelectorRelation =
  | 'adjacent-sibling'
  | 'child'
  | 'descendant'
  | 'subsequent-sibling'

type CssSelectorSegment = {
  compound: string
  relationToPrevious: CssSelectorRelation
}

type CssAttributeSelector =
  | {
      caseInsensitive: boolean
      name: string
      operator:
        | 'dash-match'
        | 'equals'
        | 'includes'
        | 'prefix'
        | 'substring'
        | 'suffix'
      value: string
    }
  | {
      name: string
      operator: 'exists'
    }

type CssPseudoFunctionSelector = {
  args: string
  end: number
  name: 'has' | 'is' | 'not' | 'where'
  start: number
}

type CssNthFormula = {
  a: number
  b: number
}

type CssStructuralPseudoClassSelector =
  | {
      end: number
      name: 'first-child' | 'last-child' | 'only-child'
      start: number
    }
  | {
      end: number
      formula: CssNthFormula
      name: 'nth-child' | 'nth-last-child'
      start: number
    }

type CssPseudoSelectorRange = {
  end: number
  start: number
}

type CssPseudoSelectors = {
  functions: CssPseudoFunctionSelector[]
  structuralClasses: CssStructuralPseudoClassSelector[]
}

type CssHasRelativeSelector = {
  compound: string
  relation: CssSelectorRelation
}

export function matchHtmlSpecimenCssSelectorList(
  selector: string,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
): [number, number, number] | null {
  let best: [number, number, number] | null = null

  for (const candidate of splitCssSelectorList(selector)) {
    const selectorPart = candidate.trim()

    if (!matchesSelector(selectorPart, node, nodes)) {
      continue
    }

    const specificity = calculateSpecificity(selectorPart)

    if (!best || compareHtmlSpecimenCssSpecificity(specificity, best) > 0) {
      best = specificity
    }
  }

  return best
}

function splitCssSelectorList(selector: string) {
  const selectors: string[] = []
  let bracketDepth = 0
  let parenDepth = 0
  let quote: '"' | "'" | null = null
  let escaped = false
  let start = 0
  let index = 0

  while (index < selector.length) {
    const char = selector[index] ?? ''

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

    if (char === '\\') {
      index += 2
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      index += 1
      continue
    }

    if (char === '[') {
      bracketDepth += 1
    } else if (char === ']' && bracketDepth > 0) {
      bracketDepth -= 1
    } else if (char === '(') {
      parenDepth += 1
    } else if (char === ')' && parenDepth > 0) {
      parenDepth -= 1
    } else if (char === ',' && bracketDepth === 0 && parenDepth === 0) {
      selectors.push(selector.slice(start, index))
      start = index + 1
    }

    index += 1
  }

  selectors.push(selector.slice(start))

  return selectors
}

export function compareHtmlSpecimenCssSpecificity(
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

function matchesSelector(
  selector: string,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const segments = parseCssSelectorSegments(selector)

  return segments !== null &&
    segments.length > 0 &&
    matchesCssSelectorSegment({
      index: segments.length - 1,
      node,
      nodes,
      segments,
    })
}

function matchesCssSelectorSegment({
  index,
  node,
  nodes,
  segments,
}: {
  index: number
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
  segments: readonly CssSelectorSegment[]
}): boolean {
  const segment = segments[index]

  if (!segment || !matchesCompoundSelector(segment.compound, node, nodes)) {
    return false
  }

  if (index === 0) {
    return true
  }

  const ancestors = getNodeAncestors({ node, nodes })

  if (segment.relationToPrevious === 'child') {
    const parent = ancestors.at(-1)

    return parent
      ? matchesCssSelectorSegment({
          index: index - 1,
          node: parent,
          nodes,
          segments,
        })
      : false
  }

  if (segment.relationToPrevious === 'adjacent-sibling') {
    const sibling = getPreviousNodeSibling({ node, nodes })

    return sibling
      ? matchesCssSelectorSegment({
          index: index - 1,
          node: sibling,
          nodes,
          segments,
        })
      : false
  }

  if (segment.relationToPrevious === 'subsequent-sibling') {
    for (const sibling of getPreviousNodeSiblings({ node, nodes })) {
      if (matchesCssSelectorSegment({
        index: index - 1,
        node: sibling,
        nodes,
        segments,
      })) {
        return true
      }
    }

    return false
  }

  for (let ancestorIndex = ancestors.length - 1; ancestorIndex >= 0; ancestorIndex -= 1) {
    if (matchesCssSelectorSegment({
      index: index - 1,
      node: ancestors[ancestorIndex],
      nodes,
      segments,
    })) {
      return true
    }
  }

  return false
}

function matchesCompoundSelector(
  compound: string,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const pseudoSelectors = readCssPseudoSelectors(compound)

  if (!pseudoSelectors) {
    return false
  }

  for (const pseudoFunction of pseudoSelectors.functions) {
    if (!canMatchCssPseudoFunctionSelector(pseudoFunction)) {
      return false
    }

    if (pseudoFunction.name === 'has') {
      if (!matchesCssHasPseudoFunctionSelector(pseudoFunction, node, nodes)) {
        return false
      }

      continue
    }

    const matchesPseudoArgs =
      matchHtmlSpecimenCssSelectorList(pseudoFunction.args, node, nodes) !== null

    if (pseudoFunction.name === 'not') {
      if (matchesPseudoArgs) {
        return false
      }

      continue
    }

    if (!matchesPseudoArgs) {
      return false
    }
  }

  if (!pseudoSelectors.structuralClasses.every((pseudoClass) =>
    matchesCssStructuralPseudoClassSelector(pseudoClass, node, nodes))) {
    return false
  }

  const compoundWithoutPseudos = removeCssPseudoSelectors(
    compound,
    [
      ...pseudoSelectors.functions,
      ...pseudoSelectors.structuralClasses,
    ],
  )

  if (hasUnsupportedCssPseudoSelector(compoundWithoutPseudos)) {
    return false
  }

  if (
    compoundWithoutPseudos.length === 0 ||
    compoundWithoutPseudos === '*'
  ) {
    return true
  }

  const attributes = parseCssAttributeSelectors(compoundWithoutPseudos)

  if (!attributes) {
    return false
  }

  const simpleCompound = removeCssAttributeSelectors(compoundWithoutPseudos)
  const classNames = readCssSimpleSelectorNames(simpleCompound, '.')
  const ids = readCssSimpleSelectorNames(simpleCompound, '#')
  const nodeClasses = getNodeClassSet(node)
  const nodeId = node.attributes.id ?? ''

  if (ids.some((id) => id !== nodeId)) {
    return false
  }

  if (classNames.some((className) => !nodeClasses.has(className))) {
    return false
  }

  if (!attributes.every((attribute) =>
    matchesCssAttributeSelector(attribute, node))) {
    return false
  }

  const tagName = getSelectorTagName(simpleCompound)

  return tagName === null || tagName === node.tagName.toLowerCase()
}

function canMatchCssPseudoFunctionSelector(
  pseudoFunction: CssPseudoFunctionSelector,
) {
  if (pseudoFunction.name === 'has') {
    return parseCssHasRelativeSelectors(pseudoFunction.args) !== null
  }

  const selectors = splitCssSelectorList(pseudoFunction.args)

  return selectors.length > 0 &&
    selectors.every((selector) => {
      const selectorPart = selector.trim()

      return selectorPart.length > 0 &&
        parseCssSelectorSegments(selectorPart) !== null
    })
}

function matchesCssHasPseudoFunctionSelector(
  pseudoFunction: CssPseudoFunctionSelector,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const relatives = parseCssHasRelativeSelectors(pseudoFunction.args)

  if (!relatives) {
    return false
  }

  return relatives.some((relative) =>
    nodes.some((candidate) =>
      matchesCssHasRelation({
        candidate,
        node,
        relation: relative.relation,
      }) &&
      matchesCompoundSelector(relative.compound, candidate, nodes)))
}

function parseCssHasRelativeSelectors(
  args: string,
): CssHasRelativeSelector[] | null {
  const relatives: CssHasRelativeSelector[] = []

  for (const selector of splitCssSelectorList(args)) {
    const relative = parseCssHasRelativeSelector(selector)

    if (!relative) {
      return null
    }

    relatives.push(relative)
  }

  return relatives.length > 0 ? relatives : null
}

function parseCssHasRelativeSelector(
  selector: string,
): CssHasRelativeSelector | null {
  let source = selector.trim()
  let relation: CssSelectorRelation = 'descendant'

  if (source.startsWith('>')) {
    relation = 'child'
    source = source.slice(1).trim()
  } else if (source.startsWith('+')) {
    relation = 'adjacent-sibling'
    source = source.slice(1).trim()
  } else if (source.startsWith('~')) {
    relation = 'subsequent-sibling'
    source = source.slice(1).trim()
  }

  const segments = parseCssSelectorSegments(source)

  return segments && segments.length === 1
    ? {
        compound: segments[0]!.compound,
        relation,
      }
    : null
}

function matchesCssHasRelation({
  candidate,
  node,
  relation,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  node: HtmlSpecimenCssSelectorNode
  relation: CssSelectorRelation
}) {
  switch (relation) {
    case 'adjacent-sibling':
      return isNextNodeSibling({ candidate, node })
    case 'child':
      return isNodeParent(node, candidate)
    case 'descendant':
      return isNodeAncestor(node, candidate)
    case 'subsequent-sibling':
      return isSubsequentNodeSibling({ candidate, node })
  }
}

function matchesCssStructuralPseudoClassSelector(
  pseudoClass: CssStructuralPseudoClassSelector,
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  switch (pseudoClass.name) {
    case 'first-child':
      return isFirstNodeChild(node)
    case 'last-child':
      return isLastNodeChild(node, nodes)
    case 'nth-child':
      return matchesCssNthFormula(
        getNodeChildPosition(node),
        pseudoClass.formula,
      )
    case 'nth-last-child':
      return matchesCssNthFormula(
        getNodeLastChildPosition(node, nodes),
        pseudoClass.formula,
      )
    case 'only-child':
      return isFirstNodeChild(node) && isLastNodeChild(node, nodes)
  }
}

function parseCssSelectorSegments(selector: string): CssSelectorSegment[] | null {
  if (hasUnsupportedCssPseudoSelector(selector)) {
    return null
  }

  const sourceSelector = selector.trim()
  const segments: CssSelectorSegment[] = []
  let bracketDepth = 0
  let parenDepth = 0
  let quote: '"' | "'" | null = null
  let buffer = ''
  let relationToNext: CssSelectorRelation = 'descendant'
  let index = 0

  while (index < sourceSelector.length) {
    const char = sourceSelector[index] ?? ''

    if (quote) {
      buffer += char

      if (char === '\\') {
        buffer += sourceSelector[index + 1] ?? ''
        index += 2
        continue
      }

      if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (char === '\\') {
      buffer += char
      buffer += sourceSelector[index + 1] ?? ''
      index += 2
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      buffer += char
      index += 1
      continue
    }

    if (char === '[') {
      bracketDepth += 1
      buffer += char
      index += 1
      continue
    }

    if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1)
      buffer += char
      index += 1
      continue
    }

    if (bracketDepth === 0 && char === '(') {
      parenDepth += 1
      buffer += char
      index += 1
      continue
    }

    if (bracketDepth === 0 && char === ')') {
      parenDepth = Math.max(0, parenDepth - 1)
      buffer += char
      index += 1
      continue
    }

    if (bracketDepth === 0 && parenDepth === 0 && char === '>') {
      appendCssSelectorSegment({
        buffer,
        relationToPrevious: relationToNext,
        segments,
      })
      buffer = ''
      relationToNext = 'child'
      index += 1
      continue
    }

    if (
      bracketDepth === 0 &&
      parenDepth === 0 &&
      (char === '+' || char === '~')
    ) {
      appendCssSelectorSegment({
        buffer,
        relationToPrevious: relationToNext,
        segments,
      })
      buffer = ''
      relationToNext = char === '+'
        ? 'adjacent-sibling'
        : 'subsequent-sibling'
      index += 1
      continue
    }

    if (bracketDepth === 0 && parenDepth === 0 && /\s/.test(char)) {
      if (buffer.trim().length > 0) {
        appendCssSelectorSegment({
          buffer,
          relationToPrevious: relationToNext,
          segments,
        })
        buffer = ''
        relationToNext = 'descendant'
      }
      index += 1
      continue
    }

    buffer += char
    index += 1
  }

  if (bracketDepth !== 0 || parenDepth !== 0 || quote !== null) {
    return null
  }

  appendCssSelectorSegment({
    buffer,
    relationToPrevious: relationToNext,
    segments,
  })

  return segments
}

function appendCssSelectorSegment({
  buffer,
  relationToPrevious,
  segments,
}: {
  buffer: string
  relationToPrevious: CssSelectorRelation
  segments: CssSelectorSegment[]
}) {
  const compound = buffer.trim()

  if (compound.length === 0) {
    return
  }

  segments.push({
    compound,
    relationToPrevious: segments.length === 0
      ? 'descendant'
      : relationToPrevious,
  })
}

function hasUnsupportedCssPseudoSelector(selector: string) {
  let bracketDepth = 0
  let escaped = false
  let quote: '"' | "'" | null = null
  let index = 0

  while (index < selector.length) {
    const char = selector[index] ?? ''

    if (escaped) {
      escaped = false
      index += 1
      continue
    }

    if (char === '\\') {
      escaped = true
      index += 1
      continue
    }

    if (quote) {
      if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      index += 1
      continue
    }

    if (char === '[') {
      bracketDepth += 1
      index += 1
      continue
    }

    if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1)
      index += 1
      continue
    }

    if (bracketDepth === 0 && char === ':') {
      const pseudoFunction = readCssPseudoFunctionSelector(selector, index)

      if (pseudoFunction) {
        index = pseudoFunction.end
        continue
      }

      const pseudoClass = readCssStructuralPseudoClassSelector(selector, index)

      if (pseudoClass) {
        index = pseudoClass.end
        continue
      }

      return true
    }

    index += 1
  }

  return false
}

function readCssPseudoSelectors(source: string): CssPseudoSelectors | null {
  const functions: CssPseudoFunctionSelector[] = []
  const structuralClasses: CssStructuralPseudoClassSelector[] = []
  let bracketDepth = 0
  let escaped = false
  let quote: '"' | "'" | null = null
  let index = 0

  while (index < source.length) {
    const char = source[index] ?? ''

    if (escaped) {
      escaped = false
      index += 1
      continue
    }

    if (char === '\\') {
      escaped = true
      index += 1
      continue
    }

    if (quote) {
      if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      index += 1
      continue
    }

    if (char === '[') {
      bracketDepth += 1
      index += 1
      continue
    }

    if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1)
      index += 1
      continue
    }

    if (bracketDepth === 0 && char === ':') {
      const pseudoFunction = readCssPseudoFunctionSelector(source, index)

      if (pseudoFunction) {
        functions.push(pseudoFunction)
        index = pseudoFunction.end
        continue
      }

      const pseudoClass = readCssStructuralPseudoClassSelector(source, index)

      if (!pseudoClass) {
        return null
      }

      structuralClasses.push(pseudoClass)
      index = pseudoClass.end
      continue
    }

    index += 1
  }

  return bracketDepth === 0 && quote === null
    ? {
        functions,
        structuralClasses,
      }
    : null
}

function readCssPseudoFunctionSelectors(source: string) {
  return readCssPseudoSelectors(source)?.functions ?? null
}

function readCssPseudoFunctionSelector(
  source: string,
  start: number,
): CssPseudoFunctionSelector | null {
  if (source[start] !== ':') {
    return null
  }

  const match = /^(has|is|not|where)\(/i.exec(source.slice(start + 1))

  if (!match) {
    return null
  }

  const name = match[1]?.toLowerCase()

  if (
    name !== 'has' &&
    name !== 'is' &&
    name !== 'not' &&
    name !== 'where'
  ) {
    return null
  }

  const openParen = start + 1 + name.length
  const closeParen = findCssFunctionEnd(source, openParen)

  if (closeParen === null) {
    return null
  }

  return {
    args: source.slice(openParen + 1, closeParen),
    end: closeParen + 1,
    name,
    start,
  }
}

function readCssStructuralPseudoClassSelector(
  source: string,
  start: number,
): CssStructuralPseudoClassSelector | null {
  if (source[start] !== ':' || source[start + 1] === ':') {
    return null
  }

  const staticMatch = /^(first-child|last-child|only-child)(?![-_a-zA-Z0-9(])/i
    .exec(source.slice(start + 1))

  const staticName = staticMatch?.[1]?.toLowerCase()

  if (
    staticName === 'first-child' ||
    staticName === 'last-child' ||
    staticName === 'only-child'
  ) {
    return {
      end: start + 1 + staticName.length,
      name: staticName,
      start,
    }
  }

  const nthMatch = /^(nth-child|nth-last-child)\(/i
    .exec(source.slice(start + 1))
  const nthName = nthMatch?.[1]?.toLowerCase()

  if (nthName !== 'nth-child' && nthName !== 'nth-last-child') {
    return null
  }

  const openParen = start + 1 + nthName.length
  const closeParen = findCssFunctionEnd(source, openParen)

  if (closeParen === null) {
    return null
  }

  const formula = parseCssNthFormula(source.slice(openParen + 1, closeParen))

  if (!formula) {
    return null
  }

  return {
    end: closeParen + 1,
    formula,
    name: nthName,
    start,
  }
}

function parseCssNthFormula(source: string): CssNthFormula | null {
  const formula = source.toLowerCase().replace(/\s+/g, '')

  if (formula.length === 0) {
    return null
  }

  if (formula === 'odd') {
    return { a: 2, b: 1 }
  }

  if (formula === 'even') {
    return { a: 2, b: 0 }
  }

  if (/^[+-]?\d+$/.test(formula)) {
    return { a: 0, b: Number(formula) }
  }

  const match = /^([+-]?\d*)n([+-]\d+)?$/.exec(formula)

  if (!match) {
    return null
  }

  const coefficient = match[1] ?? ''
  const a = coefficient === '' || coefficient === '+'
    ? 1
    : coefficient === '-'
      ? -1
      : Number(coefficient)
  const b = match[2] ? Number(match[2]) : 0

  return Number.isSafeInteger(a) && Number.isSafeInteger(b)
    ? { a, b }
    : null
}

function matchesCssNthFormula(
  position: number | null,
  formula: CssNthFormula,
) {
  if (position === null || position < 1) {
    return false
  }

  if (formula.a === 0) {
    return position === formula.b
  }

  const step = (position - formula.b) / formula.a

  return Number.isInteger(step) && step >= 0
}

function findCssFunctionEnd(source: string, openParen: number) {
  let bracketDepth = 0
  let depth = 1
  let escaped = false
  let quote: '"' | "'" | null = null
  let index = openParen + 1

  while (index < source.length) {
    const char = source[index] ?? ''

    if (escaped) {
      escaped = false
      index += 1
      continue
    }

    if (char === '\\') {
      escaped = true
      index += 1
      continue
    }

    if (quote) {
      if (char === quote) {
        quote = null
      }

      index += 1
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      index += 1
      continue
    }

    if (char === '[') {
      bracketDepth += 1
      index += 1
      continue
    }

    if (char === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1)
      index += 1
      continue
    }

    if (bracketDepth === 0 && char === '(') {
      depth += 1
      index += 1
      continue
    }

    if (bracketDepth === 0 && char === ')') {
      depth -= 1

      if (depth === 0) {
        return index
      }
    }

    index += 1
  }

  return null
}

function removeCssPseudoSelectors(
  source: string,
  pseudoSelectors: readonly CssPseudoSelectorRange[],
) {
  if (pseudoSelectors.length === 0) {
    return source
  }

  let result = ''
  let cursor = 0

  for (const pseudoSelector of [...pseudoSelectors].sort((left, right) =>
    left.start - right.start)) {
    result += source.slice(cursor, pseudoSelector.start)
    cursor = pseudoSelector.end
  }

  return result + source.slice(cursor)
}

function parseCssAttributeSelectors(
  compound: string,
): CssAttributeSelector[] | null {
  const ranges = readCssAttributeSelectorRanges(compound)

  if (!ranges) {
    return null
  }

  const selectors: CssAttributeSelector[] = []

  for (const range of ranges) {
    const selector = parseCssAttributeSelector(range.content)

    if (!selector) {
      return null
    }

    selectors.push(selector)
  }

  return selectors
}

function parseCssAttributeSelector(
  content: string,
): CssAttributeSelector | null {
  const source = content.trim()
  const match = source.match(
    /^([_a-zA-Z][\w:-]*)(?:\s*([~|^$*]?=)\s*(.+))?$/,
  )

  if (!match) {
    return null
  }

  const [, name, rawOperator, rawValue] = match

  if (!name || !isCssAttributeName(name)) {
    return null
  }

  if (!rawOperator) {
    return rawValue === undefined
      ? {
          name,
          operator: 'exists',
        }
      : null
  }

  if (rawValue === undefined) {
    return null
  }

  const value = parseCssAttributeSelectorValue(rawValue)
  const operator = parseCssAttributeSelectorOperator(rawOperator)

  return !operator || !value
    ? null
    : {
        caseInsensitive: value.caseInsensitive,
        name,
        operator,
        value: value.value,
      }
}

function parseCssAttributeSelectorOperator(operator: string) {
  switch (operator) {
    case '=':
      return 'equals'
    case '~=':
      return 'includes'
    case '|=':
      return 'dash-match'
    case '^=':
      return 'prefix'
    case '$=':
      return 'suffix'
    case '*=':
      return 'substring'
    default:
      return null
  }
}

function parseCssAttributeSelectorValue(value: string) {
  const source = value.trim()
  const quote = source[0]

  if (quote === '"' || quote === "'") {
    let escaped = false
    let result = ''
    let index = 1

    while (index < source.length) {
      const char = source[index] ?? ''

      if (escaped) {
        result += char
        escaped = false
        index += 1
        continue
      }

      if (char === '\\') {
        escaped = true
        index += 1
        continue
      }

      if (char === quote) {
        const modifier = parseCssAttributeSelectorModifier(
          source.slice(index + 1).trim(),
        )

        return modifier
          ? {
              caseInsensitive: modifier === 'i',
              value: result,
            }
          : null
      }

      result += char
      index += 1
    }

    return null
  }

  const [rawValue, rawModifier, ...rest] = source.split(/\s+/)
  const modifier = parseCssAttributeSelectorModifier(rawModifier ?? '')

  return rawValue && rest.length === 0 && modifier
    ? {
        caseInsensitive: modifier === 'i',
        value: rawValue,
      }
    : null
}

function parseCssAttributeSelectorModifier(modifier: string) {
  if (modifier.length === 0 || modifier.toLowerCase() === 's') {
    return 's'
  }

  return modifier.toLowerCase() === 'i' ? 'i' : null
}

function isCssAttributeName(name: string) {
  return /^[_a-zA-Z][\w:-]*$/.test(name)
}

function matchesCssAttributeSelector(
  selector: CssAttributeSelector,
  node: HtmlSpecimenCssSelectorNode,
) {
  const value = readCssNodeAttribute(node, selector.name)

  if (selector.operator === 'exists') {
    return value !== undefined
  }

  if (value === undefined) {
    return false
  }

  const candidate = selector.caseInsensitive ? value.toLowerCase() : value
  const expected = selector.caseInsensitive
    ? selector.value.toLowerCase()
    : selector.value

  switch (selector.operator) {
    case 'dash-match':
      return candidate === expected || candidate.startsWith(`${expected}-`)
    case 'equals':
      return candidate === expected
    case 'includes':
      return candidate.split(/\s+/).includes(expected)
    case 'prefix':
      return candidate.startsWith(expected)
    case 'substring':
      return candidate.includes(expected)
    case 'suffix':
      return candidate.endsWith(expected)
  }
}

function readCssNodeAttribute(
  node: HtmlSpecimenCssSelectorNode,
  name: string,
) {
  return node.attributes[name] ?? node.attributes[name.toLowerCase()]
}

function removeCssAttributeSelectors(compound: string) {
  const ranges = readCssAttributeSelectorRanges(compound)

  if (!ranges || ranges.length === 0) {
    return compound
  }

  let result = ''
  let cursor = 0

  for (const range of ranges) {
    result += compound.slice(cursor, range.start)
    cursor = range.end + 1
  }

  return result + compound.slice(cursor)
}

function readCssAttributeSelectorRanges(compound: string) {
  const ranges: {
    content: string
    end: number
    start: number
  }[] = []
  let quote: '"' | "'" | null = null
  let escaped = false
  let start: number | null = null
  let index = 0

  while (index < compound.length) {
    const char = compound[index] ?? ''

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

    if (char === '\\') {
      index += 2
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      index += 1
      continue
    }

    if (char === '[') {
      if (start !== null) {
        return null
      }

      start = index
      index += 1
      continue
    }

    if (char === ']') {
      if (start === null) {
        return null
      }

      ranges.push({
        content: compound.slice(start + 1, index),
        end: index,
        start,
      })
      start = null
      index += 1
      continue
    }

    index += 1
  }

  return start === null && quote === null ? ranges : null
}

function getNodeAncestors({
  node,
  nodes,
}: {
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
}) {
  return nodes
    .filter((candidate) => isNodeAncestor(candidate, node))
    .sort((left, right) => (left.path?.length ?? 0) - (right.path?.length ?? 0))
}

function getPreviousNodeSibling({
  node,
  nodes,
}: {
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
}) {
  return getPreviousNodeSiblings({ node, nodes })[0] ?? null
}

function getPreviousNodeSiblings({
  node,
  nodes,
}: {
  node: HtmlSpecimenCssSelectorNode
  nodes: readonly HtmlSpecimenCssSelectorNode[]
}) {
  if (!node.path || node.path.length === 0) {
    return []
  }

  const siblingIndex = node.path.at(-1)

  if (siblingIndex === undefined) {
    return []
  }

  const parentPath = node.path.slice(0, -1)

  return nodes
    .filter((candidate) =>
      isPreviousNodeSibling({
        candidate,
        parentPath,
        siblingIndex,
      }))
    .sort((left, right) =>
      (right.path?.at(-1) ?? 0) - (left.path?.at(-1) ?? 0))
}

function isPreviousNodeSibling({
  candidate,
  parentPath,
  siblingIndex,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  parentPath: readonly number[]
  siblingIndex: number
}) {
  if (!candidate.path || candidate.path.length !== parentPath.length + 1) {
    return false
  }

  const candidateSiblingIndex = candidate.path.at(-1)

  return candidateSiblingIndex !== undefined &&
    candidateSiblingIndex < siblingIndex &&
    parentPath.every((part, index) => part === candidate.path?.[index])
}

function isNextNodeSibling({
  candidate,
  node,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  node: HtmlSpecimenCssSelectorNode
}) {
  if (!candidate.path || !node.path || node.path.length === 0) {
    return false
  }

  const nodeSiblingIndex = node.path.at(-1)
  const candidateSiblingIndex = candidate.path.at(-1)

  return nodeSiblingIndex !== undefined &&
    candidateSiblingIndex === nodeSiblingIndex + 1 &&
    hasSameParentPath(candidate.path, node.path)
}

function isSubsequentNodeSibling({
  candidate,
  node,
}: {
  candidate: HtmlSpecimenCssSelectorNode
  node: HtmlSpecimenCssSelectorNode
}) {
  if (!candidate.path || !node.path || node.path.length === 0) {
    return false
  }

  const nodeSiblingIndex = node.path.at(-1)
  const candidateSiblingIndex = candidate.path.at(-1)

  return nodeSiblingIndex !== undefined &&
    candidateSiblingIndex !== undefined &&
    candidateSiblingIndex > nodeSiblingIndex &&
    hasSameParentPath(candidate.path, node.path)
}

function isNodeParent(
  candidate: HtmlSpecimenCssSelectorNode,
  node: HtmlSpecimenCssSelectorNode,
) {
  return Boolean(
    candidate.path &&
    node.path &&
    candidate.path.length + 1 === node.path.length &&
    candidate.path.every((part, index) => part === node.path?.[index]),
  )
}

function isFirstNodeChild(node: HtmlSpecimenCssSelectorNode) {
  return getNodeSiblingIndex(node) === 0
}

function isLastNodeChild(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const siblingIndex = getNodeSiblingIndex(node)
  const lastSiblingIndex = getLastNodeSiblingIndex(node, nodes)

  return siblingIndex !== null && siblingIndex === lastSiblingIndex
}

function getNodeChildPosition(node: HtmlSpecimenCssSelectorNode) {
  const siblingIndex = getNodeSiblingIndex(node)

  return siblingIndex === null ? null : siblingIndex + 1
}

function getNodeLastChildPosition(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const siblingIndex = getNodeSiblingIndex(node)
  const lastSiblingIndex = getLastNodeSiblingIndex(node, nodes)

  return siblingIndex === null || lastSiblingIndex === null
    ? null
    : lastSiblingIndex - siblingIndex + 1
}

function getNodeSiblingIndex(node: HtmlSpecimenCssSelectorNode) {
  if (!node.path || node.path.length === 0) {
    return null
  }

  return node.path.at(-1) ?? null
}

function getLastNodeSiblingIndex(
  node: HtmlSpecimenCssSelectorNode,
  nodes: readonly HtmlSpecimenCssSelectorNode[],
) {
  const nodePath = node.path
  let lastSiblingIndex = getNodeSiblingIndex(node)

  if (!nodePath || lastSiblingIndex === null) {
    return null
  }

  for (const candidate of nodes) {
    if (!candidate.path || !hasSameParentPath(candidate.path, nodePath)) {
      continue
    }

    const candidateSiblingIndex = candidate.path.at(-1)

    if (
      candidateSiblingIndex !== undefined &&
      candidateSiblingIndex > lastSiblingIndex
    ) {
      lastSiblingIndex = candidateSiblingIndex
    }
  }

  return lastSiblingIndex
}

function isNodeAncestor(
  candidate: HtmlSpecimenCssSelectorNode,
  node: HtmlSpecimenCssSelectorNode,
) {
  if (!candidate.path || !node.path || candidate.path.length >= node.path.length) {
    return false
  }

  return candidate.path.every((part, index) => part === node.path?.[index])
}

function hasSameParentPath(
  left: readonly number[],
  right: readonly number[],
) {
  if (left.length !== right.length || left.length === 0) {
    return false
  }

  return left
    .slice(0, -1)
    .every((part, index) => part === right[index])
}

function readCssSimpleSelectorNames(compound: string, prefix: '.' | '#') {
  const names: string[] = []
  let index = 0

  while (index < compound.length) {
    const char = compound[index] ?? ''

    if (char !== prefix) {
      index += char === '\\' ? 2 : 1
      continue
    }

    const parsed = readCssIdentifier(compound, index + 1)

    if (!parsed || parsed.value.length === 0) {
      index += 1
      continue
    }

    names.push(parsed.value)
    index = parsed.end
  }

  return names
}

function readCssTypeSelectorName(compound: string) {
  const source = compound.trim()

  if (source.length === 0 || source[0] === '*') {
    return source[0] === '*' ? '*' : null
  }

  if (source[0] === '.' || source[0] === '#' || source[0] === ':') {
    return null
  }

  return readCssIdentifier(source, 0)?.value.toLowerCase() ?? null
}

function readCssIdentifier(source: string, start: number) {
  let index = start
  let value = ''

  while (index < source.length) {
    const char = source[index] ?? ''

    if (char === '\\') {
      const escaped = source[index + 1]

      if (!escaped) {
        return null
      }

      value += escaped
      index += 2
      continue
    }

    if (!isCssIdentifierChar(char)) {
      break
    }

    value += char
    index += 1
  }

  return {
    end: index,
    value,
  }
}

function isCssIdentifierChar(char: string) {
  return /[_a-zA-Z0-9-]/.test(char)
}

function getSelectorTagName(compound: string) {
  const tagName = readCssTypeSelectorName(removeCssAttributeSelectors(compound))

  if (!tagName || tagName === '*') {
    return null
  }

  return tagName
}

function getNodeClassSet(node: HtmlSpecimenCssSelectorNode) {
  return new Set([
    ...node.classList,
    ...(node.attributes.class ?? '').split(/\s+/),
  ].filter((className) => className.length > 0))
}

function calculateSpecificity(selector: string): [number, number, number] {
  const pseudoFunctionSpecificity =
    calculateCssPseudoFunctionSpecificity(selector)
  const pseudoSelectors = readCssPseudoSelectors(selector) ?? {
    functions: [],
    structuralClasses: [],
  }
  const selectorWithoutPseudos = removeCssPseudoSelectors(
    selector,
    [
      ...pseudoSelectors.functions,
      ...pseudoSelectors.structuralClasses,
    ],
  )
  const selectorWithoutAttributes =
    removeCssAttributeSelectors(selectorWithoutPseudos)
  const attributeCount =
    readCssAttributeSelectorRanges(selectorWithoutPseudos)?.length ?? 0
  const idCount = readCssSimpleSelectorNames(
    selectorWithoutAttributes,
    '#',
  ).length
  const classCount = (
    readCssSimpleSelectorNames(selectorWithoutAttributes, '.').length +
    attributeCount +
    pseudoSelectors.structuralClasses.length
  )
  const tagCount = selectorWithoutAttributes
    .split(/[\s>+~]+/)
    .filter((part) => getSelectorTagName(part) !== null)
    .length

  return addHtmlSpecimenCssSpecificity(
    [idCount, classCount, tagCount],
    pseudoFunctionSpecificity,
  )
}

function calculateCssPseudoFunctionSpecificity(
  selector: string,
): [number, number, number] {
  const pseudoFunctions = readCssPseudoFunctionSelectors(selector)

  if (!pseudoFunctions) {
    return [0, 0, 0]
  }

  return pseudoFunctions.reduce<[number, number, number]>(
    (specificity, pseudoFunction) =>
      addHtmlSpecimenCssSpecificity(
        specificity,
        calculateSingleCssPseudoFunctionSpecificity(pseudoFunction),
      ),
    [0, 0, 0],
  )
}

function calculateSingleCssPseudoFunctionSpecificity(
  pseudoFunction: CssPseudoFunctionSelector,
): [number, number, number] {
  if (pseudoFunction.name === 'where') {
    return [0, 0, 0]
  }

  let specificity: [number, number, number] = [0, 0, 0]

  for (const selector of splitCssSelectorList(pseudoFunction.args)) {
    const selectorPart = selector.trim()

    if (
      selectorPart.length === 0 ||
      parseCssSelectorSegments(selectorPart) === null
    ) {
      continue
    }

    const candidateSpecificity = calculateSpecificity(selectorPart)

    if (
      compareHtmlSpecimenCssSpecificity(candidateSpecificity, specificity) > 0
    ) {
      specificity = candidateSpecificity
    }
  }

  return specificity
}

function addHtmlSpecimenCssSpecificity(
  left: [number, number, number],
  right: [number, number, number],
): [number, number, number] {
  return [
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
  ]
}
