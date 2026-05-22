import type { CanvasAffordanceConfig } from './CanvasAffordances'
import type { CanvasCommandAvailability } from './CanvasCommandTypes'

export function getCanvasCommandAvailability({
  canRedo,
  canUndo,
  config,
  hasSelectedGroup,
  selection,
}: {
  canRedo: boolean
  canUndo: boolean
  config: CanvasAffordanceConfig
  hasSelectedGroup: boolean
  selection: string[]
}): CanvasCommandAvailability {
  const hasSelection = selection.length > 0
  const canAlign = selection.length > 1
  const canDistribute = selection.length > 2

  return {
    alignBottom: config.commands.alignBottom && canAlign,
    alignCenter: config.commands.alignCenter && canAlign,
    alignLeft: config.commands.alignLeft && canAlign,
    alignMiddle: config.commands.alignMiddle && canAlign,
    alignRight: config.commands.alignRight && canAlign,
    alignTop: config.commands.alignTop && canAlign,
    bringForward: config.commands.bringForward && hasSelection,
    bringToFront: config.commands.bringToFront && hasSelection,
    delete: config.commands.delete && hasSelection,
    duplicate: config.commands.duplicate && hasSelection,
    distributeHorizontal:
      config.commands.distributeHorizontal && canDistribute,
    distributeVertical: config.commands.distributeVertical && canDistribute,
    group: config.commands.group && selection.length > 1,
    lockSelection: config.commands.lockSelection && hasSelection,
    redo: config.commands.redo && canRedo,
    selectAll: config.commands.selectAll,
    sendBackward: config.commands.sendBackward && hasSelection,
    sendToBack: config.commands.sendToBack && hasSelection,
    undo: config.commands.undo && canUndo,
    ungroup: config.commands.ungroup && hasSelectedGroup,
    unlockAll: config.commands.unlockAll,
  }
}
