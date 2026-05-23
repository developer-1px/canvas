import {
  createElement,
  type ComponentProps,
  type ComponentType,
} from 'react'
import type { CanvasAppStageRenderInput } from '../workflow'
import { CanvasComponentPalette } from '../../ui/palette/CanvasComponentPalette'
import { CanvasObjectInspector } from '../../ui/inspector/CanvasObjectInspector'
import { CanvasFindReplacePanel } from '../../ui/search/CanvasFindReplacePanel'
import { CanvasTextEditor } from '../../ui/text/CanvasTextEditor'
import { CanvasToolbar } from '../../ui/toolbar/CanvasToolbar'
import { CanvasStatus } from '../../ui/status/CanvasStatus'
import { ZoomControls } from '../../ui/zoom/ZoomControls'

type ToolbarProps = ComponentProps<typeof CanvasToolbar>
type TextEditorProps = ComponentProps<typeof CanvasTextEditor>
type FindReplaceProps = ComponentProps<typeof CanvasFindReplacePanel>
type InspectorProps = ComponentProps<typeof CanvasObjectInspector>
type PaletteProps = ComponentProps<typeof CanvasComponentPalette>
type ZoomControlsProps = ComponentProps<typeof ZoomControls>
type StatusProps = ComponentProps<typeof CanvasStatus>
type VisibleProps<TProps> = TProps & {
  visible: boolean
}
type StageView = {
  Stage: ComponentType<CanvasAppStageRenderInput>
  props: CanvasAppStageRenderInput
}

type CanvasAppViewProps = {
  componentPalette: PaletteProps
  findReplace: FindReplaceProps
  inspector: InspectorProps
  stage: StageView
  status: VisibleProps<StatusProps>
  textEditor: TextEditorProps
  toolbar: VisibleProps<ToolbarProps>
  zoomControls: VisibleProps<ZoomControlsProps>
}

export function CanvasAppView({
  componentPalette,
  findReplace,
  inspector,
  stage,
  status,
  textEditor,
  toolbar,
  zoomControls,
}: CanvasAppViewProps) {
  const { visible: showToolbar, ...toolbarProps } = toolbar
  const { visible: showZoomControls, ...zoomControlProps } = zoomControls
  const { visible: showStatus, ...statusProps } = status

  return (
    <main className="canvas-app">
      {showToolbar ? <CanvasToolbar {...toolbarProps} /> : null}

      <CanvasComponentPalette {...componentPalette} />

      <CanvasFindReplacePanel {...findReplace} />

      {createElement(stage.Stage, stage.props)}

      <CanvasTextEditor {...textEditor} />

      {showZoomControls ? <ZoomControls {...zoomControlProps} /> : null}

      <CanvasObjectInspector {...inspector} />

      {showStatus ? <CanvasStatus {...statusProps} /> : null}
    </main>
  )
}
