import { unique } from '../../engine/primitives/CanvasPrimitives'
import type { CanvasItem } from '../model/CanvasModel'
import { getItemsBounds } from './CanvasTreeBounds'
import { isAncestorPath, samePath } from './CanvasTreePath'
import { flattenCanvasItems } from './CanvasTreeTraversal'

export function findSelectedAncestorId(
  items: CanvasItem[],
  id: string,
  selectedIds: string[],
) {
  const entries = flattenCanvasItems(items)
  const entry = entries.find((candidate) => candidate.item.id === id)
  const selected = new Set(selectedIds)

  if (!entry) {
    return null
  }

  const ancestors = entries
    .filter(
      (candidate) =>
        selected.has(candidate.item.id) &&
        (samePath(candidate.path, entry.path) ||
          isAncestorPath(candidate.path, entry.path)),
    )
    .sort((a, b) => a.path.length - b.path.length)

  return ancestors[0]?.item.id ?? null
}

export function unionBounds(items: CanvasItem[], selected: Set<string>) {
  return getItemsBounds(
    flattenCanvasItems(items)
      .filter((entry) => selected.has(entry.item.id))
      .map((entry) => entry.item),
  )
}

export function pruneNestedSelection(items: CanvasItem[], ids: string[]) {
  const entries = flattenCanvasItems(items)
  const byId = new Map(entries.map((entry) => [entry.item.id, entry]))
  const selected = new Set(ids)

  return unique(ids).filter((id) => {
    const entry = byId.get(id)

    if (!entry) {
      return false
    }

    return !entries.some(
      (candidate) =>
        candidate.item.type === 'group' &&
        selected.has(candidate.item.id) &&
        isAncestorPath(candidate.path, entry.path),
    )
  })
}
