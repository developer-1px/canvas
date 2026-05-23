import { useMemo } from 'react'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
} from '../../engine'
import { useCanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { getCanvasAppControlModel } from './CanvasAppControlModel'
import { renderCanvasAppStageModel } from './CanvasAppStageModel'
import { useCanvasAppCommandModel } from './useCanvasAppCommandModel'
import { useCanvasAppComponentModel } from './useCanvasAppComponentModel'
import { useCanvasAppExtensionModel } from './useCanvasAppExtensionModel'
import { useCanvasAppInspectorModel } from './useCanvasAppInspectorModel'
import { useCanvasAppKeyboardModel } from './useCanvasAppKeyboardModel'
import { useCanvasAppPointerModel } from './useCanvasAppPointerModel'
import { useCanvasAppTextModel } from './useCanvasAppTextModel'
import { useCanvasInteractionModel } from './useCanvasInteractionModel'
import { useCanvasAppViewportModel } from './useCanvasAppViewportModel'
import { useCanvasWorkspaceModel } from './useCanvasWorkspaceModel'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  assertCanvasAppAssembly,
  type CanvasAppAssembly,
} from './CanvasAppAssembly'

const canvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG

export function useCanvasAppModel({
  assembly = DEFAULT_CANVAS_APP_ASSEMBLY,
}: {
  assembly?: CanvasAppAssembly
} = {}) {
  const validatedAssembly = useMemo(
    () => assertCanvasAppAssembly(assembly),
    [assembly],
  )
  const {
    componentLibrary,
    componentPresentationRenderers,
    customCommands,
    customCreationTools,
    customItemRenderers,
    customItemValidators,
    inspectorPanels,
    initialItems,
    itemAdapters,
    itemLayerAdapter,
    stageAdapter,
  } = validatedAssembly
  const stageElement = useCanvasAppStageElement()
  const workspace = useCanvasWorkspaceModel({
    customItemValidators,
    initialItems,
  })
  const interaction = useCanvasInteractionModel({
    config: canvasAffordanceConfig,
    ...workspace.interaction,
  })

  const inspector = useCanvasAppInspectorModel({
    ...workspace.inspector,
    inspectorPanels,
  })

  const text = useCanvasAppTextModel(workspace.text)

  const extension = useCanvasAppExtensionModel({
    ...workspace.extension,
    customCommands,
    customCreationTools,
    setEditing: text.setEditing,
  })

  const commands = useCanvasAppCommandModel({
    commandAdapter: itemAdapters.command,
    config: canvasAffordanceConfig,
    createId: workspace.command.createId,
    document: workspace.command.document,
    setEditing: text.setEditing,
    stageElement,
    workspace: workspace.command.workspace,
  })

  const viewportControls = useCanvasAppViewportModel({
    config: canvasAffordanceConfig,
    ...workspace.viewport,
    stageElement,
  })

  useCanvasAppKeyboardModel({
    command: {
      ...workspace.keyboard.command,
      ...commands.keyboard,
    },
    config: canvasAffordanceConfig,
    customCreationTools: extension.keyboard.customCreationTools,
    interaction: {
      ...interaction.keyboard,
      setEditing: text.setEditing,
    },
    openFindReplace: text.openFindReplace,
    selection: workspace.keyboard.selection,
    viewport: viewportControls.keyboard,
  })

  const pointer = useCanvasAppPointerModel({
    command: {
      ...commands.pointer,
      ...workspace.pointer.command,
    },
    config: canvasAffordanceConfig,
    createId: workspace.pointer.createId,
    customCreationTools: extension.pointer.customCreationTools,
    interaction: interaction.pointer,
    itemAdapters: {
      creation: itemAdapters.creation,
      transform: itemAdapters.transform,
    },
    stageElement,
    workspace: {
      ...workspace.pointer.workspace,
      setEditing: text.setEditing,
    },
  })

  const components = useCanvasAppComponentModel({
    command: workspace.component.command,
    componentLibrary,
    createId: workspace.component.createId,
    interaction: {
      ...interaction.component,
      setEditing: text.setEditing,
    },
    stageElement,
    workspace: workspace.component.workspace,
  })

  const controls = getCanvasAppControlModel({
    ...workspace.control,
    components: componentLibrary.templates,
    config: canvasAffordanceConfig,
    ...extension.control,
    gesture: interaction.control.gesture,
    tool: interaction.control.tool,
    ...commands.control,
    ...viewportControls.control,
    ...components.control,
    onToolChange: interaction.control.onToolChange,
  })

  return {
    componentPalette: controls.componentPalette,
    findReplace: text.findReplace,
    inspector,
    stage: renderCanvasAppStageModel({
      blurTextEditor: text.blurTextEditor,
      itemLayer: workspace.itemLayer,
      pointer,
      rendering: {
        componentPresentationRenderers,
        customItemRenderers,
        getComponentPresentation: componentLibrary.getPresentation,
        itemLayerAdapter,
        stageAdapter,
      },
      stage: {
        ...interaction.stage,
        stageElement: stageElement.mount,
        ...workspace.stage,
      },
    }),
    status: controls.status,
    textEditor: text.textEditor,
    toolbar: controls.toolbar,
    zoomControls: controls.zoomControls,
  }
}
