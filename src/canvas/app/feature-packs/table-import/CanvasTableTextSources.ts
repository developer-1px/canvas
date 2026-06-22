import type {
  CanvasTableImportFormat,
  CanvasTableImportSource,
} from './CanvasTableImportContracts'
import {
  isCanvasTableImportRows,
} from './CanvasTableImportRows'

export function getCanvasTableCsvSourceFromText(
  text: string,
  options: { name?: string } = {},
): CanvasTableImportSource | null {
  const rows = parseCanvasTableTextRows(text)

  if (!isCanvasTableImportRows(rows)) {
    return null
  }

  const source: CanvasTableImportSource = { rows }

  if (options.name !== undefined) {
    source.name = options.name
  }

  return source
}

export function getCanvasTableSourceFromText(
  text: string,
  options: { format?: CanvasTableImportFormat; name?: string } = {},
): CanvasTableImportSource | null {
  const rows = parseCanvasTableTextRows(text, options.format)

  if (!isCanvasTableImportRows(rows)) {
    return null
  }

  return {
    ...(options.format === undefined ? {} : { format: options.format }),
    ...(options.name === undefined ? {} : { name: options.name }),
    rows,
  }
}

export function getCanvasTablePlainTextImportFormat(
  text: string,
): CanvasTableImportFormat {
  return isCanvasMarkdownTableText(text) ? 'text-markdown' : 'text-delimited'
}

function parseCanvasTableTextRows(
  text: string,
  format?: CanvasTableImportFormat,
) {
  if (
    format === 'text-markdown' ||
    (
      format !== 'text-csv' &&
      format !== 'text-tsv' &&
      isCanvasMarkdownTableText(text)
    )
  ) {
    const markdownRows = parseCanvasMarkdownTableRows(text)

    if (markdownRows.length > 0) {
      return markdownRows
    }
  }

  const delimiter = format === 'text-tsv'
    ? '\t'
    : format === 'text-csv'
      ? ','
      : text.includes('\t')
        ? '\t'
        : ','
  const rows = parseCanvasDelimitedRows(text, delimiter)

  return rows
    .map((row) => row.map((cell) => cell.trim()))
    .filter((row) => row.some((cell) => cell.length > 0))
}

function isCanvasMarkdownTableText(text: string) {
  return parseCanvasMarkdownTableRows(text).length > 0
}

function parseCanvasMarkdownTableRows(text: string) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  for (let index = 1; index < lines.length; index += 1) {
    const dividerCells = parseCanvasMarkdownTableRowCells(lines[index] ?? '')

    if (!isCanvasMarkdownTableDividerRow(dividerCells)) {
      continue
    }

    const headerCells = parseCanvasMarkdownTableRowCells(lines[index - 1] ?? '')

    if (headerCells.length < 2) {
      continue
    }

    const rows = [headerCells]

    for (let rowIndex = index + 1; rowIndex < lines.length; rowIndex += 1) {
      const rowCells = parseCanvasMarkdownTableRowCells(lines[rowIndex] ?? '')

      if (rowCells.length < 2 || isCanvasMarkdownTableDividerRow(rowCells)) {
        break
      }

      rows.push(rowCells)
    }

    return rows.length > 1 ? rows : []
  }

  return []
}

function parseCanvasMarkdownTableRowCells(line: string) {
  const trimmedLine = line.trim()

  if (!trimmedLine.includes('|')) {
    return []
  }

  const rowText = trimCanvasMarkdownTableOuterPipes(trimmedLine)
  const cells: string[] = []
  let cell = ''
  let isEscaped = false
  let isInlineCode = false

  for (let index = 0; index < rowText.length; index += 1) {
    const char = rowText[index] ?? ''

    if (isEscaped) {
      cell += char
      isEscaped = false
      continue
    }

    if (char === '\\') {
      const nextChar = rowText[index + 1]

      if (nextChar === '|' || nextChar === '\\') {
        isEscaped = true
        continue
      }

      cell += char
      continue
    }

    if (char === '`') {
      isInlineCode = !isInlineCode
      cell += char
      continue
    }

    if (char === '|' && !isInlineCode) {
      cells.push(normalizeCanvasMarkdownTableCellText(cell))
      cell = ''
      continue
    }

    cell += char
  }

  cells.push(normalizeCanvasMarkdownTableCellText(cell))

  return cells
}

function trimCanvasMarkdownTableOuterPipes(line: string) {
  let start = 0
  let end = line.length

  if (line[start] === '|') {
    start += 1
  }

  if (line[end - 1] === '|' && line[end - 2] !== '\\') {
    end -= 1
  }

  return line.slice(start, end)
}

function normalizeCanvasMarkdownTableCellText(value: string) {
  return value
    .trim()
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function isCanvasMarkdownTableDividerRow(cells: readonly string[]) {
  return cells.length >= 2 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))
}

function parseCanvasDelimitedRows(text: string, delimiter: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (inQuotes) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\r' || char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''

      if (char === '\r' && text[index + 1] === '\n') {
        index += 1
      }
    } else {
      cell += char
    }
  }

  row.push(cell)
  rows.push(row)

  return rows
}
