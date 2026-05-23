import type {
  CanvasBuiltinTool,
  CanvasInteractionKind,
} from '../../core'
import type { CanvasCommandId } from './CanvasAffordanceTypes'

export type CanvasToolAffordance = Readonly<{
  ariaLabel: string
  shortcut: string
  statusLabel: string
  title: string
}>

export type CanvasCommandAffordance = Readonly<{
  ariaLabel: string
  title: string
}>

export const CANVAS_TOOL_AFFORDANCE_ORDER = Object.freeze([
  'select',
  'pan',
  'rect',
  'text',
  'marker',
  'highlight',
  'arrow',
] as const satisfies readonly CanvasBuiltinTool[])

export const CANVAS_TOOL_AFFORDANCES = Object.freeze({
  arrow: Object.freeze({
    ariaLabel: 'Arrow tool',
    shortcut: 'L',
    statusLabel: 'Arrow',
    title: 'Arrow (L)',
  }),
  highlight: Object.freeze({
    ariaLabel: 'Highlighter tool',
    shortcut: 'Shift+M',
    statusLabel: 'Highlight',
    title: 'Highlighter (Shift+M)',
  }),
  marker: Object.freeze({
    ariaLabel: 'Marker tool',
    shortcut: 'M',
    statusLabel: 'Marker',
    title: 'Marker (M)',
  }),
  pan: Object.freeze({
    ariaLabel: 'Pan tool',
    shortcut: 'H',
    statusLabel: 'Pan',
    title: 'Pan (H)',
  }),
  rect: Object.freeze({
    ariaLabel: 'Rectangle tool',
    shortcut: 'R',
    statusLabel: 'Rect',
    title: 'Rectangle (R)',
  }),
  select: Object.freeze({
    ariaLabel: 'Select tool',
    shortcut: 'V',
    statusLabel: 'Select',
    title: 'Select (V)',
  }),
  text: Object.freeze({
    ariaLabel: 'Text tool',
    shortcut: 'T',
    statusLabel: 'Text',
    title: 'Text (T)',
  }),
} satisfies Readonly<Record<CanvasBuiltinTool, CanvasToolAffordance>>)

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
  marquee: 'Selecting',
  move: 'Moving',
  pan: 'Panning',
  resize: 'Resizing',
})
