import type {
  Bounds,
  Point,
} from '../core'

export type CanvasRectLike = {
  h: number
  w: number
  x: number
  y: number
}

export type CanvasScreenRectLike = {
  height: number
  left: number
  top: number
  width: number
}

export type CanvasEdgeDistance = {
  axis: 'x' | 'y'
  from: Point
  length: number
}

export function normalizeCanvasRect(rect: CanvasRectLike): Bounds {
  return {
    h: Math.max(1, rect.h),
    w: Math.max(1, rect.w),
    x: rect.x,
    y: rect.y,
  }
}

export function unionCanvasRects(
  left: CanvasRectLike,
  right: CanvasRectLike,
): Bounds {
  const x = Math.min(left.x, right.x)
  const y = Math.min(left.y, right.y)
  const rightEdge = Math.max(left.x + left.w, right.x + right.w)
  const bottomEdge = Math.max(left.y + left.h, right.y + right.h)

  return {
    h: bottomEdge - y,
    w: rightEdge - x,
    x,
    y,
  }
}

export function unionCanvasRectList(
  rects: readonly CanvasRectLike[],
): Bounds | null {
  return rects.reduce<Bounds | null>((bounds, rect) =>
    bounds ? unionCanvasRects(bounds, rect) : normalizeCanvasRect(rect)
  , null)
}

export function padCanvasRect(
  rect: CanvasRectLike,
  padding: number,
): Bounds {
  return {
    h: rect.h + padding * 2,
    w: rect.w + padding * 2,
    x: rect.x - padding,
    y: rect.y - padding,
  }
}

export function getCanvasLocalRect({
  origin,
  rect,
}: {
  origin: CanvasScreenRectLike
  rect: CanvasScreenRectLike
}): Bounds {
  return {
    h: rect.height,
    w: rect.width,
    x: rect.left - origin.left,
    y: rect.top - origin.top,
  }
}

export function getCanvasRectEdgeDistances(
  selected: CanvasRectLike,
  target: CanvasRectLike,
): readonly CanvasEdgeDistance[] {
  const lines: CanvasEdgeDistance[] = []
  const selectedCenterX = selected.x + selected.w / 2
  const selectedCenterY = selected.y + selected.h / 2
  const targetCenterX = target.x + target.w / 2
  const targetCenterY = target.y + target.h / 2

  if (target.x >= selected.x + selected.w) {
    lines.push({
      axis: 'x',
      from: { x: selected.x + selected.w, y: targetCenterY },
      length: target.x - (selected.x + selected.w),
    })
  } else if (selected.x >= target.x + target.w) {
    lines.push({
      axis: 'x',
      from: { x: target.x + target.w, y: targetCenterY },
      length: selected.x - (target.x + target.w),
    })
  }

  if (target.y >= selected.y + selected.h) {
    lines.push({
      axis: 'y',
      from: { x: targetCenterX, y: selected.y + selected.h },
      length: target.y - (selected.y + selected.h),
    })
  } else if (selected.y >= target.y + target.h) {
    lines.push({
      axis: 'y',
      from: { x: targetCenterX, y: target.y + target.h },
      length: selected.y - (target.y + target.h),
    })
  }

  if (lines.length > 0) {
    return lines
  }

  const centerLines: CanvasEdgeDistance[] = [{
    axis: 'x',
    from: {
      x: Math.min(selectedCenterX, targetCenterX),
      y: targetCenterY,
    },
    length: Math.abs(targetCenterX - selectedCenterX),
  }, {
    axis: 'y',
    from: {
      x: targetCenterX,
      y: Math.min(selectedCenterY, targetCenterY),
    },
    length: Math.abs(targetCenterY - selectedCenterY),
  }]

  return centerLines.filter((line) => line.length > 0)
}
