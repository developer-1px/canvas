import type {
  Point,
  Viewport,
} from '../../../../entities'
import { createCanvasTableComponentItem } from '../../../../host'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'

export type CanvasTableImportSource = {
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

    return {
      x: (point.x - viewport.x) / viewport.scale,
      y: (point.y - viewport.y) / viewport.scale,
    }
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

export function getCanvasTableCsvFileFromList(files: FileList | null) {
  return Array.from(files ?? []).find(isCanvasTableCsvFile) ?? null
}

export function getCanvasTableCsvFileFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return getCanvasTableCsvFileFromList(dataTransfer?.files ?? null)
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

function isCanvasTableImportRows(rows: readonly (readonly string[])[]) {
  const nonEmptyRows = rows.filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  )
  const columnCount = Math.max(0, ...nonEmptyRows.map((row) => row.length))

  return nonEmptyRows.length >= 2 && columnCount >= 2
}

function parseCanvasTableTextRows(text: string) {
  const delimiter = text.includes('\t') ? '\t' : ','
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

function readCanvasBlobAsText(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Expected CSV text'))
    })
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('Could not read CSV'))
    })
    reader.readAsText(blob)
  })
}
