import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasDrawingControls } from './CanvasDrawingControls'
import { useCanvasAppDrawingModel } from './useCanvasAppDrawingModel'

export {
  CanvasDrawingControls,
  type CanvasDrawingControlsProps,
  type CanvasDrawingControlStyle,
} from './CanvasDrawingControls'
export { useCanvasAppDrawingModel } from './useCanvasAppDrawingModel'

export const CANVAS_APP_DRAWING_TOOLS_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'drawing-tools',
    label: 'Drawing tools',
    viewRenderers: {
      drawingControls: (props) => createElement(CanvasDrawingControls, props),
    },
  })

export const CANVAS_APP_DRAWING_TOOLS_RUNTIME_FEATURE_PACK = Object.freeze({
  disabledConfig: {
    overlays: {
      drawingControls: false,
    },
  },
  featurePackId: 'drawing-tools',
  id: 'drawing-tools',
  useModel: useCanvasAppDrawingModel,
})

export const CANVAS_APP_DRAWING_TOOLS_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'drawing-tools',
    label: 'Drawing tools',
    runtimeFeaturePacks: {
      drawing: CANVAS_APP_DRAWING_TOOLS_RUNTIME_FEATURE_PACK,
    },
    viewFeaturePack: CANVAS_APP_DRAWING_TOOLS_VIEW_FEATURE_PACK,
  })
