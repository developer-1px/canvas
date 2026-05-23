import type { Point } from '../../entities'
import {
  DRAG_THRESHOLD,
  pointDistance,
} from '../../core'
import type { Interaction } from './CanvasInteractionState'

export function hasCanvasInteractionMoved({
  currentScreen,
  interaction,
}: {
  currentScreen: Point
  interaction: Exclude<Interaction, { kind: 'none' | 'pan' }>
}) {
  return (
    interaction.moved ||
    pointDistance(currentScreen, interaction.startScreen) > DRAG_THRESHOLD
  )
}
