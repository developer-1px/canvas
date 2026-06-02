import type { CanvasBuiltinTool } from '../core'

import {
  defineCanvasExtension,
  type CanvasExtensionDescriptor,
} from './CanvasExtensionContracts'

export const CANVAS_STICKY_NOTE_EXTENSION_ID = 'canvas.sticky-note'

export const CANVAS_STICKY_NOTE_TOOL_ID =
  'sticky' satisfies CanvasBuiltinTool

export const CANVAS_STICKY_NOTE_RENDERER_SLOT_ID =
  'canvas.sticky-note.item-layer'

export const CANVAS_STICKY_NOTE_EXTENSION = defineCanvasExtension({
  id: CANVAS_STICKY_NOTE_EXTENSION_ID,
  rendererSlots: [{
    id: CANVAS_STICKY_NOTE_RENDERER_SLOT_ID,
    surface: 'item-layer',
  }],
  requiredAdapters: ['creation', 'document', 'renderer', 'text-target'],
  tools: [{
    id: CANVAS_STICKY_NOTE_TOOL_ID,
    kind: 'creation',
    requiredAdapters: ['creation', 'document', 'text-target'],
  }],
} as const satisfies CanvasExtensionDescriptor<
  typeof CANVAS_STICKY_NOTE_EXTENSION_ID
>)
