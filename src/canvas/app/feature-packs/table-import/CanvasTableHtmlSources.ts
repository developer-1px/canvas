import type {
  CanvasTableImportSource,
} from './CanvasTableImportContracts'
import {
  isCanvasTableImportRows,
} from './CanvasTableImportRows'

const CANVAS_HTML_TABLE_SPAN_MAX = 100

export function getCanvasTableSourceFromHTML(
  value: string,
): CanvasTableImportSource | null {
  if (!value) {
    return null
  }

  const parsedRows = typeof DOMParser === 'undefined'
    ? parseCanvasTableHTMLRowsFromString(value)
    : parseCanvasTableHTMLRowsFromDOM(value)

  if (!isCanvasTableImportRows(parsedRows)) {
    return null
  }

  return {
    format: 'text-html',
    rows: parsedRows,
  }
}

function parseCanvasTableHTMLRowsFromDOM(value: string) {
  const doc = new DOMParser().parseFromString(value, 'text/html')
  const table = doc.querySelector('table')

  if (!table) {
    return []
  }

  return buildCanvasTableHTMLRows(
    Array.from(table.querySelectorAll('tr')).map((row) =>
      Array.from(row.children)
        .filter((cell) => {
          const tagName = cell.tagName.toLowerCase()

          return tagName === 'td' || tagName === 'th'
        })
        .map((cell) => ({
          columnSpan: getCanvasTableHTMLSpan(cell.getAttribute('colspan')),
          rowSpan: getCanvasTableHTMLSpan(cell.getAttribute('rowspan')),
          text: getCanvasTableHTMLCellText(cell),
        })),
    ),
  )
}

function parseCanvasTableHTMLRowsFromString(value: string) {
  const tableHTML = extractCanvasFirstHTMLTable(value)

  if (!tableHTML) {
    return []
  }

  const sanitizedTableHTML = tableHTML.replace(
    /<(script|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,
    '',
  )
  const tableRows = Array.from(
    sanitizedTableHTML.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi),
  ).map(([, rowHTML]) =>
    Array.from(rowHTML.matchAll(/<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi))
      .map(([, , attributes, cellHTML]) => ({
        columnSpan: getCanvasTableHTMLSpan(
          getCanvasHTMLAttribute(attributes, 'colspan'),
        ),
        rowSpan: getCanvasTableHTMLSpan(
          getCanvasHTMLAttribute(attributes, 'rowspan'),
        ),
        text: normalizeCanvasTableHTMLCellText(cellHTML
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, ' ')),
      })),
  )

  return buildCanvasTableHTMLRows(tableRows)
}

function buildCanvasTableHTMLRows(
  tableRows: readonly (readonly {
    columnSpan: number
    rowSpan: number
    text: string
  }[])[],
) {
  const rows: string[][] = []

  for (const [rowIndex, tableRow] of tableRows.entries()) {
    const row = rows[rowIndex] ?? []
    let columnIndex = 0

    rows[rowIndex] = row

    for (const cell of tableRow) {
      while (row[columnIndex] !== undefined) {
        columnIndex += 1
      }

      for (let rowOffset = 0; rowOffset < cell.rowSpan; rowOffset += 1) {
        const targetRowIndex = rowIndex + rowOffset
        const targetRow = rows[targetRowIndex] ?? []

        rows[targetRowIndex] = targetRow

        for (
          let columnOffset = 0;
          columnOffset < cell.columnSpan;
          columnOffset += 1
        ) {
          const targetColumnIndex = columnIndex + columnOffset

          targetRow[targetColumnIndex] = rowOffset === 0 && columnOffset === 0
            ? cell.text
            : targetRow[targetColumnIndex] ?? ''
        }
      }

      columnIndex += cell.columnSpan
    }
  }

  return rows
}

function extractCanvasFirstHTMLTable(value: string) {
  return /<table\b[^>]*>[\s\S]*?<\/table>/i.exec(value)?.[0] ?? ''
}

function getCanvasHTMLAttribute(value: string, name: string) {
  const match = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i',
  ).exec(value)

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null
}

function getCanvasTableHTMLSpan(value: string | null) {
  const span = Number.parseInt(value ?? '1', 10)

  return Number.isFinite(span)
    ? Math.min(Math.max(span, 1), CANVAS_HTML_TABLE_SPAN_MAX)
    : 1
}

function getCanvasTableHTMLCellText(cell: Element) {
  const clone = cell.cloneNode(true)

  if (clone.nodeType === Node.ELEMENT_NODE) {
    const clonedElement = clone as Element

    clonedElement.querySelectorAll('script, style, noscript')
      .forEach((node) => node.remove())

    return normalizeCanvasTableHTMLCellText(clonedElement.textContent ?? '')
  }

  return normalizeCanvasTableHTMLCellText(cell.textContent ?? '')
}

function normalizeCanvasTableHTMLCellText(value: string) {
  return decodeCanvasHTMLEntities(value)
    .replace(/\s+/g, ' ')
    .trim()
}

function decodeCanvasHTMLEntities(value: string) {
  return value.replace(/&(#\d+|#x[\da-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith('#x')) {
      return decodeCanvasHTMLCodePoint(Number.parseInt(entity.slice(2), 16), match)
    }

    if (entity.startsWith('#')) {
      return decodeCanvasHTMLCodePoint(Number.parseInt(entity.slice(1), 10), match)
    }

    const namedEntity = CANVAS_HTML_ENTITY_TEXT[entity.toLowerCase()]

    return namedEntity ?? match
  })
}

function decodeCanvasHTMLCodePoint(value: number, fallback: string) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  try {
    return String.fromCodePoint(value)
  } catch {
    return fallback
  }
}

const CANVAS_HTML_ENTITY_TEXT: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}
