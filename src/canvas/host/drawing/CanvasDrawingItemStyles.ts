export type CanvasDrawingStrokeKind = 'highlight' | 'marker' | 'path'

export type CanvasDrawingStrokeStyle = Readonly<{
  opacity: number
  stroke: string
  strokeWidth: number
}>

export type CanvasDrawingStrokeStyleSet = Readonly<
  Record<CanvasDrawingStrokeKind, CanvasDrawingStrokeStyle>
>

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

export const CANVAS_PATH_STYLE = Object.freeze({
  opacity: 1,
  stroke: '#334155',
  strokeWidth: 3,
}) satisfies CanvasDrawingStrokeStyle

export const CANVAS_DRAWING_STROKE_STYLE_DEFAULTS = Object.freeze({
  highlight: CANVAS_HIGHLIGHT_STYLE,
  marker: CANVAS_MARKER_STYLE,
  path: CANVAS_PATH_STYLE,
}) satisfies CanvasDrawingStrokeStyleSet

export function getCanvasDrawingStrokeStyle(
  kind: CanvasDrawingStrokeKind,
): CanvasDrawingStrokeStyle {
  return CANVAS_DRAWING_STROKE_STYLE_DEFAULTS[kind]
}

export function createCanvasDrawingStrokeStyleSet(
  overrides: Partial<Record<
    CanvasDrawingStrokeKind,
    Partial<CanvasDrawingStrokeStyle>
  >> = {},
): CanvasDrawingStrokeStyleSet {
  return Object.freeze({
    highlight: freezeCanvasDrawingStrokeStyle({
      ...CANVAS_HIGHLIGHT_STYLE,
      ...overrides.highlight,
    }),
    marker: freezeCanvasDrawingStrokeStyle({
      ...CANVAS_MARKER_STYLE,
      ...overrides.marker,
    }),
    path: freezeCanvasDrawingStrokeStyle({
      ...CANVAS_PATH_STYLE,
      ...overrides.path,
    }),
  })
}

export function getCanvasArrowStyle(): CanvasArrowStyle {
  return CANVAS_ARROW_STYLE
}

function freezeCanvasDrawingStrokeStyle(
  style: CanvasDrawingStrokeStyle,
): CanvasDrawingStrokeStyle {
  return Object.freeze({ ...style })
}
