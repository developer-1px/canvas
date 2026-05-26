import type {
  Bounds,
  CanvasCommentItem,
  CanvasComponentItem,
  CanvasCustomItem,
  CanvasImageItem,
  CanvasItem,
  CanvasStampItem,
  Point,
} from '../../../entities'

export type CanvasImageExportPayload = {
  filename: string
  height: number
  svg: string
  width: number
}

const EXPORT_PADDING = 24
const EXPORT_BACKGROUND = '#ffffff'

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

function renderCanvasImageExportItem(item: CanvasItem): string {
  if (item.type === 'group') {
    return item.children.map(renderCanvasImageExportItem).join('')
  }

  if (item.type === 'image') {
    return renderCanvasImageItem(item)
  }

  if (item.type === 'comment') {
    return renderCanvasCommentExportItem(item)
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

  if (item.type === 'stamp') {
    return renderCanvasStampExportItem(item)
  }

  return renderCanvasCustomExportItem(item)
}

function renderCanvasImageItem(item: CanvasImageItem) {
  return `<image data-canvas-id="${escapeXmlAttribute(item.id)}" href="${escapeXmlAttribute(item.src)}" x="${formatNumber(item.x)}" y="${formatNumber(item.y)}" width="${formatNumber(item.w)}" height="${formatNumber(item.h)}" preserveAspectRatio="xMidYMid meet" />`
}

function renderCanvasCommentExportItem(item: CanvasCommentItem) {
  const radius = Math.min(10, item.w / 3)
  const tailStartX = item.x + item.w * 0.38
  const tailStartY = item.y + item.h
  const tailEndX = item.x + item.w * 0.22
  const tailEndY = item.y + item.h + 7

  return [
    `<rect x="${formatNumber(item.x)}" y="${formatNumber(item.y)}" width="${formatNumber(item.w)}" height="${formatNumber(item.h)}" rx="${formatNumber(radius)}" fill="#ffffff" stroke="#2563eb" stroke-width="1.4" />`,
    `<path d="M ${formatNumber(tailStartX)} ${formatNumber(tailStartY)} L ${formatNumber(tailEndX)} ${formatNumber(tailEndY)} L ${formatNumber(tailStartX + 7)} ${formatNumber(tailStartY)} Z" fill="#ffffff" stroke="#2563eb" stroke-width="1.4" />`,
    `<path d="M ${formatNumber(item.x + 10)} ${formatNumber(item.y + 13)} H ${formatNumber(item.x + item.w - 10)} M ${formatNumber(item.x + 10)} ${formatNumber(item.y + 21)} H ${formatNumber(item.x + item.w - 14)}" fill="none" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round" />`,
  ].join('')
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

function renderCanvasStampExportItem(item: CanvasStampItem) {
  const radius = Math.min(item.w, item.h) / 2

  return [
    `<rect x="${formatNumber(item.x)}" y="${formatNumber(item.y)}" width="${formatNumber(item.w)}" height="${formatNumber(item.h)}" rx="${formatNumber(radius)}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.25" />`,
    `<text x="${formatNumber(item.x + item.w / 2)}" y="${formatNumber(item.y + item.h / 2)}" fill="#111827" font-family="Arial, sans-serif" font-size="18" font-weight="700" text-anchor="middle" dominant-baseline="central">${escapeXmlText(item.label)}</text>`,
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
