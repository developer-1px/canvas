import { parseSlideEditJSONPasteTextValue } from './SlideEditTextJSONPaste'

export type SlideEditTableRowsSlideId = string
export type SlideEditTableRowsObjectId = string

export type SlideEditTableRowsDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditTableRowsMatrix = readonly (readonly string[])[]

export type SlideEditTableRowsStoragePolicy = {
  maxCellLength?: number
  maxColumns?: number
  maxRows?: number
  normalizeCell?: (input: SlideEditTableRowsNormalizeCellInput) => string
}

export type SlideEditTableRowsNormalizeCellInput = {
  columnIndex: number
  rowIndex: number
  value: string
}

export type SlideEditTableRowsJSONPasteValue = {
  columnCount: number
  format: 'json'
  payloadLength: number
  rowCount: number
  rows: SlideEditTableRowsMatrix
  sourceType: string
  surface: 'table-rows'
  wrapper?: string
}

export type SlideEditTableRowsJSONPasteInput = {
  dataTransfer: SlideEditTableRowsDataTransfer | null
  jsonMimeType?: string
  storagePolicy?: SlideEditTableRowsStoragePolicy
}

export type SlideEditTableRowsJSONPasteValueMode =
  | 'direct'
  | 'wrapped'

export type SlideEditTableRowsJSONPasteValueOptions = {
  mode?: SlideEditTableRowsJSONPasteValueMode
  sourceType?: string
  storagePolicy?: SlideEditTableRowsStoragePolicy
}

export type SlideEditTableRowsReplaceTarget<
  TObjectId extends SlideEditTableRowsObjectId = SlideEditTableRowsObjectId,
> = {
  isHidden?: boolean
  isLocked?: boolean
  isTable?: boolean
  objectId: TObjectId
}

export type SlideEditTableRowsReplaceCommand<
  TObjectId extends SlideEditTableRowsObjectId = SlideEditTableRowsObjectId,
> = {
  id: 'replace-table-rows'
  objectId: TObjectId
  rows: SlideEditTableRowsMatrix
}

export type SlideEditTableRowsReplaceCommandMetadata<
  TObjectId extends SlideEditTableRowsObjectId = SlideEditTableRowsObjectId,
> = {
  columnCount: number
  format: 'json'
  payloadLength: number
  rowCount: number
  targetIds: readonly TObjectId[]
}

export type SlideEditTableRowsReplaceHostCommandEffect<
  TSlideId extends SlideEditTableRowsSlideId = SlideEditTableRowsSlideId,
  TObjectId extends SlideEditTableRowsObjectId = SlideEditTableRowsObjectId,
> = {
  metadata: SlideEditTableRowsReplaceCommandMetadata<TObjectId>
  payload: SlideEditTableRowsReplaceCommand<TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId?: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditTableRowsPasteCommandEffectInput<
  TSlideId extends SlideEditTableRowsSlideId = SlideEditTableRowsSlideId,
  TObjectId extends SlideEditTableRowsObjectId = SlideEditTableRowsObjectId,
> = {
  pasteValue: SlideEditTableRowsJSONPasteValue
  slideId?: TSlideId
  target: SlideEditTableRowsReplaceTarget<TObjectId> | null
}

export const SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.table-rows+json'

export const SLIDE_EDIT_TABLE_ROWS_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_TABLE_ROWS_JSON_WRAPPER_KEYS = Object.freeze([
  'tableRows',
  'table',
  'rows',
] as const)

export function getSlideEditTableRowsJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_TABLE_ROWS_JSON_MIME_TYPE,
  storagePolicy = {},
}: SlideEditTableRowsJSONPasteInput): SlideEditTableRowsJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customPasteValue = getSlideEditTableRowsJSONPasteValueFromText(
        customText,
        {
          mode: 'direct',
          sourceType: jsonMimeType,
          storagePolicy,
        },
      )

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_TABLE_ROWS_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const pasteValue = getSlideEditTableRowsJSONPasteValueFromText(
      text,
      {
        mode: 'wrapped',
        sourceType: type,
        storagePolicy,
      },
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditTableRowsJSONPasteValueFromText(
  text: string,
  options?: SlideEditTableRowsJSONPasteValueOptions,
): SlideEditTableRowsJSONPasteValue | null {
  return getSlideEditTableRowsJSONPasteValueFromValue(
    parseSlideEditTableRowsJSON(text),
    {
      ...options,
      payloadLength: text.length,
    },
  )
}

export function getSlideEditTableRowsJSONPasteValueFromValue(
  value: unknown,
  {
    mode = 'direct',
    payloadLength = 0,
    sourceType = 'value',
    storagePolicy = {},
  }: SlideEditTableRowsJSONPasteValueOptions & {
    payloadLength?: number
  } = {},
): SlideEditTableRowsJSONPasteValue | null {
  const input = {
    payloadLength,
    sourceType,
    storagePolicy,
    value,
  }

  return mode === 'wrapped'
    ? getSlideEditTableRowsWrappedJSONPasteValue(input)
    : getSlideEditTableRowsDirectJSONPasteValue(input)
}

export function getSlideEditTableRowsPasteCommandEffect<
  TSlideId extends SlideEditTableRowsSlideId,
  TObjectId extends SlideEditTableRowsObjectId,
>({
  pasteValue,
  slideId,
  target,
}: SlideEditTableRowsPasteCommandEffectInput<TSlideId, TObjectId>):
  SlideEditTableRowsReplaceHostCommandEffect<TSlideId, TObjectId> | null {
  if (!target || target.isHidden || target.isLocked || target.isTable === false) {
    return null
  }

  return {
    metadata: {
      columnCount: pasteValue.columnCount,
      format: pasteValue.format,
      payloadLength: pasteValue.payloadLength,
      rowCount: pasteValue.rowCount,
      targetIds: [target.objectId],
    },
    payload: {
      id: 'replace-table-rows',
      objectId: target.objectId,
      rows: pasteValue.rows,
    },
    selection: {
      objectIds: [target.objectId],
      ...(slideId === undefined ? {} : { slideId }),
    },
    type: 'slide-command-effect',
  }
}

function getSlideEditTableRowsWrappedJSONPasteValue({
  payloadLength,
  sourceType,
  storagePolicy,
  value,
}: {
  payloadLength: number
  sourceType: string
  storagePolicy: SlideEditTableRowsStoragePolicy
  value: unknown
}): SlideEditTableRowsJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_TABLE_ROWS_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditTableRowsDirectJSONPasteValue({
      payloadLength,
      sourceType,
      storagePolicy,
      value: record[key],
      wrapper: key,
    })

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditTableRowsDirectJSONPasteValue({
  payloadLength,
  sourceType,
  storagePolicy,
  value,
  wrapper,
}: {
  payloadLength: number
  sourceType: string
  storagePolicy: SlideEditTableRowsStoragePolicy
  value: unknown
  wrapper?: string
}): SlideEditTableRowsJSONPasteValue | null {
  const rawRows = getSlideEditTableRowsRawMatrix(value)
  const rows = normalizeSlideEditTableRowsMatrix(rawRows, storagePolicy)

  if (rows.length === 0) {
    return null
  }

  return {
    columnCount: getSlideEditTableRowsColumnCount(rows),
    format: 'json',
    payloadLength,
    rowCount: rows.length,
    rows,
    sourceType,
    surface: 'table-rows',
    ...(wrapper ? { wrapper } : {}),
  }
}

function getSlideEditTableRowsRawMatrix(value: unknown): unknown[][] {
  if (Array.isArray(value)) {
    return getSlideEditTableRowsFromRows(value)
  }

  if (!value || typeof value !== 'object') {
    return []
  }

  const record = value as Record<string, unknown>
  const rowsValue = record.rows
  const rows = Array.isArray(rowsValue)
    ? getSlideEditTableRowsFromRows(rowsValue, getSlideEditTableColumns(record))
    : []
  const headerRow = getSlideEditTableHeaderRow(record)

  return headerRow.length > 0 ? [headerRow, ...rows] : rows
}

function getSlideEditTableRowsFromRows(
  rows: readonly unknown[],
  preferredColumns: readonly string[] = [],
): unknown[][] {
  if (rows.every((row) => Array.isArray(row))) {
    return rows.map((row) => row as unknown[])
  }

  if (rows.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
    const records = rows as Array<Record<string, unknown>>
    const columns = preferredColumns.length > 0
      ? preferredColumns
      : getSlideEditTableObjectColumns(records)

    return records.map((row) => columns.map((column) => row[column] ?? ''))
  }

  return []
}

function getSlideEditTableObjectColumns(
  rows: readonly Record<string, unknown>[],
) {
  const columns: string[] = []

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!columns.includes(key)) {
        columns.push(key)
      }
    }
  }

  return columns
}

function getSlideEditTableHeaderRow(record: Record<string, unknown>) {
  return getSlideEditTableColumns(record)
}

function getSlideEditTableColumns(record: Record<string, unknown>) {
  const value = Array.isArray(record.columns)
    ? record.columns
    : Array.isArray(record.headers)
    ? record.headers
    : []

  return value.flatMap((cell) => {
    const text = getSlideEditTableRowsCellText(cell)

    return text === null ? [] : [text]
  })
}

function normalizeSlideEditTableRowsMatrix(
  rows: readonly (readonly unknown[])[],
  storagePolicy: SlideEditTableRowsStoragePolicy,
) {
  const maxRows = storagePolicy.maxRows ?? Number.POSITIVE_INFINITY
  const maxColumns = storagePolicy.maxColumns ?? Number.POSITIVE_INFINITY
  const normalizedRows = rows.slice(0, maxRows).map((row, rowIndex) =>
    row.slice(0, maxColumns).map((cell, columnIndex) =>
      normalizeSlideEditTableRowsCell({
        cell,
        columnIndex,
        rowIndex,
        storagePolicy,
      })))
  const filteredRows = normalizedRows.filter((row) =>
    row.some((cell) => cell.length > 0))

  if (filteredRows.length === 0) {
    return []
  }

  const columnCount = getSlideEditTableRowsColumnCount(filteredRows)

  return filteredRows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => row[index] ?? ''))
}

function normalizeSlideEditTableRowsCell({
  cell,
  columnIndex,
  rowIndex,
  storagePolicy,
}: {
  cell: unknown
  columnIndex: number
  rowIndex: number
  storagePolicy: SlideEditTableRowsStoragePolicy
}) {
  const value = getSlideEditTableRowsCellText(cell) ?? ''
  const normalizedValue = storagePolicy.normalizeCell
    ? storagePolicy.normalizeCell({ columnIndex, rowIndex, value })
    : value
  const maxCellLength = storagePolicy.maxCellLength

  return maxCellLength === undefined
    ? normalizedValue
    : normalizedValue.slice(0, maxCellLength)
}

function getSlideEditTableRowsCellText(value: unknown) {
  if (
    typeof value !== 'string' &&
    typeof value !== 'number' &&
    typeof value !== 'boolean'
  ) {
    return null
  }

  const text = String(value).trim()

  return text || null
}

function getSlideEditTableRowsColumnCount(rows: SlideEditTableRowsMatrix) {
  return Math.max(0, ...rows.map((row) => row.length))
}

function parseSlideEditTableRowsJSON(value: string) {
  return parseSlideEditJSONPasteTextValue(value)
}
