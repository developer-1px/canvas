import {
  cssPseudoSelectorCache,
  rememberCssSelectorCacheValue,
} from './HtmlSpecimenCssSelectorCache'
import {
  findCssFunctionEnd,
} from './HtmlSpecimenCssFunctionScanner'
import {
  parseCssNthFormula,
} from './HtmlSpecimenCssNthFormula'
import type {
  CssPseudoFunctionSelector,
  CssPseudoSelectorRange,
  CssPseudoSelectors,
  CssStructuralPseudoClassSelector,
  CssStatePseudoClassSelector,
} from './HtmlSpecimenCssSelectorTypes'

export function hasUnsupportedCssPseudoSelector(selector: string) {
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

      const statePseudoClass = readCssStatePseudoClassSelector(selector, index)

      if (statePseudoClass) {
        index = statePseudoClass.end
        continue
      }

      return true
    }

    index += 1
  }

  return false
}

export function readCssPseudoSelectors(source: string): CssPseudoSelectors | null {
  if (cssPseudoSelectorCache.has(source)) {
    const cachedPseudoSelectors = cssPseudoSelectorCache.get(source) ?? null

    if (cachedPseudoSelectors) {
      cssPseudoSelectorCache.delete(source)
      cssPseudoSelectorCache.set(source, cachedPseudoSelectors)
    }

    return cachedPseudoSelectors
  }

  const functions: CssPseudoFunctionSelector[] = []
  const stateClasses: CssStatePseudoClassSelector[] = []
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

      if (pseudoClass) {
        structuralClasses.push(pseudoClass)
        index = pseudoClass.end
        continue
      }

      const statePseudoClass = readCssStatePseudoClassSelector(source, index)

      if (!statePseudoClass) {
        return rememberCssSelectorCacheValue(
          cssPseudoSelectorCache,
          source,
          null,
        )
      }

      stateClasses.push(statePseudoClass)
      index = statePseudoClass.end
      continue
    }

    index += 1
  }

  return rememberCssSelectorCacheValue(
    cssPseudoSelectorCache,
    source,
    bracketDepth === 0 && quote === null
      ? {
          functions,
          stateClasses,
          structuralClasses,
        }
      : null,
  )
}

export function readCssPseudoFunctionSelectors(source: string) {
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

  const staticMatch =
    /^(first-child|first-of-type|last-child|last-of-type|only-child|only-of-type)(?![-_a-zA-Z0-9(])/i
      .exec(source.slice(start + 1))

  const staticName = staticMatch?.[1]?.toLowerCase()

  if (
    staticName === 'first-child' ||
    staticName === 'first-of-type' ||
    staticName === 'last-child' ||
    staticName === 'last-of-type' ||
    staticName === 'only-child' ||
    staticName === 'only-of-type'
  ) {
    return {
      end: start + 1 + staticName.length,
      name: staticName,
      start,
    }
  }

  const nthMatch = /^(nth-child|nth-last-child|nth-of-type|nth-last-of-type)\(/i
    .exec(source.slice(start + 1))
  const nthName = nthMatch?.[1]?.toLowerCase()

  if (
    nthName !== 'nth-child' &&
    nthName !== 'nth-last-child' &&
    nthName !== 'nth-last-of-type' &&
    nthName !== 'nth-of-type'
  ) {
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

function readCssStatePseudoClassSelector(
  source: string,
  start: number,
): CssStatePseudoClassSelector | null {
  if (source[start] !== ':' || source[start + 1] === ':') {
    return null
  }

  const match = /^(checked|disabled|enabled)(?![-_a-zA-Z0-9(])/i
    .exec(source.slice(start + 1))
  const name = match?.[1]?.toLowerCase()

  if (name !== 'checked' && name !== 'disabled' && name !== 'enabled') {
    return null
  }

  return {
    end: start + 1 + name.length,
    name,
    start,
  }
}

export function removeCssPseudoSelectors(
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
