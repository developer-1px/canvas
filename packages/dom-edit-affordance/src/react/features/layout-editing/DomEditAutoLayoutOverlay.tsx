import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  type RefObject,
  type SetStateAction,
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
import {
  getDomEditFlexParticipationDescriptor,
  type DomEditFlexParticipationDescriptor,
} from '../../../features/size-editing/DomEditFlexParticipation'
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
  getDomEditMainAxisGuideRect,
  getDomEditPaddingCornerRects,
  getDomEditPaddingDelta,
  getDomEditPaddingDragActiveSides,
  getDomEditPaddingDragSide,
  getDomEditPaddingDragScope,
  getDomEditPaddingLabelPosition,
  getDomEditPaddingOverlayRects,
  measureDomEditAutoLayoutGapRects,
  measureDomEditAutoLayoutWorldRect,
  type DomEditAutoLayoutDragKind,
  type DomEditAutoLayoutPaddingCornerDragKind,
  type DomEditAutoLayoutPaddingDragKind,
  type DomEditAutoLayoutRect,
} from './DomEditAutoLayoutGeometry'
import {
  getDomEditFlexWrapLayout,
  type DomEditFlexWrapLayout,
} from './DomEditFlexWrapGeometry'
import {
  DomEditSizeModeCapsule,
} from './DomEditSizeModeCapsule'
import {
  DomEditAlignmentEditor,
  type DomEditAlignmentPreview,
} from './DomEditAlignmentEditor'

type AutoLayoutAffordanceMode = 'gap' | 'padding'

type DomEditAutoLayoutOverlayTransientState<
  TNodeId extends DomEditNodeId,
> = {
  alignmentPreview: DomEditAlignmentPreview | null
  hoveredAffordance: AutoLayoutAffordanceMode | null
  hoveredPaddingKind: DomEditAutoLayoutPaddingDragKind | null
  isAlignmentEditorOpen: boolean
  pinnedPaddingSide: DomEditPaddingSide | null
  selectedNodeId: TNodeId
}

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
  const [flexWrapLayout, setFlexWrapLayout] =
    useState<DomEditFlexWrapLayout | null>(null)
  const [gapRects, setGapRects] = useState<DomEditAutoLayoutRect[]>([])
  const [transientState, setTransientState] = useState(() =>
    createDomEditAutoLayoutOverlayTransientState(selectedNodeId))
  const scopedTransientState =
    transientState.selectedNodeId === selectedNodeId
      ? transientState
      : createDomEditAutoLayoutOverlayTransientState(selectedNodeId)
  const {
    alignmentPreview,
    hoveredAffordance,
    hoveredPaddingKind,
    isAlignmentEditorOpen,
    pinnedPaddingSide,
  } = scopedTransientState
  const style = adapter.getStyle(state, selectedNodeId)
  const context = adapter.getLayoutContext(selectedNodeId)
  const parentStyle = context.parentId
    ? adapter.getStyle(state, context.parentId)
    : null
  const flexParticipation = getDomEditFlexParticipationDescriptor({
    heightMode: style.heightMode,
    parentDirection: parentStyle?.direction ?? null,
    parentDisplay: context.parentDisplay,
    widthMode: style.widthMode,
  })
  const isBetweenDistribution = style.distribution === 'space-between'
  const updateTransientState = useCallback((
    update: (
      current: DomEditAutoLayoutOverlayTransientState<TNodeId>,
    ) => DomEditAutoLayoutOverlayTransientState<TNodeId>,
  ) => {
    setTransientState((current) => {
      const scopedCurrent = current.selectedNodeId === selectedNodeId
        ? current
        : createDomEditAutoLayoutOverlayTransientState(selectedNodeId)

      return update(scopedCurrent)
    })
  }, [selectedNodeId])
  const setHoveredAffordance = useCallback((
    action: SetStateAction<AutoLayoutAffordanceMode | null>,
  ) => {
    updateTransientState((current) => {
      const next = resolveDomEditStateAction(current.hoveredAffordance, action)

      return next === current.hoveredAffordance
        ? current
        : { ...current, hoveredAffordance: next }
    })
  }, [updateTransientState])
  const setHoveredPaddingKind = useCallback((
    action: SetStateAction<DomEditAutoLayoutPaddingDragKind | null>,
  ) => {
    updateTransientState((current) => {
      const next = resolveDomEditStateAction(current.hoveredPaddingKind, action)

      return next === current.hoveredPaddingKind
        ? current
        : { ...current, hoveredPaddingKind: next }
    })
  }, [updateTransientState])
  const setPinnedPaddingSide = useCallback((
    action: SetStateAction<DomEditPaddingSide | null>,
  ) => {
    updateTransientState((current) => {
      const next = resolveDomEditStateAction(current.pinnedPaddingSide, action)

      return next === current.pinnedPaddingSide
        ? current
        : { ...current, pinnedPaddingSide: next }
    })
  }, [updateTransientState])
  const setIsAlignmentEditorOpen = useCallback((
    action: SetStateAction<boolean>,
  ) => {
    updateTransientState((current) => {
      const next = resolveDomEditStateAction(
        current.isAlignmentEditorOpen,
        action,
      )

      return next === current.isAlignmentEditorOpen
        ? current
        : { ...current, isAlignmentEditorOpen: next }
    })
  }, [updateTransientState])
  const setAlignmentPreview = useCallback((
    action: SetStateAction<DomEditAlignmentPreview | null>,
  ) => {
    updateTransientState((current) => {
      const next = resolveDomEditStateAction(current.alignmentPreview, action)

      return next === current.alignmentPreview
        ? current
        : { ...current, alignmentPreview: next }
    })
  }, [updateTransientState])
  const alignmentEditorControlId = useId()
  const alignmentEditorTriggerId = `${alignmentEditorControlId}-trigger`
  const alignmentEditorPanelId = `${alignmentEditorControlId}-panel`
  const previewAlignment = useCallback((
    preview: DomEditAlignmentPreview | null,
  ) => {
    setAlignmentPreview(preview)
    onAffordanceStateChange(preview
      ? { mode: 'hover-property', property: 'align' }
      : { mode: 'idle' })
  }, [onAffordanceStateChange, setAlignmentPreview])

  useLayoutEffect(() => {
    if (!context.showSelfLayout) {
      const frame = requestAnimationFrame(() => {
        setFlexWrapLayout(null)
        setGapRects([])
      })

      return () => cancelAnimationFrame(frame)
    }

    let frame = 0
    const measure = () => {
      setFlexWrapLayout(measureDomEditFlexWrapLayout({
        direction: style.direction,
        gap: style.gap,
        shell: shellRef.current,
        target,
        viewport,
      }))
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
    style.gap,
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
  }, [
    activeDragKind,
    context.showGridLayout,
    context.showSelfLayout,
    setHoveredAffordance,
    setHoveredPaddingKind,
  ])

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
  const activeFlexWrapLayout = context.showSelfLayout &&
    visibility.gapHitTargets
    ? flexWrapLayout
    : null
  const shouldRenderPadding = visibility.paddingHitTargets
  const shouldRenderGap = visibility.gapHitTargets
  const showGapVisuals = visibility.gapVisuals || isBetweenDistribution
  const visibleGapLabelRects = showGapVisuals
    ? isBetweenDistribution
      ? gapRects
      : activeGapRect
        ? [activeGapRect]
        : []
    : []
  const alignGuideValue = alignmentPreview?.align ??
    (style.align === 'auto' ? null : style.align)
  const shouldRenderAlignmentEditor =
    context.showSelfLayout || context.showGridLayout
  const shouldRenderAlignGuide = visibility.alignGuides &&
    Boolean(alignGuideValue)
  const mainAxisGuideRect = visibility.axisGuides
    ? getDomEditMainAxisGuideRect({
      direction: style.direction,
      padding,
      rect,
    })
    : null
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
          {shouldRenderAlignGuide && alignGuideValue ? (
            <DomEditAlignItemsGuide
              align={alignGuideValue}
              isPreview={Boolean(alignmentPreview)}
              rect={rect}
              style={style}
            />
          ) : null}
          {mainAxisGuideRect ? (
            <DomEditMainAxisGuide
              direction={style.direction}
              rect={mainAxisGuideRect}
            />
          ) : null}
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
              {activeFlexWrapLayout ? (
                <DomEditFlexWrapGuides layout={activeFlexWrapLayout} />
              ) : null}
              {gapRects.map((gapRect, index) => (
                <button
                  key={`${index}:${gapRect.x}:${gapRect.y}`}
                  aria-label={
                    isBetweenDistribution
                      ? `Between space ${index + 1}, ${getDomEditGapRectValue({
                        direction: style.direction,
                        rect: gapRect,
                      })}px actual`
                      : `Edit gap ${index + 1}`
                  }
                  className={getDomEditGapClassName({
                    direction: style.direction,
                    isBetween: isBetweenDistribution,
                    isVisible: showGapVisuals,
                  })}
                  data-dom-edit-between-lane={
                    isBetweenDistribution ? `${index + 1}` : undefined
                  }
                  style={{
                    height: gapRect.h,
                    left: gapRect.x,
                    top: gapRect.y,
                    width: gapRect.w,
                  }}
                  title={isBetweenDistribution ? 'Between auto spacing' : 'Gap'}
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
                >
                  {isBetweenDistribution && showGapVisuals ? (
                    <span
                      aria-hidden="true"
                      className="figma-autolayout-between-mark"
                      data-dom-edit-between-mark="true"
                    >
                      <span className="figma-autolayout-between-rail" />
                      <span className="figma-autolayout-between-tick figma-autolayout-between-tick--start" />
                      <span className="figma-autolayout-between-tick figma-autolayout-between-tick--end" />
                    </span>
                  ) : null}
                </button>
              ))}
              {visibleGapLabelRects.map((gapRect, index) => (
                <span
                  key={`gap-label:${index}:${gapRect.x}:${gapRect.y}`}
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
                      rect: gapRect,
                    })}px actual`
                    : `Gap ${style.gap}`}
                </span>
              ))}
            </>
          ) : null}
          {shouldRenderAlignmentEditor ? (
            <>
              <button
                id={alignmentEditorTriggerId}
                aria-controls={alignmentEditorPanelId}
                aria-expanded={isAlignmentEditorOpen}
                aria-label="Alignment editor"
                className="figma-alignment-editor-trigger"
                style={{
                  left: rect.x + rect.w + 8,
                  top: rect.y,
                }}
                type="button"
                onClick={() => setIsAlignmentEditorOpen((current) => !current)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape' && isAlignmentEditorOpen) {
                    event.preventDefault()
                    event.stopPropagation()
                    setIsAlignmentEditorOpen(false)
                    setAlignmentPreview(null)
                  }
                }}
              >
                Align
              </button>
              <div
                className="figma-alignment-popover-anchor"
                style={{
                  left: rect.x + rect.w + 8,
                  top: rect.y + 30,
                }}
              >
                <DomEditAlignmentEditor
                  id={alignmentEditorPanelId}
                  context={context}
                  isOpen={isAlignmentEditorOpen}
                  labelledBy={alignmentEditorTriggerId}
                  selectedNodeId={selectedNodeId}
                  style={style}
                  onChangeAutoLayout={onChangeAutoLayout}
                  onClose={() => {
                    setIsAlignmentEditorOpen(false)
                    previewAlignment(null)
                  }}
                  onPreview={previewAlignment}
                />
              </div>
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
      {visibility.sizeModes && !activeDragKind ? (
        <>
          <DomEditSizeModeCapsule
            heightMode={style.heightMode}
            heightValue={rect.h}
            parentDisplay={context.parentDisplay}
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
          {flexParticipation ? (
            <DomEditFlexParticipationGlyph
              descriptor={flexParticipation}
              rect={rect}
            />
          ) : null}
        </>
      ) : null}
    </>
  )
}

function DomEditFlexWrapGuides({
  layout,
}: {
  layout: DomEditFlexWrapLayout
}) {
  return (
    <>
      {layout.lines.map((line) => (
        <span
          key={`line:${line.index}`}
          aria-hidden="true"
          className="figma-flex-wrap-line"
          data-flex-wrap-line={line.index + 1}
          style={{
            height: line.h,
            left: line.x,
            top: line.y,
            width: line.w,
          }}
        />
      ))}
      {layout.lines.map((line) => (
        <span
          key={`line-label:${line.index}`}
          className="figma-flex-wrap-line-label"
          data-flex-wrap-line-label={line.index + 1}
          style={{
            left: line.labelX,
            top: line.labelY,
          }}
        >
          line {line.index + 1}
        </span>
      ))}
      {layout.gaps.map((gap) => (
        <span
          key={`gap:${gap.index}`}
          aria-hidden="true"
          className={[
            'figma-flex-wrap-line-gap',
            `figma-flex-wrap-line-gap--${gap.axis}`,
          ].join(' ')}
          data-flex-wrap-line-gap={gap.index + 1}
          style={{
            height: gap.h,
            left: gap.x,
            top: gap.y,
            width: gap.w,
          }}
        />
      ))}
      {layout.gaps.map((gap) => (
        <span
          key={`gap-label:${gap.index}`}
          className="figma-flex-wrap-line-gap-label"
          data-flex-wrap-line-gap-label={gap.index + 1}
          style={{
            left: gap.labelX,
            top: gap.labelY,
          }}
        >
          {gap.label}
        </span>
      ))}
    </>
  )
}

function DomEditFlexParticipationGlyph({
  descriptor,
  rect,
}: {
  descriptor: DomEditFlexParticipationDescriptor
  rect: DomEditAutoLayoutRect & { scale: number }
}) {
  const isWidth = descriptor.axis === 'width'

  return (
    <span
      aria-label={`${descriptor.label} ${descriptor.detail}`}
      className={[
        'figma-flex-participation-glyph',
        `figma-flex-participation-glyph--${descriptor.axis}`,
      ].join(' ')}
      data-axis={descriptor.axis}
      data-kind={descriptor.kind}
      style={{
        left: isWidth ? rect.x + rect.w / 2 : rect.x + rect.w + 8,
        top: isWidth ? rect.y - 8 : rect.y + rect.h / 2,
        transform: isWidth
          ? `translate(-50%, -100%) scale(${1 / rect.scale})`
          : `translateY(-50%) scale(${1 / rect.scale})`,
      }}
    >
      <span
        className="figma-flex-participation-glyph__bar"
        aria-hidden="true"
      />
      <span className="figma-flex-participation-glyph__detail">
        {descriptor.detail}
      </span>
    </span>
  )
}

function DomEditMainAxisGuide({
  direction,
  rect,
}: {
  direction: DomEditNodeState['direction']
  rect: DomEditAutoLayoutRect
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        'figma-autolayout-axis-guide',
        `figma-autolayout-axis-guide--${direction}`,
      ].join(' ')}
      data-autolayout-axis-guide={direction}
      style={{
        height: rect.h,
        left: rect.x,
        top: rect.y,
        width: rect.w,
      }}
    />
  )
}

function DomEditAlignItemsGuide({
  align,
  isPreview,
  rect,
  style,
}: {
  align: DomEditAlignmentPreview['align']
  isPreview: boolean
  rect: DomEditAutoLayoutRect
  style: DomEditNodeState
}) {
  const padding = getDomEditPaddingSides(style)
  const axis = style.direction === 'row' ? 'horizontal' : 'vertical'
  const guideStyle = getDomEditAlignItemsGuideStyle({
    align,
    padding,
    rect,
    direction: style.direction,
  })

  return (
    <span
      aria-hidden="true"
      className={[
        'figma-align-guide',
        isPreview ? 'figma-alignment-preview-guide' : '',
        isPreview ? 'figma-align-guide--preview' : '',
        `figma-align-guide--${axis}`,
        `figma-align-guide--${align}`,
      ].join(' ')}
      data-align-guide={align}
      data-align-guide-axis={axis}
      data-align-guide-preview={isPreview ? 'true' : undefined}
      style={guideStyle}
    />
  )
}

function createDomEditAutoLayoutOverlayTransientState<
  TNodeId extends DomEditNodeId,
>(
  selectedNodeId: TNodeId,
): DomEditAutoLayoutOverlayTransientState<TNodeId> {
  return {
    alignmentPreview: null,
    hoveredAffordance: null,
    hoveredPaddingKind: null,
    isAlignmentEditorOpen: false,
    pinnedPaddingSide: null,
    selectedNodeId,
  }
}

function resolveDomEditStateAction<T>(
  current: T,
  action: SetStateAction<T>,
) {
  return typeof action === 'function'
    ? (action as (current: T) => T)(current)
    : action
}

function getDomEditAlignItemsGuideStyle({
  align,
  direction,
  padding,
  rect,
}: {
  align: DomEditAlignmentPreview['align']
  direction: DomEditNodeState['direction']
  padding: DomEditPaddingSides
  rect: DomEditAutoLayoutRect
}): CSSProperties {
  const contentLeft = rect.x + padding.left
  const contentTop = rect.y + padding.top
  const contentWidth = Math.max(1, rect.w - padding.left - padding.right)
  const contentHeight = Math.max(1, rect.h - padding.top - padding.bottom)
  const lineSize = 2

  if (align === 'stretch') {
    return {
      height: contentHeight,
      left: contentLeft,
      top: contentTop,
      width: contentWidth,
    }
  }

  if (direction === 'row') {
    const top = resolveDomEditAlignmentPreviewPosition({
      align,
      end: contentTop + contentHeight,
      lineSize,
      size: contentHeight,
      start: contentTop,
    })

    return {
      height: lineSize,
      left: contentLeft,
      top,
      width: contentWidth,
    }
  }

  const left = resolveDomEditAlignmentPreviewPosition({
    align,
    end: contentLeft + contentWidth,
    lineSize,
    size: contentWidth,
    start: contentLeft,
  })

  return {
    height: contentHeight,
    left,
    top: contentTop,
    width: lineSize,
  }
}

function resolveDomEditAlignmentPreviewPosition({
  align,
  end,
  lineSize,
  size,
  start,
}: {
  align: DomEditAlignmentPreview['align']
  end: number
  lineSize: number
  size: number
  start: number
}) {
  if (align === 'center') {
    return start + size / 2 - lineSize / 2
  }

  if (align === 'end') {
    return end - lineSize
  }

  return start
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

function measureDomEditFlexWrapLayout({
  direction,
  gap,
  shell,
  target,
  viewport,
}: {
  direction: DomEditNodeState['direction']
  gap: number
  shell: HTMLElement | null
  target: HTMLElement
  viewport: DomEditViewport
}) {
  if (!shell || !isDomEditFlexWrapEnabled(target)) {
    return null
  }

  const shellRect = shell.getBoundingClientRect()
  const container = measureDomEditAutoLayoutWorldRect({
    elementRect: target.getBoundingClientRect(),
    shellRect,
    viewport,
  })
  const children = Array.from(target.children)
    .map((child) => child.getBoundingClientRect())
    .filter((childRect) => childRect.width > 0 && childRect.height > 0)
    .map((childRect) => measureDomEditAutoLayoutWorldRect({
      elementRect: childRect,
      shellRect,
      viewport,
    }))

  return getDomEditFlexWrapLayout({
    children,
    container,
    direction,
    gap,
  })
}

function isDomEditFlexWrapEnabled(target: HTMLElement) {
  const computedStyle = target.ownerDocument.defaultView?.getComputedStyle(target)
  const flexWrap = target.style.flexWrap || computedStyle?.flexWrap

  return flexWrap === 'wrap' || flexWrap === 'wrap-reverse'
}
