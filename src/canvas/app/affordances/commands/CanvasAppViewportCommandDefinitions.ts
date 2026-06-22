import type {
  CanvasAppCommandDefinition,
} from './CanvasAppCommandDefinitionContracts'
import {
  keyboardBinding,
} from './CanvasAppCommandDefinitionBuilders'

export const CANVAS_APP_VIEWPORT_COMMAND_DEFINITIONS = [
  {
    action: { type: 'canvas.viewport.fit' },
    bindings: [
      keyboardBinding('fitAll', { key: '0' }),
      keyboardBinding('fitSelection', { key: '1' }),
    ],
    commandId: 'fitView',
    id: 'viewport:fit',
    section: 'View',
    title: 'Fit view',
  },
  {
    action: { type: 'canvas.viewport.resetZoom' },
    bindings: [
      keyboardBinding('zoomReset', {
        key: '0',
        modifier: 'primary',
      }),
    ],
    commandId: 'zoomReset',
    id: 'viewport:reset-zoom',
    section: 'View',
    title: 'Reset zoom',
  },
  {
    action: { type: 'canvas.viewport.zoom', params: { direction: 'in' } },
    bindings: [
      keyboardBinding('zoomIn', {
        key: '=',
        modifier: 'primary',
      }),
    ],
    commandId: 'zoomIn',
    id: 'viewport:zoom-in',
    section: 'View',
    title: 'Zoom in',
  },
  {
    action: { type: 'canvas.viewport.zoom', params: { direction: 'out' } },
    bindings: [
      keyboardBinding('zoomOut', {
        key: '-',
        modifier: 'primary',
      }),
    ],
    commandId: 'zoomOut',
    id: 'viewport:zoom-out',
    section: 'View',
    title: 'Zoom out',
  },
] as const satisfies readonly CanvasAppCommandDefinition[]
