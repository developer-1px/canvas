import { createElement } from 'react'
import {
  defineCanvasAppFeaturePack,
} from '../defineCanvasAppFeaturePack'
import { CanvasMinimap } from './CanvasMinimap'

export {
  CanvasMinimap,
  type CanvasMinimapProps,
} from './CanvasMinimap'
export {
  CANVAS_MINIMAP_READ_MODEL,
  CANVAS_MINIMAP_DEFAULT_SIZE,
  getCanvasMinimapPointFromViewportOffset,
  getCanvasMinimapReadModel,
  getCanvasMinimapViewportForWorldCenter,
  getCanvasMinimapWorldPoint,
  type CanvasMinimapItemBounds,
  type CanvasMinimapItemRect,
  type CanvasMinimapReadModel,
  type CanvasMinimapSize,
} from './CanvasMinimapModel'

export const CANVAS_APP_MINIMAP_FEATURE_PACK_MANIFEST =
  defineCanvasAppFeaturePack({
    id: 'minimap',
    label: 'Minimap',
    viewRenderers: {
      minimap: (props) => createElement(CanvasMinimap, props),
    },
  })

export const CANVAS_APP_MINIMAP_VIEW_FEATURE_PACK =
  CANVAS_APP_MINIMAP_FEATURE_PACK_MANIFEST.viewFeaturePack!
