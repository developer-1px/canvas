import type { Tool } from '../../entities'
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
  | { kind: 'set-tool'; preventDefault: false; tool: Tool }
