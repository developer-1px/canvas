import type {
  CanvasItem,
  Point,
} from '../../entities'
import type { CanvasClipboardCommand } from './CanvasClipboardCommandContracts'

export type RunCanvasClipboardCommand = (
  command: CanvasClipboardCommand,
) => CanvasItem[]

type CanvasClipboardCommandHandlerArgs = {
  runClipboardCommand: RunCanvasClipboardCommand
}

type CloneCanvasClipboardItemsArgs = CanvasClipboardCommandHandlerArgs & {
  ids: string[]
  offset: Point
}

type DuplicateCanvasClipboardSelectionArgs =
  CanvasClipboardCommandHandlerArgs & {
    offset?: Point
    selection: string[]
    sourceIds?: string[]
  }

type IndexedCanvasClipboardSelectionArgs = CanvasClipboardCommandHandlerArgs & {
  pasteIndex: number
}

export function cloneCanvasClipboardItems({
  ids,
  offset,
  runClipboardCommand,
}: CloneCanvasClipboardItemsArgs) {
  return runClipboardCommand({ ids, kind: 'clone', offset })
}

export function copyCanvasClipboardSelection({
  pasteIndex,
  runClipboardCommand,
}: IndexedCanvasClipboardSelectionArgs) {
  runClipboardCommand({
    kind: 'copy',
    pasteIndex,
  })
}

export function cutCanvasClipboardSelection({
  pasteIndex,
  runClipboardCommand,
}: IndexedCanvasClipboardSelectionArgs) {
  runClipboardCommand({
    kind: 'cut',
    pasteIndex,
  })
}

export function duplicateCanvasClipboardSelection({
  offset,
  runClipboardCommand,
  selection,
  sourceIds,
}: DuplicateCanvasClipboardSelectionArgs) {
  return runClipboardCommand({
    kind: 'duplicate',
    offset,
    sourceIds: sourceIds ?? selection,
  })
}

export function pasteCanvasClipboardSelection({
  pasteIndex,
  runClipboardCommand,
}: IndexedCanvasClipboardSelectionArgs) {
  runClipboardCommand({
    kind: 'paste',
    pasteIndex,
  })
}
