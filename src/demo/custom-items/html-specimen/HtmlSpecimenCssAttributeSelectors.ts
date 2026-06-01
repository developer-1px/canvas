import {
  cssAttributeSelectorCache,
  cssAttributeSelectorRangeCache,
  rememberCssSelectorCacheValue,
} from './HtmlSpecimenCssSelectorCache'
import {
  readCssNodeAttribute,
} from './HtmlSpecimenCssNodeAttributes'
import type {
  CssAttributeSelector,
  HtmlSpecimenCssSelectorNode,
} from './HtmlSpecimenCssSelectorTypes'

export function parseCssAttributeSelectors(
  compound: string,
): CssAttributeSelector[] | null {
  if (cssAttributeSelectorCache.has(compound)) {
    const cachedAttributes = cssAttributeSelectorCache.get(compound) ?? null

    if (cachedAttributes) {
      cssAttributeSelectorCache.delete(compound)
      cssAttributeSelectorCache.set(compound, cachedAttributes)
    }

    return cachedAttributes
  }

  const ranges = readCssAttributeSelectorRanges(compound)

  if (!ranges) {
    return rememberCssSelectorCacheValue(
      cssAttributeSelectorCache,
      compound,
      null,
    )
  }

  const selectors: CssAttributeSelector[] = []

  for (const range of ranges) {
    const selector = parseCssAttributeSelector(range.content)

    if (!selector) {
      return rememberCssSelectorCacheValue(
        cssAttributeSelectorCache,
        compound,
        null,
      )
    }

    selectors.push(selector)
  }

  return rememberCssSelectorCacheValue(
    cssAttributeSelectorCache,
    compound,
    selectors,
  )
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

export function matchesCssAttributeSelector(
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

export function removeCssAttributeSelectors(compound: string) {
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

export function readCssAttributeSelectorRanges(compound: string) {
  if (cssAttributeSelectorRangeCache.has(compound)) {
    const cachedRanges = cssAttributeSelectorRangeCache.get(compound) ?? null

    if (cachedRanges) {
      cssAttributeSelectorRangeCache.delete(compound)
      cssAttributeSelectorRangeCache.set(compound, cachedRanges)
    }

    return cachedRanges
  }

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
        return rememberCssSelectorCacheValue(
          cssAttributeSelectorRangeCache,
          compound,
          null,
        )
      }

      start = index
      index += 1
      continue
    }

    if (char === ']') {
      if (start === null) {
        return rememberCssSelectorCacheValue(
          cssAttributeSelectorRangeCache,
          compound,
          null,
        )
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

  return rememberCssSelectorCacheValue(
    cssAttributeSelectorRangeCache,
    compound,
    start === null && quote === null ? ranges : null,
  )
}
