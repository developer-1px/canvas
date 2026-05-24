import { useCanvasPointerDownHandlers } from '../pointer/useCanvasPointerDownHandlers'
import { useCanvasPointerDragHandlers } from '../pointer/useCanvasPointerDragHandlers'
import { getCanvasAppPointerConsumerModel } from './CanvasAppPointerConsumerModel'
import type { CanvasAppPointerModelInput } from './CanvasAppConsumerContracts'

export function useCanvasAppPointerModel({
  command,
  componentLibrary,
  config,
  createId,
  customCreationTools,
  drawingStyles,
  interaction,
  itemAdapters,
  stageElement,
  workspace,
}: CanvasAppPointerModelInput) {
  const downHandlers = useCanvasPointerDownHandlers({
    cloneItems: command.cloneItems,
    componentLibrary,
    commitItemsChange: command.commitItemsChange,
    commitSelection: command.commitSelection,
    config,
    createId,
    creationAdapter: itemAdapters.creation,
    customCreationTools,
    drawingStyles,
    interactionRef: interaction.interactionRef,
    itemReadModel: workspace.itemReadModel,
    items: workspace.items,
    scene: workspace.scene,
    selectedBounds: workspace.selectedBounds,
    selection: workspace.selection,
    setDraftArrow: interaction.setDraftArrow,
    setDraftRect: interaction.setDraftRect,
    setDraftStroke: interaction.setDraftStroke,
    setEditing: workspace.setEditing,
    setGesture: interaction.setGesture,
    setLiveItems: workspace.setLiveItems,
    setSelection: workspace.setSelection,
    setTool: interaction.setTool,
    spaceDown: interaction.spaceDown,
    stageElement,
    tool: interaction.tool,
    viewport: workspace.viewport,
  })
  const dragHandlers = useCanvasPointerDragHandlers({
    componentLibrary,
    commitItemsChange: command.commitItemsChange,
    commitSelection: command.commitSelection,
    config,
    createId,
    creationAdapter: itemAdapters.creation,
    customCreationTools,
    interactionRef: interaction.interactionRef,
    itemReadModel: workspace.itemReadModel,
    scene: workspace.scene,
    selection: workspace.selection,
    setDraftArrow: interaction.setDraftArrow,
    setDraftRect: interaction.setDraftRect,
    setDraftStroke: interaction.setDraftStroke,
    setEditing: workspace.setEditing,
    setGesture: interaction.setGesture,
    setLiveItems: workspace.setLiveItems,
    setMarquee: interaction.setMarquee,
    setSelection: workspace.setSelection,
    setSnapGuides: interaction.setSnapGuides,
    setTool: interaction.setTool,
    setViewport: workspace.setViewport,
    stageElement,
    transformAdapter: itemAdapters.transform,
    viewport: workspace.viewport,
  })

  return getCanvasAppPointerConsumerModel({
    downHandlers,
    dragHandlers,
  })
}
