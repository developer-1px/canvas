import type {
  ComponentProps,
  MouseEvent,
  ReactNode,
} from 'react'
import {
  useCallback,
  useState,
} from 'react'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
  type CanvasAppCommandPaletteProps,
  type CanvasAppComponentPaletteProps,
  type CanvasAppContextCommandMenuState,
  type CanvasAppCursorChatProps,
  type CanvasAppDrawingControlsProps,
  type CanvasAppEmoteControlsProps,
  type CanvasAppFeaturePackViewRenderers,
  type CanvasAppFindReplacePanelProps,
  type CanvasAppImageControlsProps,
  type CanvasAppMinimapProps,
  type CanvasAppSelectionFloatingBarProps,
  type CanvasAppSessionTimerProps,
  type CanvasAppShortcutHelpOverlayProps,
  type CanvasAppSpotlightProps,
  type CanvasAppStampControlsProps,
  type CanvasAppStatusProps,
  type CanvasAppStickyQuickCreateControlProps,
  type CanvasAppToolbarProps,
  type CanvasAppVotingSessionProps,
  type CanvasAppZoomControlsProps,
} from '../feature-packs'
import { CanvasObjectInspector } from '../affordances/editing/inspector/CanvasObjectInspector'
import { CanvasTextEditor } from '../affordances/editing/text-editor/CanvasTextEditor'
import {
  getCanvasContextMenuPosition,
} from '../affordances/controls/context-menu/CanvasContextMenuPosition'
import { getCanvasAppSurfaceVisibility } from './CanvasAppSurfaceModel'

type ToolbarProps = CanvasAppToolbarProps
type CommandPaletteProps = CanvasAppCommandPaletteProps
type SelectionFloatingBarProps = CanvasAppSelectionFloatingBarProps
type CursorChatProps = CanvasAppCursorChatProps
type EmoteControlsProps = CanvasAppEmoteControlsProps
type SessionTimerProps = CanvasAppSessionTimerProps
type ShortcutHelpProps = CanvasAppShortcutHelpOverlayProps
type SpotlightProps = CanvasAppSpotlightProps
type VotingSessionProps = CanvasAppVotingSessionProps
type TextEditorProps = ComponentProps<typeof CanvasTextEditor>
type DrawingControlsProps = CanvasAppDrawingControlsProps
type FindReplaceProps = CanvasAppFindReplacePanelProps
type ImageControlsProps = CanvasAppImageControlsProps
type StampControlsProps = CanvasAppStampControlsProps
type StickyQuickCreateProps = CanvasAppStickyQuickCreateControlProps
type InspectorProps = ComponentProps<typeof CanvasObjectInspector>
type PaletteProps = CanvasAppComponentPaletteProps
type ZoomControlsProps = CanvasAppZoomControlsProps
type StatusProps = CanvasAppStatusProps
type MinimapProps = CanvasAppMinimapProps
type VisibleProps<TProps> = TProps & {
  visible: boolean
}
type ToolbarViewProps = VisibleProps<ToolbarProps> & {
  selectionCommandAnchor: SelectionFloatingBarProps['anchor']
}

type CanvasAppViewProps = {
  commandPalette: CommandPaletteProps
  componentPalette: VisibleProps<PaletteProps>
  cursorChat: CursorChatProps
  drawingControls: VisibleProps<DrawingControlsProps>
  emoteControls: EmoteControlsProps
  featurePackViewRenderers?: CanvasAppFeaturePackViewRenderers
  findReplace: FindReplaceProps
  imageControls: VisibleProps<ImageControlsProps>
  inspector: VisibleProps<InspectorProps>
  minimap: VisibleProps<MinimapProps>
  sessionTimer: SessionTimerProps
  shortcutHelp: ShortcutHelpProps
  spotlight: SpotlightProps
  stage: ReactNode
  stampControls: VisibleProps<StampControlsProps>
  stickyQuickCreate: VisibleProps<StickyQuickCreateProps>
  status: VisibleProps<StatusProps>
  textEditor: VisibleProps<TextEditorProps>
  toolbar: ToolbarViewProps
  votingSession: VotingSessionProps
  zoomControls: VisibleProps<ZoomControlsProps>
}

export function CanvasAppView({
  commandPalette,
  componentPalette,
  cursorChat,
  drawingControls,
  emoteControls,
  featurePackViewRenderers = DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
  findReplace,
  imageControls,
  inspector,
  minimap,
  sessionTimer,
  shortcutHelp,
  spotlight,
  stage,
  stampControls,
  stickyQuickCreate,
  status,
  textEditor,
  toolbar,
  votingSession,
  zoomControls,
}: CanvasAppViewProps) {
  const {
    visible: showComponentPalette,
    ...componentPaletteProps
  } = componentPalette
  const { visible: showDrawingControls, ...drawingControlProps } =
    drawingControls
  const { visible: showInspector, ...inspectorProps } = inspector
  const { visible: showImageControls, ...imageControlProps } = imageControls
  const { visible: showMinimap, ...minimapProps } = minimap
  const { visible: showStampControls, ...stampControlProps } = stampControls
  const { visible: showStickyQuickCreate, ...stickyQuickCreateProps } =
    stickyQuickCreate
  const { visible: showTextEditor, ...textEditorProps } = textEditor
  const {
    visible: showToolbar,
    selectionCommandAnchor,
    ...toolbarProps
  } = toolbar
  const { visible: showZoomControls, ...zoomControlProps } = zoomControls
  const { visible: showStatus, ...statusProps } = status
  const [contextMenu, setContextMenu] =
    useState<CanvasAppContextCommandMenuState | null>(null)
  const featurePackViews = featurePackViewRenderers
  const inspectorHasContent = showInspector && (
    inspectorProps.customPanels.length > 0 ||
    inspectorProps.styleControls.length > 0 ||
    (inspectorProps.bounds !== null && inspectorProps.label !== null)
  )
  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [setContextMenu])
  const openContextMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    if (isAppControlTarget(event.target)) {
      return
    }

    event.preventDefault()
    setContextMenu(getCanvasContextMenuPosition({
      point: { x: event.clientX, y: event.clientY },
      viewportSize: getCanvasAppViewViewportSize(),
    }))
  }, [setContextMenu])
  const surfaces = getCanvasAppSurfaceVisibility({
    'canvas-status': showStatus && featurePackViews.status !== undefined,
    'command-palette': commandPalette.open &&
      featurePackViews.commandPalette !== undefined,
    'component-palette': showComponentPalette &&
      featurePackViews.componentPalette !== undefined,
    'context-command-menu': showToolbar &&
      contextMenu !== null &&
      featurePackViews.contextCommandMenu !== undefined,
    'cursor-chat': cursorChat.visible &&
      featurePackViews.cursorChat !== undefined,
    'drawing-controls': showDrawingControls &&
      featurePackViews.drawingControls !== undefined,
    'emote-controls': emoteControls.visible &&
      featurePackViews.emoteControls !== undefined,
    'find-replace-panel': findReplace.open &&
      featurePackViews.findReplacePanel !== undefined,
    'image-controls': showImageControls &&
      featurePackViews.imageControls !== undefined,
    minimap: showMinimap &&
      minimapProps.model !== null &&
      featurePackViews.minimap !== undefined,
    'object-inspector': inspectorHasContent,
    'selection-floating-bar': showToolbar &&
      statusProps.selectionLength > 0 &&
      selectionCommandAnchor !== null &&
      featurePackViews.selectionFloatingBar !== undefined,
    'session-timer': sessionTimer.visible &&
      featurePackViews.sessionTimer !== undefined,
    'shortcut-help': shortcutHelp.open &&
      featurePackViews.shortcutHelp !== undefined,
    'spotlight': spotlight.visible &&
      featurePackViews.spotlight !== undefined,
    'stamp-controls': showStampControls &&
      featurePackViews.stampControls !== undefined,
    'sticky-quick-create': showStickyQuickCreate &&
      featurePackViews.stickyQuickCreate !== undefined,
    'text-editor': showTextEditor,
    'toolbar': showToolbar && featurePackViews.toolbar !== undefined,
    'voting-session': votingSession.visible &&
      featurePackViews.votingSession !== undefined,
    'zoom-controls': showZoomControls &&
      featurePackViews.zoomControls !== undefined,
  })
  const hasTopLeftZone = surfaces.toolbar ||
    surfaces['image-controls'] ||
    surfaces['drawing-controls']
  const hasTopRightZone = surfaces['session-timer'] ||
    surfaces['voting-session'] ||
    (surfaces['stamp-controls'] && stampControlProps.anchor === null)
  const hasRightRailZone = surfaces['component-palette'] ||
    surfaces['object-inspector']
  const hasBottomLeftZone = surfaces['zoom-controls'] || surfaces.minimap
  const hasBottomCenterZone = surfaces['emote-controls'] ||
    surfaces['find-replace-panel']
  const hasBottomRightZone = surfaces['canvas-status']

  return (
    <main className="canvas-app" onContextMenuCapture={openContextMenu}>
      {stage}

      {hasTopLeftZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-top-left">
          {surfaces.toolbar && featurePackViews.toolbar
            ? featurePackViews.toolbar(toolbarProps)
            : null}

          {surfaces['image-controls'] || surfaces['drawing-controls'] ? (
            <div className="canvas-floating-row canvas-floating-row-authoring">
              {surfaces['image-controls'] && featurePackViews.imageControls
                ? featurePackViews.imageControls(imageControlProps)
                : null}

              {surfaces['drawing-controls'] && featurePackViews.drawingControls
                ? featurePackViews.drawingControls(drawingControlProps)
                : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {surfaces.spotlight ? (
        <div className="canvas-floating-zone canvas-floating-zone-top-center">
          {featurePackViews.spotlight
            ? featurePackViews.spotlight(spotlight)
            : null}
        </div>
      ) : null}

      {hasTopRightZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-top-right">
          {surfaces['session-timer'] && featurePackViews.sessionTimer
            ? featurePackViews.sessionTimer(sessionTimer)
            : null}

          {surfaces['voting-session'] && featurePackViews.votingSession
            ? featurePackViews.votingSession(votingSession)
            : null}

          {surfaces['stamp-controls'] &&
          stampControlProps.anchor === null &&
          featurePackViews.stampControls
            ? featurePackViews.stampControls(stampControlProps)
            : null}
        </div>
      ) : null}

      {hasRightRailZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-right-rail">
          {surfaces['object-inspector'] ? (
            <CanvasObjectInspector {...inspectorProps} />
          ) : null}

          {surfaces['component-palette'] && featurePackViews.componentPalette
            ? featurePackViews.componentPalette(componentPaletteProps)
            : null}
        </div>
      ) : null}

      {hasBottomLeftZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-bottom-left">
          {surfaces['zoom-controls'] && featurePackViews.zoomControls
            ? featurePackViews.zoomControls(zoomControlProps)
            : null}

          {surfaces.minimap && featurePackViews.minimap
            ? featurePackViews.minimap(minimapProps)
            : null}
        </div>
      ) : null}

      {hasBottomCenterZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-bottom-center">
          {surfaces['emote-controls'] && featurePackViews.emoteControls
            ? featurePackViews.emoteControls(emoteControls)
            : null}

          {surfaces['find-replace-panel'] && featurePackViews.findReplacePanel
            ? featurePackViews.findReplacePanel(findReplace)
            : null}
        </div>
      ) : null}

      {hasBottomRightZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-bottom-right">
          {featurePackViews.status
            ? featurePackViews.status(statusProps)
            : null}
        </div>
      ) : null}

      {surfaces['stamp-controls'] &&
      stampControlProps.anchor !== null &&
      featurePackViews.stampControls
        ? featurePackViews.stampControls(stampControlProps)
        : null}

      {surfaces['selection-floating-bar'] &&
      featurePackViews.selectionFloatingBar
        ? featurePackViews.selectionFloatingBar({
          anchor: selectionCommandAnchor,
          commandAvailability: toolbarProps.commandAvailability,
          config: toolbarProps.config,
          customCommands: toolbarProps.customCommands,
          commandHandlers: toolbarProps.commandHandlers,
          visible: true,
          onCustomCommand: toolbarProps.onCustomCommand,
        })
        : null}

      {surfaces['context-command-menu'] && featurePackViews.contextCommandMenu
        ? featurePackViews.contextCommandMenu({
          commandAvailability: toolbarProps.commandAvailability,
          config: toolbarProps.config,
          customCommands: toolbarProps.customCommands,
          commandHandlers: toolbarProps.commandHandlers,
          menu: contextMenu,
          onClose: closeContextMenu,
          onCustomCommand: toolbarProps.onCustomCommand,
        })
        : null}

      {surfaces['command-palette'] && featurePackViews.commandPalette
        ? featurePackViews.commandPalette(commandPalette)
        : null}

      {surfaces['shortcut-help'] && featurePackViews.shortcutHelp
        ? featurePackViews.shortcutHelp(shortcutHelp)
        : null}

      {surfaces['cursor-chat'] && featurePackViews.cursorChat
        ? featurePackViews.cursorChat(cursorChat)
        : null}

      {surfaces['sticky-quick-create'] && featurePackViews.stickyQuickCreate
        ? featurePackViews.stickyQuickCreate(stickyQuickCreateProps)
        : null}

      {surfaces['text-editor'] ? <CanvasTextEditor {...textEditorProps} /> : null}
    </main>
  )
}

function getCanvasAppViewViewportSize() {
  const height = globalThis.innerHeight
  const width = globalThis.innerWidth

  return typeof height === 'number' &&
      typeof width === 'number' &&
      Number.isFinite(height) &&
      Number.isFinite(width)
    ? {
      height: Math.max(0, height),
      width: Math.max(0, width),
    }
    : null
}

function isAppControlTarget(target: EventTarget) {
  return target instanceof Element &&
    target.closest(
      [
        'a',
        'button',
        'input',
        'select',
        'textarea',
        '[role="toolbar"]',
        '.canvas-status',
        '.command-palette',
        '.component-palette',
        '.cursor-chat',
        '.find-replace-panel',
        '.canvas-minimap',
        '.object-inspector',
        '.shortcut-help',
        '.text-editor',
      ].join(','),
    ) !== null
}
