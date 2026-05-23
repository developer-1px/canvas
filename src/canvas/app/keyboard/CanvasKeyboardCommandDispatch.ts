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

type CanvasKeyboardCommandShortcutIntentKind =
  CanvasKeyboardCommandShortcutIntent['kind']

type CanvasKeyboardCommandIntentRunner<
  TKind extends CanvasKeyboardCommandShortcutIntentKind,
> = (args: {
  handlers: CanvasKeyboardCommandHandlers
  intent: Extract<CanvasKeyboardCommandShortcutIntent, { kind: TKind }>
}) => void

function defineCanvasKeyboardCommandIntentRunners<
  const TRunners extends Partial<{
    [TKind in CanvasKeyboardCommandShortcutIntentKind]:
      CanvasKeyboardCommandIntentRunner<TKind>
  }>,
>(runners: TRunners) {
  return Object.freeze(runners)
}

const CANVAS_KEYBOARD_COMMAND_INTENT_RUNNERS =
  defineCanvasKeyboardCommandIntentRunners({
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
  keyof typeof CANVAS_KEYBOARD_COMMAND_INTENT_RUNNERS,
  CanvasKeyboardCommandShortcutIntentKind
>

type CanvasKeyboardAnyCommandIntentRunner =
  CanvasKeyboardCommandIntentRunner<CanvasKeyboardCommandIntentKind>

function hasCanvasKeyboardCommandIntentRunner(
  kind: string,
): kind is CanvasKeyboardCommandIntentKind {
  return Object.prototype.hasOwnProperty.call(
    CANVAS_KEYBOARD_COMMAND_INTENT_RUNNERS,
    kind,
  )
}

function getCanvasKeyboardCommandIntentRunner(
  kind: CanvasKeyboardCommandIntentKind,
): CanvasKeyboardAnyCommandIntentRunner {
  return CANVAS_KEYBOARD_COMMAND_INTENT_RUNNERS[
    kind
  ] as CanvasKeyboardAnyCommandIntentRunner
}

export type CanvasKeyboardCommandIntent = Extract<
  CanvasKeyboardCommandShortcutIntent,
  { kind: CanvasKeyboardCommandIntentKind }
>

export function isCanvasKeyboardCommandIntent(
  intent: CanvasKeyboardShortcutIntent,
): intent is CanvasKeyboardCommandIntent {
  return hasCanvasKeyboardCommandIntentRunner(intent.kind)
}

export function runCanvasKeyboardCommandIntent({
  handlers,
  intent,
}: {
  handlers: CanvasKeyboardCommandHandlers
  intent: CanvasKeyboardCommandIntent
}) {
  getCanvasKeyboardCommandIntentRunner(intent.kind)({ handlers, intent })
  return true
}
