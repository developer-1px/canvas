import type {
  Bounds,
  Point,
  ResizeHandle
} from '../core'
import {
  resizeBounds,
  type ResizeBoundsOptions,
} from '../core'

export type CanvasTransformItem = {
  id: string
}

export type CanvasTransformAdapter<TItem extends CanvasTransformItem> = {
  resizeSelection: (input: {
    from: Bounds
    items: TItem[]
    selection: string[]
    to: Bounds
  }) => TItem[]
  translateSelection: (input: {
    dx: number
    dy: number
    items: TItem[]
    selection: string[]
  }) => TItem[]
}

export function moveCanvasSelection<TItem extends CanvasTransformItem>({
  adapter,
  dx,
  dy,
  items,
  selection,
}: {
  adapter: CanvasTransformAdapter<TItem>
  dx: number
  dy: number
  items: TItem[]
  selection: string[]
}) {
  return adapter.translateSelection({ dx, dy, items, selection })
}

export function resizeCanvasSelection<TItem extends CanvasTransformItem>({
  adapter,
  bounds,
  handle,
  items,
  point,
  preserveAspectRatio,
  resizeFromCenter,
  selection,
}: {
  adapter: CanvasTransformAdapter<TItem>
  bounds: Bounds
  handle: ResizeHandle
  items: TItem[]
  point: Point
  preserveAspectRatio?: boolean
  resizeFromCenter?: boolean
  selection: string[]
}) {
  return adapter.resizeSelection({
    from: bounds,
    items,
    selection,
    to: resizeBounds(bounds, handle, point, {
      preserveAspectRatio,
      resizeFromCenter,
    } satisfies ResizeBoundsOptions),
  })
}

export function normalizeCanvasRotationDegrees(
  rotation: number | null | undefined,
) {
  if (rotation === null || rotation === undefined || !Number.isFinite(rotation)) {
    return 0
  }

  const normalized = ((rotation % 360) + 360) % 360
  const rounded = Number(normalized.toFixed(3))

  return rounded >= 360 || Math.abs(rounded) < 0.001 ? 0 : rounded
}
