import type { Bounds } from './CanvasPrimitives'
import type { CanvasSceneEntry } from './CanvasSceneAdapter'
import type {
  CanvasAxisSnap,
  CanvasSpacingGuide,
} from './CanvasSnapGuides'
import {
  canvasSnapRangesOverlap,
  isCloserCanvasSnap,
  translateCanvasSnapBounds,
} from './CanvasSnapGeometry'

type SpacingSnap = {
  delta: number
  guide: CanvasSpacingGuide
}

export function getCanvasSpacingSnap({
  candidates,
  proposed,
  threshold,
}: {
  candidates: CanvasSceneEntry[]
  proposed: Bounds
  threshold: number
}): CanvasAxisSnap<CanvasSpacingGuide> {
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

      if (isCloserCanvasSnap(delta, best)) {
        const snapped = translateCanvasSnapBounds(proposed, delta, 0)
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

      if (isCloserCanvasSnap(delta, best)) {
        const snapped = translateCanvasSnapBounds(proposed, 0, delta)
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

function isHorizontallyRelated(a: Bounds, b: Bounds, c: Bounds) {
  return (
    canvasSnapRangesOverlap(a.x, a.x + a.w, b.x, b.x + b.w) ||
    canvasSnapRangesOverlap(a.x, a.x + a.w, c.x, c.x + c.w)
  )
}

function isVerticallyRelated(a: Bounds, b: Bounds, c: Bounds) {
  return (
    canvasSnapRangesOverlap(a.y, a.y + a.h, b.y, b.y + b.h) ||
    canvasSnapRangesOverlap(a.y, a.y + a.h, c.y, c.y + c.h)
  )
}
