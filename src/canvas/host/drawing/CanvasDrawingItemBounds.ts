import {
  getCanvasPointBounds,
  normalizeBounds,
  type Bounds,
} from '../../core'
import type {
  ArrowItem,
} from '../model'
import {
  getCanvasArrowLabelBounds,
} from './CanvasArrowLabelGeometry'
import type {
  CanvasPathDrawingItem,
  CanvasStrokeDrawingItem,
} from './CanvasDrawingItemGeometry'
import {
  getCanvasPathSegmentPoints,
} from './CanvasDrawingItemTransformPrimitives'

const CANVAS_ARROW_BOUNDS_PAD = 12

export function getCanvasStrokeDrawingItemBounds(
  item: CanvasStrokeDrawingItem,
) {
  return padBounds(getCanvasPointBounds(item.points), item.strokeWidth / 2)
}

export function getCanvasPathDrawingItemBounds(
  item: CanvasPathDrawingItem,
) {
  return padBounds(
    getCanvasPointBounds(getCanvasPathSegmentPoints(item.segments)),
    item.strokeWidth / 2,
  )
}

export function getCanvasArrowDrawingItemBounds(item: ArrowItem) {
  const arrowBounds = padBounds(
    normalizeBounds(item.start, item.end),
    CANVAS_ARROW_BOUNDS_PAD,
  )

  return item.text?.trim()
    ? unionBounds(arrowBounds, getCanvasArrowLabelBounds(item))
    : arrowBounds
}

function padBounds(bounds: Bounds, pad: number): Bounds {
  return {
    x: bounds.x - pad,
    y: bounds.y - pad,
    w: Math.max(bounds.w + pad * 2, pad * 2),
    h: Math.max(bounds.h + pad * 2, pad * 2),
  }
}

function unionBounds(left: Bounds, right: Bounds): Bounds {
  const minX = Math.min(left.x, right.x)
  const minY = Math.min(left.y, right.y)
  const maxX = Math.max(left.x + left.w, right.x + right.w)
  const maxY = Math.max(left.y + left.h, right.y + right.h)

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}
