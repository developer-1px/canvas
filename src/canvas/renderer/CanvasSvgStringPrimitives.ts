export type CanvasSvgNumberFormatOptions = {
  maximumFractionDigits?: number
}

const DEFAULT_MAXIMUM_FRACTION_DIGITS = 3

export function formatCanvasSvgNumber(
  value: number,
  options: CanvasSvgNumberFormatOptions = {},
) {
  const maximumFractionDigits = normalizeCanvasSvgMaximumFractionDigits(
    options.maximumFractionDigits,
  )
  const safeValue = Number.isFinite(value) ? value : 0

  return `${Number(safeValue.toFixed(maximumFractionDigits))}`
}

export function escapeCanvasXmlText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export function escapeCanvasXmlAttribute(value: string) {
  return escapeCanvasXmlText(value)
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function normalizeCanvasSvgMaximumFractionDigits(value: number | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_MAXIMUM_FRACTION_DIGITS
  }

  return Math.min(20, Math.max(0, Math.trunc(value)))
}
