import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
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

export const CANVAS_APP_MINIMAP_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'minimap',
    label: 'Minimap',
    viewRenderers: {
      minimap: (props) => createElement(CanvasMinimap, props),
    },
  })

export const CANVAS_APP_MINIMAP_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'minimap',
    label: 'Minimap',
    viewFeaturePack: CANVAS_APP_MINIMAP_VIEW_FEATURE_PACK,
  })
