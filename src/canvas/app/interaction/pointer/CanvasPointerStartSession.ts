import type {
  Point,
  Viewport,
} from '../../../entities'
import type { CanvasAppStageElement } from '../../stage/CanvasAppStageElement'
import type { CanvasAppScreenPointInput } from './CanvasAppPointerInput'
import { screenPoint, screenToWorld } from './CanvasPointerGeometry'

export type CanvasPointerStartProjection = {
  startScreen: Point
  startWorld: Point
}

export function getCanvasPointerStartProjection({
  event,
  stageElement,
  viewport,
}: {
  event: CanvasAppScreenPointInput
  stageElement: CanvasAppStageElement
  viewport: Viewport
}): CanvasPointerStartProjection {
  const startScreen = screenPoint(stageElement, event)

  return {
    startScreen,
    startWorld: screenToWorld(startScreen, viewport),
  }
}
