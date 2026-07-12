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

export const CANVAS_STICKY_NOTE_TEXT_TARGET_SLOT_ID =
  'canvas.sticky-note.text-target'

export const CANVAS_STICKY_NOTE_EXTENSION = defineCanvasExtension({
  id: CANVAS_STICKY_NOTE_EXTENSION_ID,
  rendererSlots: [{
    id: CANVAS_STICKY_NOTE_RENDERER_SLOT_ID,
    surface: 'item-layer',
  }],
  requiredAdapters: [
    'capability',
    'creation',
    'document',
    'renderer',
    'text-target',
  ],
  textTargetSlots: [{ id: CANVAS_STICKY_NOTE_TEXT_TARGET_SLOT_ID }],
  tools: [{
    id: CANVAS_STICKY_NOTE_TOOL_ID,
    kind: 'creation',
    requiredAdapters: [
      'capability',
      'creation',
      'document',
      'text-target',
    ],
    requiredCapability: 'editDocument',
  }],
} as const satisfies CanvasExtensionDescriptor<
  typeof CANVAS_STICKY_NOTE_EXTENSION_ID
>)
