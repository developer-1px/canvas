import { useMemo } from 'react'
import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
} from '../../engine'
import { useCanvasAppStageElement } from '../stage/CanvasAppStageElement'
import { getCanvasAppAssemblyModel } from './CanvasAppAssemblyModel'
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
  const appAssembly = useMemo(
    () => getCanvasAppAssemblyModel(assertCanvasAppAssembly(assembly)),
    [assembly],
  )
  const stageElement = useCanvasAppStageElement()
  const workspace = useCanvasWorkspaceModel(appAssembly.workspace)
  const interaction = useCanvasInteractionModel({
    config: canvasAffordanceConfig,
    ...workspace.interaction,
  })

  const inspector = useCanvasAppInspectorModel({
    ...workspace.inspector,
    ...appAssembly.inspector,
  })

  const text = useCanvasAppTextModel(workspace.text)

  const extension = useCanvasAppExtensionModel({
    ...workspace.extension,
    ...appAssembly.extension,
    ...text.extension,
  })

  const commands = useCanvasAppCommandModel({
    ...appAssembly.command,
    config: canvasAffordanceConfig,
    createId: workspace.command.createId,
    document: workspace.command.document,
    ...text.command,
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
    ...extension.keyboard,
    ...text.keyboard,
    interaction: {
      ...interaction.keyboard,
      ...text.keyboard.interaction,
    },
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
    ...extension.pointer,
    interaction: interaction.pointer,
    ...appAssembly.pointer,
    stageElement,
    workspace: {
      ...workspace.pointer.workspace,
      ...text.pointer.workspace,
    },
  })

  const components = useCanvasAppComponentModel({
    command: workspace.component.command,
    ...appAssembly.component,
    createId: workspace.component.createId,
    interaction: {
      ...interaction.component,
      ...text.component.interaction,
    },
    stageElement,
    workspace: workspace.component.workspace,
  })

  const controls = getCanvasAppControlModel({
    ...workspace.control,
    ...appAssembly.control,
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
    ...text.view,
    componentPalette: controls.componentPalette,
    inspector,
    stage: renderCanvasAppStageModel({
      ...text.stage,
      itemLayer: workspace.itemLayer,
      pointer,
      rendering: appAssembly.rendering,
      stage: {
        ...interaction.stage,
        stageElement: stageElement.mount,
        ...workspace.stage,
      },
    }),
    status: controls.status,
    toolbar: controls.toolbar,
    zoomControls: controls.zoomControls,
  }
}
