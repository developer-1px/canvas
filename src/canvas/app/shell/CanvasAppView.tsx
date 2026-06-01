import type {
  ComponentProps,
  MouseEvent,
  ReactNode,
} from 'react'
import {
  useCallback,
  useState,
} from 'react'
import { CanvasComponentPalette } from '../affordances/authoring/component/CanvasComponentPalette'
import { CanvasCommandPalette } from '../affordances/controls/command-palette/CanvasCommandPalette'
import { CanvasCursorChat } from '../affordances/controls/cursor-chat/CanvasCursorChat'
import { CanvasDrawingControls } from '../affordances/controls/drawing/CanvasDrawingControls'
import { CanvasEmoteControls } from '../affordances/controls/emote/CanvasEmoteControls'
import { CanvasSessionTimer } from '../affordances/controls/facilitation/CanvasSessionTimer'
import { CanvasSpotlight } from '../affordances/controls/facilitation/CanvasSpotlight'
import { CanvasVotingSession } from '../affordances/controls/facilitation/CanvasVotingSession'
import { CanvasObjectInspector } from '../affordances/editing/inspector/CanvasObjectInspector'
import { CanvasFindReplacePanel } from '../affordances/editing/search/CanvasFindReplacePanel'
import { CanvasImageControls } from '../affordances/io/image/CanvasImageControls'
import { CanvasStampControls } from '../affordances/authoring/stamp/CanvasStampControls'
import { CanvasStickyQuickCreateControl } from '../affordances/authoring/component/CanvasStickyQuickCreateControl'
import { CanvasTextEditor } from '../affordances/editing/text-editor/CanvasTextEditor'
import { CanvasToolbar } from '../affordances/controls/toolbar/CanvasToolbar'
import {
  CanvasContextCommandMenu,
  type CanvasContextCommandMenuState,
} from '../affordances/controls/toolbar/CanvasContextCommandMenu'
import { CanvasSelectionFloatingBar } from '../affordances/controls/toolbar/CanvasSelectionFloatingBar'
import { CanvasStatus } from '../affordances/controls/status/CanvasStatus'
import { ZoomControls } from '../affordances/controls/zoom/ZoomControls'
import { getCanvasAppSurfaceVisibility } from './CanvasAppSurfaceModel'

type ToolbarProps = ComponentProps<typeof CanvasToolbar>
type CommandPaletteProps = ComponentProps<typeof CanvasCommandPalette>
type SelectionFloatingBarProps = ComponentProps<
  typeof CanvasSelectionFloatingBar
>
type CursorChatProps = ComponentProps<typeof CanvasCursorChat>
type EmoteControlsProps = ComponentProps<typeof CanvasEmoteControls>
type SessionTimerProps = ComponentProps<typeof CanvasSessionTimer>
type SpotlightProps = ComponentProps<typeof CanvasSpotlight>
type VotingSessionProps = ComponentProps<typeof CanvasVotingSession>
type TextEditorProps = ComponentProps<typeof CanvasTextEditor>
type DrawingControlsProps = ComponentProps<typeof CanvasDrawingControls>
type FindReplaceProps = ComponentProps<typeof CanvasFindReplacePanel>
type ImageControlsProps = ComponentProps<typeof CanvasImageControls>
type StampControlsProps = ComponentProps<typeof CanvasStampControls>
type StickyQuickCreateProps =
  ComponentProps<typeof CanvasStickyQuickCreateControl>
type InspectorProps = ComponentProps<typeof CanvasObjectInspector>
type PaletteProps = ComponentProps<typeof CanvasComponentPalette>
type ZoomControlsProps = ComponentProps<typeof ZoomControls>
type StatusProps = ComponentProps<typeof CanvasStatus>
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
  findReplace: FindReplaceProps
  imageControls: VisibleProps<ImageControlsProps>
  inspector: VisibleProps<InspectorProps>
  sessionTimer: SessionTimerProps
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
  findReplace,
  imageControls,
  inspector,
  sessionTimer,
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
    useState<CanvasContextCommandMenuState | null>(null)
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
    setContextMenu({ x: event.clientX, y: event.clientY })
  }, [setContextMenu])
  const surfaces = getCanvasAppSurfaceVisibility({
    'canvas-status': showStatus,
    'command-palette': commandPalette.open,
    'component-palette': showComponentPalette,
    'context-command-menu': showToolbar && contextMenu !== null,
    'cursor-chat': cursorChat.visible,
    'drawing-controls': showDrawingControls,
    'emote-controls': emoteControls.visible,
    'find-replace-panel': findReplace.open,
    'image-controls': showImageControls,
    'object-inspector': inspectorHasContent,
    'selection-floating-bar': showToolbar &&
      statusProps.selectionLength > 0 &&
      selectionCommandAnchor !== null,
    'session-timer': sessionTimer.visible,
    'spotlight': spotlight.visible,
    'stamp-controls': showStampControls,
    'sticky-quick-create': showStickyQuickCreate,
    'text-editor': showTextEditor,
    'toolbar': showToolbar,
    'voting-session': votingSession.visible,
    'zoom-controls': showZoomControls,
  })
  const hasTopLeftZone = surfaces.toolbar ||
    surfaces['image-controls'] ||
    surfaces['drawing-controls']
  const hasTopRightZone = surfaces['session-timer'] ||
    surfaces['voting-session'] ||
    (surfaces['stamp-controls'] && stampControlProps.anchor === null)
  const hasRightRailZone = surfaces['component-palette'] ||
    surfaces['object-inspector']
  const hasBottomLeftZone = surfaces['zoom-controls']
  const hasBottomCenterZone = surfaces['emote-controls'] ||
    surfaces['find-replace-panel']
  const hasBottomRightZone = surfaces['canvas-status']

  return (
    <main className="canvas-app" onContextMenuCapture={openContextMenu}>
      {stage}

      {hasTopLeftZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-top-left">
          {surfaces.toolbar ? <CanvasToolbar {...toolbarProps} /> : null}

          {surfaces['image-controls'] || surfaces['drawing-controls'] ? (
            <div className="canvas-floating-row canvas-floating-row-authoring">
              {surfaces['image-controls'] ? (
                <CanvasImageControls {...imageControlProps} />
              ) : null}

              {surfaces['drawing-controls'] ? (
                <CanvasDrawingControls {...drawingControlProps} />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {surfaces.spotlight ? (
        <div className="canvas-floating-zone canvas-floating-zone-top-center">
          <CanvasSpotlight {...spotlight} />
        </div>
      ) : null}

      {hasTopRightZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-top-right">
          {surfaces['session-timer'] ? (
            <CanvasSessionTimer {...sessionTimer} />
          ) : null}

          {surfaces['voting-session'] ? (
            <CanvasVotingSession {...votingSession} />
          ) : null}

          {surfaces['stamp-controls'] && stampControlProps.anchor === null ? (
            <CanvasStampControls {...stampControlProps} />
          ) : null}
        </div>
      ) : null}

      {hasRightRailZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-right-rail">
          {surfaces['object-inspector'] ? (
            <CanvasObjectInspector {...inspectorProps} />
          ) : null}

          {surfaces['component-palette'] ? (
            <CanvasComponentPalette {...componentPaletteProps} />
          ) : null}
        </div>
      ) : null}

      {hasBottomLeftZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-bottom-left">
          <ZoomControls {...zoomControlProps} />
        </div>
      ) : null}

      {hasBottomCenterZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-bottom-center">
          {surfaces['emote-controls'] ? (
            <CanvasEmoteControls {...emoteControls} />
          ) : null}

          {surfaces['find-replace-panel'] ? (
            <CanvasFindReplacePanel {...findReplace} />
          ) : null}
        </div>
      ) : null}

      {hasBottomRightZone ? (
        <div className="canvas-floating-zone canvas-floating-zone-bottom-right">
          <CanvasStatus {...statusProps} />
        </div>
      ) : null}

      {surfaces['stamp-controls'] && stampControlProps.anchor !== null ? (
        <CanvasStampControls {...stampControlProps} />
      ) : null}

      {surfaces['selection-floating-bar'] ? (
        <CanvasSelectionFloatingBar
          anchor={selectionCommandAnchor}
          commandAvailability={toolbarProps.commandAvailability}
          config={toolbarProps.config}
          customCommands={toolbarProps.customCommands}
          commandHandlers={toolbarProps.commandHandlers}
          visible={true}
          onCustomCommand={toolbarProps.onCustomCommand}
        />
      ) : null}

      {surfaces['context-command-menu'] ? (
        <CanvasContextCommandMenu
          commandAvailability={toolbarProps.commandAvailability}
          config={toolbarProps.config}
          customCommands={toolbarProps.customCommands}
          commandHandlers={toolbarProps.commandHandlers}
          menu={contextMenu}
          onClose={closeContextMenu}
          onCustomCommand={toolbarProps.onCustomCommand}
        />
      ) : null}

      {surfaces['command-palette'] ? (
        <CanvasCommandPalette {...commandPalette} />
      ) : null}

      {surfaces['cursor-chat'] ? <CanvasCursorChat {...cursorChat} /> : null}

      {surfaces['sticky-quick-create'] ? (
        <CanvasStickyQuickCreateControl {...stickyQuickCreateProps} />
      ) : null}

      {surfaces['text-editor'] ? <CanvasTextEditor {...textEditorProps} /> : null}
    </main>
  )
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
        '.object-inspector',
        '.text-editor',
      ].join(','),
    ) !== null
}
