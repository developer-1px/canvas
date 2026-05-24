import { useMemo } from 'react'
import { getCanvasAppAffordanceModel } from './CanvasAppAffordanceModel'
import { getCanvasAppAssemblyModel } from './CanvasAppAssemblyModel'
import { getCanvasAppControlModel } from './CanvasAppControlModel'
import { renderCanvasAppStageModel } from './CanvasAppStageModel'
import { useCanvasAppCommandModel } from './useCanvasAppCommandModel'
import { useCanvasAppComponentModel } from './useCanvasAppComponentModel'
import { useCanvasCursorChatModel } from '../cursor/useCanvasCursorChatModel'
import { useCanvasAppDrawingModel } from './useCanvasAppDrawingModel'
import { useCanvasAppExtensionModel } from './useCanvasAppExtensionModel'
import { useCanvasAppInspectorModel } from './useCanvasAppInspectorModel'
import { useCanvasAppImageModel } from './useCanvasAppImageModel'
import { useCanvasAppKeyboardModel } from './useCanvasAppKeyboardModel'
import { useCanvasAppPointerModel } from './useCanvasAppPointerModel'
import { useCanvasAppStampModel } from './useCanvasAppStampModel'
import { useCanvasAppStageElementModel } from './useCanvasAppStageElementModel'
import { useCanvasAppTextModel } from './useCanvasAppTextModel'
import { useCanvasInteractionModel } from './useCanvasInteractionModel'
import { useCanvasAppViewportModel } from './useCanvasAppViewportModel'
import { useCanvasWorkspaceModel } from './useCanvasWorkspaceModel'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  assertCanvasAppAssembly,
} from './CanvasAppAssembly'
import type { CanvasAppAssembly } from './CanvasAppAssemblyTypes'
import type { CanvasPresenceOverlay } from '../../engine'

export function useCanvasAppModel({
  assembly = DEFAULT_CANVAS_APP_ASSEMBLY,
  presence,
}: {
  assembly?: CanvasAppAssembly
  presence?: readonly CanvasPresenceOverlay[]
} = {}) {
  const appAssembly = useMemo(
    () => getCanvasAppAssemblyModel(assertCanvasAppAssembly(assembly)),
    [assembly],
  )
  const affordance = useMemo(
    () => getCanvasAppAffordanceModel(appAssembly.affordance.config),
    [appAssembly],
  )
  const stageElement = useCanvasAppStageElementModel()
  const workspace = useCanvasWorkspaceModel(appAssembly.workspace)
  const cursorChat = useCanvasCursorChatModel({
    ...affordance.keyboard,
    ...stageElement.pointer,
  })
  const interaction = useCanvasInteractionModel({
    ...affordance.interaction,
    presence,
    ...workspace.interaction,
  })

  const inspector = useCanvasAppInspectorModel({
    ...affordance.inspector,
    ...workspace.inspector,
    ...appAssembly.inspector,
  })

  const imageControls = useCanvasAppImageModel({
    ...affordance.image,
    ...workspace.image,
    ...stageElement.image,
  })

  const stampControls = useCanvasAppStampModel({
    ...affordance.stamp,
    ...workspace.stamp,
    ...stageElement.stamp,
  })

  const text = useCanvasAppTextModel({
    ...affordance.text,
    ...workspace.text,
  })

  const extension = useCanvasAppExtensionModel({
    ...workspace.extension,
    ...appAssembly.extension,
    ...text.extension,
  })

  const commands = useCanvasAppCommandModel({
    ...appAssembly.command,
    ...affordance.command,
    createId: workspace.command.createId,
    document: workspace.command.document,
    ...text.command,
    ...stageElement.command,
    workspace: workspace.command.workspace,
  })

  const viewportControls = useCanvasAppViewportModel({
    ...affordance.viewport,
    ...workspace.viewport,
    ...stageElement.viewport,
  })

  const drawing = useCanvasAppDrawingModel({
    ...affordance.drawing,
    tool: interaction.control.tool,
  })

  const components = useCanvasAppComponentModel({
    command: workspace.component.command,
    ...affordance.component,
    ...appAssembly.component,
    createId: workspace.component.createId,
    interaction: {
      ...interaction.component,
      ...text.component.interaction,
    },
    ...stageElement.component,
    workspace: workspace.component.workspace,
  })

  useCanvasAppKeyboardModel({
    command: {
      ...workspace.keyboard.command,
      ...commands.keyboard,
    },
    component: components.keyboard,
    cursorChat: cursorChat.keyboard,
    ...affordance.keyboard,
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
    ...affordance.pointer,
    createId: workspace.pointer.createId,
    ...drawing.pointer,
    ...extension.pointer,
    interaction: interaction.pointer,
    ...appAssembly.pointer,
    ...stageElement.pointer,
    workspace: {
      ...workspace.pointer.workspace,
      ...text.pointer.workspace,
    },
  })

  const controls = getCanvasAppControlModel({
    ...workspace.control,
    ...appAssembly.control,
    ...affordance.control,
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
    drawingControls: drawing.control,
    imageControls,
    inspector,
    stage: renderCanvasAppStageModel({
      cursorChat: cursorChat.stage,
      ...text.stage,
      itemLayer: workspace.itemLayer,
      pointer,
      rendering: appAssembly.rendering,
      stage: {
        ...interaction.stage,
        ...stageElement.stage,
        ...workspace.stage,
      },
    }),
    cursorChat: cursorChat.view,
    stampControls,
    stickyQuickCreate: components.control.stickyQuickCreate,
    status: controls.status,
    toolbar: controls.toolbar,
    zoomControls: controls.zoomControls,
  }
}
