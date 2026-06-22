import type {
  Bounds,
  CanvasItem,
} from '../../entities'
import {
  isCanvasGroupItem,
  isCanvasSectionComponentItem,
} from '../../host'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'

export type CanvasAppSelectionSectionItemEntry = {
  item: CanvasItem
  path: number[]
}

export type CanvasAppSelectionSectionState = {
  contentIds: string[]
  itemById: Map<string, CanvasItem>
  sections: CanvasItem[]
}

export function getSelectedCanvasAppSectionState({
  itemReadModel,
  items,
  selectedItems,
}: {
  itemReadModel: CanvasAppItemReadModel
  items: CanvasItem[]
  selectedItems: CanvasItem[]
}): CanvasAppSelectionSectionState {
  const sections = selectedItems.filter(isCanvasSectionComponentItem)
  const selectedSectionIds = new Set(sections.map((item) => item.id))
  const sectionBounds = sections.map((item) => itemReadModel.getItemBounds(item))
  const entries = flattenCanvasAppSectionItems(items)
  const contentIds = getTopLevelContainedCanvasAppItemIds({
    entries,
    itemReadModel,
    sectionBounds,
    selectedSectionIds,
  })
  const itemById = new Map(entries.map((entry) => [entry.item.id, entry.item]))

  return {
    contentIds,
    itemById,
    sections,
  }
}

export function createCanvasAppSectionItem({
  bounds,
  id,
}: {
  bounds: Bounds
  id: string
}): Extract<CanvasItem, { type: 'component' }> {
  const horizontalPadding = 34
  const topPadding = 56
  const bottomPadding = 30
  const w = Math.max(260, bounds.w + horizontalPadding * 2)
  const h = Math.max(180, bounds.h + topPadding + bottomPadding)

  return {
    accent: '#64748b',
    body: '',
    component: 'section',
    fill: 'rgba(241, 245, 249, 0.18)',
    h,
    id,
    stroke: '#94a3b8',
    title: 'Section',
    type: 'component',
    w,
    x: bounds.x + bounds.w / 2 - w / 2,
    y: bounds.y - topPadding,
  }
}

export function flattenCanvasAppSectionItems(items: CanvasItem[]) {
  const entries: CanvasAppSelectionSectionItemEntry[] = []

  function visit(nodes: CanvasItem[], parentPath: number[]) {
    nodes.forEach((item, index) => {
      const path = [...parentPath, index]
      entries.push({ item, path })

      if (isCanvasGroupItem(item)) {
        visit(item.children, path)
      }
    })
  }

  visit(items, [])
  return entries
}

export function getTopLevelContainedCanvasAppItemIds({
  entries,
  itemReadModel,
  sectionBounds,
  selectedSectionIds,
}: {
  entries: CanvasAppSelectionSectionItemEntry[]
  itemReadModel: CanvasAppItemReadModel
  sectionBounds: Bounds[]
  selectedSectionIds: ReadonlySet<string>
}) {
  const contained = entries.filter((entry) =>
    !selectedSectionIds.has(entry.item.id) &&
    isBoundsContainedByAnySection(
      itemReadModel.getItemBounds(entry.item),
      sectionBounds,
    ),
  )
  const containedPaths = contained.map((entry) => entry.path)

  return contained
    .filter((entry) =>
      !containedPaths.some((path) => isAncestorPath(path, entry.path)),
    )
    .map((entry) => entry.item.id)
}

function isBoundsContainedByAnySection(
  bounds: Bounds,
  sectionBounds: readonly Bounds[],
) {
  return sectionBounds.some((section) =>
    bounds.x >= section.x &&
    bounds.y >= section.y &&
    bounds.x + bounds.w <= section.x + section.w &&
    bounds.y + bounds.h <= section.y + section.h,
  )
}

function isAncestorPath(candidate: readonly number[], path: readonly number[]) {
  return candidate.length < path.length &&
    candidate.every((segment, index) => path[index] === segment)
}
