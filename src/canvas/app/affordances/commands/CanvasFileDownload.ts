export type CanvasFileDownloadAnchor = {
  click: () => void
  download: string
  href: string
}

export type CanvasFileDownloadDocument = {
  createElement: (tagName: 'a') => CanvasFileDownloadAnchor
}

export type CanvasFileDownloadUrlApi = {
  createObjectURL: (blob: Blob) => string
  revokeObjectURL: (url: string) => void
}

export type CanvasFileDownloadTimer = (
  callback: () => void,
  delay?: number,
) => unknown

export type CanvasBlobFileDownloadInput = {
  blob: Blob
  document?: CanvasFileDownloadDocument | null
  filename: string
  revokeDelayMs?: number
  setTimeout?: CanvasFileDownloadTimer | null
  url?: CanvasFileDownloadUrlApi | null
}

export type CanvasTextFileDownloadInput = Omit<
  CanvasBlobFileDownloadInput,
  'blob'
> & {
  content: string
  type: string
}

export function downloadCanvasBlobFile({
  blob,
  document = getCanvasFileDownloadDocument(),
  filename,
  revokeDelayMs = 0,
  setTimeout = getCanvasFileDownloadTimer(),
  url = getCanvasFileDownloadUrlApi(),
}: CanvasBlobFileDownloadInput) {
  if (!document || !url) {
    return false
  }

  const objectUrl = url.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()

  if (setTimeout) {
    setTimeout(() => url.revokeObjectURL(objectUrl), revokeDelayMs)
  } else {
    url.revokeObjectURL(objectUrl)
  }

  return true
}

export function downloadCanvasTextFile({
  content,
  type,
  ...input
}: CanvasTextFileDownloadInput) {
  if (typeof Blob === 'undefined') {
    return false
  }

  return downloadCanvasBlobFile({
    ...input,
    blob: new Blob([content], { type }),
  })
}

function getCanvasFileDownloadDocument(): CanvasFileDownloadDocument | null {
  return typeof document === 'undefined' ? null : document
}

function getCanvasFileDownloadUrlApi(): CanvasFileDownloadUrlApi | null {
  return typeof URL === 'undefined' ? null : URL
}

function getCanvasFileDownloadTimer(): CanvasFileDownloadTimer | null {
  return typeof window === 'undefined' ? null : window.setTimeout.bind(window)
}
