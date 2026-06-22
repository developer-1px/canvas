import type {
  ComponentProps,
  ReactNode,
} from 'react'
import type {
  CanvasObjectInspector,
} from '../affordances/editing/inspector/CanvasObjectInspector'
import type {
  CanvasTextEditor,
} from '../affordances/editing/text-editor/CanvasTextEditor'
import type {
  CanvasAppCommandPaletteProps,
  CanvasAppComponentPaletteProps,
  CanvasAppContextCommandMenuState,
  CanvasAppCursorChatProps,
  CanvasAppDrawingControlsProps,
  CanvasAppEmoteControlsProps,
  CanvasAppFeaturePackViewRenderers,
  CanvasAppFindReplacePanelProps,
  CanvasAppImageControlsProps,
  CanvasAppMinimapProps,
  CanvasAppSelectionFloatingBarProps,
  CanvasAppSessionTimerProps,
  CanvasAppShortcutHelpOverlayProps,
  CanvasAppSpotlightProps,
  CanvasAppStampControlsProps,
  CanvasAppStatusProps,
  CanvasAppStickyQuickCreateControlProps,
  CanvasAppToolbarProps,
  CanvasAppVotingSessionProps,
  CanvasAppZoomControlsProps,
} from '../feature-packs'

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
type MinimapProps = CanvasAppMinimapProps
type StampControlsProps = CanvasAppStampControlsProps
type StickyQuickCreateProps = CanvasAppStickyQuickCreateControlProps
type InspectorProps = ComponentProps<typeof CanvasObjectInspector>
type PaletteProps = CanvasAppComponentPaletteProps
type ZoomControlsProps = CanvasAppZoomControlsProps
type StatusProps = CanvasAppStatusProps

type VisibleProps<TProps> = TProps & {
  visible: boolean
}

type ToolbarViewProps = VisibleProps<ToolbarProps> & {
  selectionCommandAnchor: SelectionFloatingBarProps['anchor']
}

export type CanvasAppViewProps = {
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

export type CanvasAppViewContextMenuState = CanvasAppContextCommandMenuState
