import type { EditingText } from '../../entities'
import { getCanvasEditableTextValue } from '../../host'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'

export function editCanvasAppSelectionText({
  disabled = false,
  itemReadModel,
  selection,
  setEditing,
}: {
  disabled?: boolean
  itemReadModel: CanvasAppItemReadModel
  selection: readonly string[]
  setEditing: (editing: EditingText | null) => void
}) {
  if (disabled || selection.length !== 1) {
    return false
  }

  const [id] = selection
  const item = id ? itemReadModel.findEditableTextItem(id) : null

  if (!item) {
    return false
  }

  setEditing({
    id: item.id,
    value: getCanvasEditableTextValue(item),
  })
  return true
}
