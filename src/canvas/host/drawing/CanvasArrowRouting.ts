import type {
  ArrowItem,
  CanvasArrowRouting,
  CanvasItem,
  GroupItem,
} from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'

export function isCanvasArrowRouting(
  value: unknown,
): value is CanvasArrowRouting {
  return value === 'elbow' || value === 'straight'
}

export function normalizeCanvasArrowRouting(
  value: unknown,
): CanvasArrowRouting {
  return value === 'straight' ? 'straight' : 'elbow'
}

export function setCanvasArrowRouting(
  item: ArrowItem,
  routing: CanvasArrowRouting,
): ArrowItem {
  return {
    ...item,
    routing,
  }
}

export function replaceCanvasArrowRoutings(
  items: readonly CanvasItem[],
  selection: readonly string[],
  routing: CanvasArrowRouting,
): CanvasItem[] {
  const selected = new Set(selection)

  return items.map((item) =>
    replaceCanvasArrowItemRouting(item, selected, routing),
  )
}

function replaceCanvasArrowItemRouting(
  item: CanvasItem,
  selected: Set<string>,
  routing: CanvasArrowRouting,
): CanvasItem {
  if (item.type === 'arrow' && selected.has(item.id)) {
    return setCanvasArrowRouting(item, routing)
  }

  if (isCanvasGroupItem(item)) {
    return replaceCanvasArrowChildrenRouting(item, selected, routing)
  }

  return item
}

function replaceCanvasArrowChildrenRouting(
  item: GroupItem,
  selected: Set<string>,
  routing: CanvasArrowRouting,
): GroupItem {
  const nextChildren = item.children.map((child) =>
    replaceCanvasArrowItemRouting(child, selected, routing),
  )

  return nextChildren.every((child, index) => child === item.children[index])
    ? item
    : { ...item, children: nextChildren }
}
