import {
  useState,
  type RefCallback,
} from 'react'
import {
  getCanvasViewportWorldPoint,
} from '../../../core'
import type {
  Point,
  Viewport,
} from '../../../entities'
import {
  bindCanvasNativeGestureBoundary,
  CANVAS_NATIVE_GESTURE_BOUNDARY_SELECTOR,
  resolveCanvasNativeWheelOwnership,
  type CanvasNativeGestureTarget,
} from '../../../browser-runtime/CanvasNativeGestureBoundary'
import {
  bindCanvasPointerPinchGesture,
  type CanvasPointerPinchChange,
  type CanvasPointerPinchTarget,
} from '../../../browser-runtime/CanvasPointerPinchGesture'

export type CanvasAppStageRect = {
  height: number
  left: number
  top: number
  width: number
}

export type CanvasAppStageSvgSnapshot = {
  height: number
  svg: string
  width: number
}

export type CanvasAppStageSvgSnapshotInput = {
  bounds: {
    h: number
    w: number
    x: number
    y: number
  }
  ids: readonly string[]
}

export type CanvasAppStageWheelHandler = (
  event: globalThis.WheelEvent,
  rect: CanvasAppStageRect,
) => void

type CanvasAppStageDomElement = CanvasPointerPinchTarget & {
  closest?: (selector: string) => CanvasNativeGestureTarget | null
  contains: (target: Node | null) => boolean
  getBoundingClientRect: () => CanvasAppStageRect
  hasPointerCapture: (pointerId: number) => boolean
  parentElement: CanvasNativeGestureTarget | null
  releasePointerCapture: (pointerId: number) => void
  setPointerCapture: (pointerId: number) => void
}

export type CanvasAppStageElement = {
  addWheelListener: (handler: CanvasAppStageWheelHandler) => () => void
  capturePointer: (pointerId: number) => void
  getRect: () => CanvasAppStageRect | null
  getScreenPoint: (event: { clientX: number; clientY: number }) => Point
  getSelectionSvgSnapshot?: (
    input: CanvasAppStageSvgSnapshotInput,
  ) => CanvasAppStageSvgSnapshot | null
  getViewportCenter: (viewport: Viewport) => Point | null
  releasePointer: (pointerId: number) => void
}

type CanvasAppStageElementMount = {
  ref: RefCallback<Element>
}

export type CanvasAppStageElementController = CanvasAppStageElement & {
  mount: CanvasAppStageElementMount
}

type CreateCanvasAppStageElementInput = {
  getElement: () => CanvasAppStageDomElement | null
  setElement: RefCallback<Element>
}

export function useCanvasAppStageElement(): CanvasAppStageElementController {
  const [, setRevision] = useState(0)
  const [stageElement] = useState(() => {
    let element: Element | null = null

    return createCanvasAppStageElement({
      getElement: () => element,
      setElement: (nextElement) => {
        element = nextElement
        setRevision((current) => current + 1)
      },
    })
  })

  return stageElement
}

export function createCanvasAppStageElement({
  getElement,
  setElement,
}: CreateCanvasAppStageElementInput): CanvasAppStageElementController {
  return {
    addWheelListener: (handler) => {
      const element = getElement()

      if (!element) {
        return () => undefined
      }

      const activeElement = element
      const wheelRoot = activeElement.closest?.(
        CANVAS_NATIVE_GESTURE_BOUNDARY_SELECTOR,
      ) ?? activeElement.parentElement ?? activeElement
      const cleanupNativeGestureBoundary =
        bindCanvasNativeGestureBoundary(wheelRoot)
      let gestureScale = 1

      const runPinchWheel = (
        change: CanvasPointerPinchChange,
        zoom: boolean,
      ) => {
        const rect = getStageElementRect(activeElement)

        handler({
          clientX: change.clientX,
          clientY: change.clientY,
          ctrlKey: zoom,
          deltaMode: 0,
          deltaX: zoom ? 0 : -change.deltaX,
          deltaY: zoom ? -Math.log(change.scale) / 0.01 : -change.deltaY,
          metaKey: false,
          preventDefault: () => undefined,
          shiftKey: false,
        } as globalThis.WheelEvent, rect)
      }
      const cleanupPointerPinch = bindCanvasPointerPinchGesture(
        activeElement,
        (change) => {
          if (change.deltaX !== 0 || change.deltaY !== 0) {
            runPinchWheel(change, false)
          }

          if (change.scale !== 1) {
            runPinchWheel(change, true)
          }
        },
      )

      function handleWheel(event: Event) {
        const wheelEvent = event as globalThis.WheelEvent

        if (!isCanvasStageWheelEvent(wheelEvent, activeElement)) {
          return
        }

        handler(wheelEvent, getStageElementRect(activeElement))
      }

      function handleGestureStart(event: Event) {
        if (!isCanvasStageWheelEvent(
          event as globalThis.WheelEvent,
          activeElement,
        )) {
          return
        }

        gestureScale = getCanvasGestureScale(event) ?? 1
      }

      function handleGestureChange(event: Event) {
        if (!isCanvasStageWheelEvent(
          event as globalThis.WheelEvent,
          activeElement,
        )) {
          return
        }

        const nextScale = getCanvasGestureScale(event)

        if (nextScale === null) {
          return
        }

        const factor = nextScale / gestureScale

        gestureScale = nextScale

        if (!Number.isFinite(factor) || factor <= 0 || factor === 1) {
          return
        }

        const rect = getStageElementRect(activeElement)
        const gestureEvent = event as CanvasAppGestureEvent

        handler({
          clientX: gestureEvent.clientX ?? rect.left + rect.width / 2,
          clientY: gestureEvent.clientY ?? rect.top + rect.height / 2,
          ctrlKey: true,
          deltaMode: 0,
          deltaX: 0,
          deltaY: -Math.log(factor) / 0.01,
          metaKey: false,
          preventDefault: () => event.preventDefault(),
          shiftKey: false,
        } as globalThis.WheelEvent, rect)
      }

      function handleGestureEnd() {
        gestureScale = 1
      }

      wheelRoot.addEventListener('wheel', handleWheel, {
        capture: true,
        passive: false,
      })
      wheelRoot.addEventListener('gesturestart', handleGestureStart, {
        capture: true,
        passive: false,
      })
      wheelRoot.addEventListener('gesturechange', handleGestureChange, {
        capture: true,
        passive: false,
      })
      wheelRoot.addEventListener('gestureend', handleGestureEnd, {
        capture: true,
        passive: false,
      })

      return () => {
        wheelRoot.removeEventListener('wheel', handleWheel, { capture: true })
        wheelRoot.removeEventListener('gesturestart', handleGestureStart, {
          capture: true,
        })
        wheelRoot.removeEventListener('gesturechange', handleGestureChange, {
          capture: true,
        })
        wheelRoot.removeEventListener('gestureend', handleGestureEnd, {
          capture: true,
        })
        cleanupPointerPinch()
        cleanupNativeGestureBoundary()
      }
    },
    capturePointer: (pointerId) => {
      const element = getElement()

      if (element && !element.hasPointerCapture(pointerId)) {
        element.setPointerCapture(pointerId)
      }
    },
    getRect: () => {
      const element = getElement()

      return element ? getStageElementRect(element) : null
    },
    getScreenPoint: (event) => {
      const rect = getElement()?.getBoundingClientRect()

      if (!rect) {
        return { x: 0, y: 0 }
      }

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
    },
    getSelectionSvgSnapshot: (input) => {
      const element = getElement()

      return typeof SVGSVGElement !== 'undefined' &&
        element instanceof SVGSVGElement
        ? createCanvasSelectionSvgSnapshot(element, input)
        : null
    },
    getViewportCenter: (viewport) => {
      const rect = getElement()?.getBoundingClientRect()

      if (!rect) {
        return null
      }

      return getCanvasViewportWorldPoint(viewport, {
        x: rect.width / 2,
        y: rect.height / 2,
      })
    },
    releasePointer: (pointerId) => {
      const element = getElement()

      if (element?.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId)
      }
    },
    mount: {
      ref: setElement,
    },
  }
}

function isCanvasStageWheelEvent(
  event: globalThis.WheelEvent,
  stageElement: CanvasAppStageDomElement,
): boolean {
  const target = event.target

  if (resolveCanvasNativeWheelOwnership(event) === 'native') {
    return false
  }

  if (typeof Node === 'undefined' || typeof Element === 'undefined') {
    return true
  }

  if (!(target instanceof Node)) {
    return true
  }

  if (stageElement.contains(target)) {
    return true
  }

  return target instanceof Element &&
    Boolean(target.closest('.canvas-viewport-overlay-layer'))
}

type CanvasAppGestureEvent = Event & {
  readonly clientX?: number
  readonly clientY?: number
  readonly scale?: number
}

function getCanvasGestureScale(event: Event) {
  const scale = (event as CanvasAppGestureEvent).scale

  return typeof scale === 'number' && Number.isFinite(scale) && scale > 0
    ? scale
    : null
}

const CANVAS_STAGE_SNAPSHOT_PADDING = 24
const CANVAS_STAGE_SNAPSHOT_STYLE = `
.shape-item{stroke-width:1.25}
.component-card,.component-section,.component-sticky-note{stroke-linejoin:round;stroke-width:.9}
.component-concept-card{fill:rgba(255,255,255,.7);stroke:#e1e7ef}
.component-card,.component-sticky-note{filter:none}
.component-section{fill:rgba(248,250,252,.18);stroke:rgba(100,116,139,.48);stroke-dasharray:7 5}
.component-section-rule{display:none}
.marker-item,.highlight-item{fill:none;stroke-linecap:round;stroke-linejoin:round}
.path-item{stroke-linecap:round;stroke-linejoin:round}
.highlight-item{mix-blend-mode:multiply}
.arrow-item{fill:none;stroke-linecap:round;stroke-linejoin:round}
.arrow-head{fill:#a8b2c0}
.arrow-label{opacity:.28;pointer-events:none}
.arrow-label-bg{fill:transparent;stroke:transparent;stroke-width:0}
.arrow-label-text{box-sizing:border-box;display:grid;width:100%;height:100%;align-items:center;justify-items:center;overflow:hidden;padding:3px 8px;color:#687386;font:650 9.5px/1.12 sans-serif;text-align:center;white-space:pre-wrap;word-break:break-word}
.component-hit,.group-hit{fill:transparent}
.canvas-text{box-sizing:border-box;width:100%;height:100%;overflow:hidden;padding:6px 8px;color:#172033;font:500 16px/1.35 sans-serif;white-space:pre-wrap;word-break:break-word}
.canvas-shape-text{display:grid;align-items:center;justify-items:center;text-align:center}
.component-text{box-sizing:border-box;width:100%;height:100%;padding:15px 18px 14px;color:#172033;font-family:sans-serif}
.component-text-compact{padding:10px 12px}
.component-title{font-size:16.5px;font-weight:780;line-height:1.16}
.component-body{margin-top:8px;color:#5d6878;font-size:13px;font-weight:540;line-height:1.42}
.component-section-label{box-sizing:border-box;display:grid;width:100%;height:100%;grid-template-columns:minmax(0,auto) minmax(0,1fr);grid-template-rows:24px 1fr;column-gap:10px;align-items:start;overflow:hidden;padding:11px 14px;color:#172033;font-family:sans-serif;pointer-events:none}
.component-section-accent{display:none}
.component-section-title{overflow:hidden;color:#687386;font-size:13px;font-weight:680;line-height:1.15;text-overflow:ellipsis;white-space:nowrap}
.component-section-body{display:none;grid-column:1 / -1;overflow:hidden;color:#748094;font-size:11.5px;font-weight:540;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
.component-svg-title,.component-svg-text{fill:#172033;font-family:sans-serif;pointer-events:none}
.component-svg-title{font-size:14.5px;font-weight:780}
.component-svg-title-invert{fill:#fff}
.component-svg-text{fill:#5d6878;font-size:12px;font-weight:540}
.image-item{pointer-events:none}
.image-hit{fill:transparent;pointer-events:all}
.comment-item,.comment-tail{fill:#fff;stroke:#2563eb;stroke-width:1.4}
.comment-line{stroke:#2563eb;stroke-linecap:round;stroke-width:1.6;pointer-events:none}
.comment-hit{fill:transparent;pointer-events:all}
.comment-body-card{box-sizing:border-box;width:100%;height:100%;overflow:hidden;padding:10px 12px;border:1.5px solid #e1e7ef;border-radius:6px;background:#fff;color:#172033;font:500 12px/1.35 sans-serif;pointer-events:none}
.comment-thread-header,.comment-thread-meta{display:flex;align-items:center;justify-content:space-between;gap:8px}
.comment-thread-header{margin-bottom:8px;color:#5d6878;font:750 11px/1 sans-serif}
.comment-thread-messages{display:grid;gap:8px}
.comment-thread-message{display:grid;gap:4px}
.comment-thread-meta{color:#5d6878;font:700 10px/1 sans-serif}
.comment-thread-body{overflow:hidden;color:#172033;text-overflow:ellipsis;white-space:pre-wrap;word-break:break-word}
.stamp-item{fill:#fff;stroke:#cbd5e1;stroke-width:1.25}
.stamp-label{fill:#111827;font:750 18px/1 sans-serif;pointer-events:none;text-anchor:middle}
.stamp-hit{fill:transparent;pointer-events:all}
.presence-cursor{pointer-events:none}
.presence-selection{pointer-events:none}
.presence-selection-rect{fill:rgba(255,255,255,.08);stroke-width:1.75}
.presence-cursor-pointer{stroke:#fff;stroke-width:1.5}
.presence-label-text{fill:#fff;font:700 12px/1 sans-serif;pointer-events:none}
	`

function createCanvasSelectionSvgSnapshot(
  element: SVGSVGElement,
  { bounds, ids }: CanvasAppStageSvgSnapshotInput,
): CanvasAppStageSvgSnapshot | null {
  const selectedIds = new Set(ids)
  const selectedNodes = Array.from(
    element.querySelectorAll('[data-canvas-item-id]'),
  ).filter((node) =>
    selectedIds.has(node.getAttribute('data-canvas-item-id') ?? ''),
  )

  if (selectedNodes.length === 0) {
    return null
  }

  const viewBox = {
    h: bounds.h + CANVAS_STAGE_SNAPSHOT_PADDING * 2,
    w: bounds.w + CANVAS_STAGE_SNAPSHOT_PADDING * 2,
    x: bounds.x - CANVAS_STAGE_SNAPSHOT_PADDING,
    y: bounds.y - CANVAS_STAGE_SNAPSHOT_PADDING,
  }
  const snapshot = element.ownerDocument.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  )
  const background = element.ownerDocument.createElementNS(
    'http://www.w3.org/2000/svg',
    'rect',
  )
  const style = element.ownerDocument.createElementNS(
    'http://www.w3.org/2000/svg',
    'style',
  )
  const defs = element.querySelector('defs')?.cloneNode(true)

  snapshot.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  snapshot.setAttribute('width', `${Math.ceil(viewBox.w)}`)
  snapshot.setAttribute('height', `${Math.ceil(viewBox.h)}`)
  snapshot.setAttribute(
    'viewBox',
    `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`,
  )
  style.textContent = CANVAS_STAGE_SNAPSHOT_STYLE
  snapshot.append(style)

  if (defs) {
    snapshot.append(defs)
  }

  background.setAttribute('x', `${viewBox.x}`)
  background.setAttribute('y', `${viewBox.y}`)
  background.setAttribute('width', `${viewBox.w}`)
  background.setAttribute('height', `${viewBox.h}`)
  background.setAttribute('fill', '#ffffff')
  snapshot.append(background)

  for (const node of selectedNodes) {
    snapshot.append(cloneCanvasSelectionSnapshotNode(node))
  }

  return {
    height: Math.ceil(viewBox.h),
    svg: new XMLSerializer().serializeToString(snapshot),
    width: Math.ceil(viewBox.w),
  }
}

function cloneCanvasSelectionSnapshotNode(node: Element) {
  const clone = node.cloneNode(true) as Element

  clone.removeAttribute('data-selected')

  for (const transientNode of clone.querySelectorAll(
    '.item-outline,.image-hit,.comment-hit,.stamp-hit',
  )) {
    transientNode.remove()
  }

  return clone
}

function getStageElementRect(
  element: CanvasAppStageDomElement,
): CanvasAppStageRect {
  const rect = element.getBoundingClientRect()

  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  }
}
