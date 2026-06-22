import type {
  CanvasOverlayId,
  CanvasShortcutId,
} from '../../../engine'
import type {
  CanvasAppCommandBindingDefinition,
  CanvasAppCommandDefinition,
  CanvasAppCommandShortcutDefinition,
} from './CanvasAppCommandDefinitionContracts'

export function commandDefinition(
  definition: Omit<
    CanvasAppCommandDefinition,
    'bindings' | 'section' | 'surfaces'
  > & {
    readonly bindings?: readonly CanvasAppCommandBindingDefinition[]
    readonly surfaces?: readonly string[]
  },
): CanvasAppCommandDefinition {
  return {
    bindings: [],
    section: 'Commands',
    surfaces: ['selection-floating-bar', 'context-menu'],
    ...definition,
  }
}

export function systemDefinition(
  definition: Omit<CanvasAppCommandDefinition, 'section'>,
): CanvasAppCommandDefinition {
  return {
    section: 'System',
    ...definition,
  }
}

export function keyboardBinding(
  shortcutId: CanvasShortcutId,
  shortcut: CanvasAppCommandShortcutDefinition,
  options: {
    readonly overlayId?: CanvasOverlayId
  } = {},
): CanvasAppCommandBindingDefinition {
  return {
    kind: 'keyboard',
    ...(options.overlayId ? { overlayId: options.overlayId } : {}),
    shortcut,
    shortcutId,
  }
}
