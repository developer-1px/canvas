import type { Bounds } from '../../core'
import type {
  CanvasShapeKind,
} from '../model'
import { getCanvasShapeKind } from './CanvasShapeItem'

export type CanvasSvgShapeGeometry =
  | Readonly<{
      kind: 'ellipse'
      cx: number
      cy: number
      rx: number
      ry: number
    }>
  | Readonly<{
      kind: 'path'
      d: string
    }>
  | Readonly<{
      kind: 'rect'
      height: number
      rx: number
      width: number
      x: number
      y: number
    }>

type CanvasShapeGeometryDescriptor = Readonly<{
  getSvgGeometry: (bounds: Bounds) => CanvasSvgShapeGeometry
}>

const CANVAS_SHAPE_GEOMETRY_DESCRIPTORS = Object.freeze({
  diamond: Object.freeze({
    getSvgGeometry: getCanvasDiamondSvgShapeGeometry,
  }),
  ellipse: Object.freeze({
    getSvgGeometry: getCanvasEllipseSvgShapeGeometry,
  }),
  rect: Object.freeze({
    getSvgGeometry: getCanvasRectSvgShapeGeometry,
  }),
} satisfies Readonly<Record<CanvasShapeKind, CanvasShapeGeometryDescriptor>>)

export function getCanvasItemSvgShapeGeometry(
  item: {
    h: number
    shape?: CanvasShapeKind
    shapeType?: CanvasShapeKind
    w: number
    x: number
    y: number
  },
) {
  return getCanvasSvgShapeGeometry({
    bounds: item,
    shapeType: getCanvasShapeKind(item),
  })
}

export function getCanvasSvgShapeGeometry({
  bounds,
  shape,
  shapeType,
}: {
  bounds: Bounds
  shape?: CanvasShapeKind
  shapeType?: CanvasShapeKind
}) {
  return CANVAS_SHAPE_GEOMETRY_DESCRIPTORS[
    shapeType ?? shape ?? 'rect'
  ].getSvgGeometry(bounds)
}

function getCanvasDiamondSvgShapeGeometry({
  h,
  w,
  x,
  y,
}: Bounds): CanvasSvgShapeGeometry {
  const centerX = x + w / 2
  const centerY = y + h / 2

  return {
    kind: 'path',
    d: [
      `M ${centerX} ${y}`,
      `L ${x + w} ${centerY}`,
      `L ${centerX} ${y + h}`,
      `L ${x} ${centerY}`,
      'Z',
    ].join(' '),
  }
}

function getCanvasEllipseSvgShapeGeometry({
  h,
  w,
  x,
  y,
}: Bounds): CanvasSvgShapeGeometry {
  return {
    kind: 'ellipse',
    cx: x + w / 2,
    cy: y + h / 2,
    rx: w / 2,
    ry: h / 2,
  }
}

function getCanvasRectSvgShapeGeometry({
  h,
  w,
  x,
  y,
}: Bounds): CanvasSvgShapeGeometry {
  return {
    kind: 'rect',
    height: h,
    rx: 6,
    width: w,
    x,
    y,
  }
}
