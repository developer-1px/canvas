import type {
  CanvasAppCommandDefinition,
} from './CanvasAppCommandDefinitionContracts'
import {
  keyboardBinding,
  systemDefinition,
} from './CanvasAppCommandDefinitionBuilders'

export const CANVAS_APP_SYSTEM_COMMAND_DEFINITIONS = [
  systemDefinition({
    action: { type: 'canvas.system.commandPalette' },
    bindings: [
      keyboardBinding('commandPalette', {
        key: 'k',
        modifier: 'primary',
      }, { overlayId: 'commandPalette' }),
    ],
    id: 'system:commandPalette',
    title: 'Command Palette',
  }),
  systemDefinition({
    action: { type: 'canvas.system.findReplace' },
    bindings: [
      keyboardBinding('findReplace', {
        key: 'f',
        modifier: 'primary',
      }, { overlayId: 'findReplace' }),
    ],
    id: 'system:findReplace',
    title: 'Find Replace',
  }),
  systemDefinition({
    action: { type: 'canvas.system.shortcutHelp' },
    bindings: [
      keyboardBinding('shortcutHelp', {
        key: '/',
        shiftKey: true,
      }, { overlayId: 'shortcutHelp' }),
    ],
    id: 'system:shortcutHelp',
    title: 'Keyboard shortcuts',
  }),
  systemDefinition({
    action: { type: 'canvas.system.cursorChat' },
    bindings: [
      keyboardBinding('cursorChat', { key: '/' }, {
        overlayId: 'cursorChat',
      }),
    ],
    id: 'system:cursorChat',
    title: 'Cursor Chat',
  }),
  systemDefinition({
    action: { type: 'canvas.system.temporaryPan' },
    bindings: [keyboardBinding('temporaryPan', { key: 'Space' })],
    id: 'system:temporaryPan',
    title: 'Temporary Pan',
  }),
  systemDefinition({
    action: { type: 'canvas.system.escape' },
    bindings: [keyboardBinding('escape', { key: 'Escape' })],
    id: 'system:escape',
    title: 'Escape',
  }),
] as const satisfies readonly CanvasAppCommandDefinition[]
