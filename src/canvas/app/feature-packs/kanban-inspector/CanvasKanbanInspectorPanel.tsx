import type { KeyboardEvent } from 'react'
import type { CanvasItem } from '../../../entities'
import {
  getCanvasKanbanCards,
  isCanvasKanbanComponentItem,
  replaceCanvasKanbanComponentCardText,
  replaceCanvasKanbanComponentsWithAddedCard,
  replaceCanvasKanbanComponentsWithMovedCard,
  replaceCanvasKanbanComponentsWithoutCard,
  type CanvasKanbanCardMoveDirection,
} from '../../../host'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../../extensions/inspector-panels'

export const CANVAS_KANBAN_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'kanban-actions',
  isVisible: (context) => getSelectedCanvasKanbanItem(context) !== null,
  render: (context) => {
    const item = getSelectedCanvasKanbanItem(context)

    return item
      ? renderCanvasKanbanInspectorPanelContent({
          cards: getCanvasKanbanCards(item),
          disabled: context.disabled,
          onAddCard: () => addCanvasKanbanCard(context),
          onChangeText: (index, text) =>
            changeCanvasKanbanCardText(context, index, text),
          onMoveCard: (index, direction) =>
            moveCanvasKanbanCard(context, index, direction),
          onRemoveCard: (index) => removeCanvasKanbanCard(context, index),
        })
      : null
  },
}

export function changeCanvasKanbanCardText(
  context: CanvasAppInspectorPanelContext,
  index: number,
  text: string,
) {
  if (context.disabled || getSelectedCanvasKanbanItem(context) === null) {
    return false
  }

  return commitCanvasKanbanItems(
    context,
    replaceCanvasKanbanComponentCardText(
      context.items ?? context.selectedItems,
      context.selection,
      index,
      text,
    ),
  )
}

export function addCanvasKanbanCard(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.disabled || getSelectedCanvasKanbanItem(context) === null) {
    return false
  }

  return commitCanvasKanbanItems(
    context,
    replaceCanvasKanbanComponentsWithAddedCard(
      context.items ?? context.selectedItems,
      context.selection,
    ),
  )
}

export function removeCanvasKanbanCard(
  context: CanvasAppInspectorPanelContext,
  index: number,
) {
  if (context.disabled || getSelectedCanvasKanbanItem(context) === null) {
    return false
  }

  return commitCanvasKanbanItems(
    context,
    replaceCanvasKanbanComponentsWithoutCard(
      context.items ?? context.selectedItems,
      context.selection,
      index,
    ),
  )
}

export function moveCanvasKanbanCard(
  context: CanvasAppInspectorPanelContext,
  index: number,
  direction: CanvasKanbanCardMoveDirection,
) {
  if (context.disabled || getSelectedCanvasKanbanItem(context) === null) {
    return false
  }

  return commitCanvasKanbanItems(
    context,
    replaceCanvasKanbanComponentsWithMovedCard(
      context.items ?? context.selectedItems,
      context.selection,
      index,
      direction,
    ),
  )
}

function renderCanvasKanbanInspectorPanelContent({
  cards,
  disabled,
  onAddCard,
  onChangeText,
  onMoveCard,
  onRemoveCard,
}: {
  cards: readonly string[]
  disabled: boolean
  onAddCard: () => void
  onChangeText: (index: number, text: string) => void
  onMoveCard: (
    index: number,
    direction: CanvasKanbanCardMoveDirection,
  ) => void
  onRemoveCard: (index: number) => void
}) {
  return (
    <div className="kanban-inspector">
      {cards.map((card, index) => (
        <label className="kanban-inspector-row" key={`${index}-${card}`}>
          <input
            key={`text-${index}-${card}`}
            type="text"
            aria-label={`Queue card ${index + 1}`}
            defaultValue={card}
            disabled={disabled}
            maxLength={80}
            onBlur={(event) => onChangeText(index, event.currentTarget.value)}
            onKeyDown={(event) =>
              handleCanvasKanbanCardTextKeyDown(event, card)}
          />
          <button
            type="button"
            className="inspector-action-button"
            aria-label={`Move ${card} up`}
            title="Move up"
            disabled={disabled || index === 0}
            onClick={() => onMoveCard(index, 'up')}
          >
            ^
          </button>
          <button
            type="button"
            className="inspector-action-button"
            aria-label={`Move ${card} down`}
            title="Move down"
            disabled={disabled || index === cards.length - 1}
            onClick={() => onMoveCard(index, 'down')}
          >
            v
          </button>
          <button
            type="button"
            className="inspector-action-button"
            aria-label={`Remove ${card}`}
            title="Remove"
            disabled={disabled || cards.length <= 1}
            onClick={() => onRemoveCard(index)}
          >
            -
          </button>
        </label>
      ))}
      <button
        type="button"
        className="inspector-action-button"
        disabled={disabled}
        onClick={onAddCard}
      >
        Add
      </button>
    </div>
  )
}

function getSelectedCanvasKanbanItem(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems

  return item && isCanvasKanbanComponentItem(item) ? item : null
}

function commitCanvasKanbanItems(
  context: CanvasAppInspectorPanelContext,
  items: CanvasItem[],
) {
  return context.commitItemsChange({
    type: 'replace-changed',
    items,
  }, {
    before: context.selection,
    after: context.selection,
  })
}

function handleCanvasKanbanCardTextKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  value: string,
) {
  if (event.key === 'Enter') {
    event.currentTarget.blur()
    return
  }

  if (event.key === 'Escape') {
    event.currentTarget.value = value
    event.currentTarget.blur()
  }
}
