import { describe, expect, it } from 'vitest'

import {
  CANVAS_STICKY_NOTE_EXTENSION,
  CANVAS_STICKY_NOTE_EXTENSION_ID,
  CANVAS_STICKY_NOTE_RENDERER_SLOT_ID,
  CANVAS_STICKY_NOTE_TOOL_ID,
} from './CanvasFirstPartyExtensions'

describe('CanvasFirstPartyExtensions', () => {
  it('describes sticky note creation as a first-party extension affordance', () => {
    expect(CANVAS_STICKY_NOTE_EXTENSION.id).toBe(
      CANVAS_STICKY_NOTE_EXTENSION_ID,
    )
    expect(CANVAS_STICKY_NOTE_EXTENSION.requiredAdapters).toEqual([
      'creation',
      'document',
      'renderer',
      'text-target',
    ])
    expect(CANVAS_STICKY_NOTE_EXTENSION.tools).toEqual([{
      id: CANVAS_STICKY_NOTE_TOOL_ID,
      kind: 'creation',
      requiredAdapters: ['creation', 'document', 'text-target'],
    }])
    expect(CANVAS_STICKY_NOTE_EXTENSION.rendererSlots).toEqual([{
      id: CANVAS_STICKY_NOTE_RENDERER_SLOT_ID,
      surface: 'item-layer',
    }])
  })
})
