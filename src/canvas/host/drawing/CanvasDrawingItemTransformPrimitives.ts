import type {
  Bounds,
  Point,
} from '../../core'
import type {
  PathItem,
} from '../model'

export function translatePoint(point: Point, dx: number, dy: number): Point {
  return {
    x: point.x + dx,
    y: point.y + dy,
  }
}

export function translateCanvasPathSegment(
  segment: PathItem['segments'][number],
  dx: number,
  dy: number,
): PathItem['segments'][number] {
  if (segment.type === 'cubic') {
    return {
      ...segment,
      control1: translatePoint(segment.control1, dx, dy),
      control2: translatePoint(segment.control2, dx, dy),
      point: translatePoint(segment.point, dx, dy),
    }
  }

  return {
    ...segment,
    point: translatePoint(segment.point, dx, dy),
  }
}

export function scalePoint(point: Point, from: Bounds, to: Bounds): Point {
  const scaleX = to.w / from.w
  const scaleY = to.h / from.h

  return {
    x: from.w === 0
      ? to.x + to.w / 2
      : to.x + (point.x - from.x) * scaleX,
    y: from.h === 0
      ? to.y + to.h / 2
      : to.y + (point.y - from.y) * scaleY,
  }
}

export function scaleCanvasPathSegment(
  segment: PathItem['segments'][number],
  from: Bounds,
  to: Bounds,
): PathItem['segments'][number] {
  if (segment.type === 'cubic') {
    return {
      ...segment,
      control1: scalePoint(segment.control1, from, to),
      control2: scalePoint(segment.control2, from, to),
      point: scalePoint(segment.point, from, to),
    }
  }

  return {
    ...segment,
    point: scalePoint(segment.point, from, to),
  }
}

export function scalePointsToBounds({
  from,
  points,
  to,
}: {
  from: Bounds
  points: Point[]
  to: Bounds
}) {
  return points.map((point) => scalePoint(point, from, to))
}

export function getCanvasPathSegmentPoints(
  segments: readonly PathItem['segments'][number][],
) {
  return segments.flatMap((segment) =>
    segment.type === 'cubic'
      ? [segment.control1, segment.control2, segment.point]
      : [segment.point],
  )
}
