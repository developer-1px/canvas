import {
  getCanvasContextMenuPosition,
} from '../affordances/controls/context-menu/CanvasContextMenuPosition'

type CanvasAppViewContextMenuEvent = {
  clientX: number
  clientY: number
  preventDefault: () => void
  target: EventTarget
}

export function getCanvasAppViewContextMenuState(
  event: CanvasAppViewContextMenuEvent,
) {
  if (isCanvasAppControlTarget(event.target)) {
    return undefined
  }

  event.preventDefault()
  return getCanvasContextMenuPosition({
    point: { x: event.clientX, y: event.clientY },
    viewportSize: getCanvasAppViewViewportSize(),
  })
}

function getCanvasAppViewViewportSize() {
  const height = globalThis.innerHeight
  const width = globalThis.innerWidth

  return typeof height === 'number' &&
      typeof width === 'number' &&
      Number.isFinite(height) &&
      Number.isFinite(width)
    ? {
      height: Math.max(0, height),
      width: Math.max(0, width),
    }
    : null
}

function isCanvasAppControlTarget(target: EventTarget) {
  return target instanceof Element &&
    target.closest(
      [
        'a',
        'button',
        'input',
        'select',
        'textarea',
        '[role="toolbar"]',
        '.canvas-status',
        '.command-palette',
        '.component-palette',
        '.cursor-chat',
        '.find-replace-panel',
        '.canvas-minimap',
        '.object-inspector',
        '.shortcut-help',
        '.text-editor',
      ].join(','),
    ) !== null
}
