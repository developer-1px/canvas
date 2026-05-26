import type {
  CanvasCommandId,
  CanvasShortcutId,
} from '../../../engine'
import type { CanvasKeyboardShortcutChord } from './CanvasKeyboardShortcutChords'
import type {
  CanvasKeyboardCommandShortcutIntent,
  CanvasKeyboardCommandShortcutIntentInput,
} from './CanvasKeyboardCommandShortcutIntent'

export type CanvasKeyboardViewportShortcutDescriptor = {
  commandId: CanvasCommandId
  getIntent: (
    input: CanvasKeyboardCommandShortcutIntentInput,
  ) => CanvasKeyboardCommandShortcutIntent
  keys?: readonly string[]
  label: string
  modifier?: 'mod'
  reserve?: boolean | { shiftInsensitive?: boolean }
  shiftInsensitive?: boolean
  shortcut: CanvasKeyboardShortcutChord
  shortcutId: CanvasShortcutId
}

export const CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS:
  readonly CanvasKeyboardViewportShortcutDescriptor[] = [
  {
    commandId: 'zoomIn',
    getIntent: () => ({
      kind: 'zoom-by',
      multiplier: 1.25,
      preventDefault: true,
    }),
    keys: ['=', '+'],
    label: 'zoom in',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: '=' },
    shortcutId: 'zoomIn',
  },
  {
    commandId: 'zoomOut',
    getIntent: () => ({
      kind: 'zoom-by',
      multiplier: 0.8,
      preventDefault: true,
    }),
    label: 'zoom out',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: '-' },
    shortcutId: 'zoomOut',
  },
  {
    commandId: 'zoomReset',
    getIntent: () => ({ kind: 'reset-viewport', preventDefault: true }),
    label: 'reset viewport',
    modifier: 'mod',
    shiftInsensitive: true,
    shortcut: { key: '0' },
    shortcutId: 'zoomReset',
  },
  {
    commandId: 'fitView',
    getIntent: () => ({ kind: 'fit-all', preventDefault: true }),
    label: 'fit all',
    reserve: true,
    shiftInsensitive: true,
    shortcut: { key: '0' },
    shortcutId: 'fitAll',
  },
  {
    commandId: 'fitView',
    getIntent: ({ selection }) => ({
      ids: selection.length > 0 ? [...selection] : undefined,
      kind: 'fit-selection',
      preventDefault: true,
    }),
    label: 'fit selection',
    reserve: true,
    shiftInsensitive: true,
    shortcut: { key: '1' },
    shortcutId: 'fitSelection',
  },
]
