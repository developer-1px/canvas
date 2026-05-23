import type {
  CanvasKeyboardCommandShortcutIntent,
  CanvasKeyboardReorderMode,
} from './CanvasKeyboardCommandShortcutIntent'
import type { CanvasKeyboardShortcutIntent } from './CanvasKeyboardShortcutIntent'

export type CanvasKeyboardCommandHandlers = {
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: () => void
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasKeyboardReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

type CanvasKeyboardCommandIntentKind =
  | 'copy-selection'
  | 'cut-selection'
  | 'delete-selection'
  | 'duplicate-selection'
  | 'group-selection'
  | 'lock-selection'
  | 'nudge-selection'
  | 'paste-selection'
  | 'redo-history'
  | 'reorder-selection'
  | 'select-all'
  | 'undo-history'
  | 'ungroup-selection'
  | 'unlock-all'

export type CanvasKeyboardCommandIntent = Extract<
  CanvasKeyboardCommandShortcutIntent,
  { kind: CanvasKeyboardCommandIntentKind }
>

const CANVAS_KEYBOARD_COMMAND_INTENT_KINDS = Object.freeze([
  'copy-selection',
  'cut-selection',
  'delete-selection',
  'duplicate-selection',
  'group-selection',
  'lock-selection',
  'nudge-selection',
  'paste-selection',
  'redo-history',
  'reorder-selection',
  'select-all',
  'undo-history',
  'ungroup-selection',
  'unlock-all',
] satisfies readonly CanvasKeyboardCommandIntentKind[])

export function isCanvasKeyboardCommandIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardCommandIntent {
  return CANVAS_KEYBOARD_COMMAND_INTENT_KINDS.includes(
    intent.kind as CanvasKeyboardCommandIntentKind,
  )
}

export function runCanvasKeyboardCommandIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardCommandHandlers
  intent: CanvasKeyboardCommandIntent
}) {
  switch (intent.kind) {
    case 'delete-selection':
      handlers.deleteSelection()
      return true
    case 'undo-history':
      handlers.undoHistory()
      return true
    case 'redo-history':
      handlers.redoHistory()
      return true
    case 'copy-selection':
      handlers.copySelection()
      return true
    case 'cut-selection':
      handlers.cutSelection()
      return true
    case 'paste-selection':
      handlers.pasteSelection()
      return true
    case 'select-all':
      handlers.selectAll()
      return true
    case 'duplicate-selection':
      handlers.duplicateSelection()
      return true
    case 'lock-selection':
      handlers.lockSelection()
      return true
    case 'unlock-all':
      handlers.unlockAll()
      return true
    case 'reorder-selection':
      handlers.reorderSelection(intent.mode)
      return true
    case 'group-selection':
      handlers.groupSelection()
      return true
    case 'ungroup-selection':
      handlers.ungroupSelection()
      return true
    case 'nudge-selection':
      handlers.moveSelection(intent.dx, intent.dy)
      return true
  }

  return assertUnhandledCanvasKeyboardCommandIntent(intent)
}

function assertUnhandledCanvasKeyboardCommandIntent(
  intent: never,
): never {
  throw new Error(`Unhandled canvas keyboard command intent: ${String(intent)}`)
}
