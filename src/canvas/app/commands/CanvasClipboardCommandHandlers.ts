import type {
  CanvasItem,
  Point,
} from '../../entities'
import type { CanvasClipboardCommand } from './CanvasClipboardCommandExecution'

export type RunCanvasClipboardCommand = (
  command: CanvasClipboardCommand,
) => CanvasItem[]

export type CanvasClipboardCommandHandlers = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  copySelection: () => void
  cutSelection: () => void
  duplicateSelection: (sourceIds?: string[], offset?: Point) => CanvasItem[]
  pasteSelection: () => void
}

type GetCanvasClipboardCommandHandlersArgs = {
  getPasteIndex: () => number
  runClipboardCommand: RunCanvasClipboardCommand
  selection: string[]
}

export function getCanvasClipboardCommandHandlers({
  getPasteIndex,
  runClipboardCommand,
  selection,
}: GetCanvasClipboardCommandHandlersArgs): CanvasClipboardCommandHandlers {
  return {
    cloneItems: (ids, offset) =>
      runClipboardCommand({ ids, kind: 'clone', offset }),
    copySelection: () => {
      runClipboardCommand({
        kind: 'copy',
        pasteIndex: getPasteIndex(),
      })
    },
    cutSelection: () => {
      runClipboardCommand({
        kind: 'cut',
        pasteIndex: getPasteIndex(),
      })
    },
    duplicateSelection: (sourceIds = selection, offset) =>
      runClipboardCommand({ kind: 'duplicate', offset, sourceIds }),
    pasteSelection: () => {
      runClipboardCommand({
        kind: 'paste',
        pasteIndex: getPasteIndex(),
      })
    },
  }
}
