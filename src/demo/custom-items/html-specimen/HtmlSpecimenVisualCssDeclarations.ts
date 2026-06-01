import {
  countLeadingWhitespace,
  countTrailingWhitespace,
  normalizeProperty,
} from './HtmlSpecimenVisualCssProperties'
import {
  advanceCssScannerState,
  createCssScannerState,
  isCssScannerTopLevel,
} from './HtmlSpecimenVisualCssScanner'
import type { CssDeclaration } from './HtmlSpecimenVisualCssTypes'

export function parseCssDeclarations({
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

export function findMatchingBrace(
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

export function findCssDeclarationColon({
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

export function findCssDeclarationPropertyStart({
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

export function findCssTrailingImportant({
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
