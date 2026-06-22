import type {
  InteractionCommandBindingDefinition,
  InteractionCommandDefinition,
  InteractionCommandKeyboardShortcutDefinition,
} from '@interactive-os/interaction/runtime'
import type {
  CanvasCommandId,
  CanvasGestureId,
  CanvasOverlayId,
  CanvasShortcutId,
} from '../../../engine'
import type {
  CanvasToolbarCommandGroupId,
} from '../../feature-packs/toolbar/CanvasToolbarCommandCatalog'

export type CanvasAppCommandDefinitionSection =
  | 'Commands'
  | 'System'
  | 'View'

export type CanvasAppCommandShortcutDefinition =
  InteractionCommandKeyboardShortcutDefinition

export type CanvasAppCommandBindingDefinition =
  | (Extract<InteractionCommandBindingDefinition, { kind: 'keyboard' }> & {
      readonly kind: 'keyboard'
      readonly overlayId?: CanvasOverlayId
      readonly shortcutId: CanvasShortcutId
    })
  | (Extract<InteractionCommandBindingDefinition, { kind: 'pointer' }> & {
      readonly gestureId: CanvasGestureId
      readonly kind: 'pointer'
    })

export interface CanvasAppCommandDefinition
  extends InteractionCommandDefinition<CanvasAppCommandBindingDefinition> {
  readonly commandId?: CanvasCommandId
  readonly groupId?: CanvasToolbarCommandGroupId
  readonly section: CanvasAppCommandDefinitionSection
  readonly surfaces?: readonly string[]
}
