import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from 'react'
import type { Viewport } from '../../../../../src/canvas'
import {
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomLayoutContext,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from '../FigmaCloneDomEditModel'
import {
  getFigmaCloneDomOverlayVisibility,
  type FigmaCloneDomAffordanceState,
} from './FigmaCloneDomAffordanceVisibility'
import {
  clampFigmaCloneDomOverlayPosition,
  getFigmaCloneDomWorldOverlayRect,
} from './FigmaCloneDomOverlayGeometry'
import {
  resolveFigmaCloneSpacingDragValue,
} from './FigmaCloneDomOverlayGesture'

type AutoLayoutRect = {
  h: number
  w: number
  x: number
  y: number
}

type AutoLayoutDragKind =
  | 'gap'
  | 'padding-bottom'
  | 'padding-left'
  | 'padding-right'
  | 'padding-top'

type AutoLayoutAffordanceMode = 'gap' | 'padding'
type AutoLayoutSizeAxis = 'height' | 'width'
type AutoLayoutSizeMode = FigmaCloneDomEditNodeState['widthMode']

export function FigmaCloneDomAutoLayoutOverlay({
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
  affordanceState: FigmaCloneDomAffordanceState
  rect: AutoLayoutRect & { scale: number }
  shellRef: RefObject<HTMLElement | null>
  state: FigmaCloneDomEditState
  target: HTMLElement
  viewport: Viewport
  selectedNodeId: FigmaCloneDomNodeId
  onChange: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomEditField,
    value: number,
  ) => void
  onChangeAutoLayout: (
    nodeId: FigmaCloneDomNodeId,
    field: FigmaCloneDomAutoLayoutField,
    value: FigmaCloneDomEditNodeState[FigmaCloneDomAutoLayoutField],
  ) => void
  onAffordanceStateChange: (state: FigmaCloneDomAffordanceState) => void
}) {
  const [activeDragKind, setActiveDragKind] =
    useState<AutoLayoutDragKind | null>(null)
  const [gapRects, setGapRects] = useState<AutoLayoutRect[]>([])
  const [hoveredAffordance, setHoveredAffordance] =
    useState<AutoLayoutAffordanceMode | null>(null)
  const style = getFigmaCloneDomEditStyle(state, selectedNodeId)
  const context = getFigmaCloneDomLayoutContext(selectedNodeId)
  const isBetweenDistribution = style.distribution === 'space-between'

  useLayoutEffect(() => {
    if (!context.showSelfLayout) {
      const frame = requestAnimationFrame(() => {
        setGapRects([])
      })

      return () => cancelAnimationFrame(frame)
    }

    let frame = 0
    const measure = () => {
      setGapRects(measureFigmaCloneAutoLayoutGapRects({
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
      const nextAffordance = hoveredTarget?.closest('.figma-autolayout-gap')
        ? 'gap'
        : hoveredTarget?.closest('.figma-autolayout-padding')
          ? 'padding'
          : null

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
  const paddingRects = getFigmaClonePaddingOverlayRects({
    padding: style.padding,
    rect,
  })
  const paddingLabelPosition = getFigmaClonePaddingLabelPosition({
    padding: style.padding,
    rect,
  })
  const activeGapRect = gapRects[Math.max(0, Math.floor(gapRects.length / 2))]
  const activeAffordance = activeDragKind === 'gap'
    ? 'gap'
    : activeDragKind
      ? 'padding'
      : hoveredAffordance
  const affordanceState = getFigmaCloneAutoLayoutAffordanceState({
    activeAffordance,
    activeDragKind,
    baseAffordanceState,
  })
  const visibility = getFigmaCloneDomOverlayVisibility({
    affordanceState,
    context,
  })
  const shouldRenderPadding = visibility.paddingHitTargets
  const shouldRenderGap = visibility.gapHitTargets
  const startDrag = (
    event: PointerEvent<HTMLElement>,
    kind: AutoLayoutDragKind,
  ) => {
    const start = {
      clientX: event.clientX,
      clientY: event.clientY,
      gap: style.gap,
      padding: style.padding,
    }
    const pointerId = event.pointerId
    const source = event.currentTarget

    source.setPointerCapture(pointerId)
    setActiveDragKind(kind)
    setHoveredAffordance(kind === 'gap' ? 'gap' : 'padding')
    event.preventDefault()
    event.stopPropagation()

    const handleMove = (moveEvent: globalThis.PointerEvent) => {
      const dx = (moveEvent.clientX - start.clientX) / rect.scale
      const dy = (moveEvent.clientY - start.clientY) / rect.scale

      if (kind === 'gap') {
        const delta = style.direction === 'row' ? dx : dy
        onChange(
          selectedNodeId,
          'gap',
          resolveFigmaCloneSpacingDragValue(start.gap + delta, moveEvent),
        )
        return
      }

      onChange(
        selectedNodeId,
        'padding',
        resolveFigmaCloneSpacingDragValue(
          start.padding + getFigmaClonePaddingDelta(kind, dx, dy),
          moveEvent,
        ),
      )
    }
    const handleEnd = () => {
      if (source.hasPointerCapture(pointerId)) {
        source.releasePointerCapture(pointerId)
      }
      setActiveDragKind(null)
      setHoveredAffordance(null)
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
                  aria-label="Edit padding top"
                  className={getFigmaClonePaddingClassName({
                    isVisible: visibility.paddingVisuals,
                    padding: style.padding,
                    side: 'top',
                  })}
                  style={paddingRects['padding-top']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => setHoveredAffordance('padding')}
                  onPointerLeave={() => setHoveredAffordance(null)}
                  onPointerDown={(event) => startDrag(event, 'padding-top')}
                />
                <button
                  aria-label="Edit padding right"
                  className={getFigmaClonePaddingClassName({
                    isVisible: visibility.paddingVisuals,
                    padding: style.padding,
                    side: 'right',
                  })}
                  style={paddingRects['padding-right']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => setHoveredAffordance('padding')}
                  onPointerLeave={() => setHoveredAffordance(null)}
                  onPointerDown={(event) => startDrag(event, 'padding-right')}
                />
                <button
                  aria-label="Edit padding bottom"
                  className={getFigmaClonePaddingClassName({
                    isVisible: visibility.paddingVisuals,
                    padding: style.padding,
                    side: 'bottom',
                  })}
                  style={paddingRects['padding-bottom']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => setHoveredAffordance('padding')}
                  onPointerLeave={() => setHoveredAffordance(null)}
                  onPointerDown={(event) => startDrag(event, 'padding-bottom')}
                />
                <button
                  aria-label="Edit padding left"
                  className={getFigmaClonePaddingClassName({
                    isVisible: visibility.paddingVisuals,
                    padding: style.padding,
                    side: 'left',
                  })}
                  style={paddingRects['padding-left']}
                  title="Padding"
                  type="button"
                  onPointerEnter={() => setHoveredAffordance('padding')}
                  onPointerLeave={() => setHoveredAffordance(null)}
                  onPointerDown={(event) => startDrag(event, 'padding-left')}
                />
              </div>
              {visibility.paddingVisuals ? (
                <span
                  className="figma-autolayout-value figma-autolayout-value--padding"
                  style={{
                    left: paddingLabelPosition.x,
                    top: paddingLabelPosition.y,
                  }}
                >
                  Pad {style.padding}
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
                  className={getFigmaCloneGapClassName({
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
                    ? `Between ${getFigmaCloneGapRectValue({
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
      {shouldRenderSizeCapsule({
        affordanceState: baseAffordanceState,
        context,
        isDragging: Boolean(activeDragKind),
      }) ? (
        <FigmaCloneSizeModeCapsule
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

function FigmaCloneSizeModeCapsule({
  heightMode,
  heightValue,
  rect,
  showFill,
  widthMode,
  widthValue,
  onAffordanceStateChange,
  onChangeHeight,
  onChangeWidth,
}: {
  heightMode: AutoLayoutSizeMode
  heightValue: number
  rect: AutoLayoutRect & { scale: number }
  showFill: boolean
  widthMode: AutoLayoutSizeMode
  widthValue: number
  onAffordanceStateChange: (state: FigmaCloneDomAffordanceState) => void
  onChangeHeight: (mode: AutoLayoutSizeMode) => void
  onChangeWidth: (mode: AutoLayoutSizeMode) => void
}) {
  return (
    <div
      className="figma-size-mode-capsule"
      style={{
        left: rect.x + rect.w / 2,
        top: rect.y + rect.h + 5,
        transform: `translateX(-50%) scale(${1 / rect.scale})`,
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onPointerEnter={() =>
        onAffordanceStateChange({
          mode: 'hover-property',
          property: 'size',
        })}
      onPointerLeave={() => onAffordanceStateChange({ mode: 'idle' })}
    >
      <FigmaCloneSizeModeButton
        axis="width"
        mode={widthMode}
        showFill={showFill}
        value={widthValue}
        onChange={onChangeWidth}
      />
      <span className="figma-size-mode-capsule__divider" aria-hidden="true">
        x
      </span>
      <FigmaCloneSizeModeButton
        axis="height"
        mode={heightMode}
        showFill={showFill}
        value={heightValue}
        onChange={onChangeHeight}
      />
    </div>
  )
}

function getFigmaCloneAutoLayoutAffordanceState({
  activeAffordance,
  activeDragKind,
  baseAffordanceState,
}: {
  activeAffordance: AutoLayoutAffordanceMode | null
  activeDragKind: AutoLayoutDragKind | null
  baseAffordanceState: FigmaCloneDomAffordanceState
}): FigmaCloneDomAffordanceState {
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

function getFigmaClonePaddingClassName({
  isVisible,
  padding,
  side,
}: {
  isVisible: boolean
  padding: number
  side: 'bottom' | 'left' | 'right' | 'top'
}) {
  return [
    'figma-autolayout-padding',
    `figma-autolayout-padding--${side}`,
    padding <= 0 || !isVisible ? 'figma-autolayout-padding--empty' : '',
  ].filter(Boolean).join(' ')
}

function getFigmaCloneGapClassName({
  direction,
  isBetween,
  isVisible,
}: {
  direction: FigmaCloneDomEditNodeState['direction']
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

function getFigmaCloneGapRectValue({
  direction,
  rect,
}: {
  direction: FigmaCloneDomEditNodeState['direction']
  rect: AutoLayoutRect
}) {
  return Math.round(direction === 'row' ? rect.w : rect.h)
}

function FigmaCloneSizeModeButton({
  axis,
  mode,
  showFill,
  value,
  onChange,
}: {
  axis: AutoLayoutSizeAxis
  mode: AutoLayoutSizeMode
  showFill: boolean
  value: number
  onChange: (mode: AutoLayoutSizeMode) => void
}) {
  const nextMode = getNextFigmaCloneSizeMode({ mode, showFill })
  const axisLabel = axis === 'width' ? 'W' : 'H'

  return (
    <button
      aria-label={`${axisLabel} ${Math.round(value)} ${getFigmaCloneSizeModeLabel(mode)}`}
      data-mode={mode}
      title={getFigmaCloneSizeModeLabel(mode)}
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onChange(nextMode)
      }}
    >
      <span className="figma-size-mode-capsule__axis">{axisLabel}</span>
      <span className="figma-size-mode-capsule__value">
        {Math.round(value)}
      </span>
      <span className="figma-size-mode-capsule__mode">
        {getFigmaCloneSizeModeLabel(mode)}
      </span>
    </button>
  )
}

function getFigmaCloneSizeModeLabel(mode: AutoLayoutSizeMode) {
  if (mode === 'hug') {
    return 'Hug'
  }

  if (mode === 'fill') {
    return 'Fill'
  }

  return 'Fixed'
}

function getNextFigmaCloneSizeMode({
  mode,
  showFill,
}: {
  mode: AutoLayoutSizeMode
  showFill: boolean
}): AutoLayoutSizeMode {
  const modes: AutoLayoutSizeMode[] =
    showFill || mode === 'fill'
      ? ['fixed', 'hug', 'fill']
      : ['fixed', 'hug']
  const currentIndex = modes.indexOf(mode)

  return modes[(currentIndex + 1) % modes.length]
}

function shouldRenderSizeCapsule({
  affordanceState,
  context,
  isDragging,
}: {
  affordanceState: FigmaCloneDomAffordanceState
  context: ReturnType<typeof getFigmaCloneDomLayoutContext>
  isDragging: boolean
}) {
  return (
    context.showSelfLayout ||
    context.showGridLayout ||
    context.showParentParticipation
  ) &&
    affordanceState.mode !== 'measure' &&
    affordanceState.mode !== 'xray' &&
    !isDragging
}

function getFigmaClonePaddingOverlayRects({
  padding,
  rect,
}: {
  padding: number
  rect: AutoLayoutRect & { scale: number }
}): Record<Exclude<AutoLayoutDragKind, 'gap'>, CSSProperties> {
  const visibleThickness = getFigmaCloneScaledSpacing({
    max: Math.min(rect.w, rect.h) / 2,
    value: padding,
  })
  const thickness = padding <= 0 ? 8 : visibleThickness

  return {
    'padding-bottom': {
      height: thickness,
      left: 0,
      top: rect.h - thickness,
      width: rect.w,
    },
    'padding-left': {
      height: rect.h,
      left: 0,
      top: 0,
      width: thickness,
    },
    'padding-right': {
      height: rect.h,
      left: rect.w - thickness,
      top: 0,
      width: thickness,
    },
    'padding-top': {
      height: thickness,
      left: 0,
      top: 0,
      width: rect.w,
    },
  }
}

function getFigmaClonePaddingLabelPosition({
  padding,
  rect,
}: {
  padding: number
  rect: AutoLayoutRect & { scale: number }
}) {
  const thickness = getFigmaCloneScaledSpacing({
    max: Math.min(rect.w, rect.h) / 2,
    value: padding,
  })
  const inset = Math.max(12, thickness / 2)

  return {
    x: rect.x + Math.min(inset, rect.w - 12),
    y: rect.y + Math.min(inset, rect.h - 12),
  }
}

function getFigmaCloneScaledSpacing({
  max,
  value,
}: {
  max: number
  value: number
}) {
  return clampFigmaCloneDomOverlayPosition(value, 0, max)
}

function getFigmaClonePaddingDelta(
  kind: Exclude<AutoLayoutDragKind, 'gap'>,
  dx: number,
  dy: number,
) {
  if (kind === 'padding-left') {
    return dx
  }

  if (kind === 'padding-right') {
    return -dx
  }

  if (kind === 'padding-top') {
    return dy
  }

  return -dy
}

function measureFigmaCloneAutoLayoutGapRects({
  direction,
  shell,
  target,
  viewport,
}: {
  direction: FigmaCloneDomEditNodeState['direction']
  shell: HTMLElement | null
  target: HTMLElement
  viewport: Viewport
}): AutoLayoutRect[] {
  if (!shell || target.children.length < 2) {
    return []
  }

  const children = Array.from(target.children)
  const shellRect = shell.getBoundingClientRect()
  const targetRect = measureFigmaCloneAutoLayoutWorldRect({
    elementRect: target.getBoundingClientRect(),
    shellRect,
    viewport,
  })

  return children
    .slice(0, -1)
    .map((child, index) => measureFigmaCloneAutoLayoutGapRect({
      direction,
      first: measureFigmaCloneAutoLayoutWorldRect({
        elementRect: child.getBoundingClientRect(),
        shellRect,
        viewport,
      }),
      second: measureFigmaCloneAutoLayoutWorldRect({
        elementRect: children[index + 1].getBoundingClientRect(),
        shellRect,
        viewport,
      }),
      targetRect,
    }))
}

function measureFigmaCloneAutoLayoutGapRect({
  direction,
  first,
  second,
  targetRect,
}: {
  direction: FigmaCloneDomEditNodeState['direction']
  first: AutoLayoutRect
  second: AutoLayoutRect
  targetRect: AutoLayoutRect
}): AutoLayoutRect {
  if (!first || !second) {
    return {
      h: 0,
      w: 0,
      x: targetRect.x,
      y: targetRect.y,
    }
  }

  if (direction === 'row') {
    const w = clampFigmaCloneDomOverlayPosition(
      second.x - (first.x + first.w),
      0,
      targetRect.w,
    )
    const h = Math.min(
      Math.max(first.h, second.h),
      targetRect.h,
    )
    const x = clampFigmaCloneDomOverlayPosition(
      first.x + first.w,
      targetRect.x,
      targetRect.x + targetRect.w - w,
    )
    const y = clampFigmaCloneDomOverlayPosition(
      Math.min(first.y, second.y),
      targetRect.y,
      targetRect.y + targetRect.h - h,
    )

    return {
      h,
      w,
      x,
      y,
    }
  }

  const w = Math.min(Math.max(first.w, second.w), targetRect.w)
  const x = clampFigmaCloneDomOverlayPosition(
    Math.min(first.x, second.x),
    targetRect.x,
    targetRect.x + targetRect.w - w,
  )
  const h = clampFigmaCloneDomOverlayPosition(
    second.y - (first.y + first.h),
    0,
    targetRect.h,
  )
  const y = clampFigmaCloneDomOverlayPosition(
    first.y + first.h,
    targetRect.y,
    targetRect.y + targetRect.h - h,
  )

  return {
    h,
    w,
    x,
    y,
  }
}

function measureFigmaCloneAutoLayoutWorldRect({
  elementRect,
  shellRect,
  viewport,
}: {
  elementRect: DOMRect
  shellRect: DOMRect
  viewport: Viewport
}): AutoLayoutRect {
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
