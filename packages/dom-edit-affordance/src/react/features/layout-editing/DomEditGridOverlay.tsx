import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
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
  type DomEditGridLineGuide,
  type DomEditGridTrackGuide,
  type DomEditGridTrackLayout,
} from './DomEditGridTrackGeometry'

type GridOverlayRect = DomEditOverlayRect
type GridGapRect = DomEditOverlayRect & {
  axis: 'column' | 'row'
}
type DomEditGridHoverMode = 'gap' | 'track'

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
  spacingGridSize,
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
  spacingGridSize?: number
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
  const [hoveredGapIndex, setHoveredGapIndex] = useState<number | null>(null)
  const hoveredModeRef = useRef<DomEditGridHoverMode | null>(null)
  const isGapHovered = hoveredGapIndex !== null
  const context = adapter.getLayoutContext(selectedNodeId)
  const style = adapter.getStyle(state, selectedNodeId)
  const canTrackGridHover = canTrackDomEditGridHover(
    baseAffordanceState,
    activeDragAxis,
  )
  const changeHoveredMode = useCallback((mode: DomEditGridHoverMode | null) => {
    if (hoveredModeRef.current === mode) {
      return
    }

    hoveredModeRef.current = mode
    onAffordanceStateChange(mode === 'gap'
      ? { mode: 'hover-property', property: 'gap' }
      : mode === 'track'
        ? { mode: 'hover-property', property: 'geometry' }
        : { mode: 'idle' })
  }, [onAffordanceStateChange])

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!context.showGridLayout) {
        setGapRects([])
        setGridTrackLayout(null)
        setHoveredGridTrackKeys([])
        setHoveredGapIndex(null)
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
    if (
      !context.showGridLayout ||
      !canTrackGridHover
    ) {
      hoveredModeRef.current = null
      return undefined
    }

    const trackGridAffordance = (event: globalThis.PointerEvent) => {
      if (activeDragAxis) {
        setHoveredGridTrackKeys([])
        return
      }

      const hoveredTarget = document.elementFromPoint(event.clientX, event.clientY)
      const gapTarget = hoveredTarget?.closest<HTMLElement>(
        '[data-dom-edit-grid-gap-index]',
      )
      const nextHoveredGapIndex = readDomEditGridGapIndex(gapTarget)
      const nextHoveredTrackKeys = !gapTarget && shellRef.current && gridTrackLayout
        ? getDomEditGridHoveredTracks({
            layout: gridTrackLayout,
            point: getDomEditGridWorldPoint({
              event,
              shell: shellRef.current,
              viewport,
            }),
          }).map(getDomEditGridTrackKey)
        : []
      const nextHoveredMode = nextHoveredGapIndex !== null
        ? 'gap'
        : nextHoveredTrackKeys.length > 0
          ? 'track'
          : null

      setHoveredGapIndex((current) =>
        current === nextHoveredGapIndex ? current : nextHoveredGapIndex)
      setHoveredGridTrackKeys((current) =>
        areDomEditGridTrackKeysEqual(current, nextHoveredTrackKeys)
          ? current
          : nextHoveredTrackKeys)
      changeHoveredMode(nextHoveredMode)
    }

    window.addEventListener('pointermove', trackGridAffordance)

    return () => {
      window.removeEventListener('pointermove', trackGridAffordance)
    }
  }, [
    activeDragAxis,
    baseAffordanceState,
    canTrackGridHover,
    changeHoveredMode,
    context.showGridLayout,
    gridTrackLayout,
    shellRef,
    viewport,
  ])

  useEffect(() => () => {
    changeHoveredMode(null)
  }, [changeHoveredMode])

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
    canTrackGridHover &&
    affordanceState.mode !== 'xray' &&
    (
      Boolean(activeDragAxis) ||
      isGapHovered ||
      hoveredGridTrackKeys.length > 0
    )
    ? gridTrackLayout
    : null
  const activeGap = hoveredGapIndex === null
    ? gapRects.find((gap) => gap.axis === activeDragAxis) ?? gapRects[0] ?? null
    : gapRects[hoveredGapIndex] ?? null
  const startGapDrag = (
    event: PointerEvent<HTMLButtonElement>,
    gap: GridGapRect,
    gapIndex: number,
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
    hoveredModeRef.current = null
    setActiveDragAxis(gap.axis)
    setHoveredGapIndex(gapIndex)
    onAffordanceStateChange({ mode: 'drag-property', property: 'gap' })
    event.preventDefault()
    event.stopPropagation()

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const dx = (moveEvent.clientX - start.clientX) / rect.scale
      const dy = (moveEvent.clientY - start.clientY) / rect.scale
      const value = resolveDomEditGridGapDragValue(
        start.gap + (gap.axis === 'column' ? dx : dy),
        moveEvent,
        spacingGridSize,
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
      setHoveredGapIndex(null)
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
          activeGap={isGapHovered ? activeGap : null}
          hoveredTrackKeys={hoveredGridTrackKeys}
          layout={activeGridTrackLayout}
          showAllLines={Boolean(activeDragAxis)}
        />
      ) : null}
      {visibility.gridGapHitTargets ? gapRects.map((gap, index) => (
        <button
          key={`${gap.axis}:${index}:${gap.x}:${gap.y}`}
          aria-label={`Edit grid ${gap.axis} gap ${index + 1}`}
          className={[
            'figma-grid-gap',
            `figma-grid-gap--${gap.axis}`,
            !activeDragAxis && hoveredGapIndex !== index
              ? 'figma-grid-gap--empty'
              : '',
          ].filter(Boolean).join(' ')}
          data-dom-edit-grid-gap-index={index}
          style={createDomEditOverlayRectStyle(gap)}
          title="Grid gap"
          type="button"
          onPointerDown={(event) => startGapDrag(event, gap, index)}
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
  activeGap,
  hoveredTrackKeys,
  layout,
  showAllLines,
}: {
  activeGap: GridGapRect | null
  hoveredTrackKeys: string[]
  layout: DomEditGridTrackLayout
  showAllLines: boolean
}) {
  const hoveredTrackKeySet = new Set(hoveredTrackKeys)
  const tracks = [
    ...layout.columnTracks,
    ...layout.rowTracks,
  ]
  const hoveredTracks = tracks.filter((track) =>
    hoveredTrackKeySet.has(getDomEditGridTrackKey(track)))
  const visibleLineKeys = new Set(hoveredTracks.flatMap((track) => [
    `${track.axis}:${track.index + 1}`,
    `${track.axis}:${track.index + 2}`,
  ]))
  const allLines = [
    ...layout.columnLines,
    ...layout.rowLines,
  ]
  const closestGapLine = activeGap
    ? getDomEditClosestGridGapLine(activeGap, allLines)
    : null

  if (closestGapLine) {
    visibleLineKeys.add(
      `${closestGapLine.axis}:${closestGapLine.lineNumber}`,
    )
  }

  const lines = showAllLines
    ? allLines
    : allLines.filter((line) =>
    visibleLineKeys.has(`${line.axis}:${line.lineNumber}`))

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

function getDomEditClosestGridGapLine(
  gap: GridGapRect,
  lines: readonly DomEditGridLineGuide[],
) {
  const gapCenter = gap.axis === 'column'
    ? gap.x + gap.w / 2
    : gap.y + gap.h / 2

  return lines
    .filter((line) => line.axis === gap.axis)
    .reduce<DomEditGridLineGuide | null>((closest, line) => {
      if (!closest) {
        return line
      }

      return Math.abs(line.offset - gapCenter) <
        Math.abs(closest.offset - gapCenter)
        ? line
        : closest
    }, null)
}

function readDomEditGridGapIndex(target: HTMLElement | null | undefined) {
  const index = Number.parseInt(
    target?.dataset.domEditGridGapIndex ?? '',
    10,
  )

  return Number.isInteger(index) && index >= 0 ? index : null
}

function canTrackDomEditGridHover(
  affordanceState: DomEditAffordanceState,
  activeDragAxis: GridGapRect['axis'] | null,
) {
  return Boolean(activeDragAxis) ||
    affordanceState.mode === 'idle' ||
    (
      affordanceState.mode === 'hover-property' &&
      (
        affordanceState.property === 'gap' ||
        affordanceState.property === 'geometry'
      )
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
  spacingGridSize?: number,
) {
  return resolveDomEditSpacingDragValue(value, event, {
    gridSize: spacingGridSize,
  })
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
