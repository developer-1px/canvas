import {
  cssSimpleSelectorNameCache,
  rememberCssSelectorCacheValue,
} from './HtmlSpecimenCssSelectorCache'
import {
  removeCssAttributeSelectors,
} from './HtmlSpecimenCssAttributeSelectors'

export function readCssSimpleSelectorNames(compound: string, prefix: '.' | '#') {
  const cacheKey = `${prefix}\0${compound}`
  const cachedNames = cssSimpleSelectorNameCache.get(cacheKey)

  if (cachedNames) {
    cssSimpleSelectorNameCache.delete(cacheKey)
    cssSimpleSelectorNameCache.set(cacheKey, cachedNames)
    return cachedNames
  }

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

  return rememberCssSelectorCacheValue(
    cssSimpleSelectorNameCache,
    cacheKey,
    names,
  )
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

export function getSelectorTagName(compound: string) {
  const tagName = readCssTypeSelectorName(removeCssAttributeSelectors(compound))

  if (!tagName || tagName === '*') {
    return null
  }

  return tagName
}
