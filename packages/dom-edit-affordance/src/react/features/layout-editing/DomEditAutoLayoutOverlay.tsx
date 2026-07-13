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
  DomEditAutoLayoutAlign,
  DomEditAutoLayoutField,
  DomEditDirectManipulationEdit,
  DomEditDirectManipulationLifecycle,
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
  type DomEditAutoLayoutPaddingSideDragKind,
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
import {
  CANVAS_DOM_ALIGNMENT_PREVIEW_GUIDE_MODEL,
} from '../../../features/layout-editing/DomEditAlignmentMetadata'
import { DomEditMarginGhostOverlay } from '../box-model-xray/DomEditMarginGhostOverlay'
import {
  getDomEditRadioTabIndex,
  handleDomEditRadioGroupKeyDown,
} from '../../shared/DomEditRadioGroup'

type AutoLayoutAffordanceMode = 'gap' | 'padding'
type DomEditFlexChildEffectiveAlign =
  Exclude<DomEditAutoLayoutAlign, 'auto'>

type DomEditFlexChildAlignSelfDescriptor = {
  alignSelf: DomEditAutoLayoutAlign
  direction: DomEditNodeState['direction']
  effectiveAlign: DomEditFlexChildEffectiveAlign
  label: string
}

type DomEditAutoLayoutOverlayTransientState<
  TNodeId extends DomEditNodeId,
> = {
  alignmentPreview: DomEditAlignmentPreview | null
  hoveredAffordance: AutoLayoutAffordanceMode | null
  hoveredGapIndex: number | null
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
  directManipulation,
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
  directManipulation?: DomEditDirectManipulationLifecycle<TNodeId>
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
    hoveredGapIndex,
    hoveredPaddingKind,
    isAlignmentEditorOpen,
    pinnedPaddingSide,
  } = scopedTransientState
  const style = adapter.getStyle(state, selectedNodeId)
  const context = adapter.getLayoutContext(selectedNodeId)
  const parentStyle = context.parentId
    ? adapter.getStyle(state, context.parentId)
    : null
  const parentDirection = parentStyle?.direction ?? null
  const flexParticipation = getDomEditFlexParticipationDescriptor({
    heightMode: style.heightMode,
    parentDirection,
    parentDisplay: context.parentDisplay,
    widthMode: style.widthMode,
  })
  const flexChildAlignSelf = parentDirection
    ? getDomEditFlexChildAlignSelfDescriptor({
      alignSelf: style.alignSelf,
      parentAlign: parentStyle?.align ?? 'start',
      parentDirection,
    })
    : null
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
  const setHoveredGapIndex = useCallback((
    action: SetStateAction<number | null>,
  ) => {
    updateTransientState((current) => {
      const next = resolveDomEditStateAction(current.hoveredGapIndex, action)

      return next === current.hoveredGapIndex
        ? current
        : { ...current, hoveredGapIndex: next }
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
      const gapTarget = hoveredTarget?.closest<HTMLElement>(
        '[data-dom-edit-gap-index]',
      )
      const nextGapIndex = readDomEditGapIndex(gapTarget)
      const nextAffordance = gapTarget
        ? 'gap'
        : paddingKind
          ? 'padding'
          : null

      setHoveredGapIndex((current) =>
        current === nextGapIndex ? current : nextGapIndex)
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
    setHoveredGapIndex,
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
  const fallbackGapRect = gapRects[Math.max(0, Math.floor(gapRects.length / 2))]
  const hoveredGapRect = hoveredGapIndex === null
    ? null
    : gapRects[hoveredGapIndex] ?? null
  const activeGapRect = activeDragKind === 'gap'
    ? fallbackGapRect
    : hoveredGapRect ?? fallbackGapRect
  const activePaddingKind = activeDragKind && activeDragKind !== 'gap'
    ? activeDragKind
    : hoveredPaddingKind
  const activePaddingSides = activePaddingKind
    ? activeDragKind
      ? getDomEditPaddingDragActiveSides(activePaddingKind, {
        pinnedSide: pinnedPaddingSide,
      })
      : getDomEditPaddingHoverActiveSides(activePaddingKind)
    : pinnedPaddingSide
      ? [pinnedPaddingSide]
      : []
  const paddingLabelKind = activePaddingKind ?? (pinnedPaddingSide
    ? `padding-${pinnedPaddingSide}` as DomEditAutoLayoutPaddingDragKind
    : null)
  const paddingLabelPosition = paddingLabelKind
    ? getDomEditActivePaddingLabelPosition({
      kind: paddingLabelKind,
      paddingCornerRects,
      paddingRects,
      rect,
    })
    : getDomEditPaddingLabelPosition({ padding, rect })
  const paddingLabel = paddingLabelKind
    ? getDomEditActivePaddingLabel({
      activeSides: activePaddingSides,
      isDragging: Boolean(activeDragKind),
      kind: paddingLabelKind,
      padding,
    })
    : `Pad ${getDomEditPaddingSummary(padding)}`
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
    visibility.gapVisuals
    ? flexWrapLayout
    : null
  const shouldRenderPadding = visibility.paddingHitTargets
  const shouldRenderGap = visibility.gapHitTargets
  const showGapVisuals = visibility.gapVisuals
  const visibleGapLabelRects = showGapVisuals
    ? isBetweenDistribution
      ? hoveredGapRect
        ? [hoveredGapRect]
        : []
      : activeGapRect
        ? [activeGapRect]
        : []
    : []
  const alignGuideValue = alignmentPreview?.align ??
    (style.align === 'auto' ? null : style.align)
  const shouldRenderAlignmentEditor =
    (context.showSelfLayout || context.showGridLayout) &&
    (
      affordanceState.mode === 'idle' ||
      isAlignmentEditorOpen
    )
  const shouldRenderAlignGuide = visibility.alignGuides &&
    Boolean(alignGuideValue)
  const directionControlOffset = visibility.sizeModes ? 30 : 12
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
    const ownsPreview = directManipulation?.begin({
      kind: kind === 'gap' ? 'gap' : 'padding',
      nodeId: selectedNodeId,
    }) === true

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

    const updateSpacing = (
      edits: readonly DomEditDirectManipulationEdit[],
    ) => {
      if (ownsPreview) {
        directManipulation?.update(edits)
        return
      }

      for (const edit of edits) {
        if (edit.kind === 'number') {
          onChange(selectedNodeId, edit.field, edit.value)
        }
      }
    }

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
        updateSpacing([{
          field: 'gap',
          kind: 'number',
          value: resolveDomEditSpacingDragValue(
            start.gap + delta,
            moveEvent,
          ),
        }])
        return
      }

      const delta = getDomEditPaddingDelta(kind, dx, dy)
      const scope = getDomEditPaddingDragScope(kind, {
        pinnedSide: pinnedPaddingSide,
      })
      const sides = getDomEditPaddingScopeSides(scope)

      if (scope === 'all') {
        updateSpacing([{
          field: 'padding',
          kind: 'number',
          value: resolveDomEditSpacingDragValue(
            start.padding.top + delta,
            moveEvent,
          ),
        }])
        return
      }

      updateSpacing(sides.map((side) => ({
        field: DOM_EDIT_PADDING_SIDE_FIELDS[side],
        kind: 'number' as const,
        value: resolveDomEditSpacingDragValue(
          start.padding[side] + delta,
          moveEvent,
        ),
      })))
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
      setHoveredGapIndex(null)
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
      {visibility.flexChildMargin ? (
        <DomEditMarginGhostOverlay
          owner="selected"
          rect={rect}
          target={target}
        />
      ) : null}
      {visibility.flexChildAlignSelfGuide && flexChildAlignSelf ? (
        <DomEditFlexChildAlignSelfGuide
          descriptor={flexChildAlignSelf}
          rect={rect}
        />
      ) : null}
      {visibility.flexChildControls && flexChildAlignSelf ? (
        <DomEditFlexChildAlignSelfControl
          descriptor={flexChildAlignSelf}
          rect={rect}
          onPointerEnter={() =>
            onAffordanceStateChange({
              mode: 'hover-property',
              property: 'alignSelf',
            })}
          onPointerLeave={() => onAffordanceStateChange({ mode: 'idle' })}
        />
      ) : null}
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
                  {paddingLabel}
                </span>
              ) : null}
            </>
          ) : null}
          {context.showSelfLayout && shouldRenderGap ? (
            <>
              {activeFlexWrapLayout ? (
                <DomEditFlexWrapGuides layout={activeFlexWrapLayout} />
              ) : null}
              {gapRects.map((gapRect, index) => {
                const isGapLaneVisible = activeDragKind === 'gap' ||
                  hoveredGapIndex === index

                return (
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
                    isVisible: isGapLaneVisible,
                  })}
                  data-dom-edit-between-lane={
                    isBetweenDistribution ? `${index + 1}` : undefined
                  }
                  data-dom-edit-gap-index={index}
                  style={{
                    height: gapRect.h,
                    left: gapRect.x,
                    top: gapRect.y,
                    width: gapRect.w,
                  }}
                  title={isBetweenDistribution ? 'Between auto spacing' : 'Gap'}
                  type="button"
                  onPointerEnter={() => {
                    setHoveredAffordance('gap')
                    setHoveredGapIndex(index)
                  }}
                  onPointerLeave={() => {
                    setHoveredAffordance(null)
                    setHoveredGapIndex(null)
                  }}
                  onPointerDown={(event) => {
                    if (isBetweenDistribution) {
                      event.preventDefault()
                      event.stopPropagation()
                      return
                    }

                    startDrag(event, 'gap')
                  }}
                >
                  {isBetweenDistribution && isGapLaneVisible ? (
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
                )
              })}
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
                    left: gapRect.x + gapRect.w / 2,
                    top: gapRect.y + gapRect.h / 2,
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
          {visibility.directionControls ? (
            <div
              className="figma-autolayout-toolbar"
              role="radiogroup"
              aria-label="Auto layout direction"
              style={{
                left: rect.x + rect.w / 2,
                top: rect.y + rect.h + directionControlOffset,
              }}
              onKeyDown={handleDomEditRadioGroupKeyDown}
            >
              <button
                aria-label="Horizontal auto layout"
                aria-checked={style.direction === 'row'}
                role="radio"
                tabIndex={getDomEditRadioTabIndex({
                  checked: style.direction === 'row',
                })}
                type="button"
                onClick={() => onChangeAutoLayout(selectedNodeId, 'direction', 'row')}
              >
                H
              </button>
              <button
                aria-label="Vertical auto layout"
                aria-checked={style.direction === 'column'}
                role="radio"
                tabIndex={getDomEditRadioTabIndex({
                  checked: style.direction === 'column',
                })}
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
            showFill={context.parentDisplay === 'flex'}
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

function DomEditFlexChildAlignSelfControl({
  descriptor,
  rect,
  onPointerEnter,
  onPointerLeave,
}: {
  descriptor: DomEditFlexChildAlignSelfDescriptor
  rect: DomEditAutoLayoutRect & { scale: number }
  onPointerEnter: () => void
  onPointerLeave: () => void
}) {
  return (
    <button
      aria-label={`Align self ${descriptor.label}`}
      className={[
        'figma-flex-child-align-self',
        `figma-flex-child-align-self--${descriptor.direction}`,
        `figma-flex-child-align-self--${descriptor.effectiveAlign}`,
      ].join(' ')}
      data-align-effective={descriptor.effectiveAlign}
      data-align-self={descriptor.alignSelf}
      style={getDomEditFlexChildAlignSelfControlStyle({ descriptor, rect })}
      title="Align self"
      type="button"
      onPointerDown={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <span aria-hidden="true" />
    </button>
  )
}

function DomEditFlexChildAlignSelfGuide({
  descriptor,
  rect,
}: {
  descriptor: DomEditFlexChildAlignSelfDescriptor
  rect: DomEditAutoLayoutRect
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        'figma-flex-child-align-self-guide',
        `figma-flex-child-align-self-guide--${descriptor.direction}`,
        `figma-flex-child-align-self-guide--${descriptor.effectiveAlign}`,
      ].join(' ')}
      data-align-effective={descriptor.effectiveAlign}
      data-align-self-guide="true"
      style={getDomEditFlexChildAlignSelfGuideStyle({ descriptor, rect })}
    />
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
      data-dom-edit-alignment-preview-guide-model={
        isPreview ? CANVAS_DOM_ALIGNMENT_PREVIEW_GUIDE_MODEL : undefined
      }
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
    hoveredGapIndex: null,
    hoveredPaddingKind: null,
    isAlignmentEditorOpen: false,
    pinnedPaddingSide: null,
    selectedNodeId,
  }
}

function getDomEditFlexChildAlignSelfDescriptor({
  alignSelf,
  parentAlign,
  parentDirection,
}: {
  alignSelf: DomEditAutoLayoutAlign
  parentAlign: DomEditAutoLayoutAlign
  parentDirection: DomEditNodeState['direction']
}): DomEditFlexChildAlignSelfDescriptor {
  const effectiveAlign = alignSelf === 'auto'
    ? normalizeDomEditFlexChildAlign(parentAlign)
    : alignSelf

  return {
    alignSelf,
    direction: parentDirection,
    effectiveAlign,
    label: alignSelf === 'auto'
      ? `Auto (${getDomEditFlexChildAlignLabel(effectiveAlign)})`
      : getDomEditFlexChildAlignLabel(effectiveAlign),
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

function getDomEditFlexChildAlignSelfControlStyle({
  descriptor,
  rect,
}: {
  descriptor: DomEditFlexChildAlignSelfDescriptor
  rect: DomEditAutoLayoutRect & { scale: number }
}): CSSProperties {
  const position = getDomEditFlexChildCrossAxisPosition({
    align: descriptor.effectiveAlign,
    direction: descriptor.direction,
    rect,
  })

  if (descriptor.direction === 'row') {
    return {
      left: rect.x - 7,
      top: position,
      transform: `translate(-100%, -50%) scale(${1 / rect.scale})`,
    }
  }

  return {
    left: position,
    top: rect.y - 7,
    transform: `translate(-50%, -100%) scale(${1 / rect.scale})`,
  }
}

function getDomEditFlexChildAlignSelfGuideStyle({
  descriptor,
  rect,
}: {
  descriptor: DomEditFlexChildAlignSelfDescriptor
  rect: DomEditAutoLayoutRect
}): CSSProperties {
  const lineSize = 2

  if (descriptor.effectiveAlign === 'stretch') {
    return {
      height: rect.h,
      left: rect.x,
      top: rect.y,
      width: rect.w,
    }
  }

  const position = getDomEditFlexChildCrossAxisPosition({
    align: descriptor.effectiveAlign,
    direction: descriptor.direction,
    rect,
  })

  if (descriptor.direction === 'row') {
    return {
      height: lineSize,
      left: rect.x,
      top: position - lineSize / 2,
      width: rect.w,
    }
  }

  return {
    height: rect.h,
    left: position - lineSize / 2,
    top: rect.y,
    width: lineSize,
  }
}

function getDomEditFlexChildCrossAxisPosition({
  align,
  direction,
  rect,
}: {
  align: DomEditFlexChildEffectiveAlign
  direction: DomEditNodeState['direction']
  rect: DomEditAutoLayoutRect
}) {
  const start = direction === 'row' ? rect.y : rect.x
  const size = direction === 'row' ? rect.h : rect.w

  if (align === 'center' || align === 'stretch') {
    return start + size / 2
  }

  if (align === 'end') {
    return start + size
  }

  return start
}

function normalizeDomEditFlexChildAlign(
  align: DomEditAutoLayoutAlign,
): DomEditFlexChildEffectiveAlign {
  return align === 'auto' ? 'start' : align
}

function getDomEditFlexChildAlignLabel(
  align: DomEditFlexChildEffectiveAlign,
) {
  if (align === 'center') {
    return 'Center'
  }

  if (align === 'end') {
    return 'End'
  }

  if (align === 'stretch') {
    return 'Stretch'
  }

  return 'Start'
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

function getDomEditPaddingHoverActiveSides(
  kind: DomEditAutoLayoutPaddingDragKind,
): DomEditPaddingSide[] {
  const side = getDomEditPaddingDragSide(kind)

  return side
    ? [side]
    : ['top', 'right', 'bottom', 'left']
}

function getDomEditActivePaddingLabel({
  activeSides,
  isDragging,
  kind,
  padding,
}: {
  activeSides: readonly DomEditPaddingSide[]
  isDragging: boolean
  kind: DomEditAutoLayoutPaddingDragKind
  padding: DomEditPaddingSides
}) {
  const side = getDomEditPaddingDragSide(kind)

  if (!side) {
    return `Pad ${getDomEditPaddingSummary(padding)}`
  }

  const sides = isDragging && activeSides.length > 1
    ? activeSides
    : [side]

  return sides.map((activeSide) =>
    `${capitalizeDomEditPaddingSide(activeSide)} ${padding[activeSide]}`)
    .join(' · ')
}

function getDomEditActivePaddingLabelPosition({
  kind,
  paddingCornerRects,
  paddingRects,
  rect,
}: {
  kind: DomEditAutoLayoutPaddingDragKind
  paddingCornerRects: Record<DomEditAutoLayoutPaddingCornerDragKind, CSSProperties>
  paddingRects: Record<DomEditAutoLayoutPaddingSideDragKind, CSSProperties>
  rect: DomEditAutoLayoutRect
}) {
  const localRect = kind.startsWith('padding-corner-')
    ? paddingCornerRects[kind as DomEditAutoLayoutPaddingCornerDragKind]
    : paddingRects[kind as DomEditAutoLayoutPaddingSideDragKind]
  const left = Number(localRect.left ?? 0)
  const top = Number(localRect.top ?? 0)
  const width = Number(localRect.width ?? 0)
  const height = Number(localRect.height ?? 0)

  return {
    x: rect.x + left + width / 2,
    y: rect.y + top + height / 2,
  }
}

function capitalizeDomEditPaddingSide(side: DomEditPaddingSide) {
  return `${side.slice(0, 1).toUpperCase()}${side.slice(1)}`
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

function readDomEditGapIndex(target: HTMLElement | null | undefined) {
  const index = Number.parseInt(target?.dataset.domEditGapIndex ?? '', 10)

  return Number.isInteger(index) && index >= 0 ? index : null
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
