import { unique } from '../../engine/primitives/CanvasPrimitives'
import type { CanvasItem } from '../model'
import {
  flattenCanvasItems,
  pruneNestedSelection,
  syncCanvasItems,
  syncGroupBounds,
} from '../tree/CanvasTree'
import {
  replaceCanvasChildrenAtPath,
  sameCanvasPath,
} from './CanvasItemOperationTree'

export function groupCanvasSelection(
  items: CanvasItem[],
  ids: string[],
  groupId: string,
) {
  const selectedIds = pruneNestedSelection(items, ids)

  if (selectedIds.length < 2) {
    return { items, selection: ids }
  }

  const selected = new Set(selectedIds)
  const entries = flattenCanvasItems(items).filter((entry) =>
    selected.has(entry.item.id),
  )
  const parentPath = entries[0]?.parentPath

  if (
    !parentPath ||
    !entries.every((entry) => sameCanvasPath(entry.parentPath, parentPath))
  ) {
    return { items, selection: ids }
  }

  const minIndex = Math.min(...entries.map((entry) => entry.index))
  const nextItems = replaceCanvasChildrenAtPath(items, parentPath, (children) => {
    const grouped = children.filter((child) => selected.has(child.id))
    const rest = children.filter((child) => !selected.has(child.id))
    const insertIndex = children
      .slice(0, minIndex)
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
  })

  return { items: syncCanvasItems(nextItems), selection: [groupId] }
}

export function ungroupCanvasSelection(items: CanvasItem[], ids: string[]) {
  const selected = new Set(ids)
  const nextSelection: string[] = []

  function visit(nodes: CanvasItem[]): CanvasItem[] {
    return nodes.flatMap((item): CanvasItem[] => {
      if (item.type === 'group' && selected.has(item.id)) {
        nextSelection.push(...item.children.map((child) => child.id))
        return item.children
      }

      if (item.type !== 'group') {
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
