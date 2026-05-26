import type {
  CanvasItem,
  Tool,
} from '../../../entities'
import {
  type CanvasSceneAdapter,
  type CanvasCreationAdapter,
} from '../../../engine'
import type { CanvasAppCustomCreationTool } from '../../extensions/custom-tools/CanvasAppCustomCreationTools'
import type { CanvasAppComponentLibrary } from '../../workflow/CanvasAppComponentAssemblyContracts'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type {
  CanvasPointerCreationInteraction,
} from './CanvasPointerCreationGrammar'
import {
  commitCanvasPointerComponentCreation,
  isCanvasPointerComponentCreationInteraction,
} from './CanvasPointerComponentCreation'
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
  componentLibrary: CanvasAppComponentLibrary
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
  componentLibrary,
  commitItemsChange,
  creationAdapter,
  createId,
  customCreationTools,
  interaction,
  scene,
  selection,
  setTool,
}: CanvasPointerCreationCommitInput) {
  if (isCanvasPointerComponentCreationInteraction(interaction)) {
    commitCanvasPointerComponentCreation({
      commitItemsChange,
      componentLibrary,
      createId,
      interaction,
      selection,
      setTool,
    })
    return
  }

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
