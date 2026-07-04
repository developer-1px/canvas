import { createElement } from 'react'
import {
  type CanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
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
  getCanvasAppMinimapViewFeaturePack()

function getCanvasAppMinimapViewFeaturePack(): CanvasAppViewFeaturePack {
  const { viewFeaturePack } = CANVAS_APP_MINIMAP_FEATURE_PACK_MANIFEST

  if (viewFeaturePack === undefined) {
    throw new Error('Feature pack minimap must provide viewRenderers')
  }

  return viewFeaturePack
}
