import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import {
  classifyInteractionKeyTarget,
  type InteractionKeyTargetKind,
} from '@interactive-os/interaction/runtime'
import Moveable, {
  type OnDrag,
  type OnDragEnd,
  type OnDragStart,
  type OnResize,
  type OnResizeEnd,
  type OnResizeStart,
} from 'react-moveable'
import {
  getDomEditOverlayVisibility,
  type DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
import {
  getDomEditOverlayLayerVisibility,
  type DomEditOverlayLayerVisibility,
} from '../../../features/node-selection/DomEditOverlayLayers'
import {
  resolveDomEditKeyboardCommand,
  type DomEditInteractionAction,
} from '../../../interaction/DomEditInteractionCommands'
import {
  getDomEditToggledAxisSizeMode,
} from '../../../features/size-editing/DomEditSizeMode'
import {
  areDomEditOverlayRectsEqual,
  measureDomEditNodeOverlayRect,
  type DomEditScaledOverlayRect,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import {
  constrainDomEditMoveableDrag,
  readDomEditMoveableTuple,
  resolveDomEditResizeSize,
} from '../../../shared/gesture/DomEditOverlayGesture'
import type {
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
export type {
  DomEditDirectManipulationEdit,
  DomEditDirectManipulationLifecycle,
} from '../../../shared/model/DomEditTypes'
import { DomEditBoxModelOverlay } from '../box-model-xray/DomEditBoxModelOverlay'
import { DomEditMarginGhostOverlay } from '../box-model-xray/DomEditMarginGhostOverlay'
import { DomEditAutoLayoutOverlay } from '../layout-editing/DomEditAutoLayoutOverlay'
import { DomEditGridOverlay } from '../layout-editing/DomEditGridOverlay'
import { DomEditGuideOverlay } from '../spatial-inspection/DomEditGuideOverlay'
import { DomEditOverflowOverlay } from '../spatial-inspection/DomEditOverflowOverlay'
import type {
  DomEditFrameGuideConfig,
} from '../spatial-inspection/DomEditFrameGuides'

type DomEditResizeSessionData = {
  fixedHeight?: boolean
  fixedWidth?: boolean
  startSize?: number[]
  startPosition?: number[]
}

type DomEditXrayHoverTarget<TNodeId extends DomEditNodeId> = {
  nodeId: TNodeId
  rect: DomEditScaledOverlayRect
  target: HTMLElement
}

const DOM_EDIT_TEXT_ENTRY_TARGET_KINDS = new Set<InteractionKeyTargetKind>([
  'contenteditable',
  'select',
  'text-input',
  'textarea',
])

export function DomEditSelectionOverlay<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  draggable = true,
  shellRef,
  selectedNodeId,
  spacingGridSize,
  state,
  viewport,
  affordanceState: appAffordanceState,
  directManipulation,
  frameGuides,
  isCanvasPanActive,
  overlayLayers,
  onAffordanceStateChange,
  onChange,
  onChangeAutoLayout,
  onCommand,
  resizable = true,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  affordanceState: DomEditAffordanceState
  directManipulation?: DomEditDirectManipulationLifecycle<TNodeId>
  draggable?: boolean
  frameGuides?: DomEditFrameGuideConfig<TNodeId> | null
  isCanvasPanActive: boolean
  overlayLayers?: Partial<DomEditOverlayLayerVisibility> | null
  selectedNodeId: TNodeId | null
  shellRef: RefObject<HTMLElement | null>
  spacingGridSize?: number
  state: TState
  viewport: DomEditViewport
  onAffordanceStateChange: (state: DomEditAffordanceState) => void
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
  onCommand?: (action: DomEditInteractionAction) => boolean
  resizable?: boolean
}) {
  const [rect, setRect] = useState<DomEditScaledOverlayRect | null>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [xrayHoverTarget, setXrayHoverTarget] =
    useState<DomEditXrayHoverTarget<TNodeId> | null>(null)
  const [isDirectManipulation, setIsDirectManipulation] = useState(false)
  const [isTemporaryGuideMode, setIsTemporaryGuideMode] = useState(false)
  const [isTemporaryMeasureMode, setIsTemporaryMeasureMode] = useState(false)
  const [shellElement, setShellElement] = useState<HTMLElement | null>(null)
  const measuredRectRef = useRef<DomEditScaledOverlayRect | null>(null)
  const measuredTargetRef = useRef<HTMLElement | null>(null)
  const moveableRef = useRef<Moveable | null>(null)
  const ownsMoveablePreviewRef = useRef(false)

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShellElement(shellRef.current)
    })

    return () => cancelAnimationFrame(frame)
  }, [shellRef])

  useLayoutEffect(() => {
    if (!selectedNodeId) {
      measuredRectRef.current = null
      measuredTargetRef.current = null
      return undefined
    }

    let frame = 0
    let disposed = false
    const measure = () => {
      const nextTarget = adapter.getElement(selectedNodeId)
      const nextRect = measureDomEditNodeOverlayRect({
        adapter,
        nodeId: selectedNodeId,
        shell: shellRef.current,
        state,
        viewport,
      })

      if (measuredTargetRef.current !== nextTarget) {
        measuredTargetRef.current = nextTarget
        setTarget(nextTarget)
      }

      if (!areDomEditOverlayRectsEqual(measuredRectRef.current, nextRect)) {
        measuredRectRef.current = nextRect
        setRect(nextRect)
      }

      return Boolean(nextTarget)
    }
    const trackViewport = () => {
      if (disposed) {
        return
      }

      measure()
      frame = requestAnimationFrame(trackViewport)
    }

    measure()
    frame = requestAnimationFrame(trackViewport)

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
    }
  }, [adapter, selectedNodeId, shellRef, state, viewport])

  useEffect(() => {
    const updateModifierMode = (event: KeyboardEvent) => {
      if (
        DOM_EDIT_TEXT_ENTRY_TARGET_KINDS.has(
          classifyInteractionKeyTarget(event.target),
        )
      ) {
        return
      }

      if (event.key === 'Alt') {
        setIsTemporaryMeasureMode(event.type === 'keydown')
      }

      if (event.key === 'Meta' || event.key === 'Control') {
        setIsTemporaryGuideMode(event.type === 'keydown')
      }
    }
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) {
        return
      }

      const isEscape = event.key === 'Escape'
      const ownsDirectManipulationEscape = Boolean(directManipulation) &&
        isEscape &&
        !DOM_EDIT_TEXT_ENTRY_TARGET_KINDS.has(
          classifyInteractionKeyTarget(event.target),
        )
      const cancelledDirectManipulation =
        ownsDirectManipulationEscape && directManipulation?.cancel() === true
      const action: DomEditInteractionAction | undefined =
        cancelledDirectManipulation || ownsDirectManipulationEscape
          ? { type: 'dom-edit.overlay.escape' }
          : resolveDomEditKeyboardCommand(event)?.action

      if (!action) {
        return
      }

      const handledLocally = runDomEditSelectionOverlayCommand({
        action,
        affordanceState: appAffordanceState,
        onResetDirectManipulation: () => {
          setIsDirectManipulation(false)
          setIsTemporaryGuideMode(false)
          setIsTemporaryMeasureMode(false)
        },
        onChangeAffordanceState: onAffordanceStateChange,
      })
      const handledExternally = !cancelledDirectManipulation &&
        (
          !handledLocally ||
          action.type === 'dom-edit.overlay.escape'
        ) &&
        onCommand?.(action) === true
      const handled = cancelledDirectManipulation ||
        handledLocally ||
        handledExternally

      if (handled) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    const stopTemporaryModes = () => {
      setIsTemporaryGuideMode(false)
      setIsTemporaryMeasureMode(false)
    }

    window.addEventListener('keydown', updateModifierMode)
    window.addEventListener('keydown', handleShortcut)
    window.addEventListener('keyup', updateModifierMode)
    window.addEventListener('blur', stopTemporaryModes)

    return () => {
      window.removeEventListener('keydown', updateModifierMode)
      window.removeEventListener('keydown', handleShortcut)
      window.removeEventListener('keyup', updateModifierMode)
      window.removeEventListener('blur', stopTemporaryModes)
    }
  }, [
    appAffordanceState,
    directManipulation,
    onAffordanceStateChange,
    onCommand,
  ])

  useEffect(() => () => {
    directManipulation?.cancel()
  }, [directManipulation])

  useEffect(() => {
    if (
      appAffordanceState.mode !== 'xray' ||
      !selectedNodeId ||
      !shellElement
    ) {
      return undefined
    }

    const clearHoverTarget = () => {
      setXrayHoverTarget(null)
    }
    const handlePointerMove = (event: PointerEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        clearHoverTarget()
        return
      }

      const hoveredNodeId = adapter.readNodeId(event.target)

      if (!hoveredNodeId || hoveredNodeId === selectedNodeId) {
        clearHoverTarget()
        return
      }

      const hoverTarget = adapter.getElement(hoveredNodeId)
      const hoverRect = measureDomEditNodeOverlayRect({
        adapter,
        nodeId: hoveredNodeId,
        shell: shellRef.current,
        state,
        viewport,
      })

      if (!hoverTarget || !hoverRect) {
        clearHoverTarget()
        return
      }

      setXrayHoverTarget((current) => {
        if (
          current?.nodeId === hoveredNodeId &&
          current.target === hoverTarget &&
          areDomEditOverlayRectsEqual(current.rect, hoverRect)
        ) {
          return current
        }

        return {
          nodeId: hoveredNodeId,
          rect: hoverRect,
          target: hoverTarget,
        }
      })
    }

    shellElement.addEventListener('pointermove', handlePointerMove, true)
    shellElement.addEventListener('pointerleave', clearHoverTarget)

    return () => {
      shellElement.removeEventListener('pointermove', handlePointerMove, true)
      shellElement.removeEventListener('pointerleave', clearHoverTarget)
    }
  }, [
    adapter,
    appAffordanceState.mode,
    selectedNodeId,
    shellElement,
    shellRef,
    state,
    viewport,
  ])

  useLayoutEffect(() => {
    if (!target) {
      return undefined
    }

    const frame = requestAnimationFrame(() => {
      moveableRef.current?.updateRect('', true, true)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [
    appAffordanceState,
    isDirectManipulation,
    isTemporaryGuideMode,
    isTemporaryMeasureMode,
    rect?.h,
    rect?.w,
    rect?.x,
    rect?.y,
    target,
    viewport.scale,
    viewport.x,
    viewport.y,
  ])

  const style = selectedNodeId
    ? adapter.getStyle(state, selectedNodeId)
    : null
  const context = selectedNodeId
    ? adapter.getLayoutContext(selectedNodeId)
    : null

  useEffect(() => {
    if (!selectedNodeId || !style || !context) {
      return undefined
    }

    if (!shellElement) {
      return undefined
    }

    const handleResizeControlDoubleClick = (event: globalThis.MouseEvent) => {
      const eventTarget = event.target

      if (!(eventTarget instanceof Element)) {
        return
      }

      const control = eventTarget.closest(
        '.moveable-control[data-direction]',
      )

      if (!control || !control.closest('.figma-dom-moveable')) {
        return
      }

      const direction = control.getAttribute('data-direction') ?? ''
      const shouldToggleWidth =
        direction.includes('e') || direction.includes('w')
      const shouldToggleHeight =
        direction.includes('n') || direction.includes('s')

      if (!shouldToggleWidth && !shouldToggleHeight) {
        return
      }

      event.preventDefault()
      event.stopPropagation()

      if (shouldToggleWidth) {
        onChangeAutoLayout(
          selectedNodeId,
          'widthMode',
          getDomEditToggledAxisSizeMode({
            mode: style.widthMode,
            parentDisplay: context.parentDisplay,
          }),
        )
      }

      if (shouldToggleHeight) {
        onChangeAutoLayout(
          selectedNodeId,
          'heightMode',
          getDomEditToggledAxisSizeMode({
            mode: style.heightMode,
            parentDisplay: context.parentDisplay,
          }),
        )
      }
    }

    shellElement.addEventListener('dblclick', handleResizeControlDoubleClick, true)

    return () => {
      shellElement.removeEventListener(
        'dblclick',
        handleResizeControlDoubleClick,
        true,
      )
    }
  }, [
    context,
    onChangeAutoLayout,
    selectedNodeId,
    shellElement,
    style,
  ])

  if (!selectedNodeId || !rect || !target || !style || !context) {
    return null
  }

  const affordanceState: DomEditAffordanceState = isTemporaryMeasureMode
    ? { mode: 'measure' }
    : isDirectManipulation || isTemporaryGuideMode
      ? { mode: 'transform' }
      : appAffordanceState
  const visibility = getDomEditOverlayVisibility({
    affordanceState,
    context,
  })
  const layerVisibility = getDomEditOverlayLayerVisibility(overlayLayers)
  const activeXrayHoverTarget = affordanceState.mode === 'xray' &&
    xrayHoverTarget?.target.isConnected === true &&
    xrayHoverTarget.nodeId !== selectedNodeId
    ? xrayHoverTarget
    : null
  const startDirectManipulation = (kind: 'move' | 'resize') => {
    ownsMoveablePreviewRef.current =
      directManipulation?.begin({ kind, nodeId: selectedNodeId }) === true
    setIsDirectManipulation(true)
    onAffordanceStateChange({ mode: 'drag-property', property: 'geometry' })
  }
  const endDirectManipulation = (cancelled: boolean) => {
    if (ownsMoveablePreviewRef.current) {
      if (cancelled) {
        directManipulation?.cancel()
      } else {
        directManipulation?.commit()
      }
    }

    ownsMoveablePreviewRef.current = false
    setIsDirectManipulation(false)
    onAffordanceStateChange({ mode: 'idle' })
  }
  const changeDirectManipulation = (
    edits: readonly DomEditDirectManipulationEdit[],
  ) => {
    if (ownsMoveablePreviewRef.current) {
      directManipulation?.update(edits)
      return
    }

    for (const edit of edits) {
      if (edit.kind === 'number') {
        onChange(
          selectedNodeId,
          edit.field,
          roundDomEditNumber(edit.value),
        )
      } else {
        onChangeAutoLayout(selectedNodeId, edit.field, edit.value)
      }
    }
  }
  const fixResizedAxes = (
    direction: number[],
    session: DomEditResizeSessionData,
  ) => {
    if (direction[0] !== 0 && !session.fixedWidth) {
      session.fixedWidth = true

      if (style.widthMode !== 'fixed') {
        changeDirectManipulation([{
          field: 'widthMode',
          kind: 'auto-layout',
          value: 'fixed',
        }])
      }
    }

    if (direction[1] !== 0 && !session.fixedHeight) {
      session.fixedHeight = true

      if (style.heightMode !== 'fixed') {
        changeDirectManipulation([{
          field: 'heightMode',
          kind: 'auto-layout',
          value: 'fixed',
        }])
      }
    }
  }

  return (
    <div
      className="figma-selection-layer"
      aria-label="Canvas DOM editing controls"
    >
      {visibility.geometry && !isCanvasPanActive ? (
        <Moveable
          ref={moveableRef}
          className="figma-dom-moveable"
          container={shellElement ?? undefined}
          draggable={draggable}
          isDisplaySnapDigit
          renderDirections={resizable ? ['e', 's', 'se'] : []}
          resizable={resizable}
          rootContainer={shellElement ?? undefined}
          snapContainer={shellElement ?? undefined}
          snapGridHeight={8}
          snapGridWidth={8}
          snapThreshold={6}
          snappable
          target={target}
          throttleDrag={1}
          throttleResize={1}
          throttleRotate={1}
          useMutationObserver
          useResizeObserver
          zoom={1}
          onDrag={(event: OnDrag) => {
            const startPosition = readDomEditMoveableTuple(
              event.datas.startPosition,
              [style.x, style.y],
            )
            const translate = readDomEditMoveableTuple(
              event.beforeTranslate,
              [0, 0],
            )
            const nextPosition = constrainDomEditMoveableDrag({
              current: [
                startPosition[0] + translate[0] / rect.scale,
                startPosition[1] + translate[1] / rect.scale,
              ],
              isConstrained: event.inputEvent?.shiftKey === true,
              start: startPosition,
            })

            changeDirectManipulation([
              { field: 'x', kind: 'number', value: nextPosition[0] },
              { field: 'y', kind: 'number', value: nextPosition[1] },
            ])
          }}
          onDragStart={(event: OnDragStart) => {
            startDirectManipulation('move')
            event.datas.startPosition = [style.x, style.y]
            event.set([0, 0])
          }}
          onDragEnd={(event: OnDragEnd) => {
            endDirectManipulation(isDomEditCancelledInput(event.inputEvent))
          }}
          onResize={(event: OnResize) => {
            if (!hasDomEditResizeDelta(event.dist, rect.scale)) {
              return
            }

            fixResizedAxes(event.direction, event.datas)
            const startSize = readDomEditMoveableTuple(
              event.datas.startSize,
              [style.w, style.h],
            )
            const nextSize = resolveDomEditResizeSize({
              dist: event.dist,
              scale: rect.scale,
              start: startSize,
            })

            changeDirectManipulation([
              { field: 'w', kind: 'number', value: nextSize[0] },
              { field: 'h', kind: 'number', value: nextSize[1] },
            ])
          }}
          onResizeStart={(event: OnResizeStart) => {
            startDirectManipulation('resize')
            event.datas.startSize = [style.w, style.h]
            if (event.inputEvent?.shiftKey) {
              event.setRatio(event.startRatio)
            }
            event.set([style.w, style.h])
          }}
          onResizeEnd={(event: OnResizeEnd) => {
            endDirectManipulation(isDomEditCancelledInput(event.inputEvent))
          }}
        />
      ) : null}
      <DomEditViewportOverlayLayer
        className={[
          'figma-selection-guide-layer',
          isCanvasPanActive
            ? 'figma-selection-guide-layer--pan-passthrough'
            : '',
        ].filter(Boolean).join(' ')}
        viewport={viewport}
      >
        <DomEditGuideOverlay
          adapter={adapter}
          affordanceState={affordanceState}
          frameGuides={frameGuides}
          overlayLayers={layerVisibility}
          rect={rect}
          selectedNodeId={selectedNodeId}
          shellRef={shellRef}
          state={state}
          viewport={viewport}
        />
        {layerVisibility.guides && affordanceState.mode !== 'xray' ? (
          <DomEditOverflowOverlay
            rect={rect}
            shellRef={shellRef}
            target={target}
            viewport={viewport}
          />
        ) : null}
        {visibility.xray && layerVisibility.boxModel ? (
          <>
            <DomEditBoxModelOverlay
              owner="selected"
              rect={rect}
              target={target}
            />
            {activeXrayHoverTarget ? (
              <DomEditBoxModelOverlay
                owner="hover"
                rect={activeXrayHoverTarget.rect}
                target={activeXrayHoverTarget.target}
              />
            ) : null}
          </>
        ) : null}
        {visibility.measurements && layerVisibility.boxModel ? (
          <DomEditMarginGhostOverlay
            owner="selected"
            rect={rect}
            target={target}
          />
        ) : null}
        {layerVisibility.grid ? (
          <DomEditGridOverlay
            key={selectedNodeId}
            adapter={adapter}
            affordanceState={affordanceState}
            directManipulation={directManipulation}
            rect={rect}
            selectedNodeId={selectedNodeId}
            shellRef={shellRef}
            spacingGridSize={spacingGridSize}
            state={state}
            target={target}
            viewport={viewport}
            onChange={onChange}
            onAffordanceStateChange={onAffordanceStateChange}
          />
        ) : null}
        {layerVisibility.flex ? (
          <DomEditAutoLayoutOverlay
            adapter={adapter}
            affordanceState={affordanceState}
            directManipulation={directManipulation}
            rect={rect}
            selectedNodeId={selectedNodeId}
            shellRef={shellRef}
            spacingGridSize={spacingGridSize}
            state={state}
            target={target}
            viewport={viewport}
            onChange={onChange}
            onChangeAutoLayout={onChangeAutoLayout}
            onAffordanceStateChange={onAffordanceStateChange}
          />
        ) : null}
      </DomEditViewportOverlayLayer>
    </div>
  )
}

function runDomEditSelectionOverlayCommand({
  action,
  affordanceState,
  onResetDirectManipulation,
  onChangeAffordanceState,
}: {
  action: DomEditInteractionAction
  affordanceState: DomEditAffordanceState
  onResetDirectManipulation: () => void
  onChangeAffordanceState: (state: DomEditAffordanceState) => void
}) {
  if (action.type === 'dom-edit.overlay.escape') {
    onResetDirectManipulation()
    onChangeAffordanceState({ mode: 'idle' })
    return true
  }

  if (action.type === 'dom-edit.tool.select') {
    onChangeAffordanceState({ mode: 'idle' })
    return true
  }

  if (action.type === 'dom-edit.overlay.toggle-measure') {
    onChangeAffordanceState(
      affordanceState.mode === 'measure'
        ? { mode: 'idle' }
        : { mode: 'measure' },
    )
    return true
  }

  if (action.type === 'dom-edit.overlay.toggle-xray') {
    onChangeAffordanceState(
      affordanceState.mode === 'xray'
        ? { mode: 'idle' }
        : { mode: 'xray' },
    )
    return true
  }

  return false
}

function hasDomEditResizeDelta(dist: number[], scale: number): boolean {
  const [dx = 0, dy = 0] = dist

  return Math.abs(dx / scale) >= 0.5 || Math.abs(dy / scale) >= 0.5
}

function roundDomEditNumber(value: number): number {
  return Math.round(value * 10) / 10
}

function isDomEditCancelledInput(input: unknown) {
  return Boolean(
    input &&
    typeof input === 'object' &&
    'type' in input &&
    (input.type === 'pointercancel' || input.type === 'touchcancel'),
  )
}

function DomEditViewportOverlayLayer({
  children,
  className,
  viewport,
}: {
  children: ReactNode
  className?: string
  viewport: DomEditViewport
}) {
  return (
    <div
      className={className}
      style={{
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
        transformOrigin: '0 0',
      }}
    >
      {children}
    </div>
  )
}
