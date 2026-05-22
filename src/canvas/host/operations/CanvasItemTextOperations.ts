import type { CanvasItem } from '../CanvasModel'
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
