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
  DomEditDirectManipulationLifecycle,
  DomEditField,
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'
import {
  getDomEditGridHoveredTracks,
  getDomEditGridTrackKey,
  getDomEditGridTrackLayout,
  type DomEditGridTrackGuide,
  type DomEditGridTrackLayout,
} from './DomEditGridTrackGeometry'

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
  directManipulation,
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
  directManipulation?: DomEditDirectManipulationLifecycle<TNodeId>
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
  const [gridTrackLayout, setGridTrackLayout] =
    useState<DomEditGridTrackLayout | null>(null)
  const [hoveredGridTrackKeys, setHoveredGridTrackKeys] =
    useState<string[]>([])
  const [trackRects, setTrackRects] = useState<GridOverlayRect[]>([])
  const [isGapHovered, setIsGapHovered] = useState(false)
  const context = adapter.getLayoutContext(selectedNodeId)
  const style = adapter.getStyle(state, selectedNodeId)

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!context.showGridLayout) {
        setGapRects([])
        setGridTrackLayout(null)
        setHoveredGridTrackKeys([])
        setTrackRects([])
        return
      }

      const measurement = measureDomEditGrid({
        lineThickness: Math.max(1 / rect.scale, 0.5),
        shell: shellRef.current,
        target,
        viewport,
      })

      setGapRects(measurement.gaps)
      setGridTrackLayout(measurement.trackLayout)
      setTrackRects(measurement.tracks)
    })

    return () => cancelAnimationFrame(frame)
  }, [
    context.showGridLayout,
    rect.h,
    rect.scale,
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
        setHoveredGridTrackKeys([])
        return
      }

      const hoveredTarget = document.elementFromPoint(event.clientX, event.clientY)
      const nextIsGapHovered = Boolean(hoveredTarget?.closest('.figma-grid-gap'))
      const nextHoveredTrackKeys = shellRef.current && gridTrackLayout
        ? getDomEditGridHoveredTracks({
            layout: gridTrackLayout,
            point: getDomEditGridWorldPoint({
              event,
              shell: shellRef.current,
              viewport,
            }),
          }).map(getDomEditGridTrackKey)
        : []

      setIsGapHovered((current) =>
        current === nextIsGapHovered ? current : nextIsGapHovered)
      setHoveredGridTrackKeys((current) =>
        areDomEditGridTrackKeysEqual(current, nextHoveredTrackKeys)
          ? current
          : nextHoveredTrackKeys)
    }

    window.addEventListener('pointermove', trackGridAffordance)

    return () => {
      window.removeEventListener('pointermove', trackGridAffordance)
    }
  }, [
    activeDragAxis,
    context.showGridLayout,
    gridTrackLayout,
    shellRef,
    viewport,
  ])

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
  const activeGridTrackLayout = context.showGridLayout &&
    visibility.gridGapHitTargets
    ? gridTrackLayout
    : null
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
    const ownsPreview = directManipulation?.begin({
      kind: 'gap',
      nodeId: selectedNodeId,
    }) === true

    source.setPointerCapture(pointerId)
    setActiveDragAxis(gap.axis)
    setIsGapHovered(true)
    onAffordanceStateChange({ mode: 'drag-property', property: 'gap' })
    event.preventDefault()
    event.stopPropagation()

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const dx = (moveEvent.clientX - start.clientX) / rect.scale
      const dy = (moveEvent.clientY - start.clientY) / rect.scale
      const value = resolveDomEditGridGapDragValue(
        start.gap + (gap.axis === 'column' ? dx : dy),
        moveEvent,
      )

      if (ownsPreview) {
        directManipulation?.update([{
          field: 'gap',
          kind: 'number',
          value,
        }])
      } else {
        onChange(selectedNodeId, 'gap', value)
      }
    }
    const handleEnd = (endEvent: globalThis.PointerEvent) => {
      if (source.hasPointerCapture(pointerId)) {
        source.releasePointerCapture(pointerId)
      }
      if (ownsPreview) {
        if (endEvent.type === 'pointercancel') {
          directManipulation?.cancel()
        } else {
          directManipulation?.commit()
        }
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
      {activeGridTrackLayout ? (
        <DomEditGridTrackGuides
          hoveredTrackKeys={hoveredGridTrackKeys}
          layout={activeGridTrackLayout}
        />
      ) : null}
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

function DomEditGridTrackGuides({
  hoveredTrackKeys,
  layout,
}: {
  hoveredTrackKeys: string[]
  layout: DomEditGridTrackLayout
}) {
  const hoveredTrackKeySet = new Set(hoveredTrackKeys)
  const lines = [
    ...layout.columnLines,
    ...layout.rowLines,
  ]
  const tracks = [
    ...layout.columnTracks,
    ...layout.rowTracks,
  ]
  const hoveredTracks = tracks.filter((track) =>
    hoveredTrackKeySet.has(getDomEditGridTrackKey(track)))

  return (
    <>
      {hoveredTracks.map((track) => (
        <span
          key={`track:${getDomEditGridTrackKey(track)}`}
          className={[
            'figma-grid-track-hover',
            `figma-grid-track-hover--${track.axis}`,
          ].join(' ')}
          data-grid-track-hover-axis={track.axis}
          data-grid-track-hover-index={track.index + 1}
          style={createDomEditOverlayRectStyle(track.rect)}
        />
      ))}
      {lines.map((line) => (
        <span
          key={`line:${line.axis}:${line.lineNumber}`}
          className={[
            'figma-grid-line',
            `figma-grid-line--${line.axis}`,
          ].join(' ')}
          data-grid-line-axis={line.axis}
          data-grid-line-number={line.lineNumber}
          style={createDomEditOverlayRectStyle(line.rect)}
        />
      ))}
      {lines.map((line) => (
        <span
          key={`line-label:${line.axis}:${line.lineNumber}`}
          className={[
            'figma-grid-line-label',
            `figma-grid-line-label--${line.axis}`,
          ].join(' ')}
          data-grid-line-label-axis={line.axis}
          data-grid-line-label-number={line.lineNumber}
          style={{
            left: line.labelX,
            top: line.labelY,
          }}
        >
          {line.lineNumber}
        </span>
      ))}
      {hoveredTracks.map((track) => (
        <DomEditGridTrackSizeLabel
          key={`track-size:${getDomEditGridTrackKey(track)}`}
          track={track}
        />
      ))}
    </>
  )
}

function DomEditGridTrackSizeLabel({
  track,
}: {
  track: DomEditGridTrackGuide
}) {
  return (
    <span
      className={[
        'figma-grid-track-size',
        `figma-grid-track-size--${track.axis}`,
      ].join(' ')}
      data-grid-track-size-axis={track.axis}
      data-grid-track-size-index={track.index + 1}
      style={{
        left: track.labelX,
        top: track.labelY,
      }}
    >
      {track.label}
    </span>
  )
}

function measureDomEditGrid({
  lineThickness,
  shell,
  target,
  viewport,
}: {
  lineThickness: number
  shell: HTMLElement | null
  target: HTMLElement
  viewport: DomEditViewport
}) {
  if (!shell) {
    return {
      gaps: [],
      trackLayout: null,
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
  const trackLayout = getDomEditGridTrackLayout({
    columnTemplate: readDomEditGridTemplate(target, 'column'),
    container: targetWorldRect,
    lineThickness,
    rowTemplate: readDomEditGridTemplate(target, 'row'),
    tracks,
  })

  return {
    gaps: [
      ...measureDomEditGridColumnGaps(tracks, targetWorldRect),
      ...measureDomEditGridRowGaps(tracks, targetWorldRect),
    ],
    trackLayout,
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

function readDomEditGridTemplate(
  target: HTMLElement,
  axis: 'column' | 'row',
) {
  const computedStyle = target.ownerDocument.defaultView?.getComputedStyle(target)
  const inlineTemplate = axis === 'column'
    ? target.style.gridTemplateColumns
    : target.style.gridTemplateRows
  const computedTemplate = axis === 'column'
    ? computedStyle?.gridTemplateColumns
    : computedStyle?.gridTemplateRows

  return inlineTemplate || computedTemplate || ''
}

function getDomEditGridWorldPoint({
  event,
  shell,
  viewport,
}: {
  event: globalThis.PointerEvent
  shell: HTMLElement
  viewport: DomEditViewport
}) {
  const shellRect = shell.getBoundingClientRect()
  const scale = viewport.scale > 0 ? viewport.scale : 1

  return {
    x: (event.clientX - shellRect.left - viewport.x) / scale,
    y: (event.clientY - shellRect.top - viewport.y) / scale,
  }
}

function areDomEditGridTrackKeysEqual(
  current: string[],
  next: string[],
) {
  return current.length === next.length &&
    current.every((key, index) => key === next[index])
}
