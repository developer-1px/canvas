import type { Bounds } from '../core'
import type {
  CanvasAlignMode,
  CanvasDistributeMode,
} from './CanvasCommandTypes'

export type CanvasLayoutDelta = {
  x: number
  y: number
}

export type CanvasRectLayoutEntry<TItemId extends string = string> = {
  bounds: Bounds
  id: TItemId
}

export type CanvasRectLayoutPlanEntry<TItemId extends string = string> =
  CanvasRectLayoutEntry<TItemId> & {
    delta: CanvasLayoutDelta
  }

export type CanvasRectAlignmentInput = {
  bounds: Bounds
  frame: Bounds
  mode: CanvasAlignMode
}

export type CanvasRectListAlignmentInput<TItemId extends string = string> = {
  entries: readonly CanvasRectLayoutEntry<TItemId>[]
  frame: Bounds
  mode: CanvasAlignMode
}

export type CanvasRectListDistributionInput<TItemId extends string = string> = {
  entries: readonly CanvasRectLayoutEntry<TItemId>[]
  mode: CanvasDistributeMode
}

export function getCanvasAlignedBounds({
  bounds,
  frame,
  mode,
}: CanvasRectAlignmentInput): Bounds {
  if (mode === 'alignLeft') {
    return { ...bounds, x: frame.x }
  }

  if (mode === 'alignCenter') {
    return { ...bounds, x: frame.x + frame.w / 2 - bounds.w / 2 }
  }

  if (mode === 'alignRight') {
    return { ...bounds, x: frame.x + frame.w - bounds.w }
  }

  if (mode === 'alignTop') {
    return { ...bounds, y: frame.y }
  }

  if (mode === 'alignMiddle') {
    return { ...bounds, y: frame.y + frame.h / 2 - bounds.h / 2 }
  }

  return { ...bounds, y: frame.y + frame.h - bounds.h }
}

export function getCanvasAlignmentDelta(
  input: CanvasRectAlignmentInput,
): CanvasLayoutDelta {
  return getCanvasLayoutDelta(
    input.bounds,
    getCanvasAlignedBounds(input),
  )
}

export function alignCanvasRectList<TItemId extends string = string>({
  entries,
  frame,
  mode,
}: CanvasRectListAlignmentInput<TItemId>): CanvasRectLayoutPlanEntry<TItemId>[] {
  return entries.map((entry) => {
    const bounds = getCanvasAlignedBounds({
      bounds: entry.bounds,
      frame,
      mode,
    })

    return {
      ...entry,
      bounds,
      delta: getCanvasLayoutDelta(entry.bounds, bounds),
    }
  })
}

export function distributeCanvasRectList<TItemId extends string = string>({
  entries,
  mode,
}: CanvasRectListDistributionInput<TItemId>): CanvasRectLayoutPlanEntry<TItemId>[] {
  if (entries.length < 3) {
    return entries.map((entry) => ({
      ...entry,
      delta: { x: 0, y: 0 },
    }))
  }

  const horizontal = mode === 'distributeHorizontal'
  const sorted = [...entries].sort((left, right) =>
    horizontal
      ? left.bounds.x - right.bounds.x
      : left.bounds.y - right.bounds.y)
  const first = sorted[0]
  const last = sorted.at(-1)

  if (!first || !last) {
    return entries.map((entry) => ({
      ...entry,
      delta: { x: 0, y: 0 },
    }))
  }

  const start = horizontal ? first.bounds.x : first.bounds.y
  const end = horizontal
    ? last.bounds.x + last.bounds.w
    : last.bounds.y + last.bounds.h
  const totalSize = sorted.reduce(
    (sum, entry) => sum + (horizontal ? entry.bounds.w : entry.bounds.h),
    0,
  )
  const gap = (end - start - totalSize) / (sorted.length - 1)
  const distributed = new Map<TItemId, Bounds>()
  let cursor = start

  sorted.forEach((entry) => {
    const bounds = horizontal
      ? { ...entry.bounds, x: cursor }
      : { ...entry.bounds, y: cursor }

    distributed.set(entry.id, bounds)
    cursor += (horizontal ? entry.bounds.w : entry.bounds.h) + gap
  })

  return entries.map((entry) => {
    const bounds = distributed.get(entry.id) ?? entry.bounds

    return {
      ...entry,
      bounds,
      delta: getCanvasLayoutDelta(entry.bounds, bounds),
    }
  })
}

function getCanvasLayoutDelta(
  bounds: Bounds,
  nextBounds: Bounds,
): CanvasLayoutDelta {
  return {
    x: nextBounds.x - bounds.x,
    y: nextBounds.y - bounds.y,
  }
}
