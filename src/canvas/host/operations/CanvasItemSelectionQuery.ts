import type { CanvasItem } from '../model'

// De-facto "select same" affordance (Figma "Select all with same…"): widen the
// current selection to every top-level item that shares a selected item's kind.
// Components are keyed by their concrete component kind so sticky ≠ section.
// Limited to top-level items so the result never fights nested-selection pruning.
function getCanvasItemKind(item: CanvasItem): string {
  return item.type === 'component' ? `component:${item.component}` : item.type
}

export function selectSameTypeCanvasSelection(
  items: CanvasItem[],
  ids: string[],
): string[] {
  const selectedIds = new Set(ids)
  const selectedKinds = new Set(
    items
      .filter((item) => selectedIds.has(item.id))
      .map(getCanvasItemKind),
  )

  if (selectedKinds.size === 0) {
    return ids
  }

  return items
    .filter((item) => selectedKinds.has(getCanvasItemKind(item)))
    .map((item) => item.id)
}

export function canSelectSameTypeCanvasSelection(
  items: CanvasItem[],
  ids: string[],
): boolean {
  if (ids.length === 0) {
    return false
  }

  return selectSameTypeCanvasSelection(items, ids).length > ids.length
}
