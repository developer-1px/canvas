import {
  fitBoundsIntoViewport,
  getCanvasViewportZoomStepMultiplier,
  INITIAL_VIEWPORT,
  zoomViewport,
  type CanvasViewportZoomDirection,
} from '../../../../core'
import type { Viewport } from '../../../../entities'
import type { CanvasAppStageElement } from '../../../rendering/stage/CanvasAppStageElement'
import type { CanvasAppItemReadModel } from '../../../workflow/CanvasAppItemReadModelContracts'
import {
  getCanvasMinimapViewportForWorldCenter,
} from '../../controls/minimap/CanvasMinimapModel'

export type CanvasViewportSetter = (
  next: Viewport | ((current: Viewport) => Viewport),
) => void

type FitCanvasViewportToItemsArgs = {
  ids?: string[]
  itemReadModel: CanvasAppItemReadModel
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
  const bounds = itemReadModel.getSelectionBounds(targetIds)
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
    getCanvasMinimapViewportForWorldCenter({
      current,
      stageRect: rect,
      worldCenter: point,
    }),
  )
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
