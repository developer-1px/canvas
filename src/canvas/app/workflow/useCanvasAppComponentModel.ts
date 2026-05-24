import { useCanvasComponentInsertion } from '../components/useCanvasComponentInsertion'
import type {
  CanvasAppComponentModel,
  CanvasAppComponentModelInput,
} from './CanvasAppConsumerContracts'

export function useCanvasAppComponentModel({
  command,
  componentLibrary,
  createId,
  interaction,
  stageElement,
  workspace,
}: CanvasAppComponentModelInput): CanvasAppComponentModel {
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
    control: {
      onInsertComponent: insertComponent,
    },
  }
}
