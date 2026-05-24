import type {
  ComponentProps,
  ReactNode,
} from 'react'
import { CanvasComponentPalette } from '../../ui/palette/CanvasComponentPalette'
import { CanvasObjectInspector } from '../../ui/inspector/CanvasObjectInspector'
import { CanvasFindReplacePanel } from '../../ui/search/CanvasFindReplacePanel'
import { CanvasImageControls } from '../../ui/image/CanvasImageControls'
import { CanvasTextEditor } from '../../ui/text/CanvasTextEditor'
import { CanvasToolbar } from '../../ui/toolbar/CanvasToolbar'
import { CanvasStatus } from '../../ui/status/CanvasStatus'
import { ZoomControls } from '../../ui/zoom/ZoomControls'

type ToolbarProps = ComponentProps<typeof CanvasToolbar>
type TextEditorProps = ComponentProps<typeof CanvasTextEditor>
type FindReplaceProps = ComponentProps<typeof CanvasFindReplacePanel>
type ImageControlsProps = ComponentProps<typeof CanvasImageControls>
type InspectorProps = ComponentProps<typeof CanvasObjectInspector>
type PaletteProps = ComponentProps<typeof CanvasComponentPalette>
type ZoomControlsProps = ComponentProps<typeof ZoomControls>
type StatusProps = ComponentProps<typeof CanvasStatus>
type VisibleProps<TProps> = TProps & {
  visible: boolean
}

type CanvasAppViewProps = {
  componentPalette: VisibleProps<PaletteProps>
  findReplace: FindReplaceProps
  imageControls: VisibleProps<ImageControlsProps>
  inspector: VisibleProps<InspectorProps>
  stage: ReactNode
  status: VisibleProps<StatusProps>
  textEditor: VisibleProps<TextEditorProps>
  toolbar: VisibleProps<ToolbarProps>
  zoomControls: VisibleProps<ZoomControlsProps>
}

export function CanvasAppView({
  componentPalette,
  findReplace,
  imageControls,
  inspector,
  stage,
  status,
  textEditor,
  toolbar,
  zoomControls,
}: CanvasAppViewProps) {
  const {
    visible: showComponentPalette,
    ...componentPaletteProps
  } = componentPalette
  const { visible: showInspector, ...inspectorProps } = inspector
  const { visible: showImageControls, ...imageControlProps } = imageControls
  const { visible: showTextEditor, ...textEditorProps } = textEditor
  const { visible: showToolbar, ...toolbarProps } = toolbar
  const { visible: showZoomControls, ...zoomControlProps } = zoomControls
  const { visible: showStatus, ...statusProps } = status

  return (
    <main className="canvas-app">
      {showToolbar ? <CanvasToolbar {...toolbarProps} /> : null}

      {showComponentPalette ? (
        <CanvasComponentPalette {...componentPaletteProps} />
      ) : null}

      <CanvasFindReplacePanel {...findReplace} />

      {showImageControls ? <CanvasImageControls {...imageControlProps} /> : null}

      {stage}

      {showTextEditor ? <CanvasTextEditor {...textEditorProps} /> : null}

      {showZoomControls ? <ZoomControls {...zoomControlProps} /> : null}

      {showInspector ? <CanvasObjectInspector {...inspectorProps} /> : null}

      {showStatus ? <CanvasStatus {...statusProps} /> : null}
    </main>
  )
}
