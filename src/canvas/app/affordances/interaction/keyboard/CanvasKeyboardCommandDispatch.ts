import type {
  CanvasKeyboardCommandShortcutIntent,
} from './CanvasKeyboardCommandShortcutIntent'
import { createCanvasKeyboardIntentDispatchTable } from './CanvasKeyboardIntentDispatchTable'
import type {
  CanvasKeyboardReorderMode,
  CanvasKeyboardShortcutIntent,
} from './CanvasKeyboardShortcutIntentContracts'

export type CanvasKeyboardCommandHandlers = {
  copySelection: () => void
  cutSelection: () => void
  deleteSelection: () => void
  duplicateSelection: () => void
  editSelection: () => void
  groupSelection: () => void
  lockSelection: () => void
  moveSelection: (dx: number, dy: number) => void
  pasteSelection: () => void
  quickCreateSticky: () => void
  redoHistory: () => void
  reorderSelection: (mode: CanvasKeyboardReorderMode) => void
  selectAll: () => void
  undoHistory: () => void
  ungroupSelection: () => void
  unlockAll: () => void
}

export const CANVAS_KEYBOARD_COMMAND_DISPATCH_MODEL =
  'canvas-keyboard-command-dispatch'

const CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH =
  createCanvasKeyboardIntentDispatchTable<
    CanvasKeyboardCommandShortcutIntent,
    CanvasKeyboardCommandHandlers
  >()({
    'copy-selection': ({ handlers }) => {
      handlers.copySelection()
    },
    'cut-selection': ({ handlers }) => {
      handlers.cutSelection()
    },
    'delete-selection': ({ handlers }) => {
      handlers.deleteSelection()
    },
    'duplicate-selection': ({ handlers }) => {
      handlers.duplicateSelection()
    },
    'edit-selection': ({ handlers }) => {
      handlers.editSelection()
    },
    'group-selection': ({ handlers }) => {
      handlers.groupSelection()
    },
    'lock-selection': ({ handlers }) => {
      handlers.lockSelection()
    },
    'nudge-selection': ({ handlers, intent }) => {
      handlers.moveSelection(intent.dx, intent.dy)
    },
    'paste-selection': ({ handlers }) => {
      handlers.pasteSelection()
    },
    'quick-create-sticky': ({ handlers }) => {
      handlers.quickCreateSticky()
    },
    'redo-history': ({ handlers }) => {
      handlers.redoHistory()
    },
    'reorder-selection': ({ handlers, intent }) => {
      handlers.reorderSelection(intent.mode)
    },
    'select-all': ({ handlers }) => {
      handlers.selectAll()
    },
    'undo-history': ({ handlers }) => {
      handlers.undoHistory()
    },
    'ungroup-selection': ({ handlers }) => {
      handlers.ungroupSelection()
    },
    'unlock-all': ({ handlers }) => {
      handlers.unlockAll()
    },
  })

type CanvasKeyboardCommandIntentKind = Extract<
  keyof typeof CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH.runners,
  CanvasKeyboardCommandShortcutIntent['kind']
>

export type CanvasKeyboardCommandIntent = Extract<
  CanvasKeyboardCommandShortcutIntent,
  { kind: CanvasKeyboardCommandIntentKind }
>

export function isCanvasKeyboardCommandIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardCommandIntent {
  return CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH.hasKind(intent.kind)
}

export function runCanvasKeyboardCommandIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardCommandHandlers
  intent: CanvasKeyboardCommandIntent
}) {
  CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH.run({ handlers, intent })
  return true
}
