import type { CssScannerState } from './HtmlSpecimenVisualCssTypes'

export function findMatchingCssParenthesis(source: string, start: number) {
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

export function findNextCssBlockStart(
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

export function stripCssComments(css: string) {
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

export function createCssScannerState(): CssScannerState {
  return {
    bracketDepth: 0,
    comment: false,
    escaped: false,
    parenDepth: 0,
    quote: null,
  }
}

export function advanceCssScannerState(
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

export function isCssScannerTopLevel(state: CssScannerState) {
  return (
    !state.comment &&
    !state.quote &&
    state.parenDepth === 0 &&
    state.bracketDepth === 0
  )
}

export function isCssKeywordAt(source: string, index: number, keyword: string) {
  if (source.slice(index, index + keyword.length).toLowerCase() !== keyword) {
    return false
  }

  const before = source[index - 1] ?? ''
  const after = source[index + keyword.length] ?? ''

  return !isCssIdentifierChar(before) && !isCssIdentifierChar(after)
}

export function isCssIdentifierChar(char: string) {
  return /[a-z0-9_-]/i.test(char)
}
