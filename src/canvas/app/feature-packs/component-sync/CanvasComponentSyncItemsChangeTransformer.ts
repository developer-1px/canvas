import type { CanvasItem } from '../../../entities'
import {
  getCanvasEditableTextPatchUpdates,
  isCanvasEditableTextItem,
  isCanvasGroupItem,
} from '../../../host'
import type {
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'
import type {
  CanvasAppItemsChangeTransformContext,
  CanvasAppItemsChangeTransformer,
} from '../../extensions/items-change-transformers'

export const CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER:
  CanvasAppItemsChangeTransformer = {
    id: 'component-sync-items-change',
    transform: syncCanvasComponentItemsChange,
  }

export function syncCanvasComponentItemsChange({
  change,
  componentDefinitionRegistry,
  currentItems,
}: CanvasAppItemsChangeTransformContext): CanvasAppItemsChange {
  if (change.type === 'replace-changed') {
    return syncCanvasComponentReplaceChangedItems({
      change,
      currentItems,
      getSyncItemIds: componentDefinitionRegistry.getSyncItemIds,
    })
  }

  if (change.type === 'set-text') {
    return syncCanvasComponentSetTextItems({
      change,
      currentItems,
      getSyncItemIds: componentDefinitionRegistry.getSyncItemIds,
    })
  }

  return change
}

function syncCanvasComponentReplaceChangedItems({
  change,
  currentItems,
  getSyncItemIds,
}: {
  change: Extract<CanvasAppItemsChange, { type: 'replace-changed' }>
  currentItems: readonly CanvasItem[]
  getSyncItemIds: (itemId: string) => readonly string[]
}): CanvasAppItemsChange {
  const currentById = getCanvasComponentSyncItemMap(currentItems)
  const changedById = getCanvasComponentSyncItemMap(change.items)
  const nextById = new Map<string, CanvasItem>()

  for (const changedItem of changedById.values()) {
    const sourceBefore = currentById.get(changedItem.id)

    if (!sourceBefore || sourceBefore.type !== changedItem.type) {
      continue
    }

    nextById.set(changedItem.id, changedItem)

    for (const syncItemId of getSyncItemIds(changedItem.id)) {
      if (syncItemId === changedItem.id) {
        continue
      }

      const targetItem = currentById.get(syncItemId)

      if (!targetItem || targetItem.type !== changedItem.type) {
        continue
      }

      nextById.set(syncItemId, syncCanvasComponentItemState({
        sourceAfter: changedItem,
        targetItem,
      }))
    }
  }

  return nextById.size === changedById.size
    ? change
    : {
        type: 'replace-changed',
        items: replaceCanvasComponentSyncItems(currentItems, nextById),
      }
}

function syncCanvasComponentSetTextItems({
  change,
  currentItems,
  getSyncItemIds,
}: {
  change: Extract<CanvasAppItemsChange, { type: 'set-text' }>
  currentItems: readonly CanvasItem[]
  getSyncItemIds: (itemId: string) => readonly string[]
}): CanvasAppItemsChange {
  const currentById = getCanvasComponentSyncItemMap(currentItems)
  const nextById = new Map<string, CanvasItem>()

  for (const syncItemId of getSyncItemIds(change.id)) {
    const item = currentById.get(syncItemId)

    if (!item || !isCanvasEditableTextItem(item)) {
      continue
    }

    nextById.set(
      syncItemId,
      applyCanvasComponentSyncText(item, change.text),
    )
  }

  return nextById.size <= 1
    ? change
    : {
        type: 'replace-changed',
        items: replaceCanvasComponentSyncItems(currentItems, nextById),
      }
}

function syncCanvasComponentItemState({
  sourceAfter,
  targetItem,
}: {
  sourceAfter: CanvasItem
  targetItem: CanvasItem
}): CanvasItem {
  const nextItem = {
    ...targetItem,
    ...sourceAfter,
    id: targetItem.id,
    x: targetItem.x,
    y: targetItem.y,
  } as CanvasItem

  if ('children' in targetItem) {
    return {
      ...nextItem,
      children: targetItem.children,
    } as CanvasItem
  }

  return nextItem
}

function applyCanvasComponentSyncText(
  item: CanvasItem,
  text: string,
): CanvasItem {
  if (!isCanvasEditableTextItem(item)) {
    return item
  }

  return getCanvasEditableTextPatchUpdates(item, text)
    .reduce((nextItem, update) => ({
      ...nextItem,
      [update.field]: update.value,
    }), item) as CanvasItem
}

function getCanvasComponentSyncItemMap(
  items: readonly CanvasItem[],
): Map<string, CanvasItem> {
  const itemMap = new Map<string, CanvasItem>()

  collectCanvasComponentSyncItems(items, itemMap)
  return itemMap
}

function collectCanvasComponentSyncItems(
  items: readonly CanvasItem[],
  itemMap: Map<string, CanvasItem>,
) {
  for (const item of items) {
    itemMap.set(item.id, item)

    if (isCanvasGroupItem(item)) {
      collectCanvasComponentSyncItems(item.children, itemMap)
    }
  }
}

function replaceCanvasComponentSyncItems(
  items: readonly CanvasItem[],
  nextById: ReadonlyMap<string, CanvasItem>,
): CanvasItem[] {
  return items.map((item) => {
    const nextChildren = isCanvasGroupItem(item)
      ? replaceCanvasComponentSyncItems(item.children, nextById)
      : null
    const nextItem = nextById.get(item.id)

    if (nextItem) {
      return nextChildren
        ? {
            ...nextItem,
            children: nextChildren,
          } as CanvasItem
        : nextItem
    }

    return nextChildren
      ? {
          ...item,
          children: nextChildren,
        } as CanvasItem
      : item
  })
}
