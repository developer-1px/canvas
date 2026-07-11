export const FIGJAM_SHAPE_KINDS = [
  'rectangle',
  'ellipse',
  'diamond',
] as const

export const FIGJAM_SHAPE_COLORS = [
  'blue',
  'coral',
  'jade',
] as const

export const FIGJAM_SHAPE_STROKES = [
  'blue',
  'coral',
  'jade',
  'ink',
] as const

export type FigJamShapeKind = typeof FIGJAM_SHAPE_KINDS[number]
export type FigJamShapeColor = typeof FIGJAM_SHAPE_COLORS[number]
export type FigJamShapeStroke = typeof FIGJAM_SHAPE_STROKES[number]

export type FigJamShapeProps = {
  readonly position: 'absolute'
  readonly shape: FigJamShapeKind
  readonly fill: FigJamShapeColor
  readonly stroke: FigJamShapeStroke
}

export const FIGJAM_SHAPE_DEFAULT_PROPS = Object.freeze({
  position: 'absolute',
  shape: 'rectangle',
  fill: 'blue',
  stroke: 'blue',
} as const satisfies FigJamShapeProps)

export function parseFigJamShapeProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isShapeKind(value.shape) &&
    isShapeColor(value.fill) &&
    isShapeStroke(value.stroke)
  ) {
    return {
      ok: true as const,
      value: {
        position: value.position,
        shape: value.shape,
        fill: value.fill,
        stroke: value.stroke,
      } satisfies FigJamShapeProps,
    }
  }

  return {
    ok: false as const,
    reason: 'Shape props require absolute position, shape, fill, and stroke',
  }
}

function isShapeKind(value: unknown): value is FigJamShapeKind {
  return includes(FIGJAM_SHAPE_KINDS, value)
}

function isShapeColor(value: unknown): value is FigJamShapeColor {
  return includes(FIGJAM_SHAPE_COLORS, value)
}

function isShapeStroke(value: unknown): value is FigJamShapeStroke {
  return includes(FIGJAM_SHAPE_STROKES, value)
}

function includes(
  values: readonly string[],
  value: unknown,
): value is typeof values[number] {
  return typeof value === 'string' && values.includes(value)
}

function isJSONObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
