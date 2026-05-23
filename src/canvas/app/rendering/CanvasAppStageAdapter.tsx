import type {
  ComponentType,
  PointerEvent,
  ReactNode,
  RefCallback,
} from 'react'
import type {
  CanvasInteractionKind,
  ResizeHandle,
  Tool,
  Viewport,
} from '../../core'
import type { CanvasOverlayState } from '../../engine'
import { CanvasSvgStage } from '../../renderer'

export type CanvasAppStageMount = {
  ref: RefCallback<SVGSVGElement>
}

export type CanvasAppStageRenderInput = {
  activeMode: Tool
  children?: ReactNode
  gesture: CanvasInteractionKind
  overlays: CanvasOverlayState
  stageElement: CanvasAppStageMount
  viewport: Viewport
  onCanvasPointerDown: (event: PointerEvent<SVGSVGElement>) => void
  onContextMenu: (event: PointerEvent<SVGSVGElement>) => void
  onPointerCancel: (event: PointerEvent<SVGSVGElement>) => void
  onPointerMove: (event: PointerEvent<SVGSVGElement>) => void
  onPointerUp: (event: PointerEvent<SVGSVGElement>) => void
  onResizePointerDown: (
    event: PointerEvent<SVGRectElement>,
    handle: ResizeHandle,
  ) => void
}

export type CanvasAppStageAdapter = {
  Stage: ComponentType<CanvasAppStageRenderInput>
}

export const DEFAULT_CANVAS_APP_STAGE_ADAPTER: CanvasAppStageAdapter =
  Object.freeze({
    Stage: renderCanvasAppSvgStage,
  })

function renderCanvasAppSvgStage({
  stageElement,
  ...props
}: CanvasAppStageRenderInput) {
  return <CanvasSvgStage {...props} onStageElement={stageElement.ref} />
}
