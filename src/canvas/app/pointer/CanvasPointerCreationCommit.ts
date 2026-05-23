import type {
  CanvasItem,
  Tool,
} from '../../entities'
import {
  type CanvasCreationAdapter,
} from '../../engine'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import { commitCanvasCustomCreation } from './CanvasCustomCreationCommit'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import {
  commitCanvasPointerDrawingCreation,
  isCanvasPointerDrawingCreationInteraction,
} from './CanvasPointerDrawingCreation'
import {
  commitCanvasPointerShapeCreation,
  isCanvasPointerShapeCreationInteraction,
} from './CanvasPointerShapeCreation'

export type CanvasPointerCreationCommitInput = {
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interaction: CanvasPointerCreationInteraction
  selection: string[]
  setTool: (tool: Tool) => void
}

export function commitCanvasPointerCreation({
  commitItemsChange,
  creationAdapter,
  createId,
  customCreationTools,
  interaction,
  selection,
  setTool,
}: CanvasPointerCreationCommitInput) {
  if (isCanvasPointerShapeCreationInteraction(interaction)) {
    commitCanvasPointerShapeCreation({
      commitItemsChange,
      creationAdapter,
      createId,
      interaction,
      selection,
      setTool,
    })
    return
  }

  if (isCanvasPointerDrawingCreationInteraction(interaction)) {
    commitCanvasPointerDrawingCreation({
      commitItemsChange,
      creationAdapter,
      createId,
      interaction,
      selection,
    })
    return
  }

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
