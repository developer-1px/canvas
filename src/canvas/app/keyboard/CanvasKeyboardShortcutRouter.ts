import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from 'react'
import type {
  CanvasAffordanceConfig,
  CanvasDraftArrowOverlay,
  CanvasDraftStrokeOverlay,
} from '../../engine'
import type {
  Bounds,
  EditingText,
  Tool,
} from '../../entities'
import type { Interaction } from '../pointer/CanvasInteractionState'
import type { CommitCanvasSelection } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationToolRuntime'
import {
  getCanvasKeyboardShortcutIntent,
  type CanvasKeyboardReorderMode,
} from './CanvasKeyboardShortcutIntent'

export type CanvasKeyboardShortcutHandlers = {
  commitSelection: CommitCanvasSelection
  config: CanvasAffordanceConfig
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: () => void
  customCreationTools: readonly CanvasAppCustomCreationToolState[]
  fitToItems: (ids?: string[]) => void
  groupSelection: () => void
  interactionRef: MutableRefObject<Interaction>
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  openFindReplace: () => void
  pasteSelection: () => void
  redoHistory: () => void
  resetViewport: () => void
  reorderSelection: (mode: CanvasKeyboardReorderMode) => void
  selectAll: () => void
  selection: string[]
  setDraftRect: Dispatch<SetStateAction<Bounds | null>>
  setDraftArrow: Dispatch<SetStateAction<CanvasDraftArrowOverlay | null>>
  setDraftStroke: Dispatch<SetStateAction<CanvasDraftStrokeOverlay | null>>
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setGesture: Dispatch<SetStateAction<Interaction['kind']>>
  setMarquee: Dispatch<SetStateAction<Bounds | null>>
  setSpaceDown: Dispatch<SetStateAction<boolean>>
  setTool: Dispatch<SetStateAction<Tool>>
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
  zoomBy: (multiplier: number) => void
}

export function handleCanvasKeyboardShortcut(
  event: globalThis.KeyboardEvent,
  handlers: CanvasKeyboardShortcutHandlers,
) {
  const intent = getCanvasKeyboardShortcutIntent({
    config: handlers.config,
    customCreationTools: handlers.customCreationTools,
    event,
    selection: handlers.selection,
  })

  if (intent.preventDefault) {
    event.preventDefault()
  }

  switch (intent.kind) {
    case 'none':
      return
    case 'open-find-replace':
      handlers.openFindReplace()
      return
    case 'temporary-pan':
      handlers.setSpaceDown(true)
      return
    case 'escape':
      handlers.interactionRef.current = { kind: 'none' }
      handlers.setGesture('none')
      handlers.setMarquee(null)
      handlers.setDraftArrow(null)
      handlers.setDraftRect(null)
      handlers.setDraftStroke(null)
      handlers.setEditing(null)
      handlers.commitSelection([])
      handlers.setTool('select')
      return
    case 'delete-selection':
      handlers.deleteSelection()
      return
    case 'undo-history':
      handlers.undoHistory()
      return
    case 'redo-history':
      handlers.redoHistory()
      return
    case 'zoom-by':
      handlers.zoomBy(intent.multiplier)
      return
    case 'reset-viewport':
      handlers.resetViewport()
      return
    case 'copy-selection':
      handlers.copySelection()
      return
    case 'cut-selection':
      handlers.cutSelection()
      return
    case 'paste-selection':
      handlers.pasteSelection()
      return
    case 'select-all':
      handlers.selectAll()
      return
    case 'duplicate-selection':
      handlers.duplicateSelection()
      return
    case 'lock-selection':
      handlers.lockSelection()
      return
    case 'unlock-all':
      handlers.unlockAll()
      return
    case 'reorder-selection':
      handlers.reorderSelection(intent.mode)
      return
    case 'group-selection':
      handlers.groupSelection()
      return
    case 'ungroup-selection':
      handlers.ungroupSelection()
      return
    case 'nudge-selection':
      handlers.moveSelection(intent.dx, intent.dy)
      return
    case 'fit-all':
      handlers.fitToItems()
      return
    case 'fit-selection':
      handlers.fitToItems(intent.ids)
      return
    case 'set-tool':
      handlers.setTool(intent.tool)
      return
  }

  return assertUnhandledCanvasKeyboardShortcutIntent(intent)
}

function assertUnhandledCanvasKeyboardShortcutIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard shortcut intent: ${String(intent)}`)
}
