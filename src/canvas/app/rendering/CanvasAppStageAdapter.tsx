import type {
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
import {
  createCanvasAppEventInput,
  createCanvasAppPointerInput,
  type CanvasAppEventInput,
  type CanvasAppPointerInput,
} from '../pointer/CanvasAppPointerInput'

export type CanvasAppStageMount = {
  ref: RefCallback<Element>
}

export type CanvasAppStageRenderInput = {
  activeMode: Tool
  children?: ReactNode
  gesture: CanvasInteractionKind
  overlays: CanvasOverlayState
  stageElement: CanvasAppStageMount
  viewport: Viewport
  onCanvasPointerDown: (event: CanvasAppPointerInput) => void
  onContextMenu: (event: CanvasAppEventInput) => void
  onPointerCancel: (event: CanvasAppPointerInput) => void
  onPointerMove: (event: CanvasAppPointerInput) => void
  onPointerUp: (event: CanvasAppPointerInput) => void
  onResizePointerDown: (
    event: CanvasAppPointerInput,
    handle: ResizeHandle,
  ) => void
}

export type CanvasAppStageAdapter = {
  renderStage: (input: CanvasAppStageRenderInput) => ReactNode
}

export const DEFAULT_CANVAS_APP_STAGE_ADAPTER: CanvasAppStageAdapter =
  Object.freeze({
    renderStage: renderCanvasAppSvgStage,
  })

function renderCanvasAppSvgStage({
  onCanvasPointerDown,
  onContextMenu,
  onPointerCancel,
  onPointerMove,
  onPointerUp,
  onResizePointerDown,
  stageElement,
  ...props
}: CanvasAppStageRenderInput) {
  return (
    <CanvasSvgStage
      {...props}
      onStageElement={stageElement.ref}
      onCanvasPointerDown={(event) =>
        onCanvasPointerDown(createCanvasAppPointerInput(event))
      }
      onContextMenu={(event) =>
        onContextMenu(createCanvasAppEventInput(event))
      }
      onPointerCancel={(event) =>
        onPointerCancel(createCanvasAppPointerInput(event))
      }
      onPointerMove={(event) =>
        onPointerMove(createCanvasAppPointerInput(event))
      }
      onPointerUp={(event) =>
        onPointerUp(createCanvasAppPointerInput(event))
      }
      onResizePointerDown={(event, handle) =>
        onResizePointerDown(createCanvasAppPointerInput(event), handle)
      }
    />
  )
}
