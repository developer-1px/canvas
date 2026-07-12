import type {
  CanvasCommentThreadMessage,
  CanvasItem,
} from '../../../../entities'
import {
  getCanvasCommentThreadMessages,
  isCanvasCommentItem,
  setCanvasCommentResolved,
} from '../../../../host'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'

export type CanvasObjectInspectorCommentThread = {
  disabled: boolean
  itemId: string
  messages: readonly CanvasCommentThreadMessage[]
  resolved: boolean
  onToggleResolved: () => void
}

export function getCanvasObjectInspectorCommentThread({
  commitItemsChange,
  disabled,
  items,
  selectedItems,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectInspectorCommentThread | null {
  if (selection.length !== 1) {
    return null
  }

  const [item] = selectedItems

  if (!item || !isCanvasCommentItem(item)) {
    return null
  }

  return {
    disabled,
    itemId: item.id,
    messages: getCanvasCommentThreadMessages(item),
    resolved: item.resolved === true,
    onToggleResolved: () => {
      if (disabled) {
        return
      }

      const nextResolved = item.resolved !== true
      const selectedIds = new Set(selection)

      commitItemsChange({
        type: 'replace-changed',
        items: updateCanvasCommentResolved(
          items ?? selectedItems,
          selectedIds,
          nextResolved,
        ),
      }, {
        before: selection,
        after: selection,
      })
    },
  }
}

function updateCanvasCommentResolved(
  items: readonly CanvasItem[],
  selectedIds: ReadonlySet<string>,
  resolved: boolean,
): CanvasItem[] {
  return items.map((item) => {
    if (selectedIds.has(item.id) && isCanvasCommentItem(item)) {
      return setCanvasCommentResolved(item, resolved)
    }

    return item.type === 'group'
      ? {
          ...item,
          children: updateCanvasCommentResolved(
            item.children,
            selectedIds,
            resolved,
          ),
        }
      : item
  })
}
