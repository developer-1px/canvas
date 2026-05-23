import type {
  CanvasItem,
  EditingText,
  Tool,
} from '../../entities'
import {
  type CanvasCreationAdapter,
  type CanvasSceneAdapter,
} from '../../engine'
import type {
  CommitCanvasItemsChange,
  CommitCanvasSelection,
} from '../workflow/CanvasWorkflowContract'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { Interaction } from './CanvasInteractionState'
import { commitCanvasPointerCreation } from './CanvasPointerCreationCommit'
import {
  isCanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import {
  cancelCanvasPointerMarqueeInteraction,
  commitCanvasPointerMarqueeInteraction,
} from './CanvasPointerMarqueeInteraction'
import {
  cancelCanvasPointerTransformInteraction,
  commitCanvasPointerTransformInteraction,
} from './CanvasPointerTransformInteraction'

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
  if (isCanvasPointerCreationInteraction(interaction)) {
    commitCanvasPointerCreation({
      commitItemsChange,
      creationAdapter,
      createId,
      customCreationTools,
      interaction,
      selection,
      setTool,
    })
  }

  if (interaction.kind === 'move' || interaction.kind === 'resize') {
    commitCanvasPointerTransformInteraction({
      commitItemsChange,
      commitSelection,
      interaction,
      setEditing,
      setTool,
    })
  }

  if (interaction.kind === 'marquee') {
    commitCanvasPointerMarqueeInteraction({
      commitSelection,
      interaction,
      scene,
      setSelection,
    })
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
    cancelCanvasPointerTransformInteraction({
      interaction,
      setLiveItems,
    })
  } else if (interaction.kind === 'marquee') {
    cancelCanvasPointerMarqueeInteraction({
      interaction,
      setSelection,
    })
  }
}
