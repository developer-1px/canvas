import {
  isCanvasWheelPassthroughTarget,
} from '../../affordances/interaction/dom/CanvasInteractionTarget'
import type {
  CanvasAppStageDomElement,
  CanvasAppStageWheelHandler,
} from './CanvasAppStageElementContracts'
import {
  getCanvasAppStageElementRect,
} from './CanvasAppStageElementGeometry'

export function addCanvasAppStageWheelListener({
  element,
  handler,
}: {
  element: CanvasAppStageDomElement
  handler: CanvasAppStageWheelHandler
}) {
  const activeElement = element
  const wheelRoot = activeElement.parentElement ?? activeElement

  function handleWheel(event: globalThis.WheelEvent) {
    if (!isCanvasStageWheelEvent(event, activeElement)) {
      return
    }

    handler(event, getCanvasAppStageElementRect(activeElement))
  }

  wheelRoot.addEventListener('wheel', handleWheel, {
    capture: true,
    passive: false,
  })

  return () => {
    wheelRoot.removeEventListener('wheel', handleWheel, { capture: true })
  }
}

function isCanvasStageWheelEvent(
  event: globalThis.WheelEvent,
  stageElement: CanvasAppStageDomElement,
): boolean {
  const target = event.target

  if (typeof Node === 'undefined' || typeof Element === 'undefined') {
    return true
  }

  if (!(target instanceof Node)) {
    return true
  }

  if (isCanvasWheelPassthroughTarget(target)) {
    return false
  }

  if (stageElement.contains(target)) {
    return true
  }

  return target instanceof Element &&
    Boolean(target.closest('.canvas-viewport-overlay-layer'))
}
