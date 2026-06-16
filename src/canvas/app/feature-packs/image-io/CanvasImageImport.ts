import type {
  CanvasImageItem,
  Point,
} from '../../../entities'
import {
  createCanvasImageItem,
  isCanvasImageMimeType,
} from '../../../host'

export type CanvasImageImportSource = {
  dataUrl: string
  mimeType: string
  name?: string
  naturalHeight?: number
  naturalWidth?: number
}

export type CanvasImportedImageItemInput = {
  center: Point
  createId: (prefix: string) => string
  source: CanvasImageImportSource
}

const DEFAULT_IMAGE_WIDTH = 320
const DEFAULT_IMAGE_HEIGHT = 220
const MAX_IMAGE_WIDTH = 520
const MAX_IMAGE_HEIGHT = 360

export function createCanvasImportedImageItem({
  center,
  createId,
  source,
}: CanvasImportedImageItemInput): CanvasImageItem {
  const size = getCanvasImportedImageSize(source)

  return createCanvasImageItem({
    alt: source.name,
    h: size.h,
    id: createId('image'),
    mimeType: source.mimeType,
    name: source.name,
    naturalHeight: source.naturalHeight,
    naturalWidth: source.naturalWidth,
    src: source.dataUrl,
    w: size.w,
    x: center.x - size.w / 2,
    y: center.y - size.h / 2,
  })
}

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

export function getCanvasImageFileFromList(files: FileList | null) {
  return Array.from(files ?? []).find(isCanvasImageBlob) ?? null
}

export function getCanvasImageFileFromDataTransfer(
  dataTransfer: DataTransfer | null,
) {
  return getCanvasImageFileFromList(dataTransfer?.files ?? null)
}

export function isCanvasImageBlob(
  blob: Blob & { name?: string },
): blob is File {
  return isCanvasImageMimeType(blob.type)
}

function getCanvasImportedImageSize({
  naturalHeight,
  naturalWidth,
}: CanvasImageImportSource) {
  if (!naturalWidth || !naturalHeight) {
    return {
      h: DEFAULT_IMAGE_HEIGHT,
      w: DEFAULT_IMAGE_WIDTH,
    }
  }

  const scale = Math.min(
    1,
    MAX_IMAGE_WIDTH / naturalWidth,
    MAX_IMAGE_HEIGHT / naturalHeight,
  )

  return {
    h: Math.max(1, Math.round(naturalHeight * scale)),
    w: Math.max(1, Math.round(naturalWidth * scale)),
  }
}

function readCanvasBlobAsDataUrl(blob: Blob) {
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

async function readCanvasImageNaturalSize(dataUrl: string) {
  try {
    const image = new Image()
    image.src = dataUrl

    await image.decode()

    return image.naturalWidth > 0 && image.naturalHeight > 0
      ? { h: image.naturalHeight, w: image.naturalWidth }
      : null
  } catch {
    return null
  }
}

function getCanvasImageDataUrlMimeType(dataUrl: string) {
  return dataUrl.match(/^data:([^;,]+)/i)?.[1] ?? ''
}
