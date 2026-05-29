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
  name: 'is' | 'where'
  start: number
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
  const pseudoFunctions = readCssPseudoFunctionSelectors(compound)

  if (!pseudoFunctions) {
    return false
  }

  for (const pseudoFunction of pseudoFunctions) {
    if (!matchHtmlSpecimenCssSelectorList(pseudoFunction.args, node, nodes)) {
      return false
    }
  }

  const compoundWithoutPseudos = removeCssPseudoFunctionSelectors(
    compound,
    pseudoFunctions,
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

      return true
    }

    index += 1
  }

  return false
}

function readCssPseudoFunctionSelectors(source: string) {
  const pseudoFunctions: CssPseudoFunctionSelector[] = []
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

      if (!pseudoFunction) {
        return null
      }

      pseudoFunctions.push(pseudoFunction)
      index = pseudoFunction.end
      continue
    }

    index += 1
  }

  return bracketDepth === 0 && quote === null ? pseudoFunctions : null
}

function readCssPseudoFunctionSelector(
  source: string,
  start: number,
): CssPseudoFunctionSelector | null {
  if (source[start] !== ':') {
    return null
  }

  const match = /^(is|where)\(/i.exec(source.slice(start + 1))

  if (!match) {
    return null
  }

  const name = match[1]?.toLowerCase()

  if (name !== 'is' && name !== 'where') {
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

function removeCssPseudoFunctionSelectors(
  source: string,
  pseudoFunctions: readonly CssPseudoFunctionSelector[],
) {
  if (pseudoFunctions.length === 0) {
    return source
  }

  let result = ''
  let cursor = 0

  for (const pseudoFunction of pseudoFunctions) {
    result += source.slice(cursor, pseudoFunction.start)
    cursor = pseudoFunction.end
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

function isNodeAncestor(
  candidate: HtmlSpecimenCssSelectorNode,
  node: HtmlSpecimenCssSelectorNode,
) {
  if (!candidate.path || !node.path || candidate.path.length >= node.path.length) {
    return false
  }

  return candidate.path.every((part, index) => part === node.path?.[index])
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
  const selectorWithoutPseudos = removeCssPseudoFunctionSelectors(
    selector,
    readCssPseudoFunctionSelectors(selector) ?? [],
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
    attributeCount
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
