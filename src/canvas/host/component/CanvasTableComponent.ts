import type { Point } from '../../core'
import type {
  CanvasComponentItem,
  CanvasItem,
} from '../model'

export const CANVAS_TABLE_COMPONENT_KIND = 'table'

export type CanvasTableComponentRows = readonly (readonly string[])[]

export type CreateCanvasTableComponentItemInput = {
  id: string
  point: Point
  rows: CanvasTableComponentRows
  title?: string
}

export type CanvasTableGrid = {
  bodyRows: readonly (readonly string[])[]
  columns: readonly string[]
}

const CANVAS_TABLE_DEFAULT_COLUMN = 'Column'
const CANVAS_TABLE_DEFAULT_TITLE = 'Table'
const CANVAS_TABLE_MAX_COLUMNS = 8
const CANVAS_TABLE_MAX_BODY_ROWS = 12
const CANVAS_TABLE_MAX_CELL_LENGTH = 80
const CANVAS_TABLE_COLUMN_WIDTH = 112
const CANVAS_TABLE_ROW_HEIGHT = 44
const CANVAS_TABLE_MIN_WIDTH = 168
const CANVAS_TABLE_MAX_WIDTH = 896
const CANVAS_TABLE_MIN_HEIGHT = 88
const CANVAS_TABLE_MAX_HEIGHT = 572

export function isCanvasTableComponentItem(
  item: CanvasItem,
): item is CanvasComponentItem {
  return item.type === 'component' &&
    item.component === CANVAS_TABLE_COMPONENT_KIND
}

export function createCanvasTableComponentItem({
  id,
  point,
  rows,
  title = CANVAS_TABLE_DEFAULT_TITLE,
}: CreateCanvasTableComponentItemInput): CanvasComponentItem {
  const table = normalizeCanvasTableRows(rows)
  const size = getCanvasTableComponentSize({
    columnCount: table.columns.length,
    rowCount: 1 + table.bodyRows.length,
  })

  return {
    accent: '#0891b2',
    columns: [...table.columns],
    component: CANVAS_TABLE_COMPONENT_KIND,
    fill: '#ffffff',
    h: size.h,
    id,
    items: table.bodyRows.flat(),
    stroke: '#cbd5e1',
    title,
    type: 'component',
    w: size.w,
    x: point.x,
    y: point.y,
  }
}

export function getCanvasTableGrid(item: CanvasComponentItem): CanvasTableGrid {
  const columns = getCanvasTableColumns(item)
  const bodyRows = getCanvasTableBodyRows({
    columnCount: columns.length,
    items: item.items ?? [],
  })

  return {
    bodyRows,
    columns,
  }
}

export function normalizeCanvasTableRows(
  rows: CanvasTableComponentRows,
): CanvasTableGrid {
  const cleanedRows = rows
    .map((row) => row.map(normalizeCanvasTableCell))
    .filter((row) => row.some((cell) => cell.length > 0))
    .slice(0, CANVAS_TABLE_MAX_BODY_ROWS + 1)

  if (cleanedRows.length === 0) {
    return {
      bodyRows: [],
      columns: [CANVAS_TABLE_DEFAULT_COLUMN],
    }
  }

  const columnCount = Math.max(
    1,
    Math.min(
      CANVAS_TABLE_MAX_COLUMNS,
      Math.max(...cleanedRows.map((row) => row.length)),
    ),
  )
  const [headerRow = []] = cleanedRows
  const columns = padCanvasTableRow(headerRow, columnCount).map(
    (column, index) => column || `${CANVAS_TABLE_DEFAULT_COLUMN} ${index + 1}`,
  )
  const bodyRows = cleanedRows
    .slice(1, CANVAS_TABLE_MAX_BODY_ROWS + 1)
    .map((row) => padCanvasTableRow(row, columnCount))

  return {
    bodyRows,
    columns,
  }
}

function getCanvasTableComponentSize({
  columnCount,
  rowCount,
}: {
  columnCount: number
  rowCount: number
}) {
  return {
    h: clampCanvasTableDimension(
      rowCount * CANVAS_TABLE_ROW_HEIGHT,
      CANVAS_TABLE_MIN_HEIGHT,
      CANVAS_TABLE_MAX_HEIGHT,
    ),
    w: clampCanvasTableDimension(
      columnCount * CANVAS_TABLE_COLUMN_WIDTH,
      CANVAS_TABLE_MIN_WIDTH,
      CANVAS_TABLE_MAX_WIDTH,
    ),
  }
}

function getCanvasTableColumns(item: CanvasComponentItem) {
  const columns = (item.columns ?? [])
    .map(normalizeCanvasTableCell)
    .filter((column) => column.length > 0)

  return columns.length > 0 ? columns : [CANVAS_TABLE_DEFAULT_COLUMN]
}

function getCanvasTableBodyRows({
  columnCount,
  items,
}: {
  columnCount: number
  items: readonly string[]
}) {
  if (items.length === 0) {
    return []
  }

  const rows: string[][] = []

  for (let index = 0; index < items.length; index += columnCount) {
    rows.push(
      padCanvasTableRow(items.slice(index, index + columnCount), columnCount),
    )
  }

  return rows
}

function normalizeCanvasTableCell(cell: string) {
  return cell.trim().slice(0, CANVAS_TABLE_MAX_CELL_LENGTH)
}

function padCanvasTableRow(row: readonly string[], columnCount: number) {
  return Array.from({ length: columnCount }, (_, index) =>
    normalizeCanvasTableCell(row[index] ?? ''),
  )
}

function clampCanvasTableDimension(
  value: number,
  min: number,
  max: number,
) {
  return Math.max(min, Math.min(max, value))
}
