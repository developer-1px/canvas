import { describe, expect, it } from 'vitest'
import {
  isCanvasEngineDemoSelectionPointerButton,
} from './CanvasEngineDemoPointerIntent'

describe('CanvasEngineDemoPointerIntent', () => {
  it('starts selection pointer affordances only from the primary button', () => {
    expect(isCanvasEngineDemoSelectionPointerButton({ button: 0 })).toBe(true)
    expect(isCanvasEngineDemoSelectionPointerButton({ button: 1 })).toBe(false)
    expect(isCanvasEngineDemoSelectionPointerButton({ button: 2 })).toBe(false)
    expect(isCanvasEngineDemoSelectionPointerButton({ button: -1 })).toBe(false)
  })
})
