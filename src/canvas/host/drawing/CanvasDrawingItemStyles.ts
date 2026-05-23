export type CanvasDrawingStrokeKind = 'highlight' | 'marker'

export type CanvasDrawingStrokeStyle = Readonly<{
  opacity: number
  stroke: string
  strokeWidth: number
}>

export type CanvasArrowStyle = Readonly<{
  stroke: string
  strokeWidth: number
}>

export const CANVAS_MARKER_STYLE = Object.freeze({
  opacity: 1,
  stroke: '#475569',
  strokeWidth: 4,
}) satisfies CanvasDrawingStrokeStyle

export const CANVAS_HIGHLIGHT_STYLE = Object.freeze({
  opacity: 0.42,
  stroke: '#fde047',
  strokeWidth: 18,
}) satisfies CanvasDrawingStrokeStyle

export const CANVAS_ARROW_STYLE = Object.freeze({
  stroke: '#334155',
  strokeWidth: 3,
}) satisfies CanvasArrowStyle

export function getCanvasDrawingStrokeStyle(
  kind: CanvasDrawingStrokeKind,
): CanvasDrawingStrokeStyle {
  return kind === 'marker' ? CANVAS_MARKER_STYLE : CANVAS_HIGHLIGHT_STYLE
}

export function getCanvasArrowStyle(): CanvasArrowStyle {
  return CANVAS_ARROW_STYLE
}
