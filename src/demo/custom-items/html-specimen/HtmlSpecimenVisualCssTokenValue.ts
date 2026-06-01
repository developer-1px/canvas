import {
  getCssDeclarationSourceProperties,
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  advanceCssScannerState,
  createCssScannerState,
  findMatchingCssParenthesis,
  isCssScannerTopLevel,
  stripCssComments,
} from './HtmlSpecimenVisualCssScanner'

export function canPatchHtmlSpecimenCssTokenSource(
  targetProperty: string,
  tokenSourceProperty: string,
) {
  const patchableProperties = new Set(
    getCssDeclarationSourceProperties(targetProperty),
  )

  return patchableProperties.has(normalizeProperty(tokenSourceProperty))
}

export function readSingleCssVarReference(value: string) {
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

export function findTopLevelCssComma(source: string) {
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

export function isHtmlSpecimenCssTokenValue(value: string) {
  return /\bvar\s*\(/i.test(value)
}
