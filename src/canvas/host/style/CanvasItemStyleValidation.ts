export function isCanvasItemOpacity(value: unknown): value is number {
  return isFinitePositiveNumber(value) && value <= 1
}

export function isCanvasItemStrokeWidth(value: unknown): value is number {
  return isFinitePositiveNumber(value)
}

export function isCanvasItemFontSize(value: unknown): value is number {
  return isFinitePositiveNumber(value)
}

export function isCanvasItemTextAlign(
  value: unknown,
): value is 'center' | 'left' | 'right' {
  return value === 'center' || value === 'left' || value === 'right'
}

export function isOptionalCanvasItemOpacity(value: unknown) {
  return value === undefined || isCanvasItemOpacity(value)
}

export function isOptionalCanvasItemStrokeWidth(value: unknown) {
  return value === undefined || isCanvasItemStrokeWidth(value)
}

export function isOptionalCanvasItemFontSize(value: unknown) {
  return value === undefined || isCanvasItemFontSize(value)
}

export function isOptionalCanvasItemTextAlign(value: unknown) {
  return value === undefined || isCanvasItemTextAlign(value)
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
