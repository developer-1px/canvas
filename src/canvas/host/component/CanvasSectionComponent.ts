import type { Bounds } from '../../core'
import type {
  CanvasComponentItem,
  CanvasItem,
} from '../model'

export const CANVAS_SECTION_COMPONENT_KIND = 'section'

export const CANVAS_SECTION_DEFAULT_SIZE: Pick<Bounds, 'h' | 'w'> =
  Object.freeze({
    h: 340,
    w: 340,
  })

export function isCanvasSectionComponentItem(
  item: CanvasItem,
): item is CanvasComponentItem {
  return item.type === 'component' &&
    item.component === CANVAS_SECTION_COMPONENT_KIND
}
