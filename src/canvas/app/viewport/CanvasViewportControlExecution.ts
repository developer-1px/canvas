import {
  fitBoundsIntoViewport,
  INITIAL_VIEWPORT,
  zoomViewport,
} from '../../core'
import type { Viewport } from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'

export type CanvasViewportSetter = (
  next: Viewport | ((current: Viewport) => Viewport),
) => void

type FitCanvasViewportToItemsArgs = {
  ids?: string[]
  itemReadModel: CanvasItemReadModel
  setViewport: CanvasViewportSetter
  stageElement: CanvasAppStageElement
}

type ResetCanvasViewportArgs = {
  setViewport: CanvasViewportSetter
}

type ZoomCanvasViewportByArgs = {
  multiplier: number
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

export function zoomCanvasViewportBy({
  multiplier,
  setViewport,
  stageElement,
}: ZoomCanvasViewportByArgs) {
  const rect = stageElement.getRect()

  if (!rect) {
    return
  }

  const point = {
    x: rect.width / 2,
    y: rect.height / 2,
  }

  setViewport((current) => zoomViewport(current, point, multiplier))
}
