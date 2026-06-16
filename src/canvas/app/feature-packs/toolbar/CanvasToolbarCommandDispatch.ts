import type { CanvasToolbarCommandHandlers } from './CanvasToolbarCommandContracts'
import type { CanvasToolbarCommandAction } from './CanvasToolbarCommandItems'

type CanvasToolbarCommandActionRunner<
  TKind extends CanvasToolbarCommandAction['kind'],
> = (args: {
  action: Extract<CanvasToolbarCommandAction, { kind: TKind }>
  handlers: CanvasToolbarCommandHandlers
}) => void

type CanvasToolbarCommandActionRunners = {
  [TKind in CanvasToolbarCommandAction['kind']]:
    CanvasToolbarCommandActionRunner<TKind>
}

type CanvasToolbarCommandAnyActionRunner = (args: {
  action: CanvasToolbarCommandAction
  handlers: CanvasToolbarCommandHandlers
}) => void

const CANVAS_TOOLBAR_COMMAND_ACTION_RUNNERS = Object.freeze({
  align: ({ action, handlers }) => {
    handlers.onAlign(action.mode)
  },
  delete: ({ handlers }) => {
    handlers.onDelete()
  },
  distribute: ({ action, handlers }) => {
    handlers.onDistribute(action.mode)
  },
  duplicate: ({ handlers }) => {
    handlers.onDuplicate()
  },
  group: ({ handlers }) => {
    handlers.onGroup()
  },
  lock: ({ handlers }) => {
    handlers.onLock()
  },
  redo: ({ handlers }) => {
    handlers.onRedo()
  },
  reorder: ({ action, handlers }) => {
    handlers.onReorder(action.mode)
  },
  undo: ({ handlers }) => {
    handlers.onUndo()
  },
  ungroup: ({ handlers }) => {
    handlers.onUngroup()
  },
  'unlock-all': ({ handlers }) => {
    handlers.onUnlockAll()
  },
} satisfies CanvasToolbarCommandActionRunners)

export function runCanvasToolbarCommandAction({
  action,
  handlers,
}: {
  action: CanvasToolbarCommandAction
  handlers: CanvasToolbarCommandHandlers
}) {
  const runner = CANVAS_TOOLBAR_COMMAND_ACTION_RUNNERS[
    action.kind
  ] as CanvasToolbarCommandAnyActionRunner

  runner({ action, handlers })
}
