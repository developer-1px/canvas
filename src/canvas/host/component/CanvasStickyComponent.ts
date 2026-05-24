import type {
  CanvasComponentItem,
  CanvasItem,
} from '../model'

export const CANVAS_STICKY_COMPONENT_KIND = 'sticky'

export function isCanvasStickyComponentItem(
  item: CanvasItem,
): item is CanvasComponentItem {
  return item.type === 'component' &&
    item.component === CANVAS_STICKY_COMPONENT_KIND
}

export function applyCanvasStickyComponentCreationDefaults(
  item: CanvasComponentItem,
): CanvasComponentItem {
  return { ...item, body: '' }
}
