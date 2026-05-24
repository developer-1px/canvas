import {
  useCanvasComponentInsertion,
  useCanvasStickyQuickCreate,
  useCanvasStickyQuickCreateControlPoint,
} from '../components/useCanvasComponentInsertion'
import type {
  CanvasAppComponentModel,
  CanvasAppComponentModelInput,
} from './CanvasAppConsumerContracts'

export function useCanvasAppComponentModel({
  command,
  componentLibrary,
  config,
  creationAdapter,
  createId,
  interaction,
  stageElement,
  workspace,
}: CanvasAppComponentModelInput): CanvasAppComponentModel {
  const insertComponent = useCanvasComponentInsertion({
    commitItemsChange: command.commitItemsChange,
    componentLibrary,
    creationAdapter,
    createId,
    itemReadModel: workspace.itemReadModel,
    selection: workspace.selection,
    setEditing: interaction.setEditing,
    setTool: interaction.setTool,
    stageElement,
    viewport: workspace.viewport,
  })
  const quickCreateSticky = useCanvasStickyQuickCreate({
    commitItemsChange: command.commitItemsChange,
    componentLibrary,
    creationAdapter,
    createId,
    itemReadModel: workspace.itemReadModel,
    selection: workspace.selection,
    setEditing: interaction.setEditing,
    setTool: interaction.setTool,
    stageElement,
    viewport: workspace.viewport,
  })
  const quickCreatePoint = useCanvasStickyQuickCreateControlPoint({
    itemReadModel: workspace.itemReadModel,
    selection: workspace.selection,
    viewport: workspace.viewport,
  })

  return {
    control: {
      onInsertComponent: insertComponent,
      stickyQuickCreate: {
        point: quickCreatePoint,
        visible: config.overlays.stickyQuickCreate && quickCreatePoint !== null,
        onQuickCreate: quickCreateSticky,
      },
    },
    keyboard: {
      quickCreateSticky,
    },
  }
}
