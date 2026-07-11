/* eslint-disable react-refresh/only-export-components */
import {
  defineReactDesignWidget,
  type ReactDesignWidgetFallbackProps,
  type ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  includes,
  isFiniteNumber,
  isJSONObject,
  isNonEmptyString,
  isPoint,
  isPositiveFiniteNumber,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamPoint,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export const FIGJAM_DRAWING_DEFINITION_ID = 'figjam.drawing'
export const FIGJAM_DRAWING_VARIANTS = [
  'marker',
  'highlight',
  'path',
] as const

export type FigJamDrawingVariant = typeof FIGJAM_DRAWING_VARIANTS[number]

export type FigJamDrawingPathSegment =
  | { readonly type: 'move' | 'line'; readonly point: FigJamPoint }
  | {
      readonly type: 'cubic'
      readonly control1: FigJamPoint
      readonly control2: FigJamPoint
      readonly point: FigJamPoint
    }

export type FigJamDrawingGeometry =
  | {
      readonly kind: 'points'
      readonly points: readonly FigJamPoint[]
    }
  | {
      readonly kind: 'path'
      readonly segments: readonly FigJamDrawingPathSegment[]
    }

export type FigJamDrawingProps = {
  readonly fill: string | null
  readonly geometry: FigJamDrawingGeometry
  readonly opacity: number
  readonly position: 'absolute'
  readonly stroke: string
  readonly strokeWidth: number
  readonly variant: FigJamDrawingVariant
}

export type CreateFigJamDrawingNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly fill?: string | null
    readonly geometry: FigJamDrawingGeometry
    readonly opacity?: number
    readonly stroke?: string
    readonly strokeWidth?: number
    readonly variant: FigJamDrawingVariant
  }

export const FIGJAM_DRAWING_DEFAULT_PROPS = Object.freeze({
  fill: null,
  geometry: Object.freeze({
    kind: 'points',
    points: Object.freeze([{ x: 0, y: 0 }, { x: 80, y: 24 }]),
  }),
  opacity: 1,
  position: 'absolute',
  stroke: '#475569',
  strokeWidth: 5,
  variant: 'marker',
} as const satisfies FigJamDrawingProps)

export const FIGJAM_DRAWING_DEFINITION =
  defineReactDesignWidget<FigJamDrawingProps>({
    id: FIGJAM_DRAWING_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_DRAWING_DEFAULT_PROPS,
      safeParse: parseFigJamDrawingProps,
    },
    create: ({ nodeId, x, y }) => createFigJamDrawingNode({
      geometry: FIGJAM_DRAWING_DEFAULT_PROPS.geometry,
      nodeId,
      variant: 'marker',
      x,
      y,
    }),
    capabilities: {
      textEdit: false,
      transform: { move: true, resize: true },
    },
    renderer: FigJamDrawing,
    fallback: FigJamDrawingFallback,
  })

export function createFigJamDrawingNode({
  fill,
  geometry,
  height,
  nodeId,
  opacity,
  stroke,
  strokeWidth,
  variant,
  width,
  x,
  y,
}: CreateFigJamDrawingNodeInput) {
  const style = getDrawingStyle(variant)
  const parsed = parseFigJamDrawingProps({
    fill: fill === undefined ? style.fill : fill,
    geometry,
    opacity: opacity ?? style.opacity,
    position: 'absolute',
    stroke: stroke ?? style.stroke,
    strokeWidth: strokeWidth ?? style.strokeWidth,
    variant,
  })

  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  const geometrySize = getDrawingGeometrySize(parsed.value.geometry)

  return createFigJamAbsoluteWidgetNode({
    definitionId: FIGJAM_DRAWING_DEFINITION_ID,
    height: height ?? Math.max(geometrySize.height, parsed.value.strokeWidth),
    label: `${toLabel(variant)} drawing`,
    nodeId,
    props: cloneDesignProps(parsed.value),
    text: null,
    width: width ?? Math.max(geometrySize.width, parsed.value.strokeWidth),
    x,
    y,
  })
}

export function parseFigJamDrawingProps(value: unknown) {
  if (
    !isJSONObject(value) ||
    value.position !== 'absolute' ||
    !includes(FIGJAM_DRAWING_VARIANTS, value.variant) ||
    !isNonEmptyString(value.stroke) ||
    !isPositiveFiniteNumber(value.strokeWidth) ||
    !isFiniteNumber(value.opacity) ||
    value.opacity < 0 ||
    value.opacity > 1 ||
    !(value.fill === null || typeof value.fill === 'string')
  ) {
    return invalidDrawingProps()
  }

  const geometry = parseDrawingGeometry(value.geometry)

  if (!geometry) {
    return invalidDrawingProps()
  }

  if (
    value.variant === 'path' && geometry.kind !== 'path' ||
    value.variant !== 'path' && geometry.kind !== 'points'
  ) {
    return invalidDrawingProps()
  }

  return {
    ok: true as const,
    value: {
      fill: value.fill,
      geometry,
      opacity: value.opacity,
      position: value.position,
      stroke: value.stroke,
      strokeWidth: value.strokeWidth,
      variant: value.variant,
    } satisfies FigJamDrawingProps,
  }
}

function FigJamDrawing({
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamDrawingProps>) {
  const geometrySize = getDrawingGeometrySize(props.geometry)
  const width = Math.max(geometrySize.width, props.strokeWidth)
  const height = Math.max(geometrySize.height, props.strokeWidth)

  return (
    <div
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-drawing')}
      data-drawing-variant={props.variant}
      data-figjam-widget="drawing"
    >
      <svg
        aria-hidden="true"
        className="figjam-drawing__geometry"
        preserveAspectRatio="none"
        viewBox={`0 0 ${width} ${height}`}
      >
        <DrawingGeometry props={props} />
      </svg>
    </div>
  )
}

function DrawingGeometry({ props }: { readonly props: FigJamDrawingProps }) {
  const shared = {
    fill: props.fill ?? 'none',
    opacity: props.opacity,
    stroke: props.stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: props.strokeWidth,
    vectorEffect: 'non-scaling-stroke' as const,
  }

  if (props.geometry.kind === 'path') {
    return <path {...shared} d={toDrawingPath(props.geometry.segments)} />
  }

  return (
    <polyline
      {...shared}
      points={props.geometry.points.map(({ x, y }) => `${x},${y}`).join(' ')}
    />
  )
}

function FigJamDrawingFallback({
  reason,
  rootProps,
}: ReactDesignWidgetFallbackProps<FigJamDrawingProps>) {
  return (
    <div
      {...rootProps}
      className={joinClassNames(
        rootProps.className,
        'figjam-drawing',
        'figjam-widget-fallback',
      )}
      data-figjam-widget="drawing"
      data-figjam-widget-error={reason}
    >
      Drawing unavailable
    </div>
  )
}

function parseDrawingGeometry(value: unknown): FigJamDrawingGeometry | null {
  if (!isJSONObject(value)) {
    return null
  }

  if (
    value.kind === 'points' &&
    Array.isArray(value.points) &&
    value.points.length >= 2 &&
    value.points.every(isLocalPoint)
  ) {
    return {
      kind: 'points',
      points: value.points.map(({ x, y }) => ({ x, y })),
    }
  }

  if (
    value.kind === 'path' &&
    Array.isArray(value.segments) &&
    value.segments.length >= 2
  ) {
    const segments = value.segments.map(parsePathSegment)

    return segments.every((segment) => segment !== null) &&
        segments[0]?.type === 'move'
      ? {
          kind: 'path',
          segments: segments as FigJamDrawingPathSegment[],
        }
      : null
  }

  return null
}

function parsePathSegment(value: unknown): FigJamDrawingPathSegment | null {
  if (!isJSONObject(value) || !isLocalPoint(value.point)) {
    return null
  }

  if (value.type === 'move' || value.type === 'line') {
    return { type: value.type, point: { ...value.point } }
  }

  if (
    value.type === 'cubic' &&
    isLocalPoint(value.control1) &&
    isLocalPoint(value.control2)
  ) {
    return {
      type: value.type,
      control1: { ...value.control1 },
      control2: { ...value.control2 },
      point: { ...value.point },
    }
  }

  return null
}

function toDrawingPath(segments: readonly FigJamDrawingPathSegment[]) {
  return segments.map((segment) => {
    if (segment.type === 'cubic') {
      return `C${segment.control1.x} ${segment.control1.y} ` +
        `${segment.control2.x} ${segment.control2.y} ` +
        `${segment.point.x} ${segment.point.y}`
    }

    return `${segment.type === 'move' ? 'M' : 'L'}` +
      `${segment.point.x} ${segment.point.y}`
  }).join(' ')
}

function getDrawingGeometrySize(geometry: FigJamDrawingGeometry) {
  const points = geometry.kind === 'points'
    ? geometry.points
    : geometry.segments.flatMap((segment) => segment.type === 'cubic'
      ? [segment.control1, segment.control2, segment.point]
      : [segment.point])
  const xs = points.map(({ x }) => x)
  const ys = points.map(({ y }) => y)

  return {
    height: Math.max(...ys),
    width: Math.max(...xs),
  }
}

function getDrawingStyle(variant: FigJamDrawingVariant) {
  if (variant === 'highlight') {
    return {
      fill: null,
      opacity: 0.42,
      stroke: '#fde047',
      strokeWidth: 18,
    }
  }

  return {
    fill: variant === 'path' ? 'none' : null,
    opacity: 1,
    stroke: '#475569',
    strokeWidth: variant === 'path' ? 3 : 5,
  }
}

function invalidDrawingProps() {
  return {
    ok: false as const,
    reason: 'Drawing props require a matching local geometry and finite style',
  }
}

function isLocalPoint(value: unknown): value is FigJamPoint {
  return isPoint(value) && value.x >= 0 && value.y >= 0
}

function toLabel(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`
}
