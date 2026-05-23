import type {
  CanvasAlignMode,
  CanvasDistributeMode,
} from '../../engine'
import type { CanvasToolbarCommandAction } from './CanvasToolbarCommandItems'

export type CanvasToolbarCommandHandlers = {
  onAlign: (mode: CanvasAlignMode) => void
  onDelete: () => void
  onDistribute: (mode: CanvasDistributeMode) => void
  onDuplicate: () => void
  onGroup: () => void
  onLock: () => void
  onRedo: () => void
  onUndo: () => void
  onUngroup: () => void
  onUnlockAll: () => void
}

export function runCanvasToolbarCommandAction({
  action,
  handlers,
}: {
  action: CanvasToolbarCommandAction
  handlers: CanvasToolbarCommandHandlers
}) {
  switch (action.kind) {
    case 'align':
      handlers.onAlign(action.mode)
      return
    case 'delete':
      handlers.onDelete()
      return
    case 'distribute':
      handlers.onDistribute(action.mode)
      return
    case 'duplicate':
      handlers.onDuplicate()
      return
    case 'group':
      handlers.onGroup()
      return
    case 'lock':
      handlers.onLock()
      return
    case 'redo':
      handlers.onRedo()
      return
    case 'undo':
      handlers.onUndo()
      return
    case 'ungroup':
      handlers.onUngroup()
      return
    case 'unlock-all':
      handlers.onUnlockAll()
      return
  }

  return assertUnhandledCanvasToolbarCommandAction(action)
}

function assertUnhandledCanvasToolbarCommandAction(
  action: never,
): never {
  throw new Error(`Unhandled canvas toolbar command action: ${String(action)}`)
}
