import {
  useEffect,
  useLayoutEffect,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react'
import {
  getDomEditOverlayVisibility,
  type DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
import {
  clampDomEditOverlayPosition,
  createDomEditOverlayRectStyle,
  getDomEditWorldOverlayRect,
  type DomEditOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import {
  resolveDomEditSpacingDragValue,
} from '../../../shared/gesture/DomEditOverlayGesture'
import type {
  DomEditField,
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'

type GridOverlayRect = DomEditOverlayRect
type GridGapRect = DomEditOverlayRect & {
  axis: 'column' | 'row'
}

export function DomEditGridOverlay<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  affordanceState: baseAffordanceState,
  rect,
  selectedNodeId,
  shellRef,
  state,
  target,
  viewport,
  onChange,
  onAffordanceStateChange,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  affordanceState: DomEditAffordanceState
  rect: GridOverlayRect & { scale: number }
  selectedNodeId: TNodeId
  shellRef: RefObject<HTMLElement | null>
  state: TState
  target: HTMLElement
  viewport: DomEditViewport
  onChange: (
    nodeId: TNodeId,
    field: DomEditField,
    value: number,
  ) => void
  onAffordanceStateChange: (state: DomEditAffordanceState) => void
}) {
  const [activeDragAxis, setActiveDragAxis] =
    useState<GridGapRect['axis'] | null>(null)
  const [gapRects, setGapRects] = useState<GridGapRect[]>([])
  const [trackRects, setTrackRects] = useState<GridOverlayRect[]>([])
  const [isGapHovered, setIsGapHovered] = useState(false)
  const context = adapter.getLayoutContext(selectedNodeId)
  const style = adapter.getStyle(state, selectedNodeId)

  useLayoutEffect(() => {
    if (!context.showGridLayout) {
      setGapRects([])
      setTrackRects([])
      return
    }

    const measurement = measureDomEditGrid({
      shell: shellRef.current,
      target,
      viewport,
    })

    setGapRects(measurement.gaps)
    setTrackRects(measurement.tracks)
  }, [
    context.showGridLayout,
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    shellRef,
    state,
    target,
    viewport,
  ])

  useEffect(() => {
    if (!context.showGridLayout) {
      return undefined
    }

    const trackGridAffordance = (event: globalThis.PointerEvent) => {
      if (activeDragAxis) {
        return
      }

      const hoveredTarget = document.elementFromPoint(event.clientX, event.clientY)
      const nextIsGapHovered = Boolean(hoveredTarget?.closest('.figma-grid-gap'))

      setIsGapHovered((current) =>
        current === nextIsGapHovered ? current : nextIsGapHovered)
    }

    window.addEventListener('pointermove', trackGridAffordance)

    return () => {
      window.removeEventListener('pointermove', trackGridAffordance)
    }
  }, [activeDragAxis, context.showGridLayout])

  if (!context.showGridLayout) {
    return null
  }

  const affordanceState = activeDragAxis || isGapHovered
    ? {
        mode: activeDragAxis ? 'drag-property' as const : 'hover-property' as const,
        property: 'gap' as const,
      }
    : baseAffordanceState
  const visibility = getDomEditOverlayVisibility({
    affordanceState,
    context,
  })
  const activeGap = gapRects[0]
  const startGapDrag = (
    event: PointerEvent<HTMLButtonElement>,
    gap: GridGapRect,
  ) => {
    const start = {
      clientX: event.clientX,
      clientY: event.clientY,
      gap: style.gap,
    }
    const pointerId = event.pointerId
    const source = event.currentTarget

    source.setPointerCapture(pointerId)
    setActiveDragAxis(gap.axis)
    setIsGapHovered(true)
    onAffordanceStateChange({ mode: 'drag-property', property: 'gap' })
    event.preventDefault()
    event.stopPropagation()

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const dx = (moveEvent.clientX - start.clientX) / rect.scale
      const dy = (moveEvent.clientY - start.clientY) / rect.scale

      onChange(
        selectedNodeId,
        'gap',
        resolveDomEditGridGapDragValue(
          start.gap + (gap.axis === 'column' ? dx : dy),
          moveEvent,
        ),
      )
    }
    const handleEnd = () => {
      if (source.hasPointerCapture(pointerId)) {
        source.releasePointerCapture(pointerId)
      }
      setActiveDragAxis(null)
      setIsGapHovered(false)
      onAffordanceStateChange({ mode: 'idle' })
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointercancel', handleEnd)
      window.removeEventListener('pointerup', handleEnd)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointercancel', handleEnd, { once: true })
    window.addEventListener('pointerup', handleEnd, { once: true })
  }

  return (
    <>
      {visibility.gridGapVisuals ? trackRects.map((track, index) => (
        <span
          key={`${index}:${track.x}:${track.y}`}
          className="figma-grid-track"
          style={createDomEditOverlayRectStyle(track)}
        />
      )) : null}
      {visibility.gridGapHitTargets ? gapRects.map((gap, index) => (
        <button
          key={`${gap.axis}:${index}:${gap.x}:${gap.y}`}
          aria-label={`Edit grid ${gap.axis} gap ${index + 1}`}
          className={[
            'figma-grid-gap',
            `figma-grid-gap--${gap.axis}`,
            !visibility.gridGapVisuals ? 'figma-grid-gap--empty' : '',
          ].filter(Boolean).join(' ')}
          style={createDomEditOverlayRectStyle(gap)}
          title="Grid gap"
          type="button"
          onPointerDown={(event) => startGapDrag(event, gap)}
        />
      )) : null}
      {visibility.gridGapVisuals && activeGap ? (
        <span
          className="figma-grid-value"
          style={{
            left: activeGap.x + activeGap.w / 2,
            top: activeGap.y + activeGap.h / 2,
          }}
        >
          Grid gap {style.gap}
        </span>
      ) : null}
    </>
  )
}

function measureDomEditGrid({
  shell,
  target,
  viewport,
}: {
  shell: HTMLElement | null
  target: HTMLElement
  viewport: DomEditViewport
}) {
  if (!shell || target.children.length < 2) {
    return {
      gaps: [],
      tracks: [],
    }
  }

  const shellRect = shell.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const targetWorldRect = measureDomEditGridWorldRect({
    elementRect: targetRect,
    shellRect,
    viewport,
  })
  const tracks = Array.from(target.children)
    .map((child) => child.getBoundingClientRect())
    .filter((childRect) => childRect.width > 0 && childRect.height > 0)
    .map((childRect) => measureDomEditGridWorldRect({
      elementRect: childRect,
      shellRect,
      viewport,
    }))

  return {
    gaps: [
      ...measureDomEditGridColumnGaps(tracks, targetWorldRect),
      ...measureDomEditGridRowGaps(tracks, targetWorldRect),
    ],
    tracks,
  }
}

function measureDomEditGridColumnGaps(
  tracks: GridOverlayRect[],
  targetRect: GridOverlayRect,
): GridGapRect[] {
  const sorted = [...tracks].sort((a, b) => a.x - b.x)

  return sorted.slice(0, -1).flatMap((first, index) => {
    const second = sorted[index + 1]
    const gapWidth = second.x - (first.x + first.w)
    const top = Math.max(first.y, second.y)
    const bottom = Math.min(first.y + first.h, second.y + second.h)
    const height = bottom - top

    if (gapWidth <= 0.5 || height <= 0.5) {
      return []
    }

    return [{
      axis: 'column',
      h: height,
      w: gapWidth,
      x: first.x + first.w,
      y: clampDomEditOverlayPosition(
        top,
        targetRect.y,
        targetRect.y + targetRect.h - height,
      ),
    }]
  })
}

function measureDomEditGridRowGaps(
  tracks: GridOverlayRect[],
  targetRect: GridOverlayRect,
): GridGapRect[] {
  const sorted = [...tracks].sort((a, b) => a.y - b.y)

  return sorted.slice(0, -1).flatMap((first, index) => {
    const second = sorted[index + 1]
    const gapHeight = second.y - (first.y + first.h)
    const left = Math.max(first.x, second.x)
    const right = Math.min(first.x + first.w, second.x + second.w)
    const width = right - left

    if (gapHeight <= 0.5 || width <= 0.5) {
      return []
    }

    return [{
      axis: 'row',
      h: gapHeight,
      w: width,
      x: clampDomEditOverlayPosition(
        left,
        targetRect.x,
        targetRect.x + targetRect.w - width,
      ),
      y: first.y + first.h,
    }]
  })
}

function measureDomEditGridWorldRect({
  elementRect,
  shellRect,
  viewport,
}: {
  elementRect: DOMRect
  shellRect: DOMRect
  viewport: DomEditViewport
}): GridOverlayRect {
  const rect = getDomEditWorldOverlayRect({
    elementRect,
    shellRect,
    viewport,
  })

  return {
    h: rect.h,
    w: rect.w,
    x: rect.x,
    y: rect.y,
  }
}

function resolveDomEditGridGapDragValue(
  value: number,
  event: globalThis.PointerEvent,
) {
  return resolveDomEditSpacingDragValue(value, event)
}
