import { describe, expect, it } from 'vitest'
import {
  CANVAS_DOM_ALIGNMENT_POPOVER_MODEL,
  CANVAS_DOM_ALIGNMENT_PREVIEW_GUIDE_MODEL,
} from './metadata'

describe('dom-edit affordance metadata', () => {
  it('exports alignment metadata without React overlay imports', () => {
    expect(CANVAS_DOM_ALIGNMENT_POPOVER_MODEL).toBe(
      'canvas-dom-alignment-popover',
    )
    expect(CANVAS_DOM_ALIGNMENT_PREVIEW_GUIDE_MODEL).toBe(
      'canvas-dom-alignment-preview-guide',
    )
  })
})
