import type { CanvasInteractionKind, Tool } from './CanvasPrimitives'
import type { CanvasCommandId } from './CanvasAffordanceTypes'

export const CANVAS_TOOL_AFFORDANCES = {
  pan: {
    ariaLabel: 'Pan tool',
    shortcut: 'H',
    statusLabel: 'Pan',
    title: 'Pan (H)',
  },
  rect: {
    ariaLabel: 'Rectangle tool',
    shortcut: 'R',
    statusLabel: 'Rect',
    title: 'Rectangle (R)',
  },
  select: {
    ariaLabel: 'Select tool',
    shortcut: 'V',
    statusLabel: 'Select',
    title: 'Select (V)',
  },
  text: {
    ariaLabel: 'Text tool',
    shortcut: 'T',
    statusLabel: 'Text',
    title: 'Text (T)',
  },
} satisfies Record<
  Tool,
  {
    ariaLabel: string
    shortcut: string
    statusLabel: string
    title: string
  }
>

export const CANVAS_COMMAND_AFFORDANCES = {
  alignBottom: { ariaLabel: 'Align bottom', title: 'Align bottom' },
  alignCenter: { ariaLabel: 'Align center', title: 'Align center' },
  alignLeft: { ariaLabel: 'Align left', title: 'Align left' },
  alignMiddle: { ariaLabel: 'Align middle', title: 'Align middle' },
  alignRight: { ariaLabel: 'Align right', title: 'Align right' },
  alignTop: { ariaLabel: 'Align top', title: 'Align top' },
  bringForward: { ariaLabel: 'Bring forward', title: 'Bring forward' },
  bringToFront: { ariaLabel: 'Bring to front', title: 'Bring to front' },
  copy: { ariaLabel: 'Copy', title: 'Copy' },
  cut: { ariaLabel: 'Cut', title: 'Cut' },
  delete: { ariaLabel: 'Delete', title: 'Delete' },
  duplicate: { ariaLabel: 'Duplicate', title: 'Duplicate' },
  distributeHorizontal: {
    ariaLabel: 'Distribute horizontally',
    title: 'Distribute horizontally',
  },
  distributeVertical: {
    ariaLabel: 'Distribute vertically',
    title: 'Distribute vertically',
  },
  fitView: { ariaLabel: 'Fit view', title: 'Fit view' },
  group: { ariaLabel: 'Group', title: 'Group' },
  lockSelection: { ariaLabel: 'Lock selection', title: 'Lock selection' },
  nudge: { ariaLabel: 'Nudge', title: 'Nudge' },
  paste: { ariaLabel: 'Paste', title: 'Paste' },
  redo: { ariaLabel: 'Redo', title: 'Redo' },
  selectAll: { ariaLabel: 'Select all', title: 'Select all' },
  sendBackward: { ariaLabel: 'Send backward', title: 'Send backward' },
  sendToBack: { ariaLabel: 'Send to back', title: 'Send to back' },
  undo: { ariaLabel: 'Undo', title: 'Undo' },
  ungroup: { ariaLabel: 'Ungroup', title: 'Ungroup' },
  unlockAll: { ariaLabel: 'Unlock all', title: 'Unlock all' },
  zoomIn: { ariaLabel: 'Zoom in', title: 'Zoom in' },
  zoomOut: { ariaLabel: 'Zoom out', title: 'Zoom out' },
  zoomReset: { ariaLabel: 'Reset zoom', title: 'Reset zoom' },
} satisfies Record<
  CanvasCommandId,
  {
    ariaLabel: string
    title: string
  }
>

export const CANVAS_GESTURE_STATUS_LABELS: Partial<
  Record<CanvasInteractionKind, string>
> = {
  'create-rect': 'Drawing',
  marquee: 'Selecting',
  move: 'Moving',
  pan: 'Panning',
  resize: 'Resizing',
}
