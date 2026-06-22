import type {
  CanvasTableRowsNormalizationOptions,
} from './CanvasTableImportContracts'

export function normalizeCanvasTableRows(
  rows: readonly (readonly string[])[],
  options: CanvasTableRowsNormalizationOptions = {},
) {
  const normalizedRows = normalizeCanvasTableRowsWithoutFallback(rows, options)
  const columnCount = getCanvasTableColumnCount(normalizedRows)

  if (normalizedRows.length > 0 && columnCount > 0) {
    return padCanvasTableRows(normalizedRows, columnCount)
  }

  if (options.fallbackRows === undefined) {
    return []
  }

  const fallbackRows = normalizeCanvasTableRowsWithoutFallback(
    options.fallbackRows,
    options,
  )
  const fallbackColumnCount = getCanvasTableColumnCount(fallbackRows)

  return fallbackColumnCount > 0
    ? padCanvasTableRows(fallbackRows, fallbackColumnCount)
    : []
}

export function getCanvasTableColumnCount(
  rows: readonly (readonly string[])[],
) {
  return Math.max(0, ...rows.map((row) => row.length))
}

export function isCanvasTableImportRows(
  rows: readonly (readonly string[])[],
) {
  const nonEmptyRows = rows.filter((row) =>
    row.some((cell) => cell.trim().length > 0),
  )
  const columnCount = Math.max(0, ...nonEmptyRows.map((row) => row.length))

  return nonEmptyRows.length >= 2 && columnCount >= 2
}

function normalizeCanvasTableRowsWithoutFallback(
  rows: readonly (readonly string[])[],
  options: CanvasTableRowsNormalizationOptions,
) {
  const maxColumns = getCanvasTableNormalizationLimit(options.maxColumns)
  const maxRows = getCanvasTableNormalizationLimit(options.maxRows)

  return rows
    .map((row) => row
      .map((cell) => normalizeCanvasTableCell(cell, options))
      .slice(0, maxColumns))
    .filter((row) => row.some((cell) => cell.length > 0))
    .slice(0, maxRows)
}

function normalizeCanvasTableCell(
  value: string,
  options: CanvasTableRowsNormalizationOptions,
) {
  const maxCellLength = getCanvasTableNormalizationLimit(options.maxCellLength)
  const normalized = value.trim()

  return maxCellLength === undefined
    ? normalized
    : normalized.slice(0, maxCellLength)
}

function padCanvasTableRows(
  rows: readonly (readonly string[])[],
  columnCount: number,
) {
  return rows.map((row) => [
    ...row,
    ...Array.from({ length: columnCount - row.length }, () => ''),
  ])
}

function getCanvasTableNormalizationLimit(value: number | undefined) {
  return value === undefined
    ? undefined
    : Math.max(0, Math.floor(value))
}
