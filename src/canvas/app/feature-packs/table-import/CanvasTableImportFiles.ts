import {
  CANVAS_TABLE_CSV_MIME_TYPES,
  CANVAS_TABLE_TSV_MIME_TYPES,
  type CanvasTableImportSource,
} from './CanvasTableImportContracts'
import {
  getCanvasTableCsvSourceFromText,
  getCanvasTableSourceFromText,
} from './CanvasTableTextSources'

const CANVAS_CSV_MIME_TYPES = new Set<string>(CANVAS_TABLE_CSV_MIME_TYPES)
const CANVAS_TSV_MIME_TYPES = new Set<string>(CANVAS_TABLE_TSV_MIME_TYPES)

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

export async function readCanvasTableFileSources(
  files: readonly (Blob & { name?: string })[],
): Promise<CanvasTableImportSource[]> {
  const sources: CanvasTableImportSource[] = []

  for (const file of files) {
    try {
      const source = await readCanvasTableFileSource(file)

      if (source) {
        sources.push(source)
      }
    } catch {
      continue
    }
  }

  return sources
}

export function getCanvasTableCsvFileFromList(files: FileList | null) {
  return Array.from(files ?? []).find(isCanvasTableCsvFile) ?? null
}

export function getCanvasTableFileFromList(files: FileList | null) {
  return Array.from(files ?? []).find(isCanvasTableTextFile) ?? null
}

export function getCanvasTableFilesFromList(files: FileList | null) {
  return dedupeCanvasTableFiles(
    Array.from(files ?? []).filter(isCanvasTableTextFile),
  )
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

export function getCanvasTableFilesFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return []
  }

  return dedupeCanvasTableFiles([
    ...getCanvasTableFilesFromList(dataTransfer.files ?? null),
    ...getCanvasTableFilesFromDataTransferItems(dataTransfer.items ?? null),
  ])
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

function getCanvasTableFilesFromDataTransferItems(
  items: DataTransferItemList | null,
) {
  const files: File[] = []

  for (let index = 0; index < (items?.length ?? 0); index += 1) {
    const item = getCanvasDataTransferItemAt(items, index)

    if (item?.kind !== 'file') {
      continue
    }

    const file = item.getAsFile()

    if (file && isCanvasTableTextFile(file)) {
      files.push(file)
    }
  }

  return files
}

function getCanvasDataTransferItemAt(
  items: DataTransferItemList | null,
  index: number,
) {
  const item = items?.[index]

  if (item) {
    return item
  }

  const itemList = items as (
    DataTransferItemList & {
      item?: (index: number) => DataTransferItem | null
    }
  ) | null

  return typeof itemList?.item === 'function' ? itemList.item(index) : null
}

function dedupeCanvasTableFiles<T extends Blob & { name?: string }>(
  files: readonly T[],
) {
  const seenKeys = new Set<string>()
  const dedupedFiles: T[] = []

  for (const file of files) {
    const key = getCanvasTableFileDedupeKey(file)

    if (seenKeys.has(key)) {
      continue
    }

    seenKeys.add(key)
    dedupedFiles.push(file)
  }

  return dedupedFiles
}

function getCanvasTableFileDedupeKey(
  file: Blob & { lastModified?: number; name?: string },
) {
  return [
    file.name ?? '',
    file.type,
    file.size,
    file.lastModified ?? '',
  ].join('\u0000')
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
