import {
  isCanvasImageMimeType,
} from '../../../host'
import type {
  CanvasImageImportSource,
} from './CanvasImageImportContracts'
import {
  getCanvasImageDataUrlMimeType,
} from './CanvasImageDataUrls'
import {
  readCanvasImageNaturalSize,
} from './CanvasImageNaturalSize'

export async function readCanvasImageFileSource(
  file: Blob & { name?: string },
): Promise<CanvasImageImportSource | null> {
  if (!isCanvasImageBlob(file)) {
    return null
  }

  const dataUrl = await readCanvasBlobAsDataUrl(file)
  const mimeType = file.type || getCanvasImageDataUrlMimeType(dataUrl)

  if (!isCanvasImageMimeType(mimeType)) {
    return null
  }

  const naturalSize = await readCanvasImageNaturalSize(dataUrl)

  return {
    dataUrl,
    mimeType,
    name: file.name,
    naturalHeight: naturalSize?.h,
    naturalWidth: naturalSize?.w,
  }
}

export async function readCanvasImageFileSources(
  files: readonly (Blob & { name?: string })[],
): Promise<CanvasImageImportSource[]> {
  const sources: CanvasImageImportSource[] = []

  for (const file of files) {
    const source = await readCanvasImageFileSource(file)

    if (source) {
      sources.push(source)
    }
  }

  return sources
}

export function getCanvasImageFileFromList(files: FileList | null) {
  return Array.from(files ?? []).find(isCanvasImageBlob) ?? null
}

export function getCanvasImageFilesFromList(files: FileList | null) {
  return dedupeCanvasImageFiles(
    Array.from(files ?? []).filter(isCanvasImageBlob),
  )
}

export function getCanvasImageFileFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return getCanvasImageFileFromList(dataTransfer?.files ?? null)
}

export function getCanvasImageFilesFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  if (!dataTransfer) {
    return []
  }

  return dedupeCanvasImageFiles([
    ...getCanvasImageFilesFromList(dataTransfer.files ?? null),
    ...getCanvasImageFilesFromDataTransferItems(dataTransfer.items ?? null),
  ])
}

export function isCanvasImageBlob(
  blob: Blob & { name?: string },
): blob is File {
  return isCanvasImageMimeType(blob.type)
}

function getCanvasImageFilesFromDataTransferItems(
  items: DataTransferItemList | null,
) {
  const files: File[] = []

  for (let index = 0; index < (items?.length ?? 0); index += 1) {
    const item = getCanvasDataTransferItemAt(items, index)

    if (item?.kind !== 'file') {
      continue
    }

    const file = item.getAsFile()

    if (file && isCanvasImageBlob(file)) {
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

function dedupeCanvasImageFiles<T extends Blob & { name?: string }>(
  files: readonly T[],
) {
  const seenKeys = new Set<string>()
  const dedupedFiles: T[] = []

  for (const file of files) {
    const key = getCanvasImageFileDedupeKey(file)

    if (seenKeys.has(key)) {
      continue
    }

    seenKeys.add(key)
    dedupedFiles.push(file)
  }

  return dedupedFiles
}

function getCanvasImageFileDedupeKey(
  file: Blob & { lastModified?: number; name?: string },
) {
  return [
    file.name ?? '',
    file.type,
    file.size,
    file.lastModified ?? '',
  ].join('\u0000')
}

function readCanvasBlobAsDataUrl(blob: Blob) {
  if (typeof FileReader === 'undefined') {
    return readCanvasBlobAsDataUrlWithoutFileReader(blob)
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Expected image data URL'))
    })
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('Could not read image'))
    })
    reader.readAsDataURL(blob)
  })
}

async function readCanvasBlobAsDataUrlWithoutFileReader(blob: Blob) {
  if (typeof btoa !== 'function') {
    throw new Error('FileReader is unavailable')
  }

  const bytes = new Uint8Array(await blob.arrayBuffer())
  const chunks: string[] = []
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, index + chunkSize)))
  }

  return `data:${blob.type || 'application/octet-stream'};base64,${
    btoa(chunks.join(''))
  }`
}
