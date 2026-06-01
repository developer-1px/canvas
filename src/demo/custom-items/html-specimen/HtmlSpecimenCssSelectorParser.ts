import {
  cssSelectorListCache,
  cssSelectorSegmentCache,
  rememberCssSelectorCacheValue,
} from './HtmlSpecimenCssSelectorCache'
import {
  hasUnsupportedCssPseudoSelector,
} from './HtmlSpecimenCssSelectorPseudo'
import type {
  CssSelectorRelation,
  CssSelectorSegment,
} from './HtmlSpecimenCssSelectorTypes'

export function splitHtmlSpecimenCssSelectorList(selector: string) {
  const cachedSelectors = cssSelectorListCache.get(selector)

  if (cachedSelectors) {
    cssSelectorListCache.delete(selector)
    cssSelectorListCache.set(selector, cachedSelectors)
    return cachedSelectors
  }

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

  return rememberCssSelectorCacheValue(
    cssSelectorListCache,
    selector,
    selectors,
  )
}

export function parseCssSelectorSegments(selector: string): CssSelectorSegment[] | null {
  if (cssSelectorSegmentCache.has(selector)) {
    const cachedSegments = cssSelectorSegmentCache.get(selector) ?? null

    if (cachedSegments) {
      cssSelectorSegmentCache.delete(selector)
      cssSelectorSegmentCache.set(selector, cachedSegments)
    }

    return cachedSegments
  }

  if (hasUnsupportedCssPseudoSelector(selector)) {
    return rememberCssSelectorCacheValue(
      cssSelectorSegmentCache,
      selector,
      null,
    )
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
    return rememberCssSelectorCacheValue(
      cssSelectorSegmentCache,
      selector,
      null,
    )
  }

  appendCssSelectorSegment({
    buffer,
    relationToPrevious: relationToNext,
    segments,
  })

  return rememberCssSelectorCacheValue(
    cssSelectorSegmentCache,
    selector,
    segments,
  )
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
