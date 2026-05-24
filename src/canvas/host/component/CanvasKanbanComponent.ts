import type {
  CanvasComponentItem,
  CanvasItem,
  GroupItem,
} from '../model'
import { isCanvasGroupItem } from '../tree/CanvasGroupItem'

export const CANVAS_KANBAN_COMPONENT_KIND = 'kanban'

export type CanvasKanbanComponentItem = CanvasComponentItem & {
  component: typeof CANVAS_KANBAN_COMPONENT_KIND
}

export type CanvasKanbanCardMoveDirection = 'down' | 'up'

const CANVAS_KANBAN_DEFAULT_CARD = 'New card'
const CANVAS_KANBAN_MAX_CARDS = 8
const CANVAS_KANBAN_MAX_CARD_LENGTH = 80
const CANVAS_KANBAN_MIN_HEIGHT = 110
const CANVAS_KANBAN_ROW_HEIGHT = 40
const CANVAS_KANBAN_VERTICAL_PADDING = 70

export function isCanvasKanbanComponentItem(
  item: CanvasItem,
): item is CanvasKanbanComponentItem {
  return item.type === 'component' &&
    item.component === CANVAS_KANBAN_COMPONENT_KIND
}

export function getCanvasKanbanCards(
  item: CanvasComponentItem,
): readonly string[] {
  return normalizeCanvasKanbanCards(item.items ?? [])
}

export function replaceCanvasKanbanComponentCardText(
  items: readonly CanvasItem[],
  selection: readonly string[],
  index: number,
  text: string,
): CanvasItem[] {
  return replaceSelectedCanvasKanbanComponents(items, selection, (item) =>
    setCanvasKanbanCardText(item, index, text),
  )
}

export function replaceCanvasKanbanComponentsWithAddedCard(
  items: readonly CanvasItem[],
  selection: readonly string[],
  text: string = CANVAS_KANBAN_DEFAULT_CARD,
): CanvasItem[] {
  return replaceSelectedCanvasKanbanComponents(items, selection, (item) =>
    addCanvasKanbanCard(item, text),
  )
}

export function replaceCanvasKanbanComponentsWithoutCard(
  items: readonly CanvasItem[],
  selection: readonly string[],
  index: number,
): CanvasItem[] {
  return replaceSelectedCanvasKanbanComponents(items, selection, (item) =>
    removeCanvasKanbanCard(item, index),
  )
}

export function replaceCanvasKanbanComponentsWithMovedCard(
  items: readonly CanvasItem[],
  selection: readonly string[],
  index: number,
  direction: CanvasKanbanCardMoveDirection,
): CanvasItem[] {
  return replaceSelectedCanvasKanbanComponents(items, selection, (item) =>
    moveCanvasKanbanCard(item, index, direction),
  )
}

export function setCanvasKanbanCardText(
  item: CanvasKanbanComponentItem,
  index: number,
  text: string,
): CanvasKanbanComponentItem {
  const cards = [...getCanvasKanbanCards(item)]

  if (!isCanvasKanbanCardIndex(index, cards.length)) {
    return item
  }

  cards[index] = normalizeCanvasKanbanCardText(text)

  return syncCanvasKanbanComponent({
    ...item,
    items: cards,
  })
}

export function addCanvasKanbanCard(
  item: CanvasKanbanComponentItem,
  text: string = CANVAS_KANBAN_DEFAULT_CARD,
): CanvasKanbanComponentItem {
  const cards = [...getCanvasKanbanCards(item)]

  if (cards.length >= CANVAS_KANBAN_MAX_CARDS) {
    return item
  }

  return syncCanvasKanbanComponent({
    ...item,
    items: [
      ...cards,
      normalizeCanvasKanbanCardText(text),
    ],
  })
}

export function removeCanvasKanbanCard(
  item: CanvasKanbanComponentItem,
  index: number,
): CanvasKanbanComponentItem {
  const cards = [...getCanvasKanbanCards(item)]

  if (
    cards.length <= 1 ||
    !isCanvasKanbanCardIndex(index, cards.length)
  ) {
    return item
  }

  cards.splice(index, 1)

  return syncCanvasKanbanComponent({
    ...item,
    items: cards,
  })
}

export function moveCanvasKanbanCard(
  item: CanvasKanbanComponentItem,
  index: number,
  direction: CanvasKanbanCardMoveDirection,
): CanvasKanbanComponentItem {
  const cards = [...getCanvasKanbanCards(item)]
  const targetIndex = direction === 'up' ? index - 1 : index + 1

  if (
    !isCanvasKanbanCardIndex(index, cards.length) ||
    !isCanvasKanbanCardIndex(targetIndex, cards.length)
  ) {
    return item
  }

  const [card] = cards.splice(index, 1)
  cards.splice(targetIndex, 0, card)

  return syncCanvasKanbanComponent({
    ...item,
    items: cards,
  })
}

function replaceSelectedCanvasKanbanComponents(
  items: readonly CanvasItem[],
  selection: readonly string[],
  update: (
    item: CanvasKanbanComponentItem,
  ) => CanvasKanbanComponentItem,
): CanvasItem[] {
  const selected = new Set(selection)

  return items.map((item) =>
    replaceCanvasKanbanComponent(item, selected, update),
  )
}

function replaceCanvasKanbanComponent(
  item: CanvasItem,
  selected: Set<string>,
  update: (
    item: CanvasKanbanComponentItem,
  ) => CanvasKanbanComponentItem,
): CanvasItem {
  if (isCanvasKanbanComponentItem(item) && selected.has(item.id)) {
    return update(item)
  }

  if (isCanvasGroupItem(item)) {
    return replaceCanvasKanbanComponentChildren(item, selected, update)
  }

  return item
}

function replaceCanvasKanbanComponentChildren(
  item: GroupItem,
  selected: Set<string>,
  update: (
    item: CanvasKanbanComponentItem,
  ) => CanvasKanbanComponentItem,
): GroupItem {
  const nextChildren = item.children.map((child) =>
    replaceCanvasKanbanComponent(child, selected, update),
  )

  return nextChildren.every((child, index) => child === item.children[index])
    ? item
    : { ...item, children: nextChildren }
}

function syncCanvasKanbanComponent(
  item: CanvasKanbanComponentItem,
): CanvasKanbanComponentItem {
  const cards = normalizeCanvasKanbanCards(item.items ?? [])

  return {
    ...item,
    h: Math.max(
      item.h,
      CANVAS_KANBAN_MIN_HEIGHT,
      CANVAS_KANBAN_VERTICAL_PADDING + cards.length * CANVAS_KANBAN_ROW_HEIGHT,
    ),
    items: cards,
  }
}

function normalizeCanvasKanbanCards(items: readonly string[]) {
  const normalized = items
    .map(normalizeCanvasKanbanCardText)
    .slice(0, CANVAS_KANBAN_MAX_CARDS)

  return normalized.length > 0 ? normalized : [CANVAS_KANBAN_DEFAULT_CARD]
}

function normalizeCanvasKanbanCardText(text: string) {
  const trimmed = text.trim().slice(0, CANVAS_KANBAN_MAX_CARD_LENGTH)

  return trimmed || CANVAS_KANBAN_DEFAULT_CARD
}

function isCanvasKanbanCardIndex(index: unknown, cardCount: number) {
  return typeof index === 'number' &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < cardCount
}
