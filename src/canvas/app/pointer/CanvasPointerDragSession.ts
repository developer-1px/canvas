import type {
  Point,
  Viewport,
} from '../../entities'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { screenPoint, screenToWorld } from './CanvasPointerGeometry'

export type CanvasPointerDragInteraction = Exclude<
  Interaction,
  { kind: 'none' }
>

export type CanvasPointerDragSession = {
  interaction: CanvasPointerDragInteraction
}

export type CanvasPointerDragProjection = CanvasPointerDragSession & {
  currentScreen: Point
  currentWorld: Point
}

export function getCanvasPointerDragSession({
  event,
  interaction,
}: {
  event: Pick<CanvasAppPointerInput, 'pointerId'>
  interaction: Interaction
}): CanvasPointerDragSession | null {
  if (interaction.kind === 'none' || interaction.pointerId !== event.pointerId) {
    return null
  }

  return { interaction }
}

export function getCanvasPointerDragProjection({
  event,
  interaction,
  stageElement,
  viewport,
}: {
  event: Pick<CanvasAppPointerInput, 'clientX' | 'clientY' | 'pointerId'>
  interaction: Interaction
  stageElement: CanvasAppStageElement
  viewport: Viewport
}): CanvasPointerDragProjection | null {
  const session = getCanvasPointerDragSession({ event, interaction })

  if (!session) {
    return null
  }

  const currentScreen = screenPoint(stageElement, event)

  return {
    ...session,
    currentScreen,
    currentWorld: screenToWorld(currentScreen, viewport),
  }
}
