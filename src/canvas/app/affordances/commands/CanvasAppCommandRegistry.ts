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
  type CanvasAppCommandShortcutDefinition,
} from './CanvasAppCommandDefinitions'
import {
  normalizeCanvasKeyboardShortcutKey,
} from '../interaction/keyboard/CanvasKeyboardShortcutChords'

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

export function getCanvasAppCommandAriaKeyshortcuts({
  config,
  id,
}: {
  config: CanvasAffordanceConfig
  id: string
}) {
  return getCanvasAppCommandMappingAriaKeyshortcuts({
    config,
    mapping: getCanvasAppCommandMapping(id),
  })
}

export function getCanvasAppCommandMappingAriaKeyshortcuts({
  config,
  mapping,
}: {
  config: CanvasAffordanceConfig
  mapping: CanvasAppCommandMapping | undefined
}) {
  if (!mapping) {
    return undefined
  }

  const shortcuts = mapping.bindings.flatMap((binding) =>
    binding.kind === 'keyboard' &&
      isCanvasAppCommandBindingEnabled(binding, config)
      ? [formatCanvasAppCommandShortcutAriaKey(binding.shortcut)]
      : [],
  )

  return shortcuts.length > 0 ? shortcuts.join(' ') : undefined
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

function formatCanvasAppCommandShortcutAriaKey(
  shortcut: CanvasAppCommandShortcutDefinition,
) {
  const key = normalizeCanvasKeyboardShortcutKey(shortcut.key)
  const modifiers = getCanvasAppCommandShortcutAriaModifiers(shortcut)
  const hasShift = modifiers.includes('Shift')
  const ariaKey = hasShift && key.length === 1
    ? key.toUpperCase()
    : key

  return [...modifiers, ariaKey].join('+')
}

function getCanvasAppCommandShortcutAriaModifiers({
  modifier,
  modifiers,
  shiftKey,
}: CanvasAppCommandShortcutDefinition) {
  const values = [...(modifiers ?? (modifier ? [modifier] : []))]

  if (shiftKey === true && !values.includes('Shift')) {
    values.push('Shift')
  }

  return values.map((value) =>
    value === 'primary' ? 'Meta' : value
  )
}
