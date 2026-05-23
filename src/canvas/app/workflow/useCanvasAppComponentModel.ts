import type {
  Dispatch,
  SetStateAction,
} from 'react'
import type {
  EditingText,
  Tool,
  Viewport,
} from '../../entities'
import type { CanvasComponentLibrary } from '../../host'
import { useCanvasComponentInsertion } from '../components/useCanvasComponentInsertion'
import type { CanvasAppStageElement } from '../stage/CanvasAppStageElement'
import type { CommitCanvasItemsChange } from './CanvasWorkflowContract'

type CanvasAppComponentCommandModel = {
  commitItemsChange: CommitCanvasItemsChange
}

type CanvasAppComponentInteractionModel = {
  setEditing: Dispatch<SetStateAction<EditingText | null>>
  setTool: Dispatch<SetStateAction<Tool>>
}

type CanvasAppComponentWorkspaceModel = {
  selection: string[]
  viewport: Viewport
}

type UseCanvasAppComponentModelArgs = {
  command: CanvasAppComponentCommandModel
  componentLibrary: CanvasComponentLibrary
  createId: (prefix: string) => string
  interaction: CanvasAppComponentInteractionModel
  stageElement: CanvasAppStageElement
  workspace: CanvasAppComponentWorkspaceModel
}

export function useCanvasAppComponentModel({
  command,
  componentLibrary,
  createId,
  interaction,
  stageElement,
  workspace,
}: UseCanvasAppComponentModelArgs) {
  const insertComponent = useCanvasComponentInsertion({
    commitItemsChange: command.commitItemsChange,
    componentLibrary,
    createId,
    selection: workspace.selection,
    setEditing: interaction.setEditing,
    setTool: interaction.setTool,
    stageElement,
    viewport: workspace.viewport,
  })

  return {
    insertComponent,
  }
}
