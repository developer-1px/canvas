import type { CanvasItem } from '../../../../entities'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'

export function commitCanvasObjectStyleChange({
  apply,
  canApply,
  commitItemsChange,
  disabled,
  items,
  selectedItems,
  selection,
}: {
  apply: (item: CanvasItem) => CanvasItem
  canApply: (item: CanvasItem) => boolean
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}) {
  if (disabled) {
    return
  }

  const selectedIds = new Set(selection)

  commitItemsChange({
    type: 'replace-changed',
    items: (items ?? selectedItems).map((item) =>
      selectedIds.has(item.id) && canApply(item) ? apply(item) : item,
    ),
  }, {
    before: selection,
    after: selection,
  })
}
