import type { CanvasAffordanceConfig } from '../affordance/CanvasAffordances'
import type { CanvasCommandAvailability } from './CanvasCommandTypes'
import { getCanvasCommandSelectionState } from './CanvasCommandSelectionRules'

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
  const selectionState = getCanvasCommandSelectionState({ selection })

  return {
    alignBottom: config.commands.alignBottom && selectionState.canAlign,
    alignCenter: config.commands.alignCenter && selectionState.canAlign,
    alignLeft: config.commands.alignLeft && selectionState.canAlign,
    alignMiddle: config.commands.alignMiddle && selectionState.canAlign,
    alignRight: config.commands.alignRight && selectionState.canAlign,
    alignTop: config.commands.alignTop && selectionState.canAlign,
    bringForward:
      config.commands.bringForward && selectionState.hasSelection,
    bringToFront:
      config.commands.bringToFront && selectionState.hasSelection,
    delete: config.commands.delete && selectionState.hasSelection,
    duplicate: config.commands.duplicate && selectionState.hasSelection,
    distributeHorizontal:
      config.commands.distributeHorizontal &&
      selectionState.canDistribute,
    distributeVertical:
      config.commands.distributeVertical && selectionState.canDistribute,
    group: config.commands.group && selectionState.canGroup,
    lockSelection:
      config.commands.lockSelection && selectionState.hasSelection,
    redo: config.commands.redo && canRedo,
    selectAll: config.commands.selectAll,
    sendBackward:
      config.commands.sendBackward && selectionState.hasSelection,
    sendToBack: config.commands.sendToBack && selectionState.hasSelection,
    undo: config.commands.undo && canUndo,
    ungroup: config.commands.ungroup && hasSelectedGroup,
    unlockAll: config.commands.unlockAll,
  }
}
