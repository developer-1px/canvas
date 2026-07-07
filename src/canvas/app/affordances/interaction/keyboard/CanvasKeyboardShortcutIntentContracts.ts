import type { Tool } from '../../../../entities'
import type {
  CanvasKeyboardCommandShortcutIntent,
  CanvasKeyboardReorderMode,
} from './CanvasKeyboardCommandShortcutIntent'
import type {
  CanvasKeyboardSystemShortcutIntent,
} from './CanvasKeyboardSystemShortcuts'

export type { CanvasKeyboardReorderMode }

export type CanvasKeyboardShortcutIntent =
  | { kind: 'none'; preventDefault: false }
  | CanvasKeyboardSystemShortcutIntent
  | CanvasKeyboardCommandShortcutIntent
  | { commandId: string; kind: 'run-custom-command'; preventDefault: true }
  | { kind: 'set-tool'; preventDefault: false; tool: Tool }
