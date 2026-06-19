import { describe, expect, it } from 'vitest'
import {
  CANVAS_MENU_FOCUS_MODEL,
  CANVAS_MENU_KEYBOARD_KEYS,
  CANVAS_MENU_SURFACE_MODEL,
  createCanvasMenuSurfaceDescriptor,
  getCanvasMenuItemAttributes,
} from './CanvasMenuSurfaceDescriptor'

describe('CanvasMenuSurfaceDescriptor', () => {
  it('describes menu root and separator attributes as a reusable surface contract', () => {
    expect(createCanvasMenuSurfaceDescriptor({
      ariaLabel: 'Canvas context commands',
    })).toEqual({
      focusModel: CANVAS_MENU_FOCUS_MODEL,
      keyboardModel: CANVAS_MENU_KEYBOARD_KEYS,
      model: CANVAS_MENU_SURFACE_MODEL,
      rootAttributes: {
        'aria-label': 'Canvas context commands',
        role: 'menu',
      },
      separatorAttributes: {
        role: 'separator',
      },
    })
  })

  it('describes plain and checked menu items for roving focus hosts', () => {
    expect(getCanvasMenuItemAttributes({})).toEqual({
      'aria-checked': undefined,
      'aria-disabled': undefined,
      'data-canvas-menu-item': '',
      role: 'menuitem',
    })
    expect(getCanvasMenuItemAttributes({ checked: false })).toEqual({
      'aria-checked': false,
      'aria-disabled': undefined,
      'data-canvas-menu-item': '',
      role: 'menuitemcheckbox',
    })
    expect(getCanvasMenuItemAttributes({
      checked: true,
      disabled: true,
    })).toEqual({
      'aria-checked': true,
      'aria-disabled': true,
      'data-canvas-menu-item': '',
      role: 'menuitemcheckbox',
    })
  })
})
