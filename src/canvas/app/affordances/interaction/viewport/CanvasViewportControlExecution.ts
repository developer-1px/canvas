import {
  fitBoundsIntoViewport,
  getCanvasViewportZoomStepMultiplier,
  INITIAL_VIEWPORT,
  zoomViewport,
  type CanvasViewportZoomDirection,
} from '../../../../core'
import type {
  Bounds,
  Viewport,
} from '../../../../entities'
import type {
  CanvasAppStageElement,
  CanvasAppStageRect,
} from '../../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'

export type CanvasViewportSetter = (
  next: Viewport | ((current: Viewport) => Viewport),
) => void

export const CANVAS_WHEEL_VIEWPORT_MODEL = 'canvas-wheel-viewport'
export const CANVAS_WHEEL_VIEWPORT_PAN_MODE = 'ordinary-wheel'
export const CANVAS_WHEEL_VIEWPORT_HORIZONTAL_PAN_MODIFIER = 'Shift'
export const CANVAS_WHEEL_VIEWPORT_ZOOM_MODIFIER = 'Ctrl/Meta'

type FitCanvasViewportToItemsArgs = {
  ids?: string[]
  itemReadModel: CanvasAppItemReadModel
  setViewport: CanvasViewportSetter
  stageElement: CanvasAppStageElement
}

type FitCanvasViewportToBoundsArgs = {
  bounds: Bounds | null | undefined
  setViewport: CanvasViewportSetter
  stageElement: CanvasAppStageElement
}

type ResetCanvasViewportArgs = {
  setViewport: CanvasViewportSetter
}

type CenterCanvasViewportAtWorldPointArgs = {
  point: {
    x: number
    y: number
  }
  setViewport: CanvasViewportSetter
  stageElement: CanvasAppStageElement
}

type ZoomCanvasViewportArgs = {
  direction: CanvasViewportZoomDirection
  setViewport: CanvasViewportSetter
  stageElement: CanvasAppStageElement
}

export function fitCanvasViewportToItems({
  ids,
  itemReadModel,
  setViewport,
  stageElement,
}: FitCanvasViewportToItemsArgs) {
  const targetIds =
    ids && ids.length > 0
      ? ids
      : itemReadModel.getAllIds()

  fitCanvasViewportToBounds({
    bounds: itemReadModel.getSelectionBounds(targetIds),
    setViewport,
    stageElement,
  })
}

export function fitCanvasViewportToBounds({
  bounds,
  setViewport,
  stageElement,
}: FitCanvasViewportToBoundsArgs) {
  const rect = stageElement.getRect()

  if (!bounds || !rect) {
    return
  }

  setViewport(fitBoundsIntoViewport(bounds, rect))
}

export function resetCanvasViewport({
  setViewport,
}: ResetCanvasViewportArgs) {
  setViewport(INITIAL_VIEWPORT)
}

export function centerCanvasViewportAtWorldPoint({
  point,
  setViewport,
  stageElement,
}: CenterCanvasViewportAtWorldPointArgs) {
  const rect = stageElement.getRect()

  if (!rect) {
    return
  }

  setViewport((current) =>
    getCanvasViewportForWorldCenter({
      current,
      stageRect: rect,
      worldCenter: point,
    }),
  )
}

function getCanvasViewportForWorldCenter({
  current,
  stageRect,
  worldCenter,
}: {
  current: Viewport
  stageRect: CanvasAppStageRect
  worldCenter: { x: number; y: number }
}): Viewport {
  return {
    scale: current.scale,
    x: stageRect.width / 2 - worldCenter.x * current.scale,
    y: stageRect.height / 2 - worldCenter.y * current.scale,
  }
}

export function zoomCanvasViewport({
  direction,
  setViewport,
  stageElement,
}: ZoomCanvasViewportArgs) {
  const rect = stageElement.getRect()

  if (!rect) {
    return
  }

  const point = {
    x: rect.width / 2,
    y: rect.height / 2,
  }

  setViewport((current) =>
    zoomViewport(
      current,
      point,
      getCanvasViewportZoomStepMultiplier(current.scale, direction),
    ),
  )
}
