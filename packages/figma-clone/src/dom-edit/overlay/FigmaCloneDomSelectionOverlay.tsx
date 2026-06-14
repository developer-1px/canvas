import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'
import Moveable, {
  type OnResize,
  type OnResizeStart,
} from 'react-moveable'
import {
  CanvasAppViewportOverlayLayer,
  type Viewport,
} from '../../../../../src/canvas'
import {
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomLayoutContext,
  type FigmaCloneDomAutoLayoutField,
  type FigmaCloneDomEditField,
  type FigmaCloneDomEditNodeState,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from '../FigmaCloneDomEditModel'
import { FigmaCloneDomAutoLayoutOverlay } from './FigmaCloneDomAutoLayoutOverlay'
import { FigmaCloneDomBoxModelOverlay } from './FigmaCloneDomBoxModelOverlay'
import { FigmaCloneDomGuideOverlay } from './FigmaCloneDomGuideOverlay'
import { FigmaCloneDomGridOverlay } from './FigmaCloneDomGridOverlay'
import {
  getFigmaCloneDomOverlayVisibility,
  type FigmaCloneDomAffordanceState,
} from './FigmaCloneDomAffordanceVisibility'
import {
  areFigmaCloneDomOverlayRectsEqual,
  getFigmaCloneDomOverlayElement,
  measureFigmaCloneDomNodeOverlayRect,
  type FigmaCloneDomScaledOverlayRect,
} from './FigmaCloneDomOverlayGeometry'
import {
  isFigmaCloneEditableKeyboardTarget,
  readFigmaCloneMoveableTuple,
  resolveFigmaCloneResizeSize,
} from './FigmaCloneDomOverlayGesture'

export function FigmaCloneDomSelectionOverlay({
  shellRef,
  selectedNodeId,
  state,
  viewport,
  affordanceState: appAffordanceState,
  isCanvasPanActive,
  onAffordanceStateChange,
  onChange,
  onChangeAutoLayout,
}: {
  affordanceState: FigmaCloneDomAffordanceState
  isCanvasPanActive: boolean
  selectedNodeId: FigmaCloneDomNodeId | null
  shellRef: RefObject<HTMLElement | null>
  state: FigmaCloneDomEditState
  viewport: Viewport
  onAffordanceStateChange: (state: FigmaCloneDomAffordanceState) => void
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
}) {
  const [rect, setRect] = useState<FigmaCloneDomScaledOverlayRect | null>(null)
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [isDirectManipulation, setIsDirectManipulation] = useState(false)
  const [isTemporaryGuideMode, setIsTemporaryGuideMode] = useState(false)
  const [isTemporaryMeasureMode, setIsTemporaryMeasureMode] = useState(false)
  const measuredRectRef = useRef<FigmaCloneDomScaledOverlayRect | null>(null)
  const measuredTargetRef = useRef<HTMLElement | null>(null)
  const moveableRef = useRef<Moveable | null>(null)

  useLayoutEffect(() => {
    if (!selectedNodeId) {
      measuredRectRef.current = null
      measuredTargetRef.current = null
      setRect(null)
      setTarget(null)
      return undefined
    }

    let frame = 0
    let disposed = false
    const measure = () => {
      const nextTarget = getFigmaCloneDomOverlayElement(selectedNodeId)
      const nextRect = measureFigmaCloneDomNodeOverlayRect({
        nodeId: selectedNodeId,
        shell: shellRef.current,
        state,
        viewport,
      })

      if (measuredTargetRef.current !== nextTarget) {
        measuredTargetRef.current = nextTarget
        setTarget(nextTarget)
      }

      if (!areFigmaCloneDomOverlayRectsEqual(measuredRectRef.current, nextRect)) {
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
  }, [selectedNodeId, shellRef, state, viewport])

  useEffect(() => {
    const updateModifierMode = (event: KeyboardEvent) => {
      if (isFigmaCloneEditableKeyboardTarget(event.target)) {
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
      if (event.repeat || isFigmaCloneEditableKeyboardTarget(event.target)) {
        return
      }

      if (event.key === 'Escape') {
        setIsDirectManipulation(false)
        setIsTemporaryGuideMode(false)
        setIsTemporaryMeasureMode(false)
        onAffordanceStateChange({ mode: 'idle' })
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'v') {
        onAffordanceStateChange({ mode: 'idle' })
        return
      }

      if (key === 'm') {
        onAffordanceStateChange(
          appAffordanceState.mode === 'measure'
            ? { mode: 'idle' }
            : { mode: 'measure' },
        )
        return
      }

      if (key === 'x') {
        onAffordanceStateChange(
          appAffordanceState.mode === 'xray'
            ? { mode: 'idle' }
            : { mode: 'xray' },
        )
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
  }, [appAffordanceState.mode, onAffordanceStateChange])

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

  if (!selectedNodeId || !rect || !target) {
    return null
  }

  const style = getFigmaCloneDomEditStyle(state, selectedNodeId)
  const context = getFigmaCloneDomLayoutContext(selectedNodeId)
  const affordanceState: FigmaCloneDomAffordanceState = isTemporaryMeasureMode
    ? { mode: 'measure' }
    : isDirectManipulation || isTemporaryGuideMode
      ? { mode: 'transform' }
      : appAffordanceState
  const visibility = getFigmaCloneDomOverlayVisibility({
    affordanceState,
    context,
  })
  const changeField = (field: FigmaCloneDomEditField, value: number) => {
    onChange(selectedNodeId, field, roundFigmaCloneDomEditNumber(value))
  }
  const startDirectManipulation = () => setIsDirectManipulation(true)
  const endDirectManipulation = () => setIsDirectManipulation(false)
  const fixResizedAxes = (direction: number[]) => {
    if (direction[0] !== 0 && style.widthMode !== 'fixed') {
      onChangeAutoLayout(selectedNodeId, 'widthMode', 'fixed')
    }

    if (direction[1] !== 0 && style.heightMode !== 'fixed') {
      onChangeAutoLayout(selectedNodeId, 'heightMode', 'fixed')
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
          container={shellRef.current ?? undefined}
          draggable={false}
          isDisplaySnapDigit
          renderDirections={['e', 's', 'se']}
          resizable
          rootContainer={shellRef.current ?? undefined}
          snapContainer={shellRef.current ?? undefined}
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
            const startSize = readFigmaCloneMoveableTuple(
              event.datas.startSize,
              [style.w, style.h],
            )
            const nextSize = resolveFigmaCloneResizeSize({
              dist: event.dist,
              scale: rect.scale,
              start: startSize,
            })

            changeField('w', nextSize[0])
            changeField('h', nextSize[1])
          }}
          onResizeStart={(event: OnResizeStart) => {
            startDirectManipulation()
            fixResizedAxes(event.direction)
            event.datas.startSize = [style.w, style.h]
            if (event.inputEvent?.shiftKey) {
              event.setRatio(event.startRatio)
            }
            event.set([style.w, style.h])
          }}
          onResizeEnd={endDirectManipulation}
        />
      ) : null}
      <CanvasAppViewportOverlayLayer
        className={[
          'figma-selection-guide-layer',
          isCanvasPanActive
            ? 'figma-selection-guide-layer--pan-passthrough'
            : '',
        ].filter(Boolean).join(' ')}
        viewport={viewport}
      >
        <FigmaCloneDomGuideOverlay
          affordanceState={affordanceState}
          rect={rect}
          selectedNodeId={selectedNodeId}
          shellRef={shellRef}
          state={state}
          viewport={viewport}
        />
        {visibility.xray ? (
          <FigmaCloneDomBoxModelOverlay
            rect={rect}
            target={target}
          />
        ) : null}
        <FigmaCloneDomGridOverlay
          affordanceState={affordanceState}
          rect={rect}
          selectedNodeId={selectedNodeId}
          shellRef={shellRef}
          state={state}
          target={target}
          viewport={viewport}
          onChange={onChange}
        />
        <FigmaCloneDomAutoLayoutOverlay
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
      </CanvasAppViewportOverlayLayer>
    </div>
  )
}

function roundFigmaCloneDomEditNumber(value: number): number {
  return Math.round(value * 10) / 10
}
