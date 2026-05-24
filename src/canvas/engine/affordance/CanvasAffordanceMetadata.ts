import type {
  CanvasBuiltinTool,
  CanvasInteractionKind,
} from '../../core'
import type {
  CanvasCommandId,
  CanvasShortcutId,
} from './CanvasAffordanceTypes'

export type CanvasToolAffordance = Readonly<{
  ariaLabel: string
  keyboardShortcut: CanvasToolKeyboardShortcut
  shortcut: string
  statusLabel: string
  title: string
}>

export type CanvasToolKeyboardShortcut = Readonly<{
  key: string
  shiftInsensitive?: boolean
  shiftKey?: boolean
  shortcutId: CanvasShortcutId
}>

export type CanvasCommandAffordance = Readonly<{
  ariaLabel: string
  title: string
}>

export const CANVAS_TOOL_AFFORDANCE_ORDER = Object.freeze([
  'select',
  'pan',
  'sticky',
  'section',
  'rect',
  'text',
  'comment',
  'marker',
  'highlight',
  'arrow',
] as const satisfies readonly CanvasBuiltinTool[])

export const CANVAS_TOOL_AFFORDANCES = Object.freeze({
  arrow: createCanvasToolAffordance({
    ariaLabel: 'Arrow tool',
    keyboardShortcut: {
      key: 'l',
      shiftInsensitive: true,
      shortcutId: 'arrowTool',
    },
    statusLabel: 'Arrow',
  }),
  comment: createCanvasToolAffordance({
    ariaLabel: 'Comment tool',
    keyboardShortcut: {
      key: 'c',
      shiftInsensitive: true,
      shortcutId: 'commentTool',
    },
    statusLabel: 'Comment',
  }),
  highlight: createCanvasToolAffordance({
    ariaLabel: 'Highlighter tool',
    keyboardShortcut: {
      key: 'm',
      shiftKey: true,
      shortcutId: 'highlighterTool',
    },
    statusLabel: 'Highlight',
  }),
  marker: createCanvasToolAffordance({
    ariaLabel: 'Marker tool',
    keyboardShortcut: {
      key: 'm',
      shortcutId: 'markerTool',
    },
    statusLabel: 'Marker',
  }),
  pan: createCanvasToolAffordance({
    ariaLabel: 'Pan tool',
    keyboardShortcut: {
      key: 'h',
      shiftInsensitive: true,
      shortcutId: 'panTool',
    },
    statusLabel: 'Pan',
  }),
  rect: createCanvasToolAffordance({
    ariaLabel: 'Rectangle tool',
    keyboardShortcut: {
      key: 'r',
      shiftInsensitive: true,
      shortcutId: 'rectTool',
    },
    statusLabel: 'Rect',
  }),
  select: createCanvasToolAffordance({
    ariaLabel: 'Select tool',
    keyboardShortcut: {
      key: 'v',
      shiftInsensitive: true,
      shortcutId: 'selectTool',
    },
    statusLabel: 'Select',
  }),
  section: createCanvasToolAffordance({
    ariaLabel: 'Section tool',
    keyboardShortcut: {
      key: 's',
      shiftKey: true,
      shortcutId: 'sectionTool',
    },
    statusLabel: 'Section',
  }),
  sticky: createCanvasToolAffordance({
    ariaLabel: 'Sticky note tool',
    keyboardShortcut: {
      key: 's',
      shortcutId: 'stickyTool',
    },
    statusLabel: 'Sticky',
  }),
  text: createCanvasToolAffordance({
    ariaLabel: 'Text tool',
    keyboardShortcut: {
      key: 't',
      shiftInsensitive: true,
      shortcutId: 'textTool',
    },
    statusLabel: 'Text',
  }),
} satisfies Readonly<Record<CanvasBuiltinTool, CanvasToolAffordance>>)

function createCanvasToolAffordance({
  ariaLabel,
  keyboardShortcut,
  statusLabel,
}: {
  ariaLabel: string
  keyboardShortcut: CanvasToolKeyboardShortcut
  statusLabel: string
}): CanvasToolAffordance {
  const frozenKeyboardShortcut = Object.freeze({ ...keyboardShortcut })
  const shortcut = formatCanvasToolKeyboardShortcut(keyboardShortcut)

  return Object.freeze({
    ariaLabel,
    keyboardShortcut: frozenKeyboardShortcut,
    shortcut,
    statusLabel,
    title: `${getCanvasToolAffordanceTitleLabel(ariaLabel)} (${shortcut})`,
  })
}

function getCanvasToolAffordanceTitleLabel(ariaLabel: string) {
  return ariaLabel.endsWith(' tool')
    ? ariaLabel.slice(0, -' tool'.length)
    : ariaLabel
}

function formatCanvasToolKeyboardShortcut(
  shortcut: CanvasToolKeyboardShortcut,
) {
  const key = formatCanvasToolKeyboardShortcutKey(shortcut.key)

  return shortcut.shiftKey ? `Shift+${key}` : key
}

function formatCanvasToolKeyboardShortcutKey(key: string) {
  return key.length === 1 ? key.toUpperCase() : key
}

export const CANVAS_COMMAND_AFFORDANCES = Object.freeze({
  alignBottom: Object.freeze({
    ariaLabel: 'Align bottom',
    title: 'Align bottom',
  }),
  alignCenter: Object.freeze({
    ariaLabel: 'Align center',
    title: 'Align center',
  }),
  alignLeft: Object.freeze({ ariaLabel: 'Align left', title: 'Align left' }),
  alignMiddle: Object.freeze({
    ariaLabel: 'Align middle',
    title: 'Align middle',
  }),
  alignRight: Object.freeze({
    ariaLabel: 'Align right',
    title: 'Align right',
  }),
  alignTop: Object.freeze({ ariaLabel: 'Align top', title: 'Align top' }),
  bringForward: Object.freeze({
    ariaLabel: 'Bring forward',
    title: 'Bring forward',
  }),
  bringToFront: Object.freeze({
    ariaLabel: 'Bring to front',
    title: 'Bring to front',
  }),
  copy: Object.freeze({ ariaLabel: 'Copy', title: 'Copy' }),
  cut: Object.freeze({ ariaLabel: 'Cut', title: 'Cut' }),
  delete: Object.freeze({ ariaLabel: 'Delete', title: 'Delete' }),
  duplicate: Object.freeze({ ariaLabel: 'Duplicate', title: 'Duplicate' }),
  distributeHorizontal: Object.freeze({
    ariaLabel: 'Distribute horizontally',
    title: 'Distribute horizontally',
  }),
  distributeVertical: Object.freeze({
    ariaLabel: 'Distribute vertically',
    title: 'Distribute vertically',
  }),
  fitView: Object.freeze({ ariaLabel: 'Fit view', title: 'Fit view' }),
  group: Object.freeze({ ariaLabel: 'Group', title: 'Group' }),
  lockSelection: Object.freeze({
    ariaLabel: 'Lock selection',
    title: 'Lock selection',
  }),
  nudge: Object.freeze({ ariaLabel: 'Nudge', title: 'Nudge' }),
  paste: Object.freeze({ ariaLabel: 'Paste', title: 'Paste' }),
  redo: Object.freeze({ ariaLabel: 'Redo', title: 'Redo' }),
  selectAll: Object.freeze({ ariaLabel: 'Select all', title: 'Select all' }),
  sendBackward: Object.freeze({
    ariaLabel: 'Send backward',
    title: 'Send backward',
  }),
  sendToBack: Object.freeze({
    ariaLabel: 'Send to back',
    title: 'Send to back',
  }),
  undo: Object.freeze({ ariaLabel: 'Undo', title: 'Undo' }),
  ungroup: Object.freeze({ ariaLabel: 'Ungroup', title: 'Ungroup' }),
  unlockAll: Object.freeze({ ariaLabel: 'Unlock all', title: 'Unlock all' }),
  zoomIn: Object.freeze({ ariaLabel: 'Zoom in', title: 'Zoom in' }),
  zoomOut: Object.freeze({ ariaLabel: 'Zoom out', title: 'Zoom out' }),
  zoomReset: Object.freeze({ ariaLabel: 'Reset zoom', title: 'Reset zoom' }),
} satisfies Readonly<Record<CanvasCommandId, CanvasCommandAffordance>>)

export const CANVAS_GESTURE_STATUS_LABELS: Partial<
  Record<CanvasInteractionKind, string>
> = Object.freeze({
  'create-arrow': 'Drawing',
  'create-custom': 'Creating',
  'create-rect': 'Drawing',
  'draw-highlight': 'Highlighting',
  'draw-marker': 'Drawing',
  'arrow-endpoint': 'Connecting',
  marquee: 'Selecting',
  move: 'Moving',
  pan: 'Panning',
  resize: 'Resizing',
})
