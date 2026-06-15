import type {
  DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'

export type DomEditMeasurementDistance = {
  axis: 'x' | 'y'
  from: {
    x: number
    y: number
  }
  kind: 'gap' | 'inset'
  length: number
}

export function getDomEditMeasurementDistances(
  selected: DomEditOverlayRect,
  reference: DomEditOverlayRect,
): DomEditMeasurementDistance[] {
  if (containsDomEditMeasurementRect(reference, selected)) {
    return getDomEditInsetDistances(selected, reference)
  }

  if (containsDomEditMeasurementRect(selected, reference)) {
    return getDomEditInsetDistances(reference, selected)
  }

  if (intersectsDomEditMeasurementRect(selected, reference)) {
    return getDomEditOverlapDistances(selected, reference)
  }

  return [
    getDomEditHorizontalDistance(selected, reference),
    getDomEditVerticalDistance(selected, reference),
  ].filter((distance): distance is DomEditMeasurementDistance =>
    Boolean(distance && distance.length > 0.5))
}

function getDomEditInsetDistances(
  inner: DomEditOverlayRect,
  outer: DomEditOverlayRect,
): DomEditMeasurementDistance[] {
  const midX = inner.x + inner.w / 2
  const midY = inner.y + inner.h / 2
  const outerRight = outer.x + outer.w
  const outerBottom = outer.y + outer.h
  const innerRight = inner.x + inner.w
  const innerBottom = inner.y + inner.h

  const distances: DomEditMeasurementDistance[] = [
    {
      axis: 'y',
      from: { x: midX, y: outer.y },
      kind: 'inset',
      length: inner.y - outer.y,
    },
    {
      axis: 'y',
      from: { x: midX, y: innerBottom },
      kind: 'inset',
      length: outerBottom - innerBottom,
    },
    {
      axis: 'x',
      from: { x: outer.x, y: midY },
      kind: 'inset',
      length: inner.x - outer.x,
    },
    {
      axis: 'x',
      from: { x: innerRight, y: midY },
      kind: 'inset',
      length: outerRight - innerRight,
    },
  ]

  return distances.filter((distance) => distance.length > 0.5)
}

function getDomEditOverlapDistances(
  selected: DomEditOverlayRect,
  reference: DomEditOverlayRect,
): DomEditMeasurementDistance[] {
  const overlapLeft = Math.max(selected.x, reference.x)
  const overlapTop = Math.max(selected.y, reference.y)
  const overlapRight = Math.min(
    selected.x + selected.w,
    reference.x + reference.w,
  )
  const overlapBottom = Math.min(
    selected.y + selected.h,
    reference.y + reference.h,
  )
  const overlapWidth = overlapRight - overlapLeft
  const overlapHeight = overlapBottom - overlapTop
  const distances: DomEditMeasurementDistance[] = []

  if (overlapWidth > 0.5) {
    distances.push({
      axis: 'x',
      from: {
        x: overlapLeft,
        y: overlapTop + overlapHeight / 2,
      },
      kind: 'inset',
      length: overlapWidth,
    })
  }

  if (overlapHeight > 0.5) {
    distances.push({
      axis: 'y',
      from: {
        x: overlapLeft + overlapWidth / 2,
        y: overlapTop,
      },
      kind: 'inset',
      length: overlapHeight,
    })
  }

  return distances
}

function containsDomEditMeasurementRect(
  outer: DomEditOverlayRect,
  inner: DomEditOverlayRect,
) {
  return inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
}

function intersectsDomEditMeasurementRect(
  first: DomEditOverlayRect,
  second: DomEditOverlayRect,
) {
  return first.x < second.x + second.w &&
    first.x + first.w > second.x &&
    first.y < second.y + second.h &&
    first.y + first.h > second.y
}

function getDomEditHorizontalDistance(
  selected: DomEditOverlayRect,
  reference: DomEditOverlayRect,
): DomEditMeasurementDistance | null {
  const selectedRight = selected.x + selected.w
  const referenceRight = reference.x + reference.w
  const y = getDomEditMeasurementOverlapCenter({
    firstEnd: selected.y + selected.h,
    firstStart: selected.y,
    secondEnd: reference.y + reference.h,
    secondStart: reference.y,
  })

  if (selectedRight <= reference.x) {
    return {
      axis: 'x',
      from: { x: selectedRight, y },
      kind: 'gap',
      length: reference.x - selectedRight,
    }
  }

  if (referenceRight <= selected.x) {
    return {
      axis: 'x',
      from: { x: referenceRight, y },
      kind: 'gap',
      length: selected.x - referenceRight,
    }
  }

  return null
}

function getDomEditVerticalDistance(
  selected: DomEditOverlayRect,
  reference: DomEditOverlayRect,
): DomEditMeasurementDistance | null {
  const selectedBottom = selected.y + selected.h
  const referenceBottom = reference.y + reference.h
  const x = getDomEditMeasurementOverlapCenter({
    firstEnd: selected.x + selected.w,
    firstStart: selected.x,
    secondEnd: reference.x + reference.w,
    secondStart: reference.x,
  })

  if (selectedBottom <= reference.y) {
    return {
      axis: 'y',
      from: { x, y: selectedBottom },
      kind: 'gap',
      length: reference.y - selectedBottom,
    }
  }

  if (referenceBottom <= selected.y) {
    return {
      axis: 'y',
      from: { x, y: referenceBottom },
      kind: 'gap',
      length: selected.y - referenceBottom,
    }
  }

  return null
}

function getDomEditMeasurementOverlapCenter({
  firstEnd,
  firstStart,
  secondEnd,
  secondStart,
}: {
  firstEnd: number
  firstStart: number
  secondEnd: number
  secondStart: number
}) {
  const overlapStart = Math.max(firstStart, secondStart)
  const overlapEnd = Math.min(firstEnd, secondEnd)

  if (overlapEnd >= overlapStart) {
    return overlapStart + (overlapEnd - overlapStart) / 2
  }

  const firstCenter = firstStart + (firstEnd - firstStart) / 2
  const secondCenter = secondStart + (secondEnd - secondStart) / 2

  return firstCenter + (secondCenter - firstCenter) / 2
}
