import type {
  CanvasCommandId,
} from './CanvasAffordanceTypes'

export type CanvasCommandAffordance = Readonly<{
  ariaLabel: string
  title: string
}>

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
