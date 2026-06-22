import type {
  defineCanvasAppCustomItemModule,
} from '../custom-item-modules/CanvasAppCustomItemModules'
import type {
  CanvasAppWidgetInteraction,
  CanvasAppWidgetInteractions,
} from './CanvasAppWidgetModuleTypes'

type CanvasAppWidgetInteractionCarrier =
  ReturnType<typeof defineCanvasAppCustomItemModule> & {
    widgetInteraction?: CanvasAppWidgetInteraction
  }

export function getCanvasAppWidgetInteractions(
  modules: readonly ReturnType<typeof defineCanvasAppCustomItemModule>[] = [],
): CanvasAppWidgetInteractions {
  const interactions: Record<string, CanvasAppWidgetInteraction> = {}

  for (const module of modules) {
    const widgetInteraction =
      (module as CanvasAppWidgetInteractionCarrier).widgetInteraction

    if (widgetInteraction) {
      interactions[module.id] = widgetInteraction
    }
  }

  return Object.freeze(interactions)
}
