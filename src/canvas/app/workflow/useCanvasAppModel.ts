import {
  useCallback,
  useMemo,
  useState,
} from 'react'
import { getCanvasAppAffordanceModel } from './CanvasAppAffordanceModel'
import { getCanvasAppAssemblyModel } from './CanvasAppAssemblyModel'
import { getCanvasAppControlModel } from './CanvasAppControlModel'
import {
  createCanvasAppStageExternalOverlaySlot,
  renderCanvasAppStageModel,
} from './CanvasAppStageModel'
import { useCanvasAppCommandModel } from './useCanvasAppCommandModel'
import { useCanvasAppComponentModel } from './useCanvasAppComponentModel'
import { useCanvasAppCustomFocusModel } from './useCanvasAppCustomFocusModel'
import {
  getCanvasAppRuntimeFeatureConfig,
  useCanvasAppToolFeaturePackModel,
  useCanvasAppTransientFeaturePackModel,
} from '../feature-packs'
import { useCanvasAppExtensionModel } from './useCanvasAppExtensionModel'
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
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false)
  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true)
  }, [])
  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false)
  }, [])
  const openShortcutHelp = useCallback(() => {
    setShortcutHelpOpen(true)
    setCommandPaletteOpen(false)
  }, [])
  const closeShortcutHelp = useCallback(() => {
    setShortcutHelpOpen(false)
  }, [])
  const affordance = useMemo(
    () => getCanvasAppAffordanceModel(appAssembly.affordance.config),
    [appAssembly],
  )
  const installedFeaturePackIds = appAssembly.featurePack.installedIds
  const installedFeaturePackIdSet = useMemo(
    () => new Set(installedFeaturePackIds),
    [installedFeaturePackIds],
  )
  const stageElement = useCanvasAppStageElementModel()
  const workspace = useCanvasWorkspaceModel(appAssembly.workspace)
  const providedPresence = presence ?? appAssembly.collaboration.presenceProvider({
    selection: workspace.interaction.selection,
    viewport: workspace.interaction.viewport,
  })
  const featurePackTransients = useCanvasAppTransientFeaturePackModel({
    cursorChat: {
      ...affordance.keyboard,
      ...stageElement.pointer,
    },
    emote: {
      ...affordance.interaction,
      stageElement: stageElement.pointer.stageElement,
      viewport: workspace.stage.viewport,
    },
    installedFeaturePackIds,
    sessionTimer: affordance.facilitation,
    spotlight: {
      ...affordance.facilitation,
      followerCount: providedPresence.length,
    },
    votingSession: affordance.facilitation,
  })
  const interaction = useCanvasInteractionModel({
    ...affordance.interaction,
    emoteBursts: featurePackTransients.emotes.overlay.bursts,
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

  const {
    pasteClipboardImage,
    ...imageControls
  } = useCanvasAppImageModel({
    ...affordance.image,
    config: getCanvasAppRuntimeFeatureConfig({
      config: affordance.image.config,
      disabledConfig: {
        commands: {
          copy: false,
          paste: false,
        },
        overlays: {
          imageControls: false,
        },
      },
      enabled: installedFeaturePackIdSet.has('image-io'),
    }),
    ...workspace.image,
    ...stageElement.image,
  })

  const stampControls = useCanvasAppStampModel({
    ...affordance.stamp,
    votingSession: featurePackTransients.votingSession.stamp,
    ...workspace.stamp,
    ...stageElement.stamp,
  })

  useCanvasAppTableImportModel({
    ...affordance.table,
    config: getCanvasAppRuntimeFeatureConfig({
      config: affordance.table.config,
      disabledConfig: {
        commands: {
          paste: false,
        },
      },
      enabled: installedFeaturePackIdSet.has('table-import'),
    }),
    ...workspace.table,
    ...stageElement.table,
  })

  useCanvasAppLinkPreviewImportModel({
    ...affordance.linkPreview,
    config: getCanvasAppRuntimeFeatureConfig({
      config: affordance.linkPreview.config,
      disabledConfig: {
        commands: {
          paste: false,
        },
      },
      enabled: installedFeaturePackIdSet.has('media-import'),
    }),
    mediaImporters: appAssembly.extension.mediaImporters,
    ...workspace.linkPreview,
    ...stageElement.linkPreview,
  })

  useCanvasAppTextPasteImportModel({
    ...affordance.textPaste,
    config: getCanvasAppRuntimeFeatureConfig({
      config: affordance.textPaste.config,
      disabledConfig: {
        commands: {
          paste: false,
        },
      },
      enabled: installedFeaturePackIdSet.has('text-paste-import'),
    }),
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
    pasteExternal: pasteClipboardImage,
    ...text.command,
    ...stageElement.command,
    workspace: workspace.command.workspace,
  })

  const viewportControls = useCanvasAppViewportModel({
    ...affordance.viewport,
    ...workspace.viewport,
    ...stageElement.viewport,
  })

  const featurePackTools = useCanvasAppToolFeaturePackModel({
    drawing: {
      ...affordance.drawing,
      tool: interaction.control.tool,
    },
    installedFeaturePackIds,
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
    cursorChat: featurePackTransients.cursorChat.keyboard,
    ...affordance.keyboard,
    ...extension.keyboard,
    ...text.keyboard,
    openCommandPalette,
    openShortcutHelp,
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
    ...featurePackTools.drawing.pointer,
    ...extension.pointer,
    interaction: interaction.pointer,
    ...appAssembly.pointer,
    ...stageElement.pointer,
    workspace: {
      canEditText: workspace.pointer.canEditText,
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
    onOpenShortcutHelp: openShortcutHelp,
    onToolChange: interaction.control.onToolChange,
  })
  const selection = useCanvasAppSelectionModel({
    anchor: controls.toolbar.selectionCommandAnchor,
    bounds: inspector.bounds,
    disabled: inspector.disabled,
    label: inspector.label,
    setEditing: text.command.setEditing,
    votingSession: featurePackTransients.votingSession.stamp,
    workspace: workspace.selection,
  })
  const stage = renderCanvasAppStageModel({
    cursorChat: featurePackTransients.cursorChat.stage,
    emote: featurePackTransients.emotes.stage,
    ...text.stage,
    itemLayer: workspace.itemLayer,
    pointer,
    rendering: appAssembly.rendering,
    stage: {
      ...interaction.stage,
      ...stageElement.stage,
      ...workspace.stage,
    },
  })

  return {
    activeMode: interaction.stage.activeMode,
    ...text.view,
    commandPalette: {
      items: controls.commandPalette.items,
      open: commandPaletteOpen && controls.commandPalette.visible,
      onClose: closeCommandPalette,
    },
    componentPalette: controls.componentPalette,
    drawingControls: featurePackTools.drawing.control,
    featurePackViewRenderers: appAssembly.featurePack.viewRenderers,
    imageControls,
    inspector,
    items: workspace.itemLayer.items,
    minimap: controls.minimap,
    selection,
    stage,
    stageOverlaySlot: createCanvasAppStageExternalOverlaySlot(stage),
    viewport: workspace.stage.viewport,
    cursorChat: featurePackTransients.cursorChat.view,
    emoteControls: featurePackTransients.emotes.view,
    gesture: interaction.stage.gesture,
    sessionTimer: featurePackTransients.sessionTimer.view,
    shortcutHelp: {
      items: controls.shortcutHelp.items,
      open: shortcutHelpOpen && controls.shortcutHelp.visible,
      onClose: closeShortcutHelp,
    },
    spotlight: featurePackTransients.spotlight.view,
    stampControls,
    stickyQuickCreate: components.control.stickyQuickCreate,
    status: controls.status,
    toolbar: controls.toolbar,
    viewportFocus: controls.viewportFocus,
    votingSession: featurePackTransients.votingSession.view,
    zoomControls: controls.zoomControls,
  }
}
