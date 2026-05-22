import type { Bounds } from '../CanvasPrimitives'
import type { CanvasSceneEntry } from '../CanvasSceneAdapter'
import type {
  CanvasAlignmentGuide,
  CanvasAxisSnap,
} from './CanvasSnapGuides'
import { isCloserCanvasSnap } from './CanvasSnapGeometry'

type AlignmentSnap = {
  delta: number
  guide: CanvasAlignmentGuide
}

export function getCanvasAlignmentSnap({
  candidates,
  proposed,
  threshold,
}: {
  candidates: CanvasSceneEntry[]
  proposed: Bounds
  threshold: number
}): CanvasAxisSnap<CanvasAlignmentGuide> {
  let xSnap: AlignmentSnap | null = null
  let ySnap: AlignmentSnap | null = null

  for (const candidate of candidates) {
    for (const source of getXAnchors(proposed)) {
      for (const target of getXAnchors(candidate.bounds)) {
        if (source.kind !== target.kind) {
          continue
        }

        const delta = target.value - source.value

        if (Math.abs(delta) <= threshold && isCloserCanvasSnap(delta, xSnap)) {
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

        if (Math.abs(delta) <= threshold && isCloserCanvasSnap(delta, ySnap)) {
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
