import type { CanvasKeyboardShortcutHandlers } from '../keyboard/CanvasKeyboardShortcutRouter'
import { useCanvasKeyboardShortcuts } from '../keyboard/useCanvasKeyboardShortcuts'

type CanvasAppKeyboardCommandModel = Pick<
  CanvasKeyboardShortcutHandlers,
  | 'commitSelection'
  | 'copySelection'
  | 'cutSelection'
  | 'deleteSelection'
  | 'duplicateSelection'
  | 'groupSelection'
  | 'lockSelection'
  | 'moveSelection'
  | 'pasteSelection'
  | 'redoHistory'
  | 'reorderSelection'
  | 'selectAll'
  | 'undoHistory'
  | 'ungroupSelection'
  | 'unlockAll'
>

type CanvasAppKeyboardInteractionModel = Pick<
  CanvasKeyboardShortcutHandlers,
  | 'interactionRef'
  | 'setDraftArrow'
  | 'setDraftRect'
  | 'setDraftStroke'
  | 'setEditing'
  | 'setGesture'
  | 'setMarquee'
  | 'setSpaceDown'
  | 'setTool'
>

type CanvasAppKeyboardViewportModel = Pick<
  CanvasKeyboardShortcutHandlers,
  'fitToItems' | 'resetViewport' | 'zoomBy'
>

type UseCanvasAppKeyboardModelArgs = {
  command: CanvasAppKeyboardCommandModel
  config: CanvasKeyboardShortcutHandlers['config']
  customCreationTools: CanvasKeyboardShortcutHandlers['customCreationTools']
  interaction: CanvasAppKeyboardInteractionModel
  openFindReplace: CanvasKeyboardShortcutHandlers['openFindReplace']
  selection: CanvasKeyboardShortcutHandlers['selection']
  viewport: CanvasAppKeyboardViewportModel
}

export function useCanvasAppKeyboardModel({
  command,
  config,
  customCreationTools,
  interaction,
  openFindReplace,
  selection,
  viewport,
}: UseCanvasAppKeyboardModelArgs) {
  useCanvasKeyboardShortcuts({
    commitSelection: command.commitSelection,
    config,
    copySelection: command.copySelection,
    customCreationTools,
    cutSelection: command.cutSelection,
    deleteSelection: command.deleteSelection,
    duplicateSelection: command.duplicateSelection,
    fitToItems: viewport.fitToItems,
    groupSelection: command.groupSelection,
    interactionRef: interaction.interactionRef,
    lockSelection: command.lockSelection,
    moveSelection: command.moveSelection,
    openFindReplace,
    pasteSelection: command.pasteSelection,
    redoHistory: command.redoHistory,
    reorderSelection: command.reorderSelection,
    resetViewport: viewport.resetViewport,
    selectAll: command.selectAll,
    selection,
    setDraftArrow: interaction.setDraftArrow,
    setDraftRect: interaction.setDraftRect,
    setDraftStroke: interaction.setDraftStroke,
    setEditing: interaction.setEditing,
    setGesture: interaction.setGesture,
    setMarquee: interaction.setMarquee,
    setSpaceDown: interaction.setSpaceDown,
    setTool: interaction.setTool,
    undoHistory: command.undoHistory,
    ungroupSelection: command.ungroupSelection,
    unlockAll: command.unlockAll,
    zoomBy: viewport.zoomBy,
  })
}
