import type {
  Bounds,
  CanvasItem,
  Point,
  Viewport,
} from '@interactive-os/canvas'

export type CanvasDevtoolsMeasuredItem = Readonly<{
  bounds: Bounds
  id: string
  type: CanvasItem['type']
}>

export type CanvasDevtoolsDistanceAxis = 'x' | 'y'

export type CanvasDevtoolsDistance = Readonly<{
  axis: CanvasDevtoolsDistanceAxis
  fromItemId: string
  gap: number
  start: Point
  end: Point
  toItemId: string
}>

export type CanvasDevtoolsMeasureSnapshot = Readonly<{
  distances: readonly CanvasDevtoolsDistance[]
  selectedBounds: Bounds | null
  selectedItems: readonly CanvasDevtoolsMeasuredItem[]
  viewport: Viewport
}>

export type CreateCanvasDevtoolsMeasureSnapshotInput = Readonly<{
  items: readonly CanvasItem[]
  selectedItemIds: readonly string[]
  viewport: Viewport
}>

type ItemGapCandidate = CanvasDevtoolsDistance

export function createCanvasDevtoolsMeasureSnapshot({
  items,
  selectedItemIds,
  viewport,
}: CreateCanvasDevtoolsMeasureSnapshotInput): CanvasDevtoolsMeasureSnapshot {
  const itemById = new Map(items.map((item) => [item.id, item]))
  const selectedItems = selectedItemIds
    .map((id) => itemById.get(id))
    .filter((item): item is CanvasItem => item !== undefined)
    .map((item) => createCanvasDevtoolsMeasuredItem(item))

  return {
    distances: createCanvasDevtoolsDistances(selectedItems),
    selectedBounds: createCanvasDevtoolsSelectionBounds(selectedItems),
    selectedItems,
    viewport,
  }
}

function createCanvasDevtoolsMeasuredItem(
  item: CanvasItem,
): CanvasDevtoolsMeasuredItem {
  return Object.freeze({
    bounds: getCanvasDevtoolsItemBounds(item),
    id: item.id,
    type: item.type,
  })
}

function getCanvasDevtoolsItemBounds(item: CanvasItem): Bounds {
  return {
    h: item.h,
    w: item.w,
    x: item.x,
    y: item.y,
  }
}

function createCanvasDevtoolsSelectionBounds(
  items: readonly CanvasDevtoolsMeasuredItem[],
): Bounds | null {
  if (items.length === 0) {
    return null
  }

  const minX = Math.min(...items.map((item) => item.bounds.x))
  const minY = Math.min(...items.map((item) => item.bounds.y))
  const maxX = Math.max(...items.map((item) => item.bounds.x + item.bounds.w))
  const maxY = Math.max(...items.map((item) => item.bounds.y + item.bounds.h))

  return {
    h: maxY - minY,
    w: maxX - minX,
    x: minX,
    y: minY,
  }
}

function createCanvasDevtoolsDistances(
  items: readonly CanvasDevtoolsMeasuredItem[],
): readonly CanvasDevtoolsDistance[] {
  if (items.length < 2) {
    return []
  }

  return [
    getNearestCanvasDevtoolsDistance(items, 'x'),
    getNearestCanvasDevtoolsDistance(items, 'y'),
  ].filter((distance): distance is CanvasDevtoolsDistance =>
    distance !== null && distance.gap > 0,
  )
}

function getNearestCanvasDevtoolsDistance(
  items: readonly CanvasDevtoolsMeasuredItem[],
  axis: CanvasDevtoolsDistanceAxis,
): CanvasDevtoolsDistance | null {
  let nearest: ItemGapCandidate | null = null

  for (let fromIndex = 0; fromIndex < items.length; fromIndex += 1) {
    for (let toIndex = fromIndex + 1; toIndex < items.length; toIndex += 1) {
      const distance = axis === 'x'
        ? createHorizontalCanvasDevtoolsDistance(items[fromIndex], items[toIndex])
        : createVerticalCanvasDevtoolsDistance(items[fromIndex], items[toIndex])

      if (!distance) {
        continue
      }

      if (!nearest || distance.gap < nearest.gap) {
        nearest = distance
      }
    }
  }

  return nearest
}

function createHorizontalCanvasDevtoolsDistance(
  a: CanvasDevtoolsMeasuredItem,
  b: CanvasDevtoolsMeasuredItem,
): CanvasDevtoolsDistance | null {
  const left = getLeftItem(a, b)
  const right = left.id === a.id ? b : a
  const leftBounds = left.bounds
  const rightBounds = right.bounds
  const gap = rightBounds.x - (leftBounds.x + leftBounds.w)

  if (gap <= 0 || !rangesOverlap(
    leftBounds.y,
    leftBounds.y + leftBounds.h,
    rightBounds.y,
    rightBounds.y + rightBounds.h,
  )) {
    return null
  }

  const y = getRangeOverlapCenter(
    leftBounds.y,
    leftBounds.y + leftBounds.h,
    rightBounds.y,
    rightBounds.y + rightBounds.h,
  )

  return {
    axis: 'x',
    fromItemId: left.id,
    gap,
    start: { x: leftBounds.x + leftBounds.w, y },
    end: { x: rightBounds.x, y },
    toItemId: right.id,
  }
}

function createVerticalCanvasDevtoolsDistance(
  a: CanvasDevtoolsMeasuredItem,
  b: CanvasDevtoolsMeasuredItem,
): CanvasDevtoolsDistance | null {
  const top = getTopItem(a, b)
  const bottom = top.id === a.id ? b : a
  const topBounds = top.bounds
  const bottomBounds = bottom.bounds
  const gap = bottomBounds.y - (topBounds.y + topBounds.h)

  if (gap <= 0 || !rangesOverlap(
    topBounds.x,
    topBounds.x + topBounds.w,
    bottomBounds.x,
    bottomBounds.x + bottomBounds.w,
  )) {
    return null
  }

  const x = getRangeOverlapCenter(
    topBounds.x,
    topBounds.x + topBounds.w,
    bottomBounds.x,
    bottomBounds.x + bottomBounds.w,
  )

  return {
    axis: 'y',
    fromItemId: top.id,
    gap,
    start: { x, y: topBounds.y + topBounds.h },
    end: { x, y: bottomBounds.y },
    toItemId: bottom.id,
  }
}

function getLeftItem(
  a: CanvasDevtoolsMeasuredItem,
  b: CanvasDevtoolsMeasuredItem,
) {
  return a.bounds.x <= b.bounds.x ? a : b
}

function getTopItem(
  a: CanvasDevtoolsMeasuredItem,
  b: CanvasDevtoolsMeasuredItem,
) {
  return a.bounds.y <= b.bounds.y ? a : b
}

function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) {
  return Math.max(aStart, bStart) < Math.min(aEnd, bEnd)
}

function getRangeOverlapCenter(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
) {
  return (Math.max(aStart, bStart) + Math.min(aEnd, bEnd)) / 2
}
