import type {
  CanvasItem,
  EditingText,
  Tool,
} from '../../../../entities'
import {
  type CanvasSceneAdapter,
  type CanvasCreationAdapter,
} from '../../../../engine'
import type { CanvasAppCustomCreationTool } from '../../../extensions/custom-tools/CanvasAppCustomCreationTools'
import type { CanvasAppTextTarget } from '../../editing/text-editor/CanvasAppTextTarget'
import type { CanvasAppComponentLibrary } from '../../../workflow/CanvasAppComponentAssemblyContracts'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
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
  setEditing?: (editing: EditingText | null) => void
  setTool: (tool: Tool) => void
  textTarget?: CanvasAppTextTarget
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
  setEditing,
  setTool,
  textTarget,
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
      setEditing,
      textTarget,
    })
  }
}
