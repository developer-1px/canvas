import type {
  CanvasImageImportFormat,
  CanvasImageImportSource,
} from './CanvasImageImportContracts'

export function getCanvasDataImageSourceFromDataUrl(
  value: string,
  format: CanvasImageImportFormat,
  name?: string,
): CanvasImageImportSource | null {
  const mimeType = getCanvasImageDataUrlMimeType(value)

  if (!mimeType || mimeType === 'image/svg+xml') {
    return null
  }

  return {
    dataUrl: value.trim(),
    format,
    mimeType,
    name: getCanvasDataImageImportName(name, mimeType),
  }
}

export function getCanvasImageDataUrlMimeType(dataUrl: string) {
  const mimeType = dataUrl.trim().match(/^data:(image\/[^;,]+)[^,]*,/i)?.[1]
    .toLowerCase()

  return mimeType ? normalizeCanvasImageMimeType(mimeType) : ''
}

export function isCanvasSVGDataUrl(value: string) {
  return getCanvasImageDataUrlMimeType(value) === 'image/svg+xml'
}

function getCanvasDataImageImportName(
  value: string | undefined,
  mimeType: string,
) {
  const name = value?.trim().replace(/\.[^.]+$/, '')
  const extension = getCanvasImageExtension(mimeType)

  return `${name || 'clipboard'}.${extension}`
}

function getCanvasImageExtension(mimeType: string) {
  if (mimeType === 'image/jpeg') {
    return 'jpg'
  }

  return mimeType.replace('image/', '').replace('svg+xml', 'svg')
}

function normalizeCanvasImageMimeType(value: string) {
  const mimeType = value.trim().toLowerCase()

  return mimeType === 'image/jpg' ? 'image/jpeg' : mimeType
}
