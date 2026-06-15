import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import {
  getDomEditOverlayVisibility,
  type DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
import {
  areDomEditOverlayRectsEqual,
  createDomEditOverlayRectStyle,
  measureDomEditNodeOverlayRect,
  type DomEditScaledOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import type {
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'

type GuideRect = DomEditScaledOverlayRect

type GuideDistance = {
  axis: 'x' | 'y'
  from: {
    x: number
    y: number
  }
  length: number
}

export function DomEditGuideOverlay<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  rect,
  selectedNodeId,
  shellRef,
  state,
  viewport,
  affordanceState = { mode: 'idle' },
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  affordanceState?: DomEditAffordanceState
  rect: GuideRect
  selectedNodeId: TNodeId
  shellRef: RefObject<HTMLElement | null>
  state: TState
  viewport: DomEditViewport
}) {
  const [parentRect, setParentRect] = useState<GuideRect | null>(null)
  const [hoveredNodeId, setHoveredNodeId] =
    useState<TNodeId | null>(null)
  const [hoveredRect, setHoveredRect] = useState<GuideRect | null>(null)
  const context = adapter.getLayoutContext(selectedNodeId)
  const style = adapter.getStyle(state, selectedNodeId)
  const parentId = adapter.getParentId(selectedNodeId)
  const visibility = getDomEditOverlayVisibility({
    affordanceState,
    context,
  })
  const activeHoveredRect = visibility.measurements && hoveredNodeId
    ? hoveredRect
    : null
  const measurementRect = activeHoveredRect ?? parentRect
  const distances = measurementRect
    ? getDomEditMeasurementDistances(rect, measurementRect)
    : []

  useLayoutEffect(() => {
    const nextParentRect = parentId
      ? measureDomEditNodeOverlayRect({
          adapter,
          nodeId: parentId,
          shell: shellRef.current,
          state,
          viewport,
        })
      : null

    setParentRect((current) =>
      areDomEditOverlayRectsEqual(current, nextParentRect)
        ? current
        : nextParentRect)
  }, [
    adapter,
    parentId,
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    selectedNodeId,
    shellRef,
    state,
    viewport,
  ])

  useEffect(() => {
    if (!visibility.measurements) {
      return undefined
    }

    const updateHoveredNode = (event: globalThis.PointerEvent) => {
      const nextNodeId = getDomEditHoveredMeasurementNodeId({
        adapter,
        selectedNodeId,
        target: document.elementFromPoint(event.clientX, event.clientY),
      })

      setHoveredNodeId((current) =>
        current === nextNodeId ? current : nextNodeId)
    }

    window.addEventListener('pointermove', updateHoveredNode)

    return () => {
      window.removeEventListener('pointermove', updateHoveredNode)
    }
  }, [adapter, selectedNodeId, visibility.measurements])

  useLayoutEffect(() => {
    if (!visibility.measurements || !hoveredNodeId) {
      return undefined
    }

    let frame = 0
    let disposed = false
    const measureHoveredNode = () => {
      if (disposed) {
        return
      }

      const nextRect = measureDomEditNodeOverlayRect({
        adapter,
        nodeId: hoveredNodeId,
        shell: shellRef.current,
        state,
        viewport,
      })

      setHoveredRect((current) =>
        areDomEditOverlayRectsEqual(current, nextRect)
          ? current
          : nextRect)
      frame = requestAnimationFrame(measureHoveredNode)
    }

    frame = requestAnimationFrame(measureHoveredNode)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
    }
  }, [
    hoveredNodeId,
    adapter,
    shellRef,
    state,
    viewport,
    visibility.measurements,
  ])

  return (
    <>
      {visibility.parentReference && parentRect ? (
        <div
          className="figma-guide-parent"
          style={createDomEditOverlayRectStyle(parentRect)}
        />
      ) : null}
      {activeHoveredRect ? (
        <div
          className="figma-guide-reference"
          style={createDomEditOverlayRectStyle(activeHoveredRect)}
        />
      ) : null}
      {visibility.measurements ? distances.map((distance, index) => (
        <DomEditGuideDistance
          key={`${distance.axis}:${index}:${distance.from.x}:${distance.from.y}`}
          distance={distance}
        />
      )) : null}
      {affordanceState.mode === 'transform' && parentRect ? (
        <DomEditTransformGuides
          parentRect={parentRect}
          rect={rect}
        />
      ) : null}
      <div
        className="figma-guide-selected"
        style={createDomEditOverlayRectStyle(rect)}
      >
        {visibility.geometry ? (
          <>
            <span className="figma-guide-handle figma-guide-handle--nw" />
            <span className="figma-guide-handle figma-guide-handle--ne" />
            <span className="figma-guide-handle figma-guide-handle--sw" />
            <span className="figma-guide-handle figma-guide-handle--se" />
          </>
        ) : null}
      </div>
      <span
        className="figma-guide-label"
        style={{
          left: rect.x,
          top: Math.max(8, rect.y - 6),
        }}
      >
        {context.label} · {context.display}
        {context.showFlexLayout ? ` ${style.direction === 'row' ? 'H' : 'V'}` : ''}
        {context.showGridLayout ? ' Grid' : ''}
      </span>
    </>
  )
}

function getDomEditHoveredMeasurementNodeId<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  selectedNodeId,
  target,
}: {
  adapter: Pick<DomEditModelAdapter<TNodeId, TState>, 'readNodeId'>
  selectedNodeId: TNodeId
  target: Element | null
}): TNodeId | null {
  let current: Element | null = target

  while (current) {
    if (current instanceof HTMLElement) {
      const nodeId = adapter.readNodeId(current)

      if (nodeId && nodeId !== selectedNodeId) {
        return nodeId
      }
    }

    current = current.parentElement
  }

  return null
}

function DomEditTransformGuides({
  parentRect,
  rect,
}: {
  parentRect: GuideRect
  rect: GuideRect
}) {
  const parentCenterX = parentRect.x + parentRect.w / 2
  const parentCenterY = parentRect.y + parentRect.h / 2
  const selectedCenterX = rect.x + rect.w / 2
  const selectedCenterY = rect.y + rect.h / 2
  const isAlignedX = Math.abs(parentCenterX - selectedCenterX) <= 1
  const isAlignedY = Math.abs(parentCenterY - selectedCenterY) <= 1

  return (
    <>
      <span
        className={`figma-transform-guide figma-transform-guide--v${isAlignedX ? ' figma-transform-guide--aligned' : ''}`}
        style={{
          height: parentRect.h,
          left: parentCenterX,
          top: parentRect.y,
        }}
      />
      <span
        className={`figma-transform-guide figma-transform-guide--h${isAlignedY ? ' figma-transform-guide--aligned' : ''}`}
        style={{
          left: parentRect.x,
          top: parentCenterY,
          width: parentRect.w,
        }}
      />
      <span
        className="figma-transform-guide figma-transform-guide--v figma-transform-guide--selected"
        style={{
          height: rect.h,
          left: selectedCenterX,
          top: rect.y,
        }}
      />
      <span
        className="figma-transform-guide figma-transform-guide--h figma-transform-guide--selected"
        style={{
          left: rect.x,
          top: selectedCenterY,
          width: rect.w,
        }}
      />
    </>
  )
}

function DomEditGuideDistance({
  distance,
}: {
  distance: GuideDistance
}) {
  const style: CSSProperties = distance.axis === 'x'
    ? {
        left: distance.from.x,
        top: distance.from.y,
        width: distance.length,
      }
    : {
        height: distance.length,
        left: distance.from.x,
        top: distance.from.y,
      }

  return (
    <div
      className={`figma-guide-distance figma-guide-distance--${distance.axis}`}
      style={style}
    >
      <span>{Math.round(distance.length)}</span>
    </div>
  )
}

function getDomEditInsetDistances(
  inner: GuideRect,
  outer: GuideRect,
): GuideDistance[] {
  const midX = inner.x + inner.w / 2
  const midY = inner.y + inner.h / 2
  const outerRight = outer.x + outer.w
  const outerBottom = outer.y + outer.h
  const innerRight = inner.x + inner.w
  const innerBottom = inner.y + inner.h

  const distances: GuideDistance[] = [
    {
      axis: 'y',
      from: { x: midX, y: outer.y },
      length: inner.y - outer.y,
    },
    {
      axis: 'y',
      from: { x: midX, y: innerBottom },
      length: outerBottom - innerBottom,
    },
    {
      axis: 'x',
      from: { x: outer.x, y: midY },
      length: inner.x - outer.x,
    },
    {
      axis: 'x',
      from: { x: innerRight, y: midY },
      length: outerRight - innerRight,
    },
  ]

  return distances.filter((distance) => distance.length > 0.5)
}

function getDomEditMeasurementDistances(
  selected: GuideRect,
  reference: GuideRect,
): GuideDistance[] {
  if (containsDomEditGuideRect(reference, selected)) {
    return getDomEditInsetDistances(selected, reference)
  }

  if (containsDomEditGuideRect(selected, reference)) {
    return getDomEditInsetDistances(reference, selected)
  }

  return [
    getDomEditHorizontalDistance(selected, reference),
    getDomEditVerticalDistance(selected, reference),
  ].filter((distance): distance is GuideDistance =>
    Boolean(distance && distance.length > 0.5))
}

function containsDomEditGuideRect(
  outer: GuideRect,
  inner: GuideRect,
) {
  return inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
}

function getDomEditHorizontalDistance(
  selected: GuideRect,
  reference: GuideRect,
): GuideDistance | null {
  const selectedRight = selected.x + selected.w
  const referenceRight = reference.x + reference.w
  const y = getDomEditGuideOverlapCenter({
    firstEnd: selected.y + selected.h,
    firstStart: selected.y,
    secondEnd: reference.y + reference.h,
    secondStart: reference.y,
  })

  if (selectedRight <= reference.x) {
    return {
      axis: 'x',
      from: { x: selectedRight, y },
      length: reference.x - selectedRight,
    }
  }

  if (referenceRight <= selected.x) {
    return {
      axis: 'x',
      from: { x: referenceRight, y },
      length: selected.x - referenceRight,
    }
  }

  return null
}

function getDomEditVerticalDistance(
  selected: GuideRect,
  reference: GuideRect,
): GuideDistance | null {
  const selectedBottom = selected.y + selected.h
  const referenceBottom = reference.y + reference.h
  const x = getDomEditGuideOverlapCenter({
    firstEnd: selected.x + selected.w,
    firstStart: selected.x,
    secondEnd: reference.x + reference.w,
    secondStart: reference.x,
  })

  if (selectedBottom <= reference.y) {
    return {
      axis: 'y',
      from: { x, y: selectedBottom },
      length: reference.y - selectedBottom,
    }
  }

  if (referenceBottom <= selected.y) {
    return {
      axis: 'y',
      from: { x, y: referenceBottom },
      length: selected.y - referenceBottom,
    }
  }

  return null
}

function getDomEditGuideOverlapCenter({
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
