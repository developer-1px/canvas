import { describe, expect, it } from 'vitest'
import {
  CANVAS_TOOLBAR_FOCUS_MODEL,
  CANVAS_TOOLBAR_KEYBOARD_MODEL,
  CANVAS_TOOLBAR_ROVING_FOCUS_MODEL,
} from './CanvasToolbarRovingFocus'

describe('CanvasToolbarRovingFocus', () => {
  it('exports toolbar roving focus metadata for host DOM contracts', () => {
    expect(CANVAS_TOOLBAR_ROVING_FOCUS_MODEL).toBe(
      'canvas-toolbar-roving-focus',
    )
    expect(CANVAS_TOOLBAR_FOCUS_MODEL).toBe('roving-tabindex')
    expect(CANVAS_TOOLBAR_KEYBOARD_MODEL).toBe('arrow-home-end')
  })
})
