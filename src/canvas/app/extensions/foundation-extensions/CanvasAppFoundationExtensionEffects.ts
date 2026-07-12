import type {
  CanvasSelectionIds,
  Viewport,
} from '../../../core'
import type {
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'
import type { EditingText } from '../../../entities'
import type {
  CanvasAppFoundationExtensionEffect,
} from './CanvasAppFoundationExtensionRuntime'

export type CanvasAppFoundationExtensionEffectContext = {
  commitDocumentPatch?: (
    patch: readonly CanvasAppItemsChange[],
    selection?: {
      after: CanvasSelectionIds
      before: CanvasSelectionIds
    },
  ) => boolean
  commitSelection?: (selection: CanvasSelectionIds) => boolean
  setEditing?: (editing: EditingText) => void
  setViewport?: (viewport: Viewport) => void
}

export function executeCanvasAppFoundationExtensionEffects({
  context,
  effects,
}: {
  context: CanvasAppFoundationExtensionEffectContext
  effects: readonly CanvasAppFoundationExtensionEffect[]
}) {
  try {
    for (const effect of effects) {
      if (effect.type === 'document-patch') {
        if (!context.commitDocumentPatch?.(effect.patch, effect.selection)) {
          return false
        }
        continue
      }

      if (effect.type === 'selection') {
        if (!context.commitSelection?.(effect.selection)) {
          return false
        }
        continue
      }

      if (effect.type === 'editing') {
        if (!context.setEditing) {
          return false
        }

        context.setEditing(effect.editing)
        continue
      }

      if (!context.setViewport) {
        return false
      }

      context.setViewport(effect.viewport)
    }
  } catch {
    return false
  }

  return true
}
