import type { ObjectSurfaceAdapter } from '@interactive-os/object-surface'
import type { CanvasItem } from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'

export const CANVAS_OBJECT_SURFACE_ADAPTER: ObjectSurfaceAdapter<CanvasItem> = {
  getBounds: (item) => ({
    height: item.h,
    width: item.w,
    x: item.x,
    y: item.y,
  }),
  getChildren: (item) => (isCanvasGroupItem(item) ? item.children : []),
  getId: (item) => item.id,
  isGroup: isCanvasGroupItem,
  isLocked: (item) => item.locked === true,
}
