import type { Interaction } from './CanvasInteractionState'
import {
  isCanvasPointerCreationInteraction,
  type CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import type { CanvasPointerEraserInteraction } from './CanvasPointerEraser'
import type { CanvasPointerLaserInteraction } from './CanvasPointerLaser'
import type { CanvasPointerMarqueeInteraction } from './CanvasPointerMarqueeInteraction'
import type { CanvasPointerPanInteraction } from './CanvasPointerPanInteraction'
import type { CanvasPointerTransformInteraction } from './CanvasPointerTransformInteraction'

type CanvasPointerInteractionRoute<TResult> = {
  creation?: (interaction: CanvasPointerCreationInteraction) => TResult
  eraser?: (interaction: CanvasPointerEraserInteraction) => TResult
  fallback: () => TResult
  laser?: (interaction: CanvasPointerLaserInteraction) => TResult
  marquee?: (interaction: CanvasPointerMarqueeInteraction) => TResult
  none?: (interaction: Extract<Interaction, { kind: 'none' }>) => TResult
  pan?: (interaction: CanvasPointerPanInteraction) => TResult
  transform?: (interaction: CanvasPointerTransformInteraction) => TResult
}

export function routeCanvasPointerInteraction<TResult>(
  interaction: Interaction,
  route: CanvasPointerInteractionRoute<TResult>,
): TResult {
  if (interaction.kind === 'pan') {
    return resolveCanvasPointerInteractionRoute(route.pan, interaction, route)
  }

  if (interaction.kind === 'arrow-endpoint') {
    return resolveCanvasPointerInteractionRoute(
      route.transform,
      interaction,
      route,
    )
  }

  if (interaction.kind === 'move' || interaction.kind === 'resize') {
    return resolveCanvasPointerInteractionRoute(
      route.transform,
      interaction,
      route,
    )
  }

  if (interaction.kind === 'marquee') {
    return resolveCanvasPointerInteractionRoute(
      route.marquee,
      interaction,
      route,
    )
  }

  if (interaction.kind === 'erase') {
    return resolveCanvasPointerInteractionRoute(
      route.eraser,
      interaction,
      route,
    )
  }

  if (interaction.kind === 'laser') {
    return resolveCanvasPointerInteractionRoute(
      route.laser,
      interaction,
      route,
    )
  }

  if (isCanvasPointerCreationInteraction(interaction)) {
    return resolveCanvasPointerInteractionRoute(
      route.creation,
      interaction,
      route,
    )
  }

  return resolveCanvasPointerInteractionRoute(route.none, interaction, route)
}

function resolveCanvasPointerInteractionRoute<TResult, TInteraction>(
  handler: ((interaction: TInteraction) => TResult) | undefined,
  interaction: TInteraction,
  route: CanvasPointerInteractionRoute<TResult>,
) {
  return handler ? handler(interaction) : route.fallback()
}
