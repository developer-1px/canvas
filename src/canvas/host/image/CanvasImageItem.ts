import type { CanvasImageItem } from '../model'

export type CreateCanvasImageItemInput = {
  alt?: string
  h: number
  id: string
  mimeType: string
  name?: string
  naturalHeight?: number
  naturalWidth?: number
  src: string
  w: number
  x: number
  y: number
}

export function createCanvasImageItem({
  alt,
  h,
  id,
  mimeType,
  name,
  naturalHeight,
  naturalWidth,
  src,
  w,
  x,
  y,
}: CreateCanvasImageItemInput): CanvasImageItem {
  const item: CanvasImageItem = {
    h,
    id,
    mimeType,
    src,
    type: 'image',
    w,
    x,
    y,
  }

  if (alt !== undefined) {
    item.alt = alt
  }

  if (name !== undefined) {
    item.name = name
  }

  if (naturalHeight !== undefined) {
    item.naturalHeight = naturalHeight
  }

  if (naturalWidth !== undefined) {
    item.naturalWidth = naturalWidth
  }

  return item
}

export function isCanvasImageItemStorageShape(
  value: Record<string, unknown>,
): value is CanvasImageItem {
  return (
    value.type === 'image' &&
    typeof value.src === 'string' &&
    isCanvasImageDataUrl(value.src) &&
    typeof value.mimeType === 'string' &&
    isCanvasImageMimeType(value.mimeType) &&
    isPositiveFiniteNumber(value.w) &&
    isPositiveFiniteNumber(value.h) &&
    (value.alt === undefined || typeof value.alt === 'string') &&
    (value.name === undefined || typeof value.name === 'string') &&
    (value.naturalWidth === undefined ||
      isPositiveFiniteNumber(value.naturalWidth)) &&
    (value.naturalHeight === undefined ||
      isPositiveFiniteNumber(value.naturalHeight))
  )
}

export function isCanvasImageMimeType(value: string) {
  return /^image\/[a-z0-9.+-]+$/i.test(value)
}

function isCanvasImageDataUrl(value: string) {
  return /^data:image\/[a-z0-9.+-]+[;,]/i.test(value)
}

function isPositiveFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
