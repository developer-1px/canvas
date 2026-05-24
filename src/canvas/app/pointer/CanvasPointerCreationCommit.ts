import type {
  CanvasItem,
  Tool,
} from '../../entities'
import {
  type CanvasSceneAdapter,
  type CanvasCreationAdapter,
} from '../../engine'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import {
  commitCanvasPointerCustomCreation,
  isCanvasPointerCustomCreationInteraction,
} from './CanvasPointerCustomCreation'
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
  scene: CanvasSceneAdapter
  selection: string[]
  setTool: (tool: Tool) => void
}

export function commitCanvasPointerCreation({
  commitItemsChange,
  creationAdapter,
  createId,
  customCreationTools,
  interaction,
  scene,
  selection,
  setTool,
}: CanvasPointerCreationCommitInput) {
  if (isCanvasPointerShapeCreationInteraction(interaction)) {
    commitCanvasPointerShapeCreation({
      commitItemsChange,
      creationAdapter,
      createId,
      interaction,
      scene,
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

  if (isCanvasPointerCustomCreationInteraction(interaction)) {
    commitCanvasPointerCustomCreation({
      commitItemsChange,
      createId,
      customCreationTools,
      interaction,
      selection,
    })
  }
}
