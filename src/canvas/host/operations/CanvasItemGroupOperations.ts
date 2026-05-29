import { planSurfaceGrouping } from '@interactive-os/object-surface'
import { unique } from '../../core'
import type { CanvasItem } from '../model'
import {
  syncCanvasItems,
  syncGroupBounds,
} from '../tree/CanvasTree'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'
import {
  replaceCanvasChildrenAtPath,
} from './CanvasItemOperationTree'
import { CANVAS_OBJECT_SURFACE_ADAPTER } from '../surface/CanvasObjectSurfaceAdapter'

export function groupCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  groupId: string,
) {
  const groupPlan = planSurfaceGrouping({
    adapter: CANVAS_OBJECT_SURFACE_ADAPTER,
    items,
    selection: ids,
  })

  if (!groupPlan.ok) {
    return { items, selection: ids }
  }

  const selected = new Set(groupPlan.ids)
  const nextItems = replaceCanvasChildrenAtPath(
    items,
    [...groupPlan.parentPath],
    (children) => {
      const grouped = children.filter((child) => selected.has(child.id))
      const rest = children.filter((child) => !selected.has(child.id))
      const insertIndex = children
        .slice(0, groupPlan.insertIndex)
        .filter((child) => !selected.has(child.id)).length
      const group = syncGroupBounds({
        id: groupId,
        type: 'group',
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        children: grouped,
      })

      return [...rest.slice(0, insertIndex), group, ...rest.slice(insertIndex)]
    },
  )

  return { items: syncCanvasItems(nextItems), selection: [groupId] }
}

export function ungroupCanvasSelection(items: CanvasItem[], ids: string[]) {
  const selected = new Set(ids)
  const nextSelection: string[] = []

  function visit(nodes: CanvasItem[]): CanvasItem[] {
    return nodes.flatMap((item): CanvasItem[] => {
      if (isCanvasGroupItem(item) && selected.has(item.id)) {
        nextSelection.push(...item.children.map((child) => child.id))
        return item.children
      }

      if (!isCanvasGroupItem(item)) {
        return [item]
      }

      const children = visit(item.children)

      return children.length > 0
        ? [syncGroupBounds({ ...item, children })]
        : []
    })
  }

  const nextItems = syncCanvasItems(visit(items))
  return {
    items: nextItems,
    selection: unique(nextSelection),
  }
}
