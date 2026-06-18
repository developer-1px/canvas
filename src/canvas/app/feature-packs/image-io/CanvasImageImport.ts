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
  format?: CanvasImageImportFormat
  mimeType: string
  name?: string
  naturalHeight?: number
  naturalWidth?: number
}

export type CanvasImageImportFormat =
  | 'data-url-html-img'
  | 'data-url-plain'
  | 'file'
  | 'svg-html-img'
  | 'svg-html-inline'
  | 'svg-mime'
  | 'svg-plain'

export type CanvasImportedImageItemInput = {
  center: Point
  createId: (prefix: string) => string
  source: CanvasImageImportSource
}

export type CanvasImportedImageSize = {
  h: number
  w: number
}

export type CanvasImportedImageSizeOptions = {
  fallbackSize?: Partial<CanvasImportedImageSize>
  maxSize?: Partial<CanvasImportedImageSize>
}

export type CanvasImagePasteReplaceTarget = Readonly<{
  id: string
  selection: readonly string[]
}>

export type CanvasImagePasteReplaceTargetInput = Readonly<{
  selection: readonly string[]
  source: CanvasImageImportSource
}>

export type CanvasImagePasteReplaceIntent = Readonly<{
  kind: 'image-replace'
  source: CanvasImageImportSource
  target: CanvasImagePasteReplaceTarget
}>

export type CanvasImagePasteReplaceRoute =
  | CanvasImagePasteReplaceFallbackRoute
  | CanvasImagePasteReplaceRoutedRoute

export type CanvasImagePasteReplaceRoutedRoute = Readonly<{
  intent: CanvasImagePasteReplaceIntent
  kind: 'image-replace'
  source: CanvasImageImportSource
  status: 'routed'
}>

export type CanvasImagePasteReplaceFallbackReason =
  | 'batch'
  | 'disabled'
  | 'no-source'
  | 'no-target'

export type CanvasImagePasteReplaceFallbackRoute = Readonly<{
  kind: 'image-insert'
  reason: CanvasImagePasteReplaceFallbackReason
  sources: readonly CanvasImageImportSource[]
  status: 'fallback'
}>

export type CanvasImagePasteReplaceRouteInput = Readonly<{
  disabled?: boolean
  getTarget: (
    input: CanvasImagePasteReplaceTargetInput
  ) => CanvasImagePasteReplaceTarget | null
  selection: readonly string[]
  sources: readonly CanvasImageImportSource[]
}>

export const CANVAS_IMAGE_IMPORT_MODEL = 'canvas-image-import'

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

export function routeCanvasImagePasteReplace({
  disabled = false,
  getTarget,
  selection,
  sources,
}: CanvasImagePasteReplaceRouteInput): CanvasImagePasteReplaceRoute {
  if (disabled) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'disabled',
      sources,
    })
  }

  if (sources.length === 0) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'no-source',
      sources,
    })
  }

  if (sources.length > 1) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'batch',
      sources,
    })
  }

  const source = sources[0]!
  const target = getTarget({
    selection,
    source,
  })

  if (!target) {
    return createCanvasImagePasteReplaceFallbackRoute({
      reason: 'no-target',
      sources,
    })
  }

  return Object.freeze({
    intent: Object.freeze({
      kind: 'image-replace',
      source,
      target,
    }),
    kind: 'image-replace',
    source,
    status: 'routed',
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

export function getCanvasSVGImageSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasImageImportSource | null {
  if (!dataTransfer) {
    return null
  }

  const svgMimeSource = getCanvasSVGImageSourceFromMarkup(
    dataTransfer.getData('image/svg+xml'),
    'svg-mime',
  )

  if (svgMimeSource) {
    return svgMimeSource
  }

  const htmlSource = getCanvasSVGImageSourceFromHTML(
    dataTransfer.getData('text/html'),
  )

  if (htmlSource) {
    return htmlSource
  }

  return getCanvasSVGImageSourceFromMarkup(
    dataTransfer.getData('text/plain'),
    'svg-plain',
  )
}

export function getCanvasDataImageSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasImageImportSource | null {
  if (!dataTransfer) {
    return null
  }

  return getCanvasDataImageSourceFromHTML(dataTransfer.getData('text/html')) ??
    getCanvasDataImageSourceFromDataUrl(
      dataTransfer.getData('text/plain'),
      'data-url-plain',
    )
}

export function getCanvasHTMLDataImageSourcesFromDataTransfer(
  dataTransfer: DataTransfer | null,
): readonly CanvasImageImportSource[] {
  if (!dataTransfer) {
    return []
  }

  return getCanvasHTMLDataImageSources(dataTransfer.getData('text/html'))
}

export function getCanvasImageSourceFromDataTransfer(
  dataTransfer: DataTransfer | null,
): CanvasImageImportSource | null {
  return getCanvasSVGImageSourceFromDataTransfer(dataTransfer) ??
    getCanvasDataImageSourceFromDataTransfer(dataTransfer)
}

export async function resolveCanvasImageSourceNaturalSize(
  source: CanvasImageImportSource,
): Promise<CanvasImageImportSource> {
  if (source.naturalWidth && source.naturalHeight) {
    return source
  }

  const naturalSize = await readCanvasImageNaturalSize(source.dataUrl)

  return naturalSize
    ? {
        ...source,
        naturalHeight: naturalSize.h,
        naturalWidth: naturalSize.w,
      }
    : source
}

export function isCanvasImageBlob(
  blob: Blob & { name?: string },
): blob is File {
  return isCanvasImageMimeType(blob.type)
}

export function getCanvasImportedImageSize({
  naturalHeight,
  naturalWidth,
}: Pick<CanvasImageImportSource, 'naturalHeight' | 'naturalWidth'>,
options: CanvasImportedImageSizeOptions = {},
): CanvasImportedImageSize {
  const fallbackWidth =
    options.fallbackSize?.w ?? DEFAULT_IMAGE_WIDTH
  const fallbackHeight =
    options.fallbackSize?.h ?? DEFAULT_IMAGE_HEIGHT
  const maxWidth = options.maxSize?.w ?? MAX_IMAGE_WIDTH
  const maxHeight = options.maxSize?.h ?? MAX_IMAGE_HEIGHT

  if (!naturalWidth || !naturalHeight) {
    return {
      h: Math.max(1, fallbackHeight),
      w: Math.max(1, fallbackWidth),
    }
  }

  const scale = Math.min(
    1,
    maxWidth / naturalWidth,
    maxHeight / naturalHeight,
  )

  return {
    h: Math.max(1, Math.round(naturalHeight * scale)),
    w: Math.max(1, Math.round(naturalWidth * scale)),
  }
}

function createCanvasImagePasteReplaceFallbackRoute({
  reason,
  sources,
}: {
  reason: CanvasImagePasteReplaceFallbackReason
  sources: readonly CanvasImageImportSource[]
}): CanvasImagePasteReplaceFallbackRoute {
  return Object.freeze({
    kind: 'image-insert',
    reason,
    sources: Object.freeze([...sources]),
    status: 'fallback',
  })
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

function getCanvasDataImageSourceFromHTML(value: string) {
  const image = getCanvasHTMLImageSource(value)

  if (!image || isCanvasSVGDataUrl(image.src)) {
    return null
  }

  return getCanvasDataImageSourceFromDataUrl(
    image.src,
    'data-url-html-img',
    image.alt || image.title || undefined,
  )
}

function getCanvasHTMLDataImageSources(value: string) {
  const seenDataUrls = new Set<string>()
  const sources: CanvasImageImportSource[] = []

  for (const image of getCanvasHTMLImageSources(value)) {
    const source = isCanvasSVGDataUrl(image.src)
      ? getCanvasSVGImageSourceFromMarkup(
          image.src,
          'svg-html-img',
          image.alt || image.title || undefined,
        )
      : getCanvasDataImageSourceFromDataUrl(
          image.src,
          'data-url-html-img',
          image.alt || image.title || undefined,
        )

    if (!source || seenDataUrls.has(source.dataUrl)) {
      continue
    }

    seenDataUrls.add(source.dataUrl)
    sources.push(source)
  }

  return sources
}

function getCanvasDataImageSourceFromDataUrl(
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

function getCanvasSVGImageSourceFromHTML(value: string) {
  const image = getCanvasHTMLImageSource(value, { svgOnly: true })

  if (image) {
    return getCanvasSVGImageSourceFromMarkup(
      image.src,
      'svg-html-img',
      image.alt || image.title || undefined,
    )
  }

  const inlineSvg = getCanvasInlineSVGFromHTML(value)

  return inlineSvg
    ? getCanvasSVGImageSourceFromMarkup(inlineSvg, 'svg-html-inline')
    : null
}

function getCanvasSVGImageSourceFromMarkup(
  value: string,
  format: CanvasImageImportFormat,
  name?: string,
): CanvasImageImportSource | null {
  const normalized = normalizeCanvasSVGMarkup(
    decodeCanvasSVGDataUrl(value.trim()) ?? value,
  )

  if (!normalized) {
    return null
  }

  return {
    dataUrl: `data:image/svg+xml;charset=utf-8,${
      encodeURIComponent(normalized.markup)
    }`,
    format,
    mimeType: 'image/svg+xml',
    name: getCanvasSVGImportName(name),
    naturalHeight: normalized.naturalHeight,
    naturalWidth: normalized.naturalWidth,
  }
}

function normalizeCanvasSVGMarkup(value: string) {
  if (!value.trim()) {
    return null
  }

  return typeof DOMParser === 'undefined'
    ? normalizeCanvasSVGMarkupString(value)
    : normalizeCanvasSVGMarkupDOM(value)
}

function normalizeCanvasSVGMarkupDOM(value: string) {
  const doc = new DOMParser().parseFromString(value.trim(), 'image/svg+xml')
  const svg = doc.documentElement

  if (
    svg.tagName.toLowerCase() !== 'svg' ||
    doc.querySelector('parsererror')
  ) {
    return null
  }

  svg.querySelectorAll('script, foreignObject').forEach((node) => node.remove())
  removeUnsafeCanvasSVGAttributes(svg)
  svg.querySelectorAll('*').forEach(removeUnsafeCanvasSVGAttributes)

  if (!svg.getAttribute('xmlns')) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  }

  const size = getCanvasSVGNaturalSizeFromElement(svg)

  return {
    markup: new XMLSerializer().serializeToString(svg),
    naturalHeight: size?.h,
    naturalWidth: size?.w,
  }
}

function normalizeCanvasSVGMarkupString(value: string) {
  const svgMatch = /<svg\b[\s\S]*?<\/svg>/i.exec(value.trim())
  const svgMarkup = svgMatch?.[0] ?? ''

  if (!svgMarkup) {
    return null
  }

  const sanitized = svgMarkup
    .replace(/<(script|foreignObject)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|[a-z]+:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '')
    .replace(/\s+(href|[a-z]+:href)\s*=\s*javascript:[^\s>]+/gi, '')
  const markup = /<svg\b[^>]*\sxmlns\s*=/i.test(sanitized)
    ? sanitized
    : sanitized.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  const size = getCanvasSVGNaturalSizeFromMarkup(markup)

  return {
    markup,
    naturalHeight: size?.h,
    naturalWidth: size?.w,
  }
}

function removeUnsafeCanvasSVGAttributes(element: Element) {
  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase()
    const value = attribute.value.trim().toLowerCase()

    if (
      name.startsWith('on') ||
      ((name === 'href' || name.endsWith(':href')) &&
        value.startsWith('javascript:'))
    ) {
      element.removeAttribute(attribute.name)
    }
  })
}

function getCanvasHTMLImageSource(
  value: string,
  options: { svgOnly?: boolean } = {},
) {
  return getCanvasHTMLImageSources(value, options)[0] ?? null
}

function getCanvasHTMLImageSources(
  value: string,
  options: { svgOnly?: boolean } = {},
) {
  if (!value) {
    return []
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(value, 'text/html')

    return Array.from(doc.querySelectorAll<HTMLImageElement>('img[src]'))
      .map((image) => ({
        alt: image.alt,
        src: image.getAttribute('src')?.trim() ?? '',
        title: image.title,
      }))
      .filter((image) =>
        /^data:image\//i.test(image.src) &&
        (!options.svgOnly || isCanvasSVGDataUrl(image.src)),
      )
  }

  const images: Array<{ alt: string; src: string; title: string }> = []

  for (const match of value.matchAll(/<img\b([^>]*)>/gi)) {
    const attributes = match[1]
    const src = getCanvasHTMLAttribute(attributes, 'src')

    if (
      src?.trim().match(/^data:image\//i) &&
      (!options.svgOnly || isCanvasSVGDataUrl(src))
    ) {
      images.push({
        alt: getCanvasHTMLAttribute(attributes, 'alt') ?? '',
        src,
        title: getCanvasHTMLAttribute(attributes, 'title') ?? '',
      })
    }
  }

  return images
}

function getCanvasInlineSVGFromHTML(value: string) {
  if (!value) {
    return null
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(value, 'text/html')
    const svg = doc.querySelector('svg')

    return svg ? new XMLSerializer().serializeToString(svg) : null
  }

  return /<svg\b[\s\S]*?<\/svg>/i.exec(value)?.[0] ?? null
}

function getCanvasHTMLAttribute(value: string, name: string) {
  const match = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i',
  ).exec(value)

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null
}

function getCanvasSVGNaturalSizeFromElement(svg: Element) {
  const width = getCanvasSVGLength(svg.getAttribute('width'))
  const height = getCanvasSVGLength(svg.getAttribute('height'))

  if (width && height) {
    return {
      h: height,
      w: width,
    }
  }

  return getCanvasSVGNaturalSizeFromViewBox(svg.getAttribute('viewBox'))
}

function getCanvasSVGNaturalSizeFromMarkup(markup: string) {
  const openTag = /<svg\b([^>]*)>/i.exec(markup)?.[1] ?? ''
  const width = getCanvasSVGLength(getCanvasHTMLAttribute(openTag, 'width'))
  const height = getCanvasSVGLength(getCanvasHTMLAttribute(openTag, 'height'))

  if (width && height) {
    return {
      h: height,
      w: width,
    }
  }

  return getCanvasSVGNaturalSizeFromViewBox(
    getCanvasHTMLAttribute(openTag, 'viewBox'),
  )
}

function getCanvasSVGNaturalSizeFromViewBox(value: string | null) {
  const viewBox = value
    ?.trim()
    .split(/[\s,]+/)
    .map((item) => Number.parseFloat(item))

  if (
    viewBox?.length === 4 &&
    Number.isFinite(viewBox[2]) &&
    Number.isFinite(viewBox[3]) &&
    viewBox[2] > 0 &&
    viewBox[3] > 0
  ) {
    return {
      h: viewBox[3],
      w: viewBox[2],
    }
  }

  return null
}

function getCanvasSVGLength(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function decodeCanvasSVGDataUrl(value: string) {
  const match = value.match(/^data:image\/svg\+xml[^,]*,(.*)$/i)

  if (!match) {
    return null
  }

  try {
    return value.includes(';base64,')
      ? atob(match[1])
      : decodeURIComponent(match[1])
  } catch {
    return null
  }
}

function getCanvasSVGImportName(value?: string) {
  const name = value?.trim()

  return name ? `${name.replace(/\.[^.]+$/, '')}.svg` : 'clipboard.svg'
}

function getCanvasDataImageImportName(value: string | undefined, mimeType: string) {
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

function isCanvasSVGDataUrl(value: string) {
  return getCanvasImageDataUrlMimeType(value) === 'image/svg+xml'
}

async function readCanvasImageNaturalSize(dataUrl: string) {
  if (typeof Image === 'undefined') {
    return null
  }

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
  const mimeType = dataUrl.trim().match(/^data:(image\/[^;,]+)[^,]*,/i)?.[1]
    .toLowerCase()

  return mimeType ? normalizeCanvasImageMimeType(mimeType) : ''
}

function normalizeCanvasImageMimeType(value: string) {
  const mimeType = value.trim().toLowerCase()

  return mimeType === 'image/jpg' ? 'image/jpeg' : mimeType
}
