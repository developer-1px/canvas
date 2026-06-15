import {
  useEffect,
  useLayoutEffect,
  useState,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
} from 'react'
import {
  getDomEditOverlayVisibility,
  type DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
import {
  DOM_EDIT_PADDING_SIDE_FIELDS,
  getDomEditOppositePaddingSide,
  getDomEditPaddingScopeSides,
  getDomEditPaddingSides,
  getDomEditPaddingSummary,
  type DomEditPaddingSide,
  type DomEditPaddingSides,
} from '../../../features/box-editing/DomEditPadding'
import {
  resolveDomEditSpacingDragValue,
} from '../../../shared/gesture/DomEditOverlayGesture'
import type {
  DomEditAutoLayoutField,
  DomEditField,
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditNodeState,
  DomEditState,
  DomEditViewport,
} from '../../../shared/model/DomEditTypes'
import {
  getDomEditGapRectValue,
  getDomEditPaddingCornerRects,
  getDomEditPaddingDelta,
  getDomEditPaddingDragActiveSides,
  getDomEditPaddingDragSide,
  getDomEditPaddingDragScope,
  getDomEditPaddingLabelPosition,
  getDomEditPaddingOverlayRects,
  measureDomEditAutoLayoutGapRects,
  type DomEditAutoLayoutDragKind,
  type DomEditAutoLayoutPaddingCornerDragKind,
  type DomEditAutoLayoutPaddingDragKind,
  type DomEditAutoLayoutRect,
} from './DomEditAutoLayoutGeometry'
import {
  DomEditSizeModeCapsule,
  shouldRenderDomEditSizeModeCapsule,
} from './DomEditSizeModeCapsule'

type AutoLayoutAffordanceMode = 'gap' | 'padding'

const DOM_EDIT_PADDING_SIDE_HANDLES = [
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
] satisfies DomEditAutoLayoutPaddingDragKind[]

const DOM_EDIT_PADDING_CORNER_HANDLES = [
  {
    kind: 'padding-corner-top-left',
    label: 'Edit all padding',
  },
  {
    kind: 'padding-corner-top-right',
    label: 'Edit all padding',
  },
  {
    kind: 'padding-corner-bottom-right',
    label: 'Edit all padding',
  },
  {
    kind: 'padding-corner-bottom-left',
    label: 'Edit all padding',
  },
] satisfies Array<{
  kind: DomEditAutoLayoutPaddingCornerDragKind
  label: string
}>

const DOM_EDIT_PADDING_DRAG_KINDS = new Set<string>([
  ...DOM_EDIT_PADDING_SIDE_HANDLES,
  ...DOM_EDIT_PADDING_CORNER_HANDLES.map((handle) => handle.kind),
])

export function DomEditAutoLayoutOverlay<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  rect,
  shellRef,
  state,
  target,
  viewport,
  selectedNodeId,
  affordanceState: baseAffordanceState,
  onChange,
  onChangeAutoLayout,
  onAffordanceStateChange,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  affordanceState: DomEditAffordanceState
  rect: DomEditAutoLayoutRect & { scale: number }
  shellRef: RefObject<HTMLElement | null>
  state: TState
  target: HTMLElement
  viewport: DomEditViewport
  selectedNodeId: TNodeId
  onChange: (
    nodeId: TNodeId,
    field: DomEditField,
    value: number,
  ) => void
  onChangeAutoLayout: (
    nodeId: TNodeId,
    field: DomEditAutoLayoutField,
    value: DomEditNodeState[DomEditAutoLayoutField],
  ) => void
  onAffordanceStateChange: (state: DomEditAffordanceState) => void
}) {
  const [activeDragKind, setActiveDragKind] =
    useState<DomEditAutoLayoutDragKind | null>(null)
  const [gapRects, setGapRects] = useState<DomEditAutoLayoutRect[]>([])
  const [hoveredAffordance, setHoveredAffordance] =
    useState<AutoLayoutAffordanceMode | null>(null)
  const [hoveredPaddingKind, setHoveredPaddingKind] =
    useState<DomEditAutoLayoutPaddingDragKind | null>(null)
  const [pinnedPaddingSide, setPinnedPaddingSide] =
    useState<DomEditPaddingSide | null>(null)
  const style = adapter.getStyle(state, selectedNodeId)
  const context = adapter.getLayoutContext(selectedNodeId)
  const isBetweenDistribution = style.distribution === 'space-between'

  useEffect(() => {
    setHoveredAffordance(null)
    setHoveredPaddingKind(null)
    setPinnedPaddingSide(null)
  }, [selectedNodeId])

  useLayoutEffect(() => {
    if (!context.showSelfLayout) {
      const frame = requestAnimationFrame(() => {
        setGapRects([])
      })

      return () => cancelAnimationFrame(frame)
    }

    let frame = 0
    const measure = () => {
      setGapRects(measureDomEditAutoLayoutGapRects({
        direction: style.direction,
        shell: shellRef.current,
        target,
        viewport,
      }))
    }

    frame = requestAnimationFrame(measure)

    return () => cancelAnimationFrame(frame)
  }, [
    context.showSelfLayout,
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    shellRef,
    style.direction,
    state,
    target,
    viewport,
  ])

  useEffect(() => {
    if (!context.showSelfLayout && !context.showGridLayout) {
      return undefined
    }

    const trackAutoLayoutAffordance = (event: globalThis.PointerEvent) => {
      if (activeDragKind) {
        return
      }

      const hoveredTarget = document.elementFromPoint(event.clientX, event.clientY)
      const paddingKind = readDomEditPaddingDragKind(hoveredTarget)
      const nextAffordance = hoveredTarget?.closest('.figma-autolayout-gap')
        ? 'gap'
        : paddingKind
          ? 'padding'
          : null

      setHoveredPaddingKind((current) =>
        current === paddingKind ? current : paddingKind)
      setHoveredAffordance((current) =>
        current === nextAffordance ? current : nextAffordance)
    }

    window.addEventListener('pointermove', trackAutoLayoutAffordance)

    return () => {
      window.removeEventListener('pointermove', trackAutoLayoutAffordance)
    }
  }, [activeDragKind, context.showGridLayout, context.showSelfLayout])

  if (
    !context.showSelfLayout &&
    !context.showGridLayout &&
    !context.showParentParticipation
  ) {
    return null
  }

  const canEditBoxSpacing = context.showSelfLayout || context.showGridLayout
  const padding = getDomEditPaddingSides(style)
  const paddingRects = getDomEditPaddingOverlayRects({
    padding,
    rect,
  })
  const paddingCornerRects = getDomEditPaddingCornerRects({ rect })
  const paddingLabelPosition = getDomEditPaddingLabelPosition({
    padding,
    rect,
  })
  const activeGapRect = gapRects[Math.max(0, Math.floor(gapRects.length / 2))]
  const activePaddingKind = activeDragKind && activeDragKind !== 'gap'
    ? activeDragKind
    : hoveredPaddingKind
  const activePaddingSides = activePaddingKind
    ? getDomEditPaddingDragActiveSides(activePaddingKind, {
      pinnedSide: pinnedPaddingSide,
    })
    : pinnedPaddingSide
      ? [pinnedPaddingSide]
      : []
  const activeAffordance = activeDragKind === 'gap'
    ? 'gap'
    : activeDragKind
      ? 'padding'
      : pinnedPaddingSide
        ? 'padding'
        : hoveredAffordance
  const affordanceState = getDomEditAutoLayoutAffordanceState({
    activeAffordance,
    activeDragKind,
    baseAffordanceState,
  })
  const visibility = getDomEditOverlayVisibility({
    affordanceState,
    context,
  })
  const shouldRenderPadding = visibility.paddingHitTargets
  const shouldRenderGap = visibility.gapHitTargets
  const startDrag = (
    event: PointerEvent<HTMLElement>,
    kind: DomEditAutoLayoutDragKind,
  ) => {
    const start = {
      clientX: event.clientX,
      clientY: event.clientY,
      gap: style.gap,
      padding,
    }
    const pointerId = event.pointerId
    const source = event.currentTarget
    let didMove = false

    source.setPointerCapture(pointerId)
    setActiveDragKind(kind)
    setHoveredAffordance(kind === 'gap' ? 'gap' : 'padding')
    setHoveredPaddingKind(kind === 'gap' ? null : kind)
    onAffordanceStateChange({
      mode: 'drag-property',
      property: kind === 'gap' ? 'gap' : 'padding',
    })
    event.preventDefault()
    event.stopPropagation()

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const dx = (moveEvent.clientX - start.clientX) / rect.scale
      const dy = (moveEvent.clientY - start.clientY) / rect.scale
      const moveDistance = Math.hypot(
        moveEvent.clientX - start.clientX,
        moveEvent.clientY - start.clientY,
      )

      if (moveDistance <= 3) {
        return
      }

      didMove = true

      if (kind === 'gap') {
        const delta = style.direction === 'row' ? dx : dy
        onChange(
          selectedNodeId,
          'gap',
          resolveDomEditSpacingDragValue(start.gap + delta, moveEvent),
        )
        return
      }

      const delta = getDomEditPaddingDelta(kind, dx, dy)
      const scope = getDomEditPaddingDragScope(kind, {
        pinnedSide: pinnedPaddingSide,
      })
      const sides = getDomEditPaddingScopeSides(scope)

      if (scope === 'all') {
        onChange(
          selectedNodeId,
          'padding',
          resolveDomEditSpacingDragValue(start.padding.top + delta, moveEvent),
        )
      }

      for (const side of sides) {
        onChange(
          selectedNodeId,
          DOM_EDIT_PADDING_SIDE_FIELDS[side],
          resolveDomEditSpacingDragValue(start.padding[side] + delta, moveEvent),
        )
      }
    }
    const handleEnd = () => {
      if (source.hasPointerCapture(pointerId)) {
        source.releasePointerCapture(pointerId)
      }
      if (!didMove && kind !== 'gap') {
        const side = getDomEditPaddingDragSide(kind)

        if (side) {
          setPinnedPaddingSide((current) => current === side ? null : side)
        } else {
          setPinnedPaddingSide(null)
        }
      }
      setActiveDragKind(null)
      setHoveredAffordance(null)
      setHoveredPaddingKind(null)
      onAffordanceStateChange({ mode: 'idle' })
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointercancel', handleEnd)
      window.removeEventListener('pointerup', handleEnd)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointercancel', handleEnd, { once: true })
    window.addEventListener('pointerup', handleEnd, { once: true })
  }
  const matchOppositePaddingSide = (
    event: MouseEvent<HTMLElement>,
    side: DomEditPaddingSide,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const oppositeSide = getDomEditOppositePaddingSide(side)

    onChange(
      selectedNodeId,
      DOM_EDIT_PADDING_SIDE_FIELDS[side],
      padding[oppositeSide],
    )
    setPinnedPaddingSide(null)
    setHoveredAffordance('padding')
  }

  return (
    <>
      {canEditBoxSpacing ? (
        <>
          {shouldRenderPadding ? (
            <>
              <div
                className="figma-autolayout-box"
                style={{
                  height: rect.h,
                  left: rect.x,
                  top: rect.y,
                  width: rect.w,
                }}
              >
                <button
                  aria-label="Edit vertical padding"
                  className={getDomEditPaddingClassName({
                    activeSides: activePaddingSides,
                    isVisible: visibility.paddingVisuals,
                    padding: padding.top,
                    pinnedSide: pinnedPaddingSide,
                    side: 'top',
                  })}
                  aria-pressed={pinnedPaddingSide === 'top'}
                  data-dom-edit-padding-kind="padding-top"
                  style={paddingRects['padding-top']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => {
                    setHoveredAffordance('padding')
                    setHoveredPaddingKind('padding-top')
                  }}
                  onPointerLeave={() => {
                    setHoveredAffordance(null)
                    setHoveredPaddingKind(null)
                  }}
                  onDoubleClick={(event) =>
                    matchOppositePaddingSide(event, 'top')}
                  onPointerDown={(event) => startDrag(event, 'padding-top')}
                />
                <button
                  aria-label="Edit horizontal padding"
                  className={getDomEditPaddingClassName({
                    activeSides: activePaddingSides,
                    isVisible: visibility.paddingVisuals,
                    padding: padding.right,
                    pinnedSide: pinnedPaddingSide,
                    side: 'right',
                  })}
                  aria-pressed={pinnedPaddingSide === 'right'}
                  data-dom-edit-padding-kind="padding-right"
                  style={paddingRects['padding-right']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => {
                    setHoveredAffordance('padding')
                    setHoveredPaddingKind('padding-right')
                  }}
                  onPointerLeave={() => {
                    setHoveredAffordance(null)
                    setHoveredPaddingKind(null)
                  }}
                  onDoubleClick={(event) =>
                    matchOppositePaddingSide(event, 'right')}
                  onPointerDown={(event) => startDrag(event, 'padding-right')}
                />
                <button
                  aria-label="Edit vertical padding"
                  className={getDomEditPaddingClassName({
                    activeSides: activePaddingSides,
                    isVisible: visibility.paddingVisuals,
                    padding: padding.bottom,
                    pinnedSide: pinnedPaddingSide,
                    side: 'bottom',
                  })}
                  aria-pressed={pinnedPaddingSide === 'bottom'}
                  data-dom-edit-padding-kind="padding-bottom"
                  style={paddingRects['padding-bottom']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => {
                    setHoveredAffordance('padding')
                    setHoveredPaddingKind('padding-bottom')
                  }}
                  onPointerLeave={() => {
                    setHoveredAffordance(null)
                    setHoveredPaddingKind(null)
                  }}
                  onDoubleClick={(event) =>
                    matchOppositePaddingSide(event, 'bottom')}
                  onPointerDown={(event) => startDrag(event, 'padding-bottom')}
                />
                <button
                  aria-label="Edit horizontal padding"
                  className={getDomEditPaddingClassName({
                    activeSides: activePaddingSides,
                    isVisible: visibility.paddingVisuals,
                    padding: padding.left,
                    pinnedSide: pinnedPaddingSide,
                    side: 'left',
                  })}
                  aria-pressed={pinnedPaddingSide === 'left'}
                  data-dom-edit-padding-kind="padding-left"
                  style={paddingRects['padding-left']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => {
                    setHoveredAffordance('padding')
                    setHoveredPaddingKind('padding-left')
                  }}
                  onPointerLeave={() => {
                    setHoveredAffordance(null)
                    setHoveredPaddingKind(null)
                  }}
                  onDoubleClick={(event) =>
                    matchOppositePaddingSide(event, 'left')}
                  onPointerDown={(event) => startDrag(event, 'padding-left')}
                />
                {DOM_EDIT_PADDING_CORNER_HANDLES.map((corner) => (
                  <button
                    key={corner.kind}
                    aria-label={corner.label}
                    className={getDomEditPaddingCornerClassName({
                      activeSides: activePaddingSides,
                      corner: corner.kind,
                      isVisible: visibility.paddingVisuals,
                      padding,
                    })}
                    data-dom-edit-padding-kind={corner.kind}
                    style={paddingCornerRects[corner.kind]}
                    title="Padding"
                    type="button"
                    onPointerEnter={() => {
                      setHoveredAffordance('padding')
                      setHoveredPaddingKind(corner.kind)
                    }}
                    onPointerLeave={() => {
                      setHoveredAffordance(null)
                      setHoveredPaddingKind(null)
                    }}
                    onPointerDown={(event) => startDrag(event, corner.kind)}
                  />
                ))}
              </div>
              {visibility.paddingVisuals ? (
                <span
                  className="figma-autolayout-value figma-autolayout-value--padding"
                  style={{
                    left: paddingLabelPosition.x,
                    top: paddingLabelPosition.y,
                  }}
                >
                  Pad {getDomEditPaddingSummary(padding)}
                </span>
              ) : null}
            </>
          ) : null}
          {context.showSelfLayout && shouldRenderGap ? (
            <>
              {gapRects.map((gapRect, index) => (
                <button
                  key={`${index}:${gapRect.x}:${gapRect.y}`}
                  aria-label={
                    isBetweenDistribution
                      ? `Between space ${index + 1}`
                      : `Edit gap ${index + 1}`
                  }
                  className={getDomEditGapClassName({
                    direction: style.direction,
                    isBetween: isBetweenDistribution,
                    isVisible: visibility.gapVisuals,
                  })}
                  style={{
                    height: gapRect.h,
                    left: gapRect.x,
                    top: gapRect.y,
                    width: gapRect.w,
                  }}
                  title={isBetweenDistribution ? 'Between' : 'Gap'}
                  type="button"
                  onPointerEnter={() => setHoveredAffordance('gap')}
                  onPointerLeave={() => setHoveredAffordance(null)}
                  onPointerDown={(event) => {
                    if (isBetweenDistribution) {
                      event.preventDefault()
                      event.stopPropagation()
                      return
                    }

                    startDrag(event, 'gap')
                  }}
                />
              ))}
              {visibility.gapVisuals && activeGapRect ? (
                <span
                  className={[
                    'figma-autolayout-value',
                    'figma-autolayout-value--gap',
                    isBetweenDistribution
                      ? 'figma-autolayout-value--between'
                      : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    left: activeGapRect.x + activeGapRect.w / 2,
                    top: activeGapRect.y + activeGapRect.h / 2,
                  }}
                >
                  {isBetweenDistribution
                    ? `Between ${getDomEditGapRectValue({
                      direction: style.direction,
                      rect: activeGapRect,
                    })}`
                    : `Gap ${style.gap}`}
                </span>
              ) : null}
            </>
          ) : null}
          {visibility.gapVisuals ? (
            <div
              className="figma-autolayout-toolbar"
              style={{
                left: rect.x + rect.w / 2,
                top: rect.y + rect.h + 12,
              }}
            >
              <button
                aria-label="Horizontal auto layout"
                aria-pressed={style.direction === 'row'}
                type="button"
                onClick={() => onChangeAutoLayout(selectedNodeId, 'direction', 'row')}
              >
                H
              </button>
              <button
                aria-label="Vertical auto layout"
                aria-pressed={style.direction === 'column'}
                type="button"
                onClick={() => onChangeAutoLayout(selectedNodeId, 'direction', 'column')}
              >
                V
              </button>
            </div>
          ) : null}
        </>
      ) : null}
      {shouldRenderDomEditSizeModeCapsule({
        affordanceState: baseAffordanceState,
        context,
        isDragging: Boolean(activeDragKind),
      }) ? (
        <DomEditSizeModeCapsule
          heightMode={style.heightMode}
          heightValue={rect.h}
          rect={rect}
          showFill={context.showParentParticipation}
          widthMode={style.widthMode}
          widthValue={rect.w}
          onAffordanceStateChange={onAffordanceStateChange}
          onChangeHeight={(mode) =>
            onChangeAutoLayout(selectedNodeId, 'heightMode', mode)}
          onChangeWidth={(mode) =>
            onChangeAutoLayout(selectedNodeId, 'widthMode', mode)}
        />
      ) : null}
    </>
  )
}

function getDomEditAutoLayoutAffordanceState({
  activeAffordance,
  activeDragKind,
  baseAffordanceState,
}: {
  activeAffordance: AutoLayoutAffordanceMode | null
  activeDragKind: DomEditAutoLayoutDragKind | null
  baseAffordanceState: DomEditAffordanceState
}): DomEditAffordanceState {
  if (activeDragKind === 'gap') {
    return { mode: 'drag-property', property: 'gap' }
  }

  if (activeDragKind) {
    return { mode: 'drag-property', property: 'padding' }
  }

  if (activeAffordance === 'gap') {
    return { mode: 'hover-property', property: 'gap' }
  }

  if (activeAffordance === 'padding') {
    return { mode: 'hover-property', property: 'padding' }
  }

  return baseAffordanceState
}

function getDomEditPaddingClassName({
  activeSides,
  isVisible,
  padding,
  pinnedSide,
  side,
}: {
  activeSides: readonly DomEditPaddingSide[]
  isVisible: boolean
  padding: number
  pinnedSide: DomEditPaddingSide | null
  side: DomEditPaddingSide
}) {
  const isActive = activeSides.includes(side)
  const hasActiveGroup = activeSides.length > 0

  return [
    'figma-autolayout-padding',
    `figma-autolayout-padding--${side}`,
    isActive ? 'figma-autolayout-padding--active' : '',
    hasActiveGroup && !isActive ? 'figma-autolayout-padding--muted' : '',
    pinnedSide === side ? 'figma-autolayout-padding--pinned' : '',
    (padding <= 0 && !isActive) || !isVisible
      ? 'figma-autolayout-padding--empty'
      : '',
  ].filter(Boolean).join(' ')
}

function getDomEditPaddingCornerClassName({
  activeSides,
  corner,
  isVisible,
  padding,
}: {
  activeSides: readonly DomEditPaddingSide[]
  corner: DomEditAutoLayoutPaddingCornerDragKind
  isVisible: boolean
  padding: DomEditPaddingSides
}) {
  const hasPadding = padding.bottom > 0 ||
    padding.left > 0 ||
    padding.right > 0 ||
    padding.top > 0
  const isActive = activeSides.length === 4
  const hasActiveGroup = activeSides.length > 0

  return [
    'figma-autolayout-padding',
    'figma-autolayout-padding-corner',
    `figma-autolayout-padding-corner--${corner.replace('padding-corner-', '')}`,
    isActive ? 'figma-autolayout-padding--active' : '',
    hasActiveGroup && !isActive ? 'figma-autolayout-padding--muted' : '',
    (!hasPadding && !isActive) || !isVisible
      ? 'figma-autolayout-padding--empty'
      : '',
  ].filter(Boolean).join(' ')
}

function readDomEditPaddingDragKind(
  target: Element | null,
): DomEditAutoLayoutPaddingDragKind | null {
  const paddingTarget = target?.closest('[data-dom-edit-padding-kind]')
  const kind = paddingTarget instanceof HTMLElement
    ? paddingTarget.dataset.domEditPaddingKind
    : null

  return kind && DOM_EDIT_PADDING_DRAG_KINDS.has(kind)
    ? kind as DomEditAutoLayoutPaddingDragKind
    : null
}

function getDomEditGapClassName({
  direction,
  isBetween,
  isVisible,
}: {
  direction: DomEditNodeState['direction']
  isBetween: boolean
  isVisible: boolean
}) {
  return [
    'figma-autolayout-gap',
    `figma-autolayout-gap--${direction}`,
    isBetween ? 'figma-autolayout-gap--between' : '',
    !isVisible ? 'figma-autolayout-gap--empty' : '',
  ].filter(Boolean).join(' ')
}
