import type { CanvasItem } from '../model/CanvasModel'
import { mapCanvasItems } from './CanvasItemOperationTree'

export function updateTextItem(
  items: CanvasItem[],
  id: string,
  text: string,
) {
  return mapCanvasItems(items, (item) =>
    item.id === id && item.type === 'text' ? { ...item, text } : item,
  )
}

export function updateItemText(
  items: CanvasItem[],
  id: string,
  text: string,
) {
  return mapCanvasItems(items, (item) =>
    item.id === id && (item.type === 'rect' || item.type === 'text')
      ? { ...item, text }
      : item,
  )
}
