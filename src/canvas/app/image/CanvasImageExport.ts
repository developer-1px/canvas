import type {
  Bounds,
  CanvasComponentItem,
  CanvasCustomItem,
  CanvasImageItem,
  CanvasItem,
  Point,
} from '../../entities'
import { writeCanvasImageBlobToClipboard } from './CanvasImageClipboard'

export type CanvasImageExportReadModel = {
  getSelectedItems: (ids: string[]) => CanvasItem[]
  getSelectionBounds: (ids: Iterable<string>) => Bounds | null
}

export type CanvasImageExportStageSnapshot = {
  getSelectionSvgSnapshot?: (input: {
    bounds: Bounds
    ids: readonly string[]
  }) => Omit<CanvasImageExportPayload, 'filename'> | null
}

export type CanvasImageExportPayload = {
  filename: string
  height: number
  svg: string
  width: number
}

const EXPORT_PADDING = 24
const EXPORT_BACKGROUND = '#ffffff'
const EXPORT_IMAGE_LOAD_TIMEOUT_MS = 3000

export function createCanvasSelectionImageExport({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}): CanvasImageExportPayload | null {
  if (selection.length === 0) {
    return null
  }

  const bounds = itemReadModel.getSelectionBounds(selection)

  if (!bounds) {
    return null
  }

  const snapshot = stageElement?.getSelectionSvgSnapshot?.({
    bounds,
    ids: selection,
  })

  if (snapshot) {
    return {
      ...snapshot,
      filename: 'canvas-selection.png',
    }
  }

  const items = itemReadModel.getSelectedItems(selection)

  if (items.length === 0) {
    return null
  }

  return createCanvasItemsImageExport({ bounds, items })
}

export function createCanvasSelectionImageExportCandidates({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}): CanvasImageExportPayload[] {
  if (selection.length === 0) {
    return []
  }

  const bounds = itemReadModel.getSelectionBounds(selection)

  if (!bounds) {
    return []
  }

  const snapshot = stageElement?.getSelectionSvgSnapshot?.({
    bounds,
    ids: selection,
  })
  const items = itemReadModel.getSelectedItems(selection)
  const candidates: CanvasImageExportPayload[] = []

  if (snapshot) {
    candidates.push({
      ...snapshot,
      filename: 'canvas-selection.png',
    })
  }

  if (items.length > 0) {
    candidates.push(createCanvasItemsImageExport({ bounds, items }))
  }

  return candidates
}

export function createCanvasItemsImageExport({
  bounds,
  items,
}: {
  bounds: Bounds
  items: CanvasItem[]
}): CanvasImageExportPayload {
  const viewBox = {
    h: bounds.h + EXPORT_PADDING * 2,
    w: bounds.w + EXPORT_PADDING * 2,
    x: bounds.x - EXPORT_PADDING,
    y: bounds.y - EXPORT_PADDING,
  }
  const width = Math.ceil(viewBox.w)
  const height = Math.ceil(viewBox.h)
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${formatNumber(viewBox.x)} ${formatNumber(viewBox.y)} ${formatNumber(viewBox.w)} ${formatNumber(viewBox.h)}">`,
    `<rect x="${formatNumber(viewBox.x)}" y="${formatNumber(viewBox.y)}" width="${formatNumber(viewBox.w)}" height="${formatNumber(viewBox.h)}" fill="${EXPORT_BACKGROUND}" />`,
    ...items.map(renderCanvasImageExportItem),
    '</svg>',
  ].join('')

  return {
    filename: 'canvas-selection.png',
    height,
    svg,
    width,
  }
}

export async function downloadCanvasSelectionImage({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}) {
  const exportPayload = await renderCanvasImageExportCandidatePngBlob(
    createCanvasSelectionImageExportCandidates({
      itemReadModel,
      selection,
      stageElement,
    }),
  )

  if (!exportPayload) {
    return false
  }

  downloadCanvasImageBlob(exportPayload.blob, exportPayload.filename)
  return true
}

export async function copyCanvasSelectionImageToClipboard({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}) {
  const exportPayload = await renderCanvasImageExportCandidatePngBlob(
    createCanvasSelectionImageExportCandidates({
      itemReadModel,
      selection,
      stageElement,
    }),
  )

  return exportPayload
    ? writeCanvasImageBlobToClipboard(exportPayload.blob)
    : false
}

async function renderCanvasImageExportCandidatePngBlob(
  candidates: CanvasImageExportPayload[],
) {
  for (const candidate of candidates) {
    try {
      return {
        blob: await renderCanvasImageExportPngBlob(candidate),
        filename: candidate.filename,
      }
    } catch {
      // Try the next representation; browser SVG rasterization support varies.
    }
  }

  return null
}

async function renderCanvasImageExportPngBlob({
  height,
  svg,
  width,
}: CanvasImageExportPayload) {
  const image = await loadCanvasImageFromSvg(svg)
  const canvas = document.createElement('canvas')
  const scale = Math.max(1, Math.ceil(window.devicePixelRatio || 1))
  const context = canvas.getContext('2d')

  canvas.width = width * scale
  canvas.height = height * scale

  if (!context) {
    throw new Error('Canvas image export unavailable')
  }

  context.scale(scale, scale)
  context.drawImage(image, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('Canvas image export failed'))
    }, 'image/png')
  })
}

function loadCanvasImageFromSvg(svg: string) {
  const url = URL.createObjectURL(
    new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
  )
  const image = new Image()

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Canvas image export timed out'))
    }, EXPORT_IMAGE_LOAD_TIMEOUT_MS)
    const cleanup = () => {
      window.clearTimeout(timeout)
      URL.revokeObjectURL(url)
    }

    image.addEventListener('load', () => {
      cleanup()
      resolve(image)
    }, { once: true })
    image.addEventListener('error', () => {
      cleanup()
      reject(new Error('Canvas image export failed'))
    }, { once: true })
    image.src = url
  })
}

function downloadCanvasImageBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

function renderCanvasImageExportItem(item: CanvasItem): string {
  if (item.type === 'group') {
    return item.children.map(renderCanvasImageExportItem).join('')
  }

  if (item.type === 'image') {
    return renderCanvasImageItem(item)
  }

  if (item.type === 'rect') {
    return [
      `<rect x="${formatNumber(item.x)}" y="${formatNumber(item.y)}" width="${formatNumber(item.w)}" height="${formatNumber(item.h)}" rx="4" fill="${escapeXmlAttribute(item.fill)}" stroke="${escapeXmlAttribute(item.stroke)}" stroke-width="1.25" />`,
      item.text
        ? renderCanvasSvgText({
            fontSize: 16,
            text: item.text,
            x: item.x + 8,
            y: item.y + 24,
          })
        : '',
    ].join('')
  }

  if (item.type === 'text') {
    return renderCanvasSvgText({
      fontSize: 16,
      text: item.text,
      x: item.x,
      y: item.y + 18,
    })
  }

  if (item.type === 'marker' || item.type === 'highlight') {
    return `<polyline points="${formatCanvasPoints(item.points)}" fill="none" stroke="${escapeXmlAttribute(item.stroke)}" stroke-width="${formatNumber(item.strokeWidth)}" stroke-linecap="round" stroke-linejoin="round" opacity="${formatNumber(item.opacity)}" />`
  }

  if (item.type === 'arrow') {
    return `<line x1="${formatNumber(item.start.x)}" y1="${formatNumber(item.start.y)}" x2="${formatNumber(item.end.x)}" y2="${formatNumber(item.end.y)}" stroke="${escapeXmlAttribute(item.stroke)}" stroke-width="${formatNumber(item.strokeWidth)}" stroke-linecap="round" />`
  }

  if (item.type === 'component') {
    return renderCanvasComponentExportItem(item)
  }

  return renderCanvasCustomExportItem(item)
}

function renderCanvasImageItem(item: CanvasImageItem) {
  return `<image data-canvas-id="${escapeXmlAttribute(item.id)}" href="${escapeXmlAttribute(item.src)}" x="${formatNumber(item.x)}" y="${formatNumber(item.y)}" width="${formatNumber(item.w)}" height="${formatNumber(item.h)}" preserveAspectRatio="xMidYMid meet" />`
}

function renderCanvasComponentExportItem(item: CanvasComponentItem) {
  const body = item.body ? `${item.title}\n${item.body}` : item.title

  return [
    `<rect x="${formatNumber(item.x)}" y="${formatNumber(item.y)}" width="${formatNumber(item.w)}" height="${formatNumber(item.h)}" rx="6" fill="${escapeXmlAttribute(item.fill)}" stroke="${escapeXmlAttribute(item.stroke)}" stroke-width="1.25" />`,
    renderCanvasSvgText({
      fontSize: 14,
      text: body,
      x: item.x + 14,
      y: item.y + 24,
    }),
  ].join('')
}

function renderCanvasCustomExportItem(item: CanvasCustomItem) {
  return [
    `<rect x="${formatNumber(item.x)}" y="${formatNumber(item.y)}" width="${formatNumber(item.w)}" height="${formatNumber(item.h)}" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.25" />`,
    renderCanvasSvgText({
      fontSize: 14,
      text: item.title,
      x: item.x + 14,
      y: item.y + 24,
    }),
  ].join('')
}

function renderCanvasSvgText({
  fontSize,
  text,
  x,
  y,
}: {
  fontSize: number
  text: string
  x: number
  y: number
}) {
  return text
    .split('\n')
    .slice(0, 8)
    .map((line, index) =>
      `<text x="${formatNumber(x)}" y="${formatNumber(
        y + index * fontSize * 1.35,
      )}" fill="#111827" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="600">${escapeXmlText(line)}</text>`,
    )
    .join('')
}

function formatCanvasPoints(points: readonly Point[]) {
  return points
    .map((point) => `${formatNumber(point.x)},${formatNumber(point.y)}`)
    .join(' ')
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2)
}

function escapeXmlText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeXmlAttribute(value: string) {
  return escapeXmlText(value)
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}
