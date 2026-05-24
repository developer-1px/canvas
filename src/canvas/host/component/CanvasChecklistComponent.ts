import type {
  CanvasComponentItem,
  CanvasItem,
  GroupItem,
} from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'

export const CANVAS_CHECKLIST_COMPONENT_KIND = 'checklist'

export type CanvasChecklistComponentItem = CanvasComponentItem & {
  component: typeof CANVAS_CHECKLIST_COMPONENT_KIND
}

const CANVAS_CHECKLIST_DEFAULT_ITEM = 'New item'
const CANVAS_CHECKLIST_MAX_ITEMS = 8
const CANVAS_CHECKLIST_MAX_ITEM_LENGTH = 80
const CANVAS_CHECKLIST_MIN_HEIGHT = 100
const CANVAS_CHECKLIST_ROW_HEIGHT = 28
const CANVAS_CHECKLIST_VERTICAL_PADDING = 72

export function isCanvasChecklistComponentItem(
  item: CanvasItem,
): item is CanvasChecklistComponentItem {
  return item.type === 'component' &&
    item.component === CANVAS_CHECKLIST_COMPONENT_KIND
}

export function getCanvasChecklistItems(
  item: CanvasComponentItem,
): readonly string[] {
  return normalizeCanvasChecklistItems(item.items ?? [])
}

export function getCanvasChecklistCheckedItems(
  item: CanvasComponentItem,
): readonly number[] {
  const items = getCanvasChecklistItems(item)

  return normalizeCanvasChecklistCheckedItems(item.checkedItems, items.length)
}

export function isCanvasChecklistItemChecked(
  item: CanvasComponentItem,
  index: number,
) {
  return getCanvasChecklistCheckedItems(item).includes(index)
}

export function replaceCanvasChecklistComponentItemText(
  items: readonly CanvasItem[],
  selection: readonly string[],
  index: number,
  text: string,
): CanvasItem[] {
  return replaceSelectedCanvasChecklistComponents(items, selection, (item) =>
    setCanvasChecklistItemText(item, index, text),
  )
}

export function replaceCanvasChecklistComponentItemChecked(
  items: readonly CanvasItem[],
  selection: readonly string[],
  index: number,
  checked: boolean,
): CanvasItem[] {
  return replaceSelectedCanvasChecklistComponents(items, selection, (item) =>
    setCanvasChecklistItemChecked(item, index, checked),
  )
}

export function replaceCanvasChecklistComponentsWithAddedItem(
  items: readonly CanvasItem[],
  selection: readonly string[],
  text: string = CANVAS_CHECKLIST_DEFAULT_ITEM,
): CanvasItem[] {
  return replaceSelectedCanvasChecklistComponents(items, selection, (item) =>
    addCanvasChecklistItem(item, text),
  )
}

export function replaceCanvasChecklistComponentsWithoutItem(
  items: readonly CanvasItem[],
  selection: readonly string[],
  index: number,
): CanvasItem[] {
  return replaceSelectedCanvasChecklistComponents(items, selection, (item) =>
    removeCanvasChecklistItem(item, index),
  )
}

export function setCanvasChecklistItemText(
  item: CanvasChecklistComponentItem,
  index: number,
  text: string,
): CanvasChecklistComponentItem {
  const checklistItems = [...getCanvasChecklistItems(item)]

  if (!isCanvasChecklistItemIndex(index, checklistItems.length)) {
    return item
  }

  checklistItems[index] = normalizeCanvasChecklistItemText(text)

  return syncCanvasChecklistComponent({
    ...item,
    items: checklistItems,
  })
}

export function setCanvasChecklistItemChecked(
  item: CanvasChecklistComponentItem,
  index: number,
  checked: boolean,
): CanvasChecklistComponentItem {
  const checklistItems = getCanvasChecklistItems(item)

  if (!isCanvasChecklistItemIndex(index, checklistItems.length)) {
    return item
  }

  const checkedItems = new Set(getCanvasChecklistCheckedItems(item))

  if (checked) {
    checkedItems.add(index)
  } else {
    checkedItems.delete(index)
  }

  return syncCanvasChecklistComponent({
    ...item,
    checkedItems: [...checkedItems],
    items: [...checklistItems],
  })
}

export function addCanvasChecklistItem(
  item: CanvasChecklistComponentItem,
  text: string = CANVAS_CHECKLIST_DEFAULT_ITEM,
): CanvasChecklistComponentItem {
  const checklistItems = [...getCanvasChecklistItems(item)]

  if (checklistItems.length >= CANVAS_CHECKLIST_MAX_ITEMS) {
    return item
  }

  return syncCanvasChecklistComponent({
    ...item,
    items: [
      ...checklistItems,
      normalizeCanvasChecklistItemText(text),
    ],
  })
}

export function removeCanvasChecklistItem(
  item: CanvasChecklistComponentItem,
  index: number,
): CanvasChecklistComponentItem {
  const checklistItems = [...getCanvasChecklistItems(item)]

  if (
    checklistItems.length <= 1 ||
    !isCanvasChecklistItemIndex(index, checklistItems.length)
  ) {
    return item
  }

  checklistItems.splice(index, 1)

  return syncCanvasChecklistComponent({
    ...item,
    checkedItems: getCanvasChecklistCheckedItems(item).flatMap((checkedIndex) => {
      if (checkedIndex === index) {
        return []
      }

      return [checkedIndex > index ? checkedIndex - 1 : checkedIndex]
    }),
    items: checklistItems,
  })
}

function replaceSelectedCanvasChecklistComponents(
  items: readonly CanvasItem[],
  selection: readonly string[],
  update: (
    item: CanvasChecklistComponentItem,
  ) => CanvasChecklistComponentItem,
): CanvasItem[] {
  const selected = new Set(selection)

  return items.map((item) =>
    replaceCanvasChecklistComponent(item, selected, update),
  )
}

function replaceCanvasChecklistComponent(
  item: CanvasItem,
  selected: Set<string>,
  update: (
    item: CanvasChecklistComponentItem,
  ) => CanvasChecklistComponentItem,
): CanvasItem {
  if (isCanvasChecklistComponentItem(item) && selected.has(item.id)) {
    return update(item)
  }

  if (isCanvasGroupItem(item)) {
    return replaceCanvasChecklistComponentChildren(item, selected, update)
  }

  return item
}

function replaceCanvasChecklistComponentChildren(
  item: GroupItem,
  selected: Set<string>,
  update: (
    item: CanvasChecklistComponentItem,
  ) => CanvasChecklistComponentItem,
): GroupItem {
  const nextChildren = item.children.map((child) =>
    replaceCanvasChecklistComponent(child, selected, update),
  )

  return nextChildren.every((child, index) => child === item.children[index])
    ? item
    : { ...item, children: nextChildren }
}

function syncCanvasChecklistComponent(
  item: CanvasChecklistComponentItem,
): CanvasChecklistComponentItem {
  const checklistItems = normalizeCanvasChecklistItems(item.items ?? [])
  const checkedItems = normalizeCanvasChecklistCheckedItems(
    item.checkedItems,
    checklistItems.length,
  )

  return {
    ...item,
    checkedItems,
    h: Math.max(
      item.h,
      CANVAS_CHECKLIST_MIN_HEIGHT,
      CANVAS_CHECKLIST_VERTICAL_PADDING +
        checklistItems.length * CANVAS_CHECKLIST_ROW_HEIGHT,
    ),
    items: checklistItems,
  }
}

function normalizeCanvasChecklistItems(items: readonly string[]) {
  const normalized = items
    .map(normalizeCanvasChecklistItemText)
    .slice(0, CANVAS_CHECKLIST_MAX_ITEMS)

  return normalized.length > 0 ? normalized : [CANVAS_CHECKLIST_DEFAULT_ITEM]
}

function normalizeCanvasChecklistItemText(text: string) {
  const trimmed = text.trim().slice(0, CANVAS_CHECKLIST_MAX_ITEM_LENGTH)

  return trimmed || CANVAS_CHECKLIST_DEFAULT_ITEM
}

function normalizeCanvasChecklistCheckedItems(
  checkedItems: unknown,
  itemCount: number,
) {
  if (!Array.isArray(checkedItems)) {
    return []
  }

  return Array.from(new Set(
    checkedItems.filter((index): index is number =>
      isCanvasChecklistItemIndex(index, itemCount),
    ),
  )).sort((left, right) => left - right)
}

function isCanvasChecklistItemIndex(index: unknown, itemCount: number) {
  return typeof index === 'number' &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < itemCount
}
