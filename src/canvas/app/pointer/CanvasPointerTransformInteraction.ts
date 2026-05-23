import type {
  CanvasItem,
  EditingText,
  Tool,
} from '../../entities'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { Interaction } from './CanvasInteractionState'

export type CanvasPointerTransformInteraction = Extract<
  Interaction,
  { kind: 'move' } | { kind: 'resize' }
>

export function commitCanvasPointerTransformInteraction({
  commitItemsChange,
  commitSelection,
  interaction,
  setEditing,
  setTool,
}: {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  interaction: CanvasPointerTransformInteraction
  setEditing: (editing: EditingText | null) => void
  setTool: (tool: Tool) => void
}) {
  commitItemsChange(
    {
      type: 'transform',
      beforeItems: interaction.historyItems,
      afterItems: interaction.currentItems,
    },
    {
      before: getCanvasPointerTransformHistorySelection(interaction),
      after: interaction.ids,
    },
  )

  if (interaction.kind === 'move' && !interaction.moved && interaction.edit) {
    commitSelection([interaction.edit.id])
    setEditing(interaction.edit)
    setTool('select')
  }
}

export function cancelCanvasPointerTransformInteraction({
  interaction,
  setLiveItems,
}: {
  interaction: CanvasPointerTransformInteraction
  setLiveItems: (items: CanvasItem[]) => void
}) {
  setLiveItems(interaction.historyItems)
}

function getCanvasPointerTransformHistorySelection(
  interaction: CanvasPointerTransformInteraction,
) {
  return interaction.kind === 'move'
    ? interaction.historySelection
    : interaction.ids
}
