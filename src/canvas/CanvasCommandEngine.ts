import type { CanvasAffordanceConfig } from './CanvasAffordances'
import type { CanvasItem } from './CanvasModel'
import { findCanvasItem } from './CanvasTree'

export type CanvasCommandAvailability = {
  delete: boolean
  duplicate: boolean
  group: boolean
  redo: boolean
  undo: boolean
  ungroup: boolean
}

export function getCanvasCommandAvailability({
  canRedo,
  canUndo,
  config,
  items,
  selection,
}: {
  canRedo: boolean
  canUndo: boolean
  config: CanvasAffordanceConfig
  items: CanvasItem[]
  selection: string[]
}): CanvasCommandAvailability {
  const hasSelection = selection.length > 0

  return {
    delete: config.commands.delete && hasSelection,
    duplicate: config.commands.duplicate && hasSelection,
    group: config.commands.group && selection.length > 1,
    redo: config.commands.redo && canRedo,
    undo: config.commands.undo && canUndo,
    ungroup:
      config.commands.ungroup &&
      selection.some((id) => findCanvasItem(items, id)?.type === 'group'),
  }
}
