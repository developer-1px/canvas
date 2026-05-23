import type { CanvasKeyboardShortcutChord } from './CanvasKeyboardShortcutChords'

export type CanvasKeyboardNudgeShortcutDescriptor = {
  dx: number
  dy: number
  label: string
  shortcut: CanvasKeyboardShortcutChord
}

export const CANVAS_KEYBOARD_NUDGE_SHORTCUTS = [
  {
    dx: -1,
    dy: 0,
    label: 'nudge left',
    shortcut: { key: 'ArrowLeft' },
  },
  {
    dx: 1,
    dy: 0,
    label: 'nudge right',
    shortcut: { key: 'ArrowRight' },
  },
  {
    dx: 0,
    dy: -1,
    label: 'nudge up',
    shortcut: { key: 'ArrowUp' },
  },
  {
    dx: 0,
    dy: 1,
    label: 'nudge down',
    shortcut: { key: 'ArrowDown' },
  },
  {
    dx: -10,
    dy: 0,
    label: 'large nudge left',
    shortcut: { key: 'ArrowLeft', shiftKey: true },
  },
  {
    dx: 10,
    dy: 0,
    label: 'large nudge right',
    shortcut: { key: 'ArrowRight', shiftKey: true },
  },
  {
    dx: 0,
    dy: -10,
    label: 'large nudge up',
    shortcut: { key: 'ArrowUp', shiftKey: true },
  },
  {
    dx: 0,
    dy: 10,
    label: 'large nudge down',
    shortcut: { key: 'ArrowDown', shiftKey: true },
  },
] satisfies readonly CanvasKeyboardNudgeShortcutDescriptor[]
