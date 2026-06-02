import {
  useState,
  type RefCallback,
} from 'react'
import type {
  Point,
  Viewport,
} from '../../../entities'

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

type CanvasAppStageDomElement = {
  addEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
    options?: AddEventListenerOptions,
  ) => void
  getBoundingClientRect: () => CanvasAppStageRect
  hasPointerCapture: (pointerId: number) => boolean
  releasePointerCapture: (pointerId: number) => void
  removeEventListener: (
    type: 'wheel',
    listener: (event: globalThis.WheelEvent) => void,
  ) => void
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
  const [stageElement] = useState(() => {
    let element: Element | null = null

    return createCanvasAppStageElement({
      getElement: () => element,
      setElement: (nextElement) => {
        element = nextElement
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

      function handleWheel(event: globalThis.WheelEvent) {
        handler(event, getStageElementRect(activeElement))
      }

      activeElement.addEventListener('wheel', handleWheel, { passive: false })

      return () => {
        activeElement.removeEventListener('wheel', handleWheel)
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

      return {
        x: (rect.width / 2 - viewport.x) / viewport.scale,
        y: (rect.height / 2 - viewport.y) / viewport.scale,
      }
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
