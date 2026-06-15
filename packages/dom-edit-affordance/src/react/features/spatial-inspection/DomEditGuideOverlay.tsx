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
  getDomEditOverlayLayerVisibility,
  type DomEditOverlayLayerVisibility,
} from '../../../features/node-selection/DomEditOverlayLayers'
import {
  areDomEditOverlayRectsEqual,
  createDomEditOverlayRectStyle,
  getDomEditWorldOverlayRect,
  measureDomEditNodeOverlayRect,
  type DomEditOverlayRect,
  type DomEditScaledOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import type {
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'
import {
  getDomEditSmartGuides,
  type DomEditSmartGuide,
  type DomEditSmartGuideCandidate,
} from './DomEditSmartGuides'
import {
  getDomEditFrameGuideGeometry,
  type DomEditFrameGuideConfig,
  type DomEditFrameGuideDistance,
  type DomEditFrameGuideLine,
  type DomEditFrameLayoutColumn,
} from './DomEditFrameGuides'
import {
  getDomEditMeasurementDistances,
  type DomEditMeasurementDistance,
} from './DomEditMeasurementGeometry'

type GuideRect = DomEditScaledOverlayRect

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
  frameGuides,
  overlayLayers,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  affordanceState?: DomEditAffordanceState
  frameGuides?: DomEditFrameGuideConfig<TNodeId> | null
  overlayLayers?: Partial<DomEditOverlayLayerVisibility> | null
  rect: GuideRect
  selectedNodeId: TNodeId
  shellRef: RefObject<HTMLElement | null>
  state: TState
  viewport: DomEditViewport
}) {
  const [frameRect, setFrameRect] = useState<GuideRect | null>(null)
  const [parentRect, setParentRect] = useState<GuideRect | null>(null)
  const [siblingRects, setSiblingRects] =
    useState<DomEditSmartGuideCandidate[]>([])
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
  const layerVisibility = getDomEditOverlayLayerVisibility(overlayLayers)
  const activeHoveredRect = visibility.measurements && hoveredNodeId
    ? hoveredRect
    : null
  const measurementRect = activeHoveredRect ?? parentRect
  const distances = measurementRect && layerVisibility.spacing
    ? getDomEditMeasurementDistances(rect, measurementRect)
    : []
  const shouldRenderSmartGuides = layerVisibility.spacing &&
    shouldRenderDomEditSmartGuides(affordanceState)
  const activeSiblingRects = parentId ? siblingRects : []
  const smartGuides = shouldRenderSmartGuides
    ? getDomEditSmartGuides({
        isDragging: isDomEditSmartGuideDragging(affordanceState),
        parent: parentRect,
        selected: rect,
        siblings: activeSiblingRects,
      })
    : []
  const frameGuideGeometry = layerVisibility.guides && frameGuides && frameRect
    ? getDomEditFrameGuideGeometry({
        frameRect,
        layoutColumns: frameGuides.layoutColumns,
        rulerGuides: frameGuides.rulerGuides,
        selectedRect: rect,
      })
    : null
  const shouldRenderFrameGuideDistances =
    layerVisibility.spacing &&
    shouldRenderDomEditFrameGuideDistances(affordanceState)

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

  useLayoutEffect(() => {
    const nextFrameRect = frameGuides
      ? measureDomEditNodeOverlayRect({
          adapter,
          nodeId: frameGuides.frameNodeId,
          shell: shellRef.current,
          state,
          viewport,
        })
      : null

    setFrameRect((current) =>
      areDomEditOverlayRectsEqual(current, nextFrameRect)
        ? current
        : nextFrameRect)
  }, [
    adapter,
    frameGuides,
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    selectedNodeId,
    shellRef,
    state,
    viewport,
  ])

  useLayoutEffect(() => {
    if (!shouldRenderSmartGuides || !parentId) {
      return
    }

    const nextSiblingRects = measureDomEditSiblingSmartGuideCandidates({
      adapter,
      parentId,
      selectedNodeId,
      shell: shellRef.current,
      viewport,
    })

    setSiblingRects((current) =>
      areDomEditSmartGuideCandidatesEqual(current, nextSiblingRects)
        ? current
        : nextSiblingRects)
  }, [
    adapter,
    parentId,
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    selectedNodeId,
    shellRef,
    shouldRenderSmartGuides,
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
      {frameGuideGeometry?.columns.map((column) => (
        <DomEditFrameLayoutColumnOverlay
          key={column.id}
          column={column}
        />
      ))}
      {frameGuideGeometry?.lines.map((guide) => (
        <DomEditFrameGuideLineOverlay
          key={guide.id}
          guide={guide}
        />
      ))}
      {shouldRenderFrameGuideDistances
        ? frameGuideGeometry?.distances.map((distance) => (
          <DomEditFrameGuideDistanceLine
            key={`${distance.guideId}:${distance.axis}:${distance.point}`}
            distance={distance}
          />
        ))
        : null}
      {smartGuides.map((guide, index) => (
        <DomEditSmartGuideLine
          key={`${guide.family}:${guide.axis}:${guide.coordinate}:${guide.from}:${guide.length}:${guide.source}:${guide.sourceId ?? 'parent'}:${index}`}
          guide={guide}
        />
      ))}
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

function measureDomEditSiblingSmartGuideCandidates<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  parentId,
  selectedNodeId,
  shell,
  viewport,
}: {
  adapter: Pick<
    DomEditModelAdapter<TNodeId, TState>,
    'getElement' | 'readNodeId'
  >
  parentId: TNodeId
  selectedNodeId: TNodeId
  shell: HTMLElement | null
  viewport: DomEditViewport
}): DomEditSmartGuideCandidate[] {
  const parentElement = adapter.getElement(parentId)

  if (!shell || !parentElement) {
    return []
  }

  const shellRect = shell.getBoundingClientRect()

  return Array.from(parentElement.children).flatMap((child) => {
    if (!(child instanceof HTMLElement)) {
      return []
    }

    const nodeId = adapter.readNodeId(child)

    if (!nodeId || nodeId === selectedNodeId) {
      return []
    }

    const rect = child.getBoundingClientRect()

    if (rect.width <= 0.5 || rect.height <= 0.5) {
      return []
    }

    return [{
      id: nodeId,
      rect: getDomEditWorldOverlayRect({
        elementRect: rect,
        shellRect,
        viewport,
      }),
      source: 'sibling',
    }]
  })
}

function areDomEditSmartGuideCandidatesEqual(
  current: readonly DomEditSmartGuideCandidate[],
  next: readonly DomEditSmartGuideCandidate[],
) {
  if (current.length !== next.length) {
    return false
  }

  return current.every((candidate, index) => {
    const nextCandidate = next[index]

    return Boolean(nextCandidate) &&
      candidate.id === nextCandidate.id &&
      candidate.source === nextCandidate.source &&
      areDomEditGuideRectsEqual(candidate.rect, nextCandidate.rect)
  })
}

function areDomEditGuideRectsEqual(
  current: DomEditOverlayRect,
  next: DomEditOverlayRect,
) {
  return current.h === next.h &&
    current.w === next.w &&
    current.x === next.x &&
    current.y === next.y
}

function shouldRenderDomEditSmartGuides(
  affordanceState: DomEditAffordanceState,
) {
  return affordanceState.mode === 'measure' ||
    affordanceState.mode === 'transform' ||
    (
      affordanceState.mode === 'drag-property' &&
      affordanceState.property === 'geometry'
    )
}

function isDomEditSmartGuideDragging(
  affordanceState: DomEditAffordanceState,
) {
  return affordanceState.mode === 'transform' ||
    (
      affordanceState.mode === 'drag-property' &&
      affordanceState.property === 'geometry'
    )
}

function shouldRenderDomEditFrameGuideDistances(
  affordanceState: DomEditAffordanceState,
) {
  return affordanceState.mode === 'idle' ||
    affordanceState.mode === 'measure' ||
    affordanceState.mode === 'transform'
}

function DomEditFrameLayoutColumnOverlay({
  column,
}: {
  column: DomEditFrameLayoutColumn
}) {
  return (
    <span
      className="figma-layout-guide-column"
      style={createDomEditOverlayRectStyle(column)}
    />
  )
}

function DomEditFrameGuideLineOverlay({
  guide,
}: {
  guide: DomEditFrameGuideLine
}) {
  const style: CSSProperties = guide.orientation === 'vertical'
    ? {
        height: guide.length,
        left: guide.x,
        top: guide.y,
      }
    : {
        left: guide.x,
        top: guide.y,
        width: guide.length,
      }

  return (
    <span
      className={[
        'figma-frame-guide',
        'figma-frame-guide--ruler',
        `figma-frame-guide--${guide.axis}`,
        `figma-frame-guide--${guide.orientation}`,
      ].join(' ')}
      style={style}
    />
  )
}

function DomEditFrameGuideDistanceLine({
  distance,
}: {
  distance: DomEditFrameGuideDistance
}) {
  const style: CSSProperties = distance.orientation === 'vertical'
    ? {
        height: distance.length,
        left: distance.coordinate,
        top: distance.from,
      }
    : {
        left: distance.from,
        top: distance.coordinate,
        width: distance.length,
      }

  return (
    <span
      className={[
        'figma-frame-guide-distance',
        `figma-frame-guide-distance--${distance.axis}`,
        `figma-frame-guide-distance--${distance.orientation}`,
      ].join(' ')}
      style={style}
    />
  )
}

function DomEditSmartGuideLine({
  guide,
}: {
  guide: DomEditSmartGuide
}) {
  const style: CSSProperties = guide.orientation === 'vertical'
    ? {
        height: guide.length,
        left: guide.coordinate,
        top: guide.from,
      }
    : {
        left: guide.from,
        top: guide.coordinate,
        width: guide.length,
      }

  return (
    <span
      className={[
        'figma-smart-guide',
        `figma-smart-guide--${guide.axis}`,
        `figma-smart-guide--${guide.orientation}`,
        `figma-smart-guide--${guide.family}`,
        `figma-smart-guide--${guide.pointKind}`,
        `figma-smart-guide--${guide.emphasis}`,
        `figma-smart-guide--${guide.source}`,
        guide.spacingKind
          ? `figma-smart-guide--${guide.spacingKind}`
          : '',
        guide.spacingSource
          ? `figma-smart-guide--${guide.spacingSource}`
          : '',
        guide.sourceId ? 'figma-smart-guide--with-source' : '',
      ].filter(Boolean).join(' ')}
      style={style}
    />
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
  adapter: Pick<
    DomEditModelAdapter<TNodeId, TState>,
    'getParentId' | 'readNodeId'
  >
  selectedNodeId: TNodeId
  target: Element | null
}): TNodeId | null {
  if (target?.closest('.figma-selection-layer')) {
    return null
  }

  const selectedParentId = adapter.getParentId(selectedNodeId)
  const nodePath: TNodeId[] = []
  let current: Element | null = target

  while (current) {
    if (current instanceof HTMLElement) {
      const nodeId = adapter.readNodeId(current)

      if (nodeId && nodeId !== selectedNodeId && !nodePath.includes(nodeId)) {
        nodePath.push(nodeId)
      }
    }

    current = current.parentElement
  }

  const siblingNodeId = selectedParentId
    ? nodePath.find((nodeId) => adapter.getParentId(nodeId) === selectedParentId)
    : null

  return siblingNodeId ?? nodePath[0] ?? null
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
  distance: DomEditMeasurementDistance
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
      className={[
        'figma-guide-distance',
        `figma-guide-distance--${distance.axis}`,
        `figma-guide-distance--${distance.kind}`,
      ].join(' ')}
      style={style}
    >
      <span>{Math.round(distance.length)} px</span>
    </div>
  )
}
