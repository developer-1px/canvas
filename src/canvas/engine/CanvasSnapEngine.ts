import type { CanvasAffordanceConfig } from './CanvasAffordances'
import type { Bounds, Point, Viewport } from './CanvasPrimitives'
import type { CanvasSceneAdapter, CanvasSceneEntry } from './CanvasSceneAdapter'

export type CanvasAlignmentGuide = {
  end: number
  orientation: 'horizontal' | 'vertical'
  position: number
  start: number
}

export type CanvasSpacingGuide = {
  gap: number
  orientation: 'horizontal' | 'vertical'
  segments: Array<{
    end: Point
    start: Point
  }>
}

export type CanvasSnapGuides = {
  alignmentGuides: CanvasAlignmentGuide[]
  spacingGuides: CanvasSpacingGuide[]
}

export type CanvasMoveSnap = CanvasSnapGuides & {
  dx: number
  dy: number
}

const GRID_SIZE = 40
const SNAP_THRESHOLD = 8

export const EMPTY_CANVAS_SNAP_GUIDES: CanvasSnapGuides = {
  alignmentGuides: [],
  spacingGuides: [],
}

export function getCanvasMoveSnap({
  bounds,
  config,
  dx,
  dy,
  scene,
  selection,
  viewport,
}: {
  bounds: Bounds
  config: CanvasAffordanceConfig
  dx: number
  dy: number
  scene: CanvasSceneAdapter
  selection: string[]
  viewport: Viewport
}): CanvasMoveSnap {
  const threshold = getSnapThreshold(viewport)
  const candidates = getSnapCandidates(scene, selection)
  const proposed = translateBounds(bounds, dx, dy)
  const alignment = config.gestures.snapToAlignment
    ? getAlignmentSnap({
        candidates,
        proposed,
        threshold,
      })
    : createEmptyAxisSnap()
  const afterAlignment = translateBounds(proposed, alignment.dx, alignment.dy)
  const spacing = config.gestures.snapToSpacing
    ? getSpacingSnap({
        candidates,
        proposed: afterAlignment,
        threshold,
      })
    : createEmptyAxisSnap()
  const afterSpacing = translateBounds(
    afterAlignment,
    alignment.x ? 0 : spacing.dx,
    alignment.y ? 0 : spacing.dy,
  )
  const grid = getGridSnap({
    proposed: afterSpacing,
    threshold,
  })

  return {
    dx:
      dx +
      alignment.dx +
      (alignment.x ? 0 : spacing.dx) +
      (alignment.x || spacing.x || !config.gestures.snapToGrid ? 0 : grid.dx),
    dy:
      dy +
      alignment.dy +
      (alignment.y ? 0 : spacing.dy) +
      (alignment.y || spacing.y || !config.gestures.snapToGrid ? 0 : grid.dy),
    alignmentGuides: alignment.guides,
    spacingGuides: spacing.guides,
  }
}

export function snapCanvasPointToGrid({
  config,
  point,
}: {
  config: CanvasAffordanceConfig
  point: Point
}): Point {
  if (!config.gestures.snapToGrid) {
    return point
  }

  return {
    x: Math.round(point.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(point.y / GRID_SIZE) * GRID_SIZE,
  }
}

function getAlignmentSnap({
  candidates,
  proposed,
  threshold,
}: {
  candidates: CanvasSceneEntry[]
  proposed: Bounds
  threshold: number
}) {
  let xSnap: AxisSnap | null = null
  let ySnap: AxisSnap | null = null

  for (const candidate of candidates) {
    for (const source of getXAnchors(proposed)) {
      for (const target of getXAnchors(candidate.bounds)) {
        if (source.kind !== target.kind) {
          continue
        }

        const delta = target.value - source.value

        if (Math.abs(delta) <= threshold && isCloser(delta, xSnap)) {
          xSnap = {
            delta,
            guide: {
              orientation: 'vertical',
              position: target.value,
              start: Math.min(proposed.y, candidate.bounds.y),
              end: Math.max(
                proposed.y + proposed.h,
                candidate.bounds.y + candidate.bounds.h,
              ),
            },
          }
        }
      }
    }

    for (const source of getYAnchors(proposed)) {
      for (const target of getYAnchors(candidate.bounds)) {
        if (source.kind !== target.kind) {
          continue
        }

        const delta = target.value - source.value

        if (Math.abs(delta) <= threshold && isCloser(delta, ySnap)) {
          ySnap = {
            delta,
            guide: {
              orientation: 'horizontal',
              position: target.value,
              start: Math.min(proposed.x, candidate.bounds.x),
              end: Math.max(
                proposed.x + proposed.w,
                candidate.bounds.x + candidate.bounds.w,
              ),
            },
          }
        }
      }
    }
  }

  return {
    dx: xSnap?.delta ?? 0,
    dy: ySnap?.delta ?? 0,
    guides: [xSnap?.guide, ySnap?.guide].filter(
      (guide): guide is CanvasAlignmentGuide => Boolean(guide),
    ),
    x: Boolean(xSnap),
    y: Boolean(ySnap),
  }
}

function getSpacingSnap({
  candidates,
  proposed,
  threshold,
}: {
  candidates: CanvasSceneEntry[]
  proposed: Bounds
  threshold: number
}) {
  const horizontal = getHorizontalSpacingSnap({ candidates, proposed, threshold })
  const vertical = getVerticalSpacingSnap({ candidates, proposed, threshold })

  return {
    dx: horizontal?.delta ?? 0,
    dy: vertical?.delta ?? 0,
    guides: [horizontal?.guide, vertical?.guide].filter(
      (guide): guide is CanvasSpacingGuide => Boolean(guide),
    ),
    x: Boolean(horizontal),
    y: Boolean(vertical),
  }
}

function getHorizontalSpacingSnap({
  candidates,
  proposed,
  threshold,
}: {
  candidates: CanvasSceneEntry[]
  proposed: Bounds
  threshold: number
}) {
  let best: SpacingSnap | null = null

  for (const left of candidates) {
    const leftRight = left.bounds.x + left.bounds.w

    if (leftRight > proposed.x) {
      continue
    }

    for (const right of candidates) {
      if (right.bounds.x < proposed.x + proposed.w) {
        continue
      }

      const leftGap = proposed.x - leftRight
      const rightGap = right.bounds.x - (proposed.x + proposed.w)
      const diff = rightGap - leftGap
      const delta = diff / 2

      if (
        Math.abs(delta) > threshold ||
        !isVerticallyRelated(proposed, left.bounds, right.bounds)
      ) {
        continue
      }

      if (isCloser(delta, best)) {
        const snapped = translateBounds(proposed, delta, 0)
        const y = snapped.y + snapped.h / 2
        const gap = Math.round((leftGap + rightGap) / 2)

        best = {
          delta,
          guide: {
            gap,
            orientation: 'horizontal',
            segments: [
              {
                start: { x: leftRight, y },
                end: { x: snapped.x, y },
              },
              {
                start: { x: snapped.x + snapped.w, y },
                end: { x: right.bounds.x, y },
              },
            ],
          },
        }
      }
    }
  }

  return best
}

function getVerticalSpacingSnap({
  candidates,
  proposed,
  threshold,
}: {
  candidates: CanvasSceneEntry[]
  proposed: Bounds
  threshold: number
}) {
  let best: SpacingSnap | null = null

  for (const top of candidates) {
    const topBottom = top.bounds.y + top.bounds.h

    if (topBottom > proposed.y) {
      continue
    }

    for (const bottom of candidates) {
      if (bottom.bounds.y < proposed.y + proposed.h) {
        continue
      }

      const topGap = proposed.y - topBottom
      const bottomGap = bottom.bounds.y - (proposed.y + proposed.h)
      const diff = bottomGap - topGap
      const delta = diff / 2

      if (
        Math.abs(delta) > threshold ||
        !isHorizontallyRelated(proposed, top.bounds, bottom.bounds)
      ) {
        continue
      }

      if (isCloser(delta, best)) {
        const snapped = translateBounds(proposed, 0, delta)
        const x = snapped.x + snapped.w / 2
        const gap = Math.round((topGap + bottomGap) / 2)

        best = {
          delta,
          guide: {
            gap,
            orientation: 'vertical',
            segments: [
              {
                start: { x, y: topBottom },
                end: { x, y: snapped.y },
              },
              {
                start: { x, y: snapped.y + snapped.h },
                end: { x, y: bottom.bounds.y },
              },
            ],
          },
        }
      }
    }
  }

  return best
}

function getGridSnap({
  proposed,
  threshold,
}: {
  proposed: Bounds
  threshold: number
}) {
  const dx = Math.round(proposed.x / GRID_SIZE) * GRID_SIZE - proposed.x
  const dy = Math.round(proposed.y / GRID_SIZE) * GRID_SIZE - proposed.y

  return {
    dx: Math.abs(dx) <= threshold ? dx : 0,
    dy: Math.abs(dy) <= threshold ? dy : 0,
  }
}

function getSnapCandidates(scene: CanvasSceneAdapter, selection: string[]) {
  return scene.entries.filter(
    (entry) => !scene.getSelectedAncestorId(entry.id, selection),
  )
}

function getSnapThreshold(viewport: Viewport) {
  return SNAP_THRESHOLD / viewport.scale
}

function getXAnchors(bounds: Bounds) {
  return [
    { kind: 'start', value: bounds.x },
    { kind: 'center', value: bounds.x + bounds.w / 2 },
    { kind: 'end', value: bounds.x + bounds.w },
  ]
}

function getYAnchors(bounds: Bounds) {
  return [
    { kind: 'start', value: bounds.y },
    { kind: 'center', value: bounds.y + bounds.h / 2 },
    { kind: 'end', value: bounds.y + bounds.h },
  ]
}

function isCloser(delta: number, snap: { delta: number } | null) {
  return !snap || Math.abs(delta) < Math.abs(snap.delta)
}

function isHorizontallyRelated(a: Bounds, b: Bounds, c: Bounds) {
  return (
    rangesOverlap(a.x, a.x + a.w, b.x, b.x + b.w) ||
    rangesOverlap(a.x, a.x + a.w, c.x, c.x + c.w)
  )
}

function isVerticallyRelated(a: Bounds, b: Bounds, c: Bounds) {
  return (
    rangesOverlap(a.y, a.y + a.h, b.y, b.y + b.h) ||
    rangesOverlap(a.y, a.y + a.h, c.y, c.y + c.h)
  )
}

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart <= bEnd && aEnd >= bStart
}

function createEmptyAxisSnap() {
  return {
    dx: 0,
    dy: 0,
    guides: [],
    x: false,
    y: false,
  }
}

function translateBounds(bounds: Bounds, dx: number, dy: number): Bounds {
  return {
    ...bounds,
    x: bounds.x + dx,
    y: bounds.y + dy,
  }
}

type AxisSnap = {
  delta: number
  guide: CanvasAlignmentGuide
}

type SpacingSnap = {
  delta: number
  guide: CanvasSpacingGuide
}
