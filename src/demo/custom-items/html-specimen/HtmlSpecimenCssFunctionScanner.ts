export function findCssFunctionEnd(source: string, openParen: number) {
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
