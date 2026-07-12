import type {
  CanvasItem,
  EditingText,
  Tool,
} from '../../../../entities'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../../../workflow/CanvasWorkflowContract'
import type { Interaction } from './CanvasInteractionState'

export type CanvasPointerTransformInteraction = Extract<
  Interaction,
  { kind: 'arrow-endpoint' } | { kind: 'move' } | { kind: 'resize' }
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
  if (
    interaction.kind === 'move' &&
    !interaction.moved &&
    interaction.clickSelection
  ) {
    return commitSelection(interaction.clickSelection)
  }

  const committed = commitItemsChange(
    {
      type: 'transform',
      beforeItems: interaction.historyItems,
      afterItems: interaction.currentItems,
    },
    {
      before: getCanvasPointerTransformHistorySelection(interaction),
      after: getCanvasPointerTransformSelection(interaction),
    },
  )

  if (!committed) {
    return false
  }

  if (interaction.kind === 'move' && !interaction.moved && interaction.edit) {
    commitSelection([interaction.edit.id])
    setEditing(interaction.edit)
    setTool('select')
  }

  return true
}

export function cancelCanvasPointerTransformInteraction({
  interaction,
  setLiveItems,
  setSelection,
}: {
  interaction: CanvasPointerTransformInteraction
  setLiveItems: (items: CanvasItem[]) => void
  setSelection: (selection: string[]) => void
}) {
  setLiveItems(interaction.historyItems)

  if (interaction.kind === 'move') {
    setSelection(interaction.historySelection)
  }
}

function getCanvasPointerTransformHistorySelection(
  interaction: CanvasPointerTransformInteraction,
) {
  return interaction.kind === 'move'
    ? interaction.historySelection
    : getCanvasPointerTransformSelection(interaction)
}

function getCanvasPointerTransformSelection(
  interaction: CanvasPointerTransformInteraction,
) {
  return interaction.kind === 'arrow-endpoint'
    ? [interaction.arrowId]
    : interaction.ids
}
