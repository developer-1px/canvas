import type { Bounds } from './CanvasModel'

export type CanvasSceneEntry = {
  bounds: Bounds
  id: string
  isGroup: boolean
  parentId: string | null
  path: number[]
}

export type CanvasSceneAdapter = {
  entries: CanvasSceneEntry[]
  getBounds: (ids: string[]) => Bounds | null
  getParentId: (id: string) => string | null
  getSelectedAncestorId: (id: string, selectedIds: string[]) => string | null
  isGroup: (id: string) => boolean
}

export function createCanvasSceneAdapter(
  entries: CanvasSceneEntry[],
): CanvasSceneAdapter {
  const entryById = new Map(entries.map((entry) => [entry.id, entry]))

  return {
    entries,
    getBounds: (ids) => getSceneEntriesBounds(entries, new Set(ids)),
    getParentId: (id) => entryById.get(id)?.parentId ?? null,
    getSelectedAncestorId: (id, selectedIds) => {
      const entry = entryById.get(id)
      const selected = new Set(selectedIds)

      if (!entry) {
        return null
      }

      return (
        entries
          .filter(
            (candidate) =>
              selected.has(candidate.id) &&
              (samePath(candidate.path, entry.path) ||
                isAncestorPath(candidate.path, entry.path)),
          )
          .sort((a, b) => a.path.length - b.path.length)[0]?.id ?? null
      )
    },
    isGroup: (id) => entryById.get(id)?.isGroup ?? false,
  }
}

function getSceneEntriesBounds(
  entries: CanvasSceneEntry[],
  selectedIds: Set<string>,
) {
  const selectedEntries = entries.filter((entry) => selectedIds.has(entry.id))

  if (selectedEntries.length === 0) {
    return null
  }

  const first = selectedEntries[0].bounds
  let minX = first.x
  let minY = first.y
  let maxX = first.x + first.w
  let maxY = first.y + first.h

  for (const entry of selectedEntries.slice(1)) {
    minX = Math.min(minX, entry.bounds.x)
    minY = Math.min(minY, entry.bounds.y)
    maxX = Math.max(maxX, entry.bounds.x + entry.bounds.w)
    maxY = Math.max(maxY, entry.bounds.y + entry.bounds.h)
  }

  return {
    x: minX,
    y: minY,
    w: maxX - minX,
    h: maxY - minY,
  }
}

function isAncestorPath(parent: number[], child: number[]) {
  return (
    parent.length < child.length &&
    parent.every((segment, index) => segment === child[index])
  )
}

function samePath(a: number[], b: number[]) {
  return a.length === b.length && a.every((segment, index) => segment === b[index])
}
