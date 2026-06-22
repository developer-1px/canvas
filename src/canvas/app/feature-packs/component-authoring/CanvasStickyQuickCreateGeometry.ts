import type {
  CanvasItem,
  CanvasSide,
  Point,
} from '../../../entities'
import {
  CANVAS_SECTION_COMPONENT_KIND,
} from '../../../host'
import type { CanvasAppItemReadModel } from '../../workflow/CanvasAppItemReadModelContracts'

const CANVAS_STICKY_QUICK_CREATE_GAP = 24
const CANVAS_STICKY_QUICK_CREATE_MAX_SLOT_ATTEMPTS = 12
const CANVAS_STICKY_QUICK_CREATE_CROSS_OFFSETS = [
  0,
  1,
  -1,
  2,
  -2,
  3,
  -3,
] as const

export const CANVAS_STICKY_QUICK_CREATE_DIRECTIONS = [
  'right',
  'bottom',
  'left',
  'top',
] as const satisfies readonly CanvasSide[]

export function getCanvasStickyQuickCreateControlWorldPoint({
  bounds,
  direction,
}: {
  bounds: { h: number; w: number; x: number; y: number }
  direction: CanvasSide
}): Point {
  const centerX = bounds.x + bounds.w / 2
  const centerY = bounds.y + bounds.h / 2
  const gap = CANVAS_STICKY_QUICK_CREATE_GAP / 2

  if (direction === 'left') {
    return { x: bounds.x - gap, y: centerY }
  }

  if (direction === 'right') {
    return { x: bounds.x + bounds.w + gap, y: centerY }
  }

  if (direction === 'top') {
    return { x: centerX, y: bounds.y - gap }
  }

  return { x: centerX, y: bounds.y + bounds.h + gap }
}

export function getCanvasStickyQuickCreateAvailableTargetPoint({
  direction,
  itemReadModel,
  sourceBounds,
  sourceId,
  targetSize,
}: {
  direction: CanvasSide
  itemReadModel: CanvasAppItemReadModel
  sourceBounds: { h: number; w: number; x: number; y: number }
  sourceId: string
  targetSize: { h: number; w: number }
}): Point {
  const blockers = getCanvasStickyQuickCreateBlockerBounds({
    itemReadModel,
    sourceId,
  })
  const candidates = getCanvasStickyQuickCreateCandidatePoints({
    direction,
    sourceBounds,
    targetSize,
  })
  let fallback = candidates[0]

  for (const candidate of candidates) {
    if (!doesCanvasStickyQuickCreateTargetOverlap({
      blockers,
      targetBounds: {
        ...candidate,
        ...targetSize,
      },
    })) {
      return candidate
    }

    fallback = candidate
  }

  return fallback
}

export function getCanvasStickyQuickCreateSourceAnchor({
  direction,
  sourceBounds,
}: {
  direction: CanvasSide
  sourceBounds: { h: number; w: number; x: number; y: number }
}): Point {
  const centerX = sourceBounds.x + sourceBounds.w / 2
  const centerY = sourceBounds.y + sourceBounds.h / 2

  if (direction === 'left') {
    return { x: sourceBounds.x, y: centerY }
  }

  if (direction === 'right') {
    return { x: sourceBounds.x + sourceBounds.w, y: centerY }
  }

  if (direction === 'top') {
    return { x: centerX, y: sourceBounds.y }
  }

  return { x: centerX, y: sourceBounds.y + sourceBounds.h }
}

export function getCanvasStickyQuickCreateTargetAnchor({
  direction,
  targetBounds,
}: {
  direction: CanvasSide
  targetBounds: { h: number; w: number; x: number; y: number }
}): Point {
  const centerX = targetBounds.x + targetBounds.w / 2
  const centerY = targetBounds.y + targetBounds.h / 2

  if (direction === 'left') {
    return { x: targetBounds.x + targetBounds.w, y: centerY }
  }

  if (direction === 'right') {
    return { x: targetBounds.x, y: centerY }
  }

  if (direction === 'top') {
    return { x: centerX, y: targetBounds.y + targetBounds.h }
  }

  return { x: centerX, y: targetBounds.y }
}

function getCanvasStickyQuickCreateTargetPoint({
  direction,
  sourceBounds,
  targetSize,
}: {
  direction: CanvasSide
  sourceBounds: { h: number; w: number; x: number; y: number }
  targetSize: { h: number; w: number }
}): Point {
  if (direction === 'left') {
    return {
      x: sourceBounds.x - targetSize.w - CANVAS_STICKY_QUICK_CREATE_GAP,
      y: sourceBounds.y,
    }
  }

  if (direction === 'right') {
    return {
      x: sourceBounds.x + sourceBounds.w + CANVAS_STICKY_QUICK_CREATE_GAP,
      y: sourceBounds.y,
    }
  }

  if (direction === 'top') {
    return {
      x: sourceBounds.x,
      y: sourceBounds.y - targetSize.h - CANVAS_STICKY_QUICK_CREATE_GAP,
    }
  }

  return {
    x: sourceBounds.x,
    y: sourceBounds.y + sourceBounds.h + CANVAS_STICKY_QUICK_CREATE_GAP,
  }
}

function getCanvasStickyQuickCreateCandidatePoints({
  direction,
  sourceBounds,
  targetSize,
}: {
  direction: CanvasSide
  sourceBounds: { h: number; w: number; x: number; y: number }
  targetSize: { h: number; w: number }
}): Point[] {
  const preferred = getCanvasStickyQuickCreateTargetPoint({
    direction,
    sourceBounds,
    targetSize,
  })
  const mainStep = getCanvasStickyQuickCreateMainStep({
    direction,
    targetSize,
  })
  const crossStep = getCanvasStickyQuickCreateCrossStep({
    direction,
    targetSize,
  })
  const candidates: Point[] = []

  for (let main = 0;
    main < CANVAS_STICKY_QUICK_CREATE_MAX_SLOT_ATTEMPTS;
    main += 1) {
    for (const cross of CANVAS_STICKY_QUICK_CREATE_CROSS_OFFSETS) {
      candidates.push({
        x: preferred.x + mainStep.x * main + crossStep.x * cross,
        y: preferred.y + mainStep.y * main + crossStep.y * cross,
      })
    }
  }

  return candidates
}

function getCanvasStickyQuickCreateMainStep({
  direction,
  targetSize,
}: {
  direction: CanvasSide
  targetSize: { h: number; w: number }
}): Point {
  const gap = CANVAS_STICKY_QUICK_CREATE_GAP

  if (direction === 'left') {
    return { x: -(targetSize.w + gap), y: 0 }
  }

  if (direction === 'right') {
    return { x: targetSize.w + gap, y: 0 }
  }

  if (direction === 'top') {
    return { x: 0, y: -(targetSize.h + gap) }
  }

  return { x: 0, y: targetSize.h + gap }
}

function getCanvasStickyQuickCreateCrossStep({
  direction,
  targetSize,
}: {
  direction: CanvasSide
  targetSize: { h: number; w: number }
}): Point {
  const gap = CANVAS_STICKY_QUICK_CREATE_GAP

  if (direction === 'left' || direction === 'right') {
    return { x: 0, y: targetSize.h + gap }
  }

  return { x: targetSize.w + gap, y: 0 }
}

function getCanvasStickyQuickCreateBlockerBounds({
  itemReadModel,
  sourceId,
}: {
  itemReadModel: CanvasAppItemReadModel
  sourceId: string
}) {
  return itemReadModel.getAllItems()
    .filter((item) => isCanvasStickyQuickCreateBlocker(item, sourceId))
    .map((item) => itemReadModel.getItemBounds(item))
}

function isCanvasStickyQuickCreateBlocker(
  item: CanvasItem,
  sourceId: string,
) {
  if (
    item.id === sourceId ||
    (
      item.type === 'component' &&
      item.component === CANVAS_SECTION_COMPONENT_KIND
    )
  ) {
    return false
  }

  return item.type === 'component' ||
    item.type === 'custom' ||
    item.type === 'image' ||
    item.type === 'rect' ||
    item.type === 'shape' ||
    item.type === 'text'
}

function doesCanvasStickyQuickCreateTargetOverlap({
  blockers,
  targetBounds,
}: {
  blockers: readonly { h: number; w: number; x: number; y: number }[]
  targetBounds: { h: number; w: number; x: number; y: number }
}) {
  return blockers.some((blocker) => doCanvasBoundsOverlap(
    targetBounds,
    blocker,
  ))
}

function doCanvasBoundsOverlap(
  a: { h: number; w: number; x: number; y: number },
  b: { h: number; w: number; x: number; y: number },
) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
}
