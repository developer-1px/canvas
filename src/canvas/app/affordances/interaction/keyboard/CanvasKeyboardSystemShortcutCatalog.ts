import type {
  CanvasGestureId,
  CanvasOverlayId,
  CanvasShortcutId,
} from '../../../../engine'
import type { CanvasKeyboardShortcutChord } from './CanvasKeyboardShortcutChords'

export type CanvasKeyboardSystemShortcutIntent =
  | { kind: 'open-command-palette'; preventDefault: true }
  | { kind: 'open-cursor-chat'; preventDefault: true }
  | { kind: 'open-find-replace'; preventDefault: true }
  | { kind: 'temporary-pan'; preventDefault: true }
  | { kind: 'escape'; preventDefault: false }

export type CanvasKeyboardSystemShortcutPhase =
  | 'before-typing-target'
  | 'after-typing-target'

export type CanvasKeyboardSystemShortcutDescriptor = {
  code?: string
  gestureId?: CanvasGestureId
  getIntent: () => CanvasKeyboardSystemShortcutIntent
  ignoreKey?: boolean
  label: string
  modifier?: 'mod'
  overlayId?: CanvasOverlayId
  phase: CanvasKeyboardSystemShortcutPhase
  reserve?: { shiftInsensitive?: boolean }
  shiftInsensitive?: boolean
  shortcut: CanvasKeyboardShortcutChord
  shortcutId: CanvasShortcutId
}

const CANVAS_KEYBOARD_FIND_REPLACE_SHORTCUT = {
  getIntent: () => ({ kind: 'open-find-replace', preventDefault: true }),
  label: 'find replace',
  modifier: 'mod',
  overlayId: 'findReplace',
  phase: 'before-typing-target',
  shiftInsensitive: true,
  shortcut: { key: 'f' },
  shortcutId: 'findReplace',
} satisfies CanvasKeyboardSystemShortcutDescriptor

const CANVAS_KEYBOARD_COMMAND_PALETTE_SHORTCUT = {
  getIntent: () => ({ kind: 'open-command-palette', preventDefault: true }),
  label: 'command palette',
  modifier: 'mod',
  overlayId: 'commandPalette',
  phase: 'before-typing-target',
  shiftInsensitive: true,
  shortcut: { key: 'k' },
  shortcutId: 'commandPalette',
} satisfies CanvasKeyboardSystemShortcutDescriptor

const CANVAS_KEYBOARD_CURSOR_CHAT_SHORTCUT = {
  getIntent: () => ({ kind: 'open-cursor-chat', preventDefault: true }),
  label: 'cursor chat',
  overlayId: 'cursorChat',
  phase: 'after-typing-target',
  reserve: {},
  shortcut: { key: '/' },
  shortcutId: 'cursorChat',
} satisfies CanvasKeyboardSystemShortcutDescriptor

export const CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT = {
  code: 'Space',
  gestureId: 'temporaryPan',
  getIntent: () => ({ kind: 'temporary-pan', preventDefault: true }),
  ignoreKey: true,
  label: 'temporary pan',
  phase: 'after-typing-target',
  reserve: { shiftInsensitive: true },
  shiftInsensitive: true,
  shortcut: { key: 'Space' },
  shortcutId: 'temporaryPan',
} satisfies CanvasKeyboardSystemShortcutDescriptor

const CANVAS_KEYBOARD_ESCAPE_SHORTCUT = {
  getIntent: () => ({ kind: 'escape', preventDefault: false }),
  label: 'escape',
  phase: 'after-typing-target',
  reserve: { shiftInsensitive: true },
  shiftInsensitive: true,
  shortcut: { key: 'Escape' },
  shortcutId: 'escape',
} satisfies CanvasKeyboardSystemShortcutDescriptor

export const CANVAS_KEYBOARD_SYSTEM_SHORTCUTS:
  readonly CanvasKeyboardSystemShortcutDescriptor[] = [
  CANVAS_KEYBOARD_COMMAND_PALETTE_SHORTCUT,
  CANVAS_KEYBOARD_FIND_REPLACE_SHORTCUT,
  CANVAS_KEYBOARD_CURSOR_CHAT_SHORTCUT,
  CANVAS_KEYBOARD_TEMPORARY_PAN_SHORTCUT,
  CANVAS_KEYBOARD_ESCAPE_SHORTCUT,
]
