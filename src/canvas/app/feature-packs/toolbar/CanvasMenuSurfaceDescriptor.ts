import {
  CANVAS_MENU_FOCUS_MODEL,
  CANVAS_MENU_ITEM_PROPS,
  CANVAS_MENU_KEYBOARD_KEYS,
} from './CanvasMenuRovingFocus'

export {
  CANVAS_MENU_FOCUS_MODEL,
  CANVAS_MENU_KEYBOARD_KEYS,
} from './CanvasMenuRovingFocus'

export const CANVAS_MENU_SURFACE_MODEL = 'canvas-menu-surface'

export type CanvasMenuSurfaceRootAttributes = {
  'aria-label': string
  role: 'menu'
}

export type CanvasMenuSeparatorAttributes = {
  role: 'separator'
}

export type CanvasMenuItemAttributes = {
  'aria-checked': boolean | undefined
  'aria-disabled': true | undefined
  'data-canvas-menu-item': ''
  role: 'menuitem' | 'menuitemcheckbox'
}

export type CanvasMenuSurfaceDescriptor = {
  focusModel: typeof CANVAS_MENU_FOCUS_MODEL
  keyboardModel: typeof CANVAS_MENU_KEYBOARD_KEYS
  model: typeof CANVAS_MENU_SURFACE_MODEL
  rootAttributes: CanvasMenuSurfaceRootAttributes
  separatorAttributes: CanvasMenuSeparatorAttributes
}

export type CanvasMenuSurfaceDescriptorInput = {
  ariaLabel: string
}

export type CanvasMenuItemAttributesInput = {
  checked?: boolean
  disabled?: boolean
}

export function createCanvasMenuSurfaceDescriptor({
  ariaLabel,
}: CanvasMenuSurfaceDescriptorInput): CanvasMenuSurfaceDescriptor {
  return {
    focusModel: CANVAS_MENU_FOCUS_MODEL,
    keyboardModel: CANVAS_MENU_KEYBOARD_KEYS,
    model: CANVAS_MENU_SURFACE_MODEL,
    rootAttributes: {
      'aria-label': ariaLabel,
      role: 'menu',
    },
    separatorAttributes: {
      role: 'separator',
    },
  }
}

export function getCanvasMenuItemAttributes({
  checked,
  disabled = false,
}: CanvasMenuItemAttributesInput = {}): CanvasMenuItemAttributes {
  const hasCheckedState = checked !== undefined

  return {
    ...CANVAS_MENU_ITEM_PROPS,
    'aria-checked': hasCheckedState ? checked : undefined,
    'aria-disabled': disabled ? true : undefined,
    role: hasCheckedState ? 'menuitemcheckbox' : 'menuitem',
  }
}
