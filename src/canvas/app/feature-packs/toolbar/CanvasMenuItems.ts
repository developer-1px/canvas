import {
  CANVAS_MENU_ITEM_SELECTOR,
  type CanvasMenuItem,
} from './CanvasMenuRovingFocusContracts'

export function getCanvasMenuItems(root: HTMLElement) {
  return Array.from(
    root.querySelectorAll<CanvasMenuItem>(CANVAS_MENU_ITEM_SELECTOR),
  )
}

export function isCanvasMenuItemEnabled(item: CanvasMenuItem) {
  return !item.disabled && item.getAttribute('aria-disabled') !== 'true'
}
