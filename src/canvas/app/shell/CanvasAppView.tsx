import type {
  ComponentProps,
  ReactNode,
} from 'react'
import { CanvasComponentPalette } from '../../ui/palette/CanvasComponentPalette'
import { CanvasCursorChat } from '../../ui/cursor/CanvasCursorChat'
import { CanvasDrawingControls } from '../../ui/drawing/CanvasDrawingControls'
import { CanvasEmoteControls } from '../../ui/emote/CanvasEmoteControls'
import { CanvasSessionTimer } from '../../ui/facilitation/CanvasSessionTimer'
import { CanvasSpotlight } from '../../ui/facilitation/CanvasSpotlight'
import { CanvasVotingSession } from '../../ui/facilitation/CanvasVotingSession'
import { CanvasObjectInspector } from '../../ui/inspector/CanvasObjectInspector'
import { CanvasFindReplacePanel } from '../../ui/search/CanvasFindReplacePanel'
import { CanvasImageControls } from '../../ui/image/CanvasImageControls'
import { CanvasStampControls } from '../../ui/stamp/CanvasStampControls'
import { CanvasStickyQuickCreateControl } from '../../ui/sticky/CanvasStickyQuickCreateControl'
import { CanvasTextEditor } from '../../ui/text/CanvasTextEditor'
import { CanvasToolbar } from '../../ui/toolbar/CanvasToolbar'
import { CanvasStatus } from '../../ui/status/CanvasStatus'
import { ZoomControls } from '../../ui/zoom/ZoomControls'

type ToolbarProps = ComponentProps<typeof CanvasToolbar>
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

type CanvasAppViewProps = {
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
  toolbar: VisibleProps<ToolbarProps>
  votingSession: VotingSessionProps
  zoomControls: VisibleProps<ZoomControlsProps>
}

export function CanvasAppView({
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
  const { visible: showToolbar, ...toolbarProps } = toolbar
  const { visible: showZoomControls, ...zoomControlProps } = zoomControls
  const { visible: showStatus, ...statusProps } = status

  return (
    <main className="canvas-app">
      {showToolbar ? <CanvasToolbar {...toolbarProps} /> : null}

      <CanvasSessionTimer {...sessionTimer} />

      <CanvasSpotlight {...spotlight} />

      <CanvasVotingSession {...votingSession} />

      {showComponentPalette ? (
        <CanvasComponentPalette {...componentPaletteProps} />
      ) : null}

      {showDrawingControls ? (
        <CanvasDrawingControls {...drawingControlProps} />
      ) : null}

      <CanvasEmoteControls {...emoteControls} />

      <CanvasFindReplacePanel {...findReplace} />

      {showImageControls ? <CanvasImageControls {...imageControlProps} /> : null}

      {showStampControls ? <CanvasStampControls {...stampControlProps} /> : null}

      {stage}

      <CanvasCursorChat {...cursorChat} />

      {showStickyQuickCreate ? (
        <CanvasStickyQuickCreateControl {...stickyQuickCreateProps} />
      ) : null}

      {showTextEditor ? <CanvasTextEditor {...textEditorProps} /> : null}

      {showZoomControls ? <ZoomControls {...zoomControlProps} /> : null}

      {showInspector ? <CanvasObjectInspector {...inspectorProps} /> : null}

      {showStatus ? <CanvasStatus {...statusProps} /> : null}
    </main>
  )
}
