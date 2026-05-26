import type { Point } from '../../../entities'

export type CanvasClipboardCommand =
  | { ids: string[]; kind: 'clone'; offset: Point }
  | { kind: 'duplicate'; offset?: Point; sourceIds?: string[] }
  | { kind: 'copy'; pasteIndex: number }
  | { kind: 'paste'; pasteIndex: number }
  | { kind: 'cut'; pasteIndex: number }
