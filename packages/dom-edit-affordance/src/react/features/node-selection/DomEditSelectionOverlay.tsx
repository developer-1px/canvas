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
  type OnResize,
  type OnResizeStart,
} from 'react-moveable'
import {
  getDomEditOverlayVisibility,
  type DomEditAffordanceState,
} from '../../../features/node-selection/DomEditAffordanceVisibility'
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
  readDomEditMoveableTuple,
  resolveDomEditResizeSize,
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
import { DomEditBoxModelOverlay } from '../box-model-xray/DomEditBoxModelOverlay'
import { DomEditAutoLayoutOverlay } from '../layout-editing/DomEditAutoLayoutOverlay'
import { DomEditGridOverlay } from '../layout-editing/DomEditGridOverlay'
import { DomEditGuideOverlay } from '../spatial-inspection/DomEditGuideOverlay'

type DomEditResizeSessionData = {
  fixedHeight?: boolean
  fixedWidth?: boolean
  startSize?: number[]
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
  shellRef,
  selectedNodeId,
  state,
  viewport,
  affordanceState: appAffordanceState,
  isCanvasPanActive,
  onAffordanceStateChange,
  onChange,
  onChangeAutoLayout,
  onCommand,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  affordanceState: DomEditAffordanceState
  isCanvasPanActive: boolean
  selectedNodeId: TNodeId | null
  shellRef: RefObject<HTMLElement | null>
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
}) {
  const [rect, setRect] = useState<DomEditScaledOverlayRect | null>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [isDirectManipulation, setIsDirectManipulation] = useState(false)
  const [isTemporaryGuideMode, setIsTemporaryGuideMode] = useState(false)
  const [isTemporaryMeasureMode, setIsTemporaryMeasureMode] = useState(false)
  const [shellElement, setShellElement] = useState<HTMLElement | null>(null)
  const measuredRectRef = useRef<DomEditScaledOverlayRect | null>(null)
  const measuredTargetRef = useRef<HTMLElement | null>(null)
  const moveableRef = useRef<Moveable | null>(null)

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
      if (event.repeat) {
        return
      }

      const command = resolveDomEditKeyboardCommand(event)

      if (!command) {
        return
      }

      const handled = runDomEditSelectionOverlayCommand({
        action: command.action,
        affordanceState: appAffordanceState,
        onResetDirectManipulation: () => {
          setIsDirectManipulation(false)
          setIsTemporaryGuideMode(false)
          setIsTemporaryMeasureMode(false)
        },
        onChangeAffordanceState: onAffordanceStateChange,
      }) || onCommand?.(command.action) === true

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
  }, [appAffordanceState, onAffordanceStateChange, onCommand])

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
  const changeField = (field: DomEditField, value: number) => {
    onChange(selectedNodeId, field, roundDomEditNumber(value))
  }
  const startDirectManipulation = () => {
    setIsDirectManipulation(true)
    onAffordanceStateChange({ mode: 'drag-property', property: 'geometry' })
  }
  const endDirectManipulation = () => {
    setIsDirectManipulation(false)
    onAffordanceStateChange({ mode: 'idle' })
  }
  const fixResizedAxes = (
    direction: number[],
    session: DomEditResizeSessionData,
  ) => {
    if (direction[0] !== 0 && !session.fixedWidth) {
      session.fixedWidth = true

      if (style.widthMode !== 'fixed') {
        onChangeAutoLayout(selectedNodeId, 'widthMode', 'fixed')
      }
    }

    if (direction[1] !== 0 && !session.fixedHeight) {
      session.fixedHeight = true

      if (style.heightMode !== 'fixed') {
        onChangeAutoLayout(selectedNodeId, 'heightMode', 'fixed')
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
          draggable={false}
          isDisplaySnapDigit
          renderDirections={['e', 's', 'se']}
          resizable
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

            changeField('w', nextSize[0])
            changeField('h', nextSize[1])
          }}
          onResizeStart={(event: OnResizeStart) => {
            startDirectManipulation()
            event.datas.startSize = [style.w, style.h]
            if (event.inputEvent?.shiftKey) {
              event.setRatio(event.startRatio)
            }
            event.set([style.w, style.h])
          }}
          onResizeEnd={endDirectManipulation}
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
          rect={rect}
          selectedNodeId={selectedNodeId}
          shellRef={shellRef}
          state={state}
          viewport={viewport}
        />
        {visibility.xray ? (
          <DomEditBoxModelOverlay
            rect={rect}
            target={target}
          />
        ) : null}
        <DomEditGridOverlay
          adapter={adapter}
          affordanceState={affordanceState}
          rect={rect}
          selectedNodeId={selectedNodeId}
          shellRef={shellRef}
          state={state}
          target={target}
          viewport={viewport}
          onChange={onChange}
          onAffordanceStateChange={onAffordanceStateChange}
        />
        <DomEditAutoLayoutOverlay
          adapter={adapter}
          affordanceState={affordanceState}
          rect={rect}
          selectedNodeId={selectedNodeId}
          shellRef={shellRef}
          state={state}
          target={target}
          viewport={viewport}
          onChange={onChange}
          onChangeAutoLayout={onChangeAutoLayout}
          onAffordanceStateChange={onAffordanceStateChange}
        />
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

function roundDomEditNumber(value: number): number {
  return Math.round(value * 10) / 10
}

function hasDomEditResizeDelta(dist: number[], scale: number): boolean {
  const [dx = 0, dy = 0] = dist

  return Math.abs(dx / scale) >= 0.5 || Math.abs(dy / scale) >= 0.5
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
