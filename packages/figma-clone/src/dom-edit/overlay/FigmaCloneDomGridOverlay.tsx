import {
  useEffect,
  useLayoutEffect,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react'
import type { Viewport } from '../../../../../src/canvas'
import {
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomLayoutContext,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from '../FigmaCloneDomEditModel'
import {
  getFigmaCloneDomOverlayVisibility,
  type FigmaCloneDomAffordanceState,
} from './FigmaCloneDomAffordanceVisibility'
import {
  clampFigmaCloneDomOverlayPosition,
  createFigmaCloneDomOverlayRectStyle,
  getFigmaCloneDomWorldOverlayRect,
  type FigmaCloneDomOverlayRect,
} from './FigmaCloneDomOverlayGeometry'
import {
  resolveFigmaCloneSpacingDragValue,
} from './FigmaCloneDomOverlayGesture'

type GridOverlayRect = FigmaCloneDomOverlayRect
type GridGapRect = FigmaCloneDomOverlayRect & {
  axis: 'column' | 'row'
}

export function FigmaCloneDomGridOverlay({
  affordanceState: baseAffordanceState,
  rect,
  selectedNodeId,
  shellRef,
  state,
  target,
  viewport,
  onChange,
}: {
  affordanceState: FigmaCloneDomAffordanceState
  rect: GridOverlayRect & { scale: number }
  selectedNodeId: FigmaCloneDomNodeId
  shellRef: RefObject<HTMLElement | null>
  state: FigmaCloneDomEditState
  target: HTMLElement
  viewport: Viewport
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
}) {
  const [activeDragAxis, setActiveDragAxis] =
    useState<GridGapRect['axis'] | null>(null)
  const [gapRects, setGapRects] = useState<GridGapRect[]>([])
  const [trackRects, setTrackRects] = useState<GridOverlayRect[]>([])
  const [isGapHovered, setIsGapHovered] = useState(false)
  const context = getFigmaCloneDomLayoutContext(selectedNodeId)
  const style = getFigmaCloneDomEditStyle(state, selectedNodeId)

  useLayoutEffect(() => {
    if (!context.showGridLayout) {
      setGapRects([])
      setTrackRects([])
      return
    }

    const measurement = measureFigmaCloneGrid({
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
  const visibility = getFigmaCloneDomOverlayVisibility({
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
    event.preventDefault()
    event.stopPropagation()

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const dx = (moveEvent.clientX - start.clientX) / rect.scale
      const dy = (moveEvent.clientY - start.clientY) / rect.scale

      onChange(
        selectedNodeId,
        'gap',
        resolveFigmaCloneGridGapDragValue(
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
          style={createFigmaCloneDomOverlayRectStyle(track)}
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
          style={createFigmaCloneDomOverlayRectStyle(gap)}
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

function measureFigmaCloneGrid({
  shell,
  target,
  viewport,
}: {
  shell: HTMLElement | null
  target: HTMLElement
  viewport: Viewport
}) {
  if (!shell || target.children.length < 2) {
    return {
      gaps: [],
      tracks: [],
    }
  }

  const shellRect = shell.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const targetWorldRect = measureFigmaCloneGridWorldRect({
    elementRect: targetRect,
    shellRect,
    viewport,
  })
  const tracks = Array.from(target.children)
    .map((child) => child.getBoundingClientRect())
    .filter((childRect) => childRect.width > 0 && childRect.height > 0)
    .map((childRect) => measureFigmaCloneGridWorldRect({
      elementRect: childRect,
      shellRect,
      viewport,
    }))

  return {
    gaps: [
      ...measureFigmaCloneGridColumnGaps(tracks, targetWorldRect),
      ...measureFigmaCloneGridRowGaps(tracks, targetWorldRect),
    ],
    tracks,
  }
}

function measureFigmaCloneGridColumnGaps(
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
      y: clampFigmaCloneDomOverlayPosition(
        top,
        targetRect.y,
        targetRect.y + targetRect.h - height,
      ),
    }]
  })
}

function measureFigmaCloneGridRowGaps(
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
      x: clampFigmaCloneDomOverlayPosition(
        left,
        targetRect.x,
        targetRect.x + targetRect.w - width,
      ),
      y: first.y + first.h,
    }]
  })
}

function measureFigmaCloneGridWorldRect({
  elementRect,
  shellRect,
  viewport,
}: {
  elementRect: DOMRect
  shellRect: DOMRect
  viewport: Viewport
}): GridOverlayRect {
  const rect = getFigmaCloneDomWorldOverlayRect({
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

function resolveFigmaCloneGridGapDragValue(
  value: number,
  event: globalThis.PointerEvent,
) {
  return resolveFigmaCloneSpacingDragValue(value, event)
}
