import type { KeyboardEvent } from 'react'
import type { CanvasItem } from '../../../entities'
import {
  getCanvasChecklistItems,
  isCanvasChecklistComponentItem,
  isCanvasChecklistItemChecked,
  replaceCanvasChecklistComponentItemChecked,
  replaceCanvasChecklistComponentItemText,
  replaceCanvasChecklistComponentsWithAddedItem,
  replaceCanvasChecklistComponentsWithoutItem,
} from '../../../host'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../../extensions/inspector-panels'

export const CANVAS_CHECKLIST_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'checklist-actions',
  requiredCapability: 'editDocument',
  isVisible: (context) => getSelectedCanvasChecklistItem(context) !== null,
  render: (context) => {
    const item = getSelectedCanvasChecklistItem(context)

    return item
      ? renderCanvasChecklistInspectorPanelContent({
          disabled: context.disabled,
          items: getCanvasChecklistItems(item),
          isChecked: (index) => isCanvasChecklistItemChecked(item, index),
          onAddItem: () => addCanvasChecklistItem(context),
          onChangeChecked: (index, checked) =>
            changeCanvasChecklistItemChecked(context, index, checked),
          onChangeText: (index, text) =>
            changeCanvasChecklistItemText(context, index, text),
          onRemoveItem: (index) => removeCanvasChecklistItem(context, index),
        })
      : null
  },
}

export function changeCanvasChecklistItemChecked(
  context: CanvasAppInspectorPanelContext,
  index: number,
  checked: boolean,
) {
  if (context.disabled || getSelectedCanvasChecklistItem(context) === null) {
    return false
  }

  return commitCanvasChecklistItems(
    context,
    replaceCanvasChecklistComponentItemChecked(
      context.items ?? context.selectedItems,
      context.selection,
      index,
      checked,
    ),
  )
}

export function changeCanvasChecklistItemText(
  context: CanvasAppInspectorPanelContext,
  index: number,
  text: string,
) {
  if (context.disabled || getSelectedCanvasChecklistItem(context) === null) {
    return false
  }

  return commitCanvasChecklistItems(
    context,
    replaceCanvasChecklistComponentItemText(
      context.items ?? context.selectedItems,
      context.selection,
      index,
      text,
    ),
  )
}

export function addCanvasChecklistItem(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.disabled || getSelectedCanvasChecklistItem(context) === null) {
    return false
  }

  return commitCanvasChecklistItems(
    context,
    replaceCanvasChecklistComponentsWithAddedItem(
      context.items ?? context.selectedItems,
      context.selection,
    ),
  )
}

export function removeCanvasChecklistItem(
  context: CanvasAppInspectorPanelContext,
  index: number,
) {
  if (context.disabled || getSelectedCanvasChecklistItem(context) === null) {
    return false
  }

  return commitCanvasChecklistItems(
    context,
    replaceCanvasChecklistComponentsWithoutItem(
      context.items ?? context.selectedItems,
      context.selection,
      index,
    ),
  )
}

function renderCanvasChecklistInspectorPanelContent({
  disabled,
  items,
  isChecked,
  onAddItem,
  onChangeChecked,
  onChangeText,
  onRemoveItem,
}: {
  disabled: boolean
  items: readonly string[]
  isChecked: (index: number) => boolean
  onAddItem: () => void
  onChangeChecked: (index: number, checked: boolean) => void
  onChangeText: (index: number, text: string) => void
  onRemoveItem: (index: number) => void
}) {
  return (
    <div className="checklist-inspector">
      {items.map((item, index) => (
        <label className="checklist-inspector-row" key={`${index}-${item}`}>
          <input
            type="checkbox"
            aria-label={`Toggle ${item}`}
            checked={isChecked(index)}
            disabled={disabled}
            onChange={(event) =>
              onChangeChecked(index, event.currentTarget.checked)}
          />
          <input
            key={`text-${index}-${item}`}
            type="text"
            aria-label={`Checklist item ${index + 1}`}
            defaultValue={item}
            disabled={disabled}
            maxLength={80}
            onBlur={(event) => onChangeText(index, event.currentTarget.value)}
            onKeyDown={(event) =>
              handleCanvasChecklistItemTextKeyDown(event, item)}
          />
          <button
            type="button"
            className="inspector-action-button"
            aria-label={`Remove ${item}`}
            title="Remove"
            disabled={disabled || items.length <= 1}
            onClick={() => onRemoveItem(index)}
          >
            -
          </button>
        </label>
      ))}
      <button
        type="button"
        className="inspector-action-button"
        disabled={disabled}
        onClick={onAddItem}
      >
        Add
      </button>
    </div>
  )
}

function getSelectedCanvasChecklistItem(
  context: CanvasAppInspectorPanelContext,
) {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems

  return item && isCanvasChecklistComponentItem(item) ? item : null
}

function commitCanvasChecklistItems(
  context: CanvasAppInspectorPanelContext,
  items: CanvasItem[],
) {
  return context.document.commit({
    change: {
      type: 'replace-changed',
      items,
    },
    selection: {
      before: context.selection,
      after: context.selection,
    },
  }).ok
}

function handleCanvasChecklistItemTextKeyDown(
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
