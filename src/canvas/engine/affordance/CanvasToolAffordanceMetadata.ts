import type {
  CanvasBuiltinTool,
} from '../../core'
import type {
  CanvasShortcutId,
} from './CanvasAffordanceTypes'

export type CanvasToolAffordance = Readonly<{
  ariaLabel: string
  keyboardShortcut?: CanvasToolKeyboardShortcut
  model: string
  shortcut?: string
  statusLabel: string
  title: string
}>

export type CanvasToolKeyboardShortcut = Readonly<{
  key: string
  shiftInsensitive?: boolean
  shiftKey?: boolean
  shortcutId: CanvasShortcutId
}>

export const CANVAS_TOOL_AFFORDANCE_ORDER = Object.freeze([
  'select',
  'pan',
  'sticky',
  'section',
  'rect',
  'ellipse',
  'diamond',
  'text',
  'comment',
  'pen',
  'marker',
  'highlight',
  'eraser',
  'laser',
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
    model: 'canvas-arrow-tool',
    statusLabel: 'Arrow',
  }),
  comment: createCanvasToolAffordance({
    ariaLabel: 'Comment tool',
    keyboardShortcut: {
      key: 'c',
      shiftInsensitive: true,
      shortcutId: 'commentTool',
    },
    model: 'canvas-comment-tool',
    statusLabel: 'Comment',
  }),
  highlight: createCanvasToolAffordance({
    ariaLabel: 'Highlighter tool',
    keyboardShortcut: {
      key: 'm',
      shiftKey: true,
      shortcutId: 'highlighterTool',
    },
    model: 'canvas-highlighter-tool',
    statusLabel: 'Highlight',
  }),
  eraser: createCanvasToolAffordance({
    ariaLabel: 'Eraser tool',
    keyboardShortcut: {
      key: 'e',
      shiftInsensitive: true,
      shortcutId: 'eraserTool',
    },
    model: 'canvas-eraser-tool',
    statusLabel: 'Eraser',
  }),
  diamond: createCanvasToolAffordance({
    ariaLabel: 'Diamond tool',
    model: 'canvas-diamond-tool',
    statusLabel: 'Diamond',
  }),
  ellipse: createCanvasToolAffordance({
    ariaLabel: 'Ellipse tool',
    keyboardShortcut: {
      key: 'o',
      shiftInsensitive: true,
      shortcutId: 'ellipseTool',
    },
    model: 'canvas-ellipse-tool',
    statusLabel: 'Ellipse',
  }),
  laser: createCanvasToolAffordance({
    ariaLabel: 'Laser pointer tool',
    keyboardShortcut: {
      key: 'p',
      shiftInsensitive: true,
      shortcutId: 'laserTool',
    },
    model: 'canvas-laser-pointer-tool',
    statusLabel: 'Laser',
  }),
  marker: createCanvasToolAffordance({
    ariaLabel: 'Marker tool',
    keyboardShortcut: {
      key: 'm',
      shortcutId: 'markerTool',
    },
    model: 'canvas-marker-tool',
    statusLabel: 'Marker',
  }),
  pen: createCanvasToolAffordance({
    ariaLabel: 'Pen tool',
    keyboardShortcut: {
      key: 'p',
      shiftKey: true,
      shortcutId: 'penTool',
    },
    model: 'canvas-pen-tool',
    statusLabel: 'Pen',
  }),
  pan: createCanvasToolAffordance({
    ariaLabel: 'Pan tool',
    keyboardShortcut: {
      key: 'h',
      shiftInsensitive: true,
      shortcutId: 'panTool',
    },
    model: 'canvas-pan-tool',
    statusLabel: 'Pan',
  }),
  rect: createCanvasToolAffordance({
    ariaLabel: 'Rectangle tool',
    keyboardShortcut: {
      key: 'r',
      shiftInsensitive: true,
      shortcutId: 'rectTool',
    },
    model: 'canvas-rect-tool',
    statusLabel: 'Rect',
  }),
  select: createCanvasToolAffordance({
    ariaLabel: 'Select tool',
    keyboardShortcut: {
      key: 'v',
      shiftInsensitive: true,
      shortcutId: 'selectTool',
    },
    model: 'canvas-select-tool',
    statusLabel: 'Select',
  }),
  section: createCanvasToolAffordance({
    ariaLabel: 'Section tool',
    keyboardShortcut: {
      key: 's',
      shiftKey: true,
      shortcutId: 'sectionTool',
    },
    model: 'canvas-section-tool',
    statusLabel: 'Section',
  }),
  sticky: createCanvasToolAffordance({
    ariaLabel: 'Sticky note tool',
    keyboardShortcut: {
      key: 's',
      shortcutId: 'stickyTool',
    },
    model: 'canvas-sticky-note-tool',
    statusLabel: 'Sticky',
  }),
  text: createCanvasToolAffordance({
    ariaLabel: 'Text tool',
    keyboardShortcut: {
      key: 't',
      shiftInsensitive: true,
      shortcutId: 'textTool',
    },
    model: 'canvas-text-tool',
    statusLabel: 'Text',
  }),
} satisfies Readonly<Record<CanvasBuiltinTool, CanvasToolAffordance>>)

function createCanvasToolAffordance({
  ariaLabel,
  keyboardShortcut,
  model,
  statusLabel,
}: {
  ariaLabel: string
  keyboardShortcut?: CanvasToolKeyboardShortcut
  model: string
  statusLabel: string
}): CanvasToolAffordance {
  const frozenKeyboardShortcut = keyboardShortcut
    ? Object.freeze({ ...keyboardShortcut })
    : undefined
  const shortcut = keyboardShortcut
    ? formatCanvasToolKeyboardShortcut(keyboardShortcut)
    : undefined

  return Object.freeze({
    ariaLabel,
    ...(frozenKeyboardShortcut ? {
      keyboardShortcut: frozenKeyboardShortcut,
      shortcut,
    } : {}),
    model,
    statusLabel,
    title: shortcut
      ? `${getCanvasToolAffordanceTitleLabel(ariaLabel)} (${shortcut})`
      : getCanvasToolAffordanceTitleLabel(ariaLabel),
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
