import { CanvasSvgStage } from '../../renderer'
import {
  createCanvasAppEventInput,
  createCanvasAppPointerInput,
} from '../interaction/pointer/CanvasAppPointerInput'
import type {
  CanvasAppStageAdapter,
  CanvasAppStageRenderInput,
} from './CanvasAppRenderingContracts'

export type {
  CanvasAppStageAdapter,
  CanvasAppStageMount,
  CanvasAppStageRenderInput,
} from './CanvasAppRenderingContracts'

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
