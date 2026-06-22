import type {
  CanvasAppCommandDefinition,
} from './CanvasAppCommandDefinitionContracts'
import {
  commandDefinition,
  keyboardBinding,
} from './CanvasAppCommandDefinitionBuilders'

export const CANVAS_APP_EDITING_COMMAND_DEFINITIONS = [
  {
    action: { type: 'canvas.command.undo' },
    bindings: [keyboardBinding('undo', { key: 'z', modifier: 'primary' })],
    commandId: 'undo',
    groupId: 'history',
    id: 'command:undo',
    section: 'Commands',
    surfaces: ['context-menu'],
    title: 'Undo',
  },
  {
    action: { type: 'canvas.command.redo' },
    bindings: [
      keyboardBinding('redo', {
        key: 'z',
        modifier: 'primary',
        shiftKey: true,
      }),
      keyboardBinding('redo', { key: 'y', modifier: 'primary' }),
    ],
    commandId: 'redo',
    groupId: 'history',
    id: 'command:redo',
    section: 'Commands',
    surfaces: ['context-menu'],
    title: 'Redo',
  },
  {
    action: { type: 'canvas.command.duplicate' },
    bindings: [
      keyboardBinding('duplicate', { key: 'd', modifier: 'primary' }),
      {
        gestureId: 'altDragDuplicate',
        kind: 'pointer',
        pointer: { modifier: 'Alt', type: 'drag' },
      },
    ],
    commandId: 'duplicate',
    groupId: 'selection',
    id: 'command:duplicate',
    section: 'Commands',
    surfaces: ['selection-floating-bar', 'context-menu'],
    title: 'Duplicate',
  },
  {
    action: { type: 'canvas.command.delete' },
    bindings: [
      keyboardBinding('delete', { key: 'Delete' }),
      keyboardBinding('delete', { key: 'Backspace' }),
    ],
    commandId: 'delete',
    groupId: 'selection',
    id: 'command:delete',
    section: 'Commands',
    surfaces: ['selection-floating-bar', 'context-menu'],
    title: 'Delete',
  },
  {
    action: { type: 'canvas.command.group' },
    bindings: [keyboardBinding('group', { key: 'g', modifier: 'primary' })],
    commandId: 'group',
    groupId: 'grouping',
    id: 'command:group',
    section: 'Commands',
    surfaces: ['selection-floating-bar', 'context-menu'],
    title: 'Group',
  },
  {
    action: { type: 'canvas.command.ungroup' },
    bindings: [
      keyboardBinding('ungroup', {
        key: 'g',
        modifier: 'primary',
        shiftKey: true,
      }),
    ],
    commandId: 'ungroup',
    groupId: 'grouping',
    id: 'command:ungroup',
    section: 'Commands',
    surfaces: ['selection-floating-bar', 'context-menu'],
    title: 'Ungroup',
  },
  commandDefinition({
    action: { type: 'canvas.command.align', params: { mode: 'alignLeft' } },
    commandId: 'alignLeft',
    groupId: 'alignment',
    id: 'command:alignLeft',
    title: 'Align left',
  }),
  commandDefinition({
    action: { type: 'canvas.command.align', params: { mode: 'alignCenter' } },
    commandId: 'alignCenter',
    groupId: 'alignment',
    id: 'command:alignCenter',
    title: 'Align center',
  }),
  commandDefinition({
    action: { type: 'canvas.command.align', params: { mode: 'alignRight' } },
    commandId: 'alignRight',
    groupId: 'alignment',
    id: 'command:alignRight',
    title: 'Align right',
  }),
  commandDefinition({
    action: { type: 'canvas.command.align', params: { mode: 'alignTop' } },
    commandId: 'alignTop',
    groupId: 'alignment',
    id: 'command:alignTop',
    title: 'Align top',
  }),
  commandDefinition({
    action: { type: 'canvas.command.align', params: { mode: 'alignMiddle' } },
    commandId: 'alignMiddle',
    groupId: 'alignment',
    id: 'command:alignMiddle',
    title: 'Align middle',
  }),
  commandDefinition({
    action: { type: 'canvas.command.align', params: { mode: 'alignBottom' } },
    commandId: 'alignBottom',
    groupId: 'alignment',
    id: 'command:alignBottom',
    title: 'Align bottom',
  }),
  commandDefinition({
    action: {
      type: 'canvas.command.distribute',
      params: { mode: 'distributeHorizontal' },
    },
    commandId: 'distributeHorizontal',
    groupId: 'alignment',
    id: 'command:distributeHorizontal',
    title: 'Distribute horizontally',
  }),
  commandDefinition({
    action: {
      type: 'canvas.command.distribute',
      params: { mode: 'distributeVertical' },
    },
    commandId: 'distributeVertical',
    groupId: 'alignment',
    id: 'command:distributeVertical',
    title: 'Distribute vertically',
  }),
  commandDefinition({
    action: {
      type: 'canvas.command.reorder',
      params: { mode: 'bringToFront' },
    },
    bindings: [
      keyboardBinding('bringToFront', {
        key: ']',
        modifier: 'primary',
        shiftKey: true,
      }),
    ],
    commandId: 'bringToFront',
    groupId: 'layer-order',
    id: 'command:bringToFront',
    title: 'Bring to front',
  }),
  commandDefinition({
    action: {
      type: 'canvas.command.reorder',
      params: { mode: 'bringForward' },
    },
    bindings: [
      keyboardBinding('bringForward', {
        key: ']',
        modifier: 'primary',
      }),
    ],
    commandId: 'bringForward',
    groupId: 'layer-order',
    id: 'command:bringForward',
    title: 'Bring forward',
  }),
  commandDefinition({
    action: {
      type: 'canvas.command.reorder',
      params: { mode: 'sendBackward' },
    },
    bindings: [
      keyboardBinding('sendBackward', {
        key: '[',
        modifier: 'primary',
      }),
    ],
    commandId: 'sendBackward',
    groupId: 'layer-order',
    id: 'command:sendBackward',
    title: 'Send backward',
  }),
  commandDefinition({
    action: {
      type: 'canvas.command.reorder',
      params: { mode: 'sendToBack' },
    },
    bindings: [
      keyboardBinding('sendToBack', {
        key: '[',
        modifier: 'primary',
        shiftKey: true,
      }),
    ],
    commandId: 'sendToBack',
    groupId: 'layer-order',
    id: 'command:sendToBack',
    title: 'Send to back',
  }),
  commandDefinition({
    action: { type: 'canvas.command.lock' },
    bindings: [
      keyboardBinding('lockSelection', {
        key: 'l',
        modifier: 'primary',
      }),
    ],
    commandId: 'lockSelection',
    groupId: 'lock',
    id: 'command:lockSelection',
    title: 'Lock selection',
  }),
  commandDefinition({
    action: { type: 'canvas.command.unlock-all' },
    bindings: [
      keyboardBinding('unlockAll', {
        key: 'l',
        modifier: 'primary',
        shiftKey: true,
      }),
    ],
    commandId: 'unlockAll',
    groupId: 'lock',
    id: 'command:unlockAll',
    surfaces: ['context-menu'],
    title: 'Unlock all',
  }),
] as const satisfies readonly CanvasAppCommandDefinition[]
