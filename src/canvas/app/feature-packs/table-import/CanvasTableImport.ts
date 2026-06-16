import type {
  Point,
  Viewport,
} from '../../../entities'
import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import { createCanvasTableComponentItem } from '../../../host'
import type { CanvasAppStageElement } from '../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'

export type CanvasTableImportFormat =
  | 'text-csv'
  | 'text-delimited'
  | 'text-html'
  | 'text-tsv'

export type CanvasTableImportSource = {
  format?: CanvasTableImportFormat
  name?: string
  rows: readonly (readonly string[])[]
}

export type CanvasTableInsertionContext = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  selection: string[]
}

export type CanvasTableInsertCenterInput = {
  event?: { clientX: number; clientY: number }
  stageElement: CanvasAppStageElement
  viewport: Viewport
}

const CANVAS_CSV_MIME_TYPES = new Set([
  'application/vnd.ms-excel',
  'text/comma-separated-values',
  'text/csv',
])
const CANVAS_TSV_MIME_TYPES = new Set([
  'text/tab-separated-values',
])
const CANVAS_HTML_TABLE_SPAN_MAX = 100

export function insertCanvasTableSource({
  center,
  context,
  source,
}: {
  center: Point
  context: CanvasTableInsertionContext
  source: CanvasTableImportSource
}) {
  const createdItem = createCanvasTableComponentItem({
    id: context.createId('component'),
    point: center,
    rows: source.rows,
    title: getCanvasTableImportTitle(source),
  })
  const item = {
    ...createdItem,
    x: createdItem.x - createdItem.w / 2,
    y: createdItem.y - createdItem.h / 2,
  }

  return context.commitItemsChange(
    { type: 'add', items: [item] },
    {
      before: context.selection,
      after: [item.id],
    },
  )
}

export function getCanvasTableInsertCenter({
  event,
  stageElement,
  viewport,
}: CanvasTableInsertCenterInput): Point {
  if (event) {
    const point = stageElement.getScreenPoint(event)

    return getCanvasViewportWorldPoint(viewport, point)
  }

  return stageElement.getViewportCenter(viewport) ?? { x: 0, y: 0 }
}

export async function readCanvasTableCsvFileSource(
  file: Blob & { name?: string },
): Promise<CanvasTableImportSource | null> {
  if (!isCanvasTableCsvFile(file)) {
    return null
  }

  return getCanvasTableCsvSourceFromText(await readCanvasBlobAsText(file), {
    name: file.name,
  })
}

export async function readCanvasTableFileSource(
  file: Blob & { name?: string },
): Promise<CanvasTableImportSource | null> {
  if (!isCanvasTableTextFile(file)) {
    return null
  }

  return getCanvasTableSourceFromText(await readCanvasBlobAsText(file), {
    format: isCanvasTableTsvFile(file) ? 'text-tsv' : 'text-csv',
    name: file.name,
  })
}

export function getCanvasTableCsvFileFromList(files: FileList | null) {
  return Array.from(files ?? []).find(isCanvasTableCsvFile) ?? null
}

export function getCanvasTableFileFromList(files: FileList | null) {
  return Array.from(files ?? []).find(isCanvasTableTextFile) ?? null
}

export function getCanvasTableCsvFileFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return getCanvasTableCsvFileFromList(dataTransfer?.files ?? null)
}

export function getCanvasTableFileFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return getCanvasTableFileFromList(dataTransfer?.files ?? null)
}

export function getCanvasTableCsvSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return null
  }

  return getCanvasTableCsvSourceFromText(
    dataTransfer.getData('text/csv') || dataTransfer.getData('text/plain'),
  )
}

export function getCanvasTableSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return null
  }

  const tabSeparatedText = dataTransfer.getData('text/tab-separated-values')

  if (tabSeparatedText) {
    return getCanvasTableSourceFromText(tabSeparatedText, {
      format: 'text-tsv',
    })
  }

  const csvText = dataTransfer.getData('text/csv')

  if (csvText) {
    return getCanvasTableSourceFromText(csvText, {
      format: 'text-csv',
    })
  }

  const htmlSource = getCanvasTableSourceFromHTML(
    dataTransfer.getData('text/html'),
  )

  if (htmlSource) {
    return htmlSource
  }

  return getCanvasTableSourceFromText(dataTransfer.getData('text/plain'), {
    format: 'text-delimited',
  })
}

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

function getCanvasTableImportTitle({ name }: CanvasTableImportSource) {
  if (!name) {
    return 'Table'
  }

  return name.replace(/\.[^.]+$/, '') || 'Table'
}

function isCanvasTableCsvFile(file: Blob & { name?: string }) {
  const mimeType = file.type.toLowerCase()
  const name = file.name?.toLowerCase() ?? ''

  return CANVAS_CSV_MIME_TYPES.has(mimeType) || name.endsWith('.csv')
}

function isCanvasTableTsvFile(file: Blob & { name?: string }) {
  const mimeType = file.type.toLowerCase()
  const name = file.name?.toLowerCase() ?? ''

  return CANVAS_TSV_MIME_TYPES.has(mimeType) || name.endsWith('.tsv')
}

function isCanvasTableTextFile(file: Blob & { name?: string }) {
  return isCanvasTableCsvFile(file) || isCanvasTableTsvFile(file)
}

function isCanvasTableImportRows(rows: readonly (readonly string[])[]) {
  const nonEmptyRows = rows.filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  )
  const columnCount = Math.max(0, ...nonEmptyRows.map((row) => row.length))

  return nonEmptyRows.length >= 2 && columnCount >= 2
}

function parseCanvasTableTextRows(
  text: string,
  format?: CanvasTableImportFormat,
) {
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

function readCanvasBlobAsText(blob: Blob) {
  if (typeof blob.text === 'function') {
    return blob.text()
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Expected table text'))
    })
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('Could not read table file'))
    })
    reader.readAsText(blob)
  })
}
