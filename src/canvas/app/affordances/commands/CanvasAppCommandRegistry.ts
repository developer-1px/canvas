import {
  compileInteractionCommandDefinitions,
  getInteractionCommandBindingSummary,
  getInteractionCommandMapping,
  type InteractionCommandCompiledBinding,
  type InteractionCommandMapping,
} from '@interactive-os/interaction/runtime'
import {
  type CanvasAffordanceConfig,
} from '../../../engine'
import {
  CANVAS_APP_COMMAND_DEFINITIONS,
  type CanvasAppCommandBindingDefinition,
  type CanvasAppCommandDefinition,
  type CanvasAppCommandDefinitionSection,
} from './CanvasAppCommandDefinitions'

export type CanvasAppCommandMappingSection =
  CanvasAppCommandDefinitionSection

export type CanvasAppCommandBinding =
  InteractionCommandCompiledBinding<CanvasAppCommandBindingDefinition>

export type CanvasAppCommandMapping =
  InteractionCommandMapping<CanvasAppCommandDefinition>

export const CANVAS_APP_COMMAND_MAPPINGS:
  readonly CanvasAppCommandMapping[] = Object.freeze(
    compileInteractionCommandDefinitions(CANVAS_APP_COMMAND_DEFINITIONS, {
      platform: 'mac',
    }),
  )

export function getCanvasAppCommandMapping(
  id: string,
): CanvasAppCommandMapping | undefined {
  return getInteractionCommandMapping(CANVAS_APP_COMMAND_MAPPINGS, id)
}

export function getCanvasAppCommandMappingShortcut({
  config,
  mapping,
}: {
  config: CanvasAffordanceConfig
  mapping: CanvasAppCommandMapping | undefined
}) {
  if (!mapping) {
    return undefined
  }

  return getInteractionCommandBindingSummary({
    bindings: mapping.bindings,
    isBindingEnabled: (binding) =>
      isCanvasAppCommandBindingEnabled(binding, config),
  })
}

function isCanvasAppCommandBindingEnabled(
  binding: CanvasAppCommandBinding,
  config: CanvasAffordanceConfig,
) {
  if (binding.kind === 'pointer') {
    return binding.gestureId ? config.gestures[binding.gestureId] : true
  }

  if (!config.shortcuts[binding.shortcutId]) {
    return false
  }

  return binding.overlayId ? config.overlays[binding.overlayId] : true
}
