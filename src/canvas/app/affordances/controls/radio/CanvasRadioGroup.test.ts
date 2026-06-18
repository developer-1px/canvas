import { describe, expect, it } from 'vitest'
import {
  CANVAS_RADIO_GROUP_FOCUS_MODEL,
  CANVAS_RADIO_GROUP_KEYBOARD_MODEL,
  CANVAS_RADIO_GROUP_MODEL,
} from './CanvasRadioGroup'

describe('CanvasRadioGroup', () => {
  it('exports radio group metadata for host DOM contracts', () => {
    expect(CANVAS_RADIO_GROUP_MODEL).toBe('canvas-radio-group')
    expect(CANVAS_RADIO_GROUP_FOCUS_MODEL).toBe('roving-tabindex')
    expect(CANVAS_RADIO_GROUP_KEYBOARD_MODEL).toBe('arrow-home-end')
  })
})
