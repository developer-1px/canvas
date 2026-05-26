import type {
  CanvasAlignMode,
  CanvasCommandAvailability,
  CanvasCommandId,
  CanvasDistributeMode,
} from '../../../../engine'

export type CanvasToolbarCommandAction =
  | { kind: 'align'; mode: CanvasAlignMode }
  | { kind: 'delete' }
  | { kind: 'distribute'; mode: CanvasDistributeMode }
  | { kind: 'duplicate' }
  | { kind: 'group' }
  | { kind: 'lock' }
  | { kind: 'redo' }
  | { kind: 'undo' }
  | { kind: 'ungroup' }
  | { kind: 'unlock-all' }

export type CanvasFeatureCommandSurface =
  | 'context-menu'
  | 'selection-floating-bar'
  | 'toolbar'

export type CanvasToolbarCommandGroupId =
  | 'history'
  | 'selection'
  | 'grouping'
  | 'alignment'
  | 'lock'

export type CanvasToolbarAvailableCommandId =
  keyof CanvasCommandAvailability & CanvasCommandId

export type CanvasToolbarCommandDescriptor = {
  action: CanvasToolbarCommandAction
  command: CanvasToolbarAvailableCommandId
  surfaces: readonly CanvasFeatureCommandSurface[]
}

export type CanvasToolbarCommandGroupDescriptor = {
  commands: readonly CanvasToolbarCommandDescriptor[]
  id: CanvasToolbarCommandGroupId
}

export const CANVAS_TOOLBAR_COMMAND_GROUPS = [
  {
    id: 'history',
    commands: [
      {
        action: { kind: 'undo' },
        command: 'undo',
        surfaces: ['context-menu'],
      },
      {
        action: { kind: 'redo' },
        command: 'redo',
        surfaces: ['context-menu'],
      },
    ],
  },
  {
    id: 'selection',
    commands: [
      {
        action: { kind: 'duplicate' },
        command: 'duplicate',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'delete' },
        command: 'delete',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
    ],
  },
  {
    id: 'grouping',
    commands: [
      {
        action: { kind: 'group' },
        command: 'group',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'ungroup' },
        command: 'ungroup',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
    ],
  },
  {
    id: 'alignment',
    commands: [
      {
        action: { kind: 'align', mode: 'alignLeft' },
        command: 'alignLeft',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'align', mode: 'alignCenter' },
        command: 'alignCenter',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'align', mode: 'alignRight' },
        command: 'alignRight',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'align', mode: 'alignTop' },
        command: 'alignTop',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'align', mode: 'alignMiddle' },
        command: 'alignMiddle',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'align', mode: 'alignBottom' },
        command: 'alignBottom',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'distribute', mode: 'distributeHorizontal' },
        command: 'distributeHorizontal',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'distribute', mode: 'distributeVertical' },
        command: 'distributeVertical',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
    ],
  },
  {
    id: 'lock',
    commands: [
      {
        action: { kind: 'lock' },
        command: 'lockSelection',
        surfaces: ['selection-floating-bar', 'context-menu'],
      },
      {
        action: { kind: 'unlock-all' },
        command: 'unlockAll',
        surfaces: ['context-menu'],
      },
    ],
  },
] as const satisfies readonly CanvasToolbarCommandGroupDescriptor[]
