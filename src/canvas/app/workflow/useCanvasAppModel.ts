import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { getCanvasAppAffordanceModel } from './CanvasAppAffordanceModel'
import { getCanvasAppAssemblyModel } from './CanvasAppAssemblyModel'
import { getCanvasAppControlModel } from './CanvasAppControlModel'
import { renderCanvasAppStageModel } from './CanvasAppStageModel'
import { useCanvasAppCommandModel } from './useCanvasAppCommandModel'
import { useCanvasAppComponentModel } from './useCanvasAppComponentModel'
import { useCanvasAppCustomFocusModel } from './useCanvasAppCustomFocusModel'
import { useCanvasCursorChatModel } from '../affordances/controls/cursor-chat/useCanvasCursorChatModel'
import { useCanvasAppDrawingModel } from './useCanvasAppDrawingModel'
import { useCanvasEmoteModel } from '../affordances/controls/emote/useCanvasEmoteModel'
import { useCanvasAppExtensionModel } from './useCanvasAppExtensionModel'
import { useCanvasSessionTimerModel } from '../affordances/controls/facilitation/useCanvasSessionTimerModel'
import { useCanvasSpotlightModel } from '../affordances/controls/facilitation/useCanvasSpotlightModel'
import { useCanvasVotingSessionModel } from '../affordances/controls/facilitation/useCanvasVotingSessionModel'
import { useCanvasAppInspectorModel } from './useCanvasAppInspectorModel'
import { useCanvasAppImageModel } from './useCanvasAppImageModel'
import { useCanvasAppKeyboardModel } from './useCanvasAppKeyboardModel'
import { useCanvasAppLinkPreviewImportModel } from './useCanvasAppLinkPreviewImportModel'
import { useCanvasAppPointerModel } from './useCanvasAppPointerModel'
import { useCanvasAppSelectionModel } from './useCanvasAppSelectionModel'
import { useCanvasAppStampModel } from './useCanvasAppStampModel'
import { useCanvasAppStageElementModel } from './useCanvasAppStageElementModel'
import { useCanvasAppTableImportModel } from './useCanvasAppTableImportModel'
import { useCanvasAppTextPasteImportModel } from './useCanvasAppTextPasteImportModel'
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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [])
  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false)
  }, [])
  const affordance = useMemo(
    () => getCanvasAppAffordanceModel(appAssembly.affordance.config),
    [appAssembly],
  )
  const stageElement = useCanvasAppStageElementModel()
  const workspace = useCanvasWorkspaceModel(appAssembly.workspace)
  const providedPresence = presence ?? appAssembly.collaboration.presenceProvider({
    selection: workspace.interaction.selection,
    viewport: workspace.interaction.viewport,
  })
  const cursorChat = useCanvasCursorChatModel({
    ...affordance.keyboard,
    ...stageElement.pointer,
  })
  const sessionTimer = useCanvasSessionTimerModel(affordance.facilitation)
  const spotlight = useCanvasSpotlightModel({
    ...affordance.facilitation,
    followerCount: providedPresence.length,
  })
  const votingSession = useCanvasVotingSessionModel(affordance.facilitation)
  const emotes = useCanvasEmoteModel({
    ...affordance.interaction,
    stageElement: stageElement.pointer.stageElement,
    viewport: workspace.stage.viewport,
  })
  const interaction = useCanvasInteractionModel({
    ...affordance.interaction,
    emoteBursts: emotes.overlay.bursts,
    presence: providedPresence,
    ...workspace.interaction,
  })
  const customFocus = useCanvasAppCustomFocusModel({
    selection: workspace.inspector.selection,
  })

  const inspector = useCanvasAppInspectorModel({
    ...affordance.inspector,
    ...customFocus,
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
    votingSession: votingSession.stamp,
    ...workspace.stamp,
    ...stageElement.stamp,
  })

  useCanvasAppTableImportModel({
    ...affordance.table,
    ...workspace.table,
    ...stageElement.table,
  })

  useCanvasAppLinkPreviewImportModel({
    ...affordance.linkPreview,
    mediaImporters: appAssembly.extension.mediaImporters,
    ...workspace.linkPreview,
    ...stageElement.linkPreview,
  })

  useCanvasAppTextPasteImportModel({
    ...affordance.textPaste,
    ...appAssembly.extension,
    ...workspace.textPaste,
    ...stageElement.textPaste,
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
    command: commands.keyboard,
    component: components.keyboard,
    cursorChat: cursorChat.keyboard,
    ...affordance.keyboard,
    ...extension.keyboard,
    ...text.keyboard,
    openCommandPalette,
    interaction: {
      ...interaction.keyboard,
      ...text.keyboard.interaction,
    },
    viewport: viewportControls.keyboard,
    workspace: workspace.keyboard,
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
  const selection = useCanvasAppSelectionModel({
    anchor: controls.toolbar.selectionCommandAnchor,
    bounds: inspector.bounds,
    disabled: inspector.disabled,
    label: inspector.label,
    setEditing: text.command.setEditing,
    votingSession: votingSession.stamp,
    workspace: workspace.selection,
  })

  return {
    ...text.view,
    commandPalette: {
      items: controls.commandPalette.items,
      open: commandPaletteOpen && controls.commandPalette.visible,
      onClose: closeCommandPalette,
    },
    componentPalette: controls.componentPalette,
    drawingControls: drawing.control,
    imageControls,
    inspector,
    items: workspace.itemLayer.items,
    selection,
    stage: renderCanvasAppStageModel({
      cursorChat: cursorChat.stage,
      emote: emotes.stage,
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
    emoteControls: emotes.view,
    sessionTimer: sessionTimer.view,
    spotlight: spotlight.view,
    stampControls,
    stickyQuickCreate: components.control.stickyQuickCreate,
    status: controls.status,
    toolbar: controls.toolbar,
    votingSession: votingSession.view,
    zoomControls: controls.zoomControls,
  }
}
