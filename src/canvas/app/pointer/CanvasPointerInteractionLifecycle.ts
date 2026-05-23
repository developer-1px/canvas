import type {
  CanvasItem,
  EditingText,
  Tool,
} from '../../entities'
import { normalizeBounds } from '../../core'
import {
  createCanvasArrow,
  createCanvasHighlight,
  createCanvasMarker,
  createCanvasRect,
  getCanvasMarqueeSelection,
  type CanvasCreationAdapter,
  type CanvasSceneAdapter,
} from '../../engine'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import { commitCanvasCustomCreation } from './CanvasCustomCreationCommit'
import type { Interaction } from './CanvasInteractionState'

export type CanvasPointerInteractionCommitInput = {
  commitItemsChange: CommitCanvasItemsChange
  commitSelection: CommitCanvasSelection
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interaction: Interaction
  scene: CanvasSceneAdapter
  selection: string[]
  setEditing: (editing: EditingText | null) => void
  setSelection: (selection: string[]) => void
  setTool: (tool: Tool) => void
}

export function commitCanvasPointerInteraction({
  commitItemsChange,
  commitSelection,
  creationAdapter,
  createId,
  customCreationTools,
  interaction,
  scene,
  selection,
  setEditing,
  setSelection,
  setTool,
}: CanvasPointerInteractionCommitInput) {
  if (interaction.kind === 'create-rect') {
    const nextItem = createCanvasRect({
      adapter: creationAdapter,
      createId,
      currentWorld: interaction.currentWorld,
      startWorld: interaction.startWorld,
    })

    commitItemsChange({ type: 'add', items: [nextItem] }, {
      before: selection,
      after: [nextItem.id],
    })
    setTool('select')
  }

  if (interaction.kind === 'draw-marker') {
    const nextItem = createCanvasMarker({
      adapter: creationAdapter,
      createId,
      points: interaction.points,
      startWorld: interaction.startWorld,
    })

    commitItemsChange({ type: 'add', items: [nextItem] }, {
      before: selection,
      after: [nextItem.id],
    })
  }

  if (interaction.kind === 'draw-highlight') {
    const nextItem = createCanvasHighlight({
      adapter: creationAdapter,
      createId,
      points: interaction.points,
      startWorld: interaction.startWorld,
    })

    commitItemsChange({ type: 'add', items: [nextItem] }, {
      before: selection,
      after: [nextItem.id],
    })
  }

  if (interaction.kind === 'create-arrow') {
    const nextItem = createCanvasArrow({
      adapter: creationAdapter,
      createId,
      currentWorld: interaction.currentWorld,
      startWorld: interaction.startWorld,
    })

    commitItemsChange({ type: 'add', items: [nextItem] }, {
      before: selection,
      after: [nextItem.id],
    })
  }

  if (interaction.kind === 'create-custom') {
    commitCanvasCustomCreation({
      commitItemsChange,
      createId,
      customCreationTools,
      currentWorld: interaction.currentWorld,
      moved: interaction.moved,
      selection,
      startWorld: interaction.startWorld,
      tool: interaction.tool,
    })
  }

  if (interaction.kind === 'move' || interaction.kind === 'resize') {
    commitItemsChange(
      {
        type: 'transform',
        beforeItems: interaction.historyItems,
        afterItems: interaction.currentItems,
      },
      {
        before:
          interaction.kind === 'move'
            ? interaction.historySelection
            : interaction.ids,
        after: interaction.ids,
      },
    )
  }

  if (interaction.kind === 'move' && !interaction.moved && interaction.edit) {
    commitSelection([interaction.edit.id])
    setEditing(interaction.edit)
    setTool('select')
  }

  if (interaction.kind === 'marquee') {
    if (interaction.moved) {
      const nextSelection = getCanvasMarqueeSelection({
        additive: interaction.additive,
        baseSelection: interaction.baseSelection,
        bounds: normalizeBounds(
          interaction.startWorld,
          interaction.currentWorld,
        ),
        scene,
      })

      setSelection(interaction.baseSelection)
      commitSelection(nextSelection)
    } else if (!interaction.additive) {
      setSelection(interaction.baseSelection)
      commitSelection([])
    }
  }
}

export type CanvasPointerInteractionCancelInput = {
  interaction: Interaction
  setLiveItems: (items: CanvasItem[]) => void
  setSelection: (selection: string[]) => void
}

export function cancelCanvasPointerInteraction({
  interaction,
  setLiveItems,
  setSelection,
}: CanvasPointerInteractionCancelInput) {
  if (interaction.kind === 'move' || interaction.kind === 'resize') {
    setLiveItems(interaction.historyItems)
  } else if (interaction.kind === 'marquee') {
    setSelection(interaction.baseSelection)
  }
}
