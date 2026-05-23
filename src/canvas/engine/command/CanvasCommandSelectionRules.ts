export type CanvasCommandSelectionState = {
  canAlign: boolean
  canDistribute: boolean
  canGroup: boolean
  hasSelection: boolean
}

const CANVAS_COMMAND_SELECTION_MINIMUMS = {
  align: 2,
  distribute: 3,
  group: 2,
  selection: 1,
} as const

export function getCanvasCommandSelectionState({
  selection,
}: {
  selection: readonly string[]
}): CanvasCommandSelectionState {
  const selectionSize = selection.length

  return {
    canAlign: selectionSize >= CANVAS_COMMAND_SELECTION_MINIMUMS.align,
    canDistribute:
      selectionSize >= CANVAS_COMMAND_SELECTION_MINIMUMS.distribute,
    canGroup: selectionSize >= CANVAS_COMMAND_SELECTION_MINIMUMS.group,
    hasSelection:
      selectionSize >= CANVAS_COMMAND_SELECTION_MINIMUMS.selection,
  }
}

export function canAlignCanvasCommandSelection(
  selection: readonly string[],
) {
  return getCanvasCommandSelectionState({ selection }).canAlign
}

export function canDistributeCanvasCommandSelection(
  selection: readonly string[],
) {
  return getCanvasCommandSelectionState({ selection }).canDistribute
}

export function canGroupCanvasCommandSelection(
  selection: readonly string[],
) {
  return getCanvasCommandSelectionState({ selection }).canGroup
}

export function hasCanvasCommandSelection(selection: readonly string[]) {
  return getCanvasCommandSelectionState({ selection }).hasSelection
}
