import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { ZoomControls } from './ZoomControls'

export {
  ZoomControls,
  type ZoomControlsProps,
} from './ZoomControls'

export const CANVAS_APP_ZOOM_CONTROLS_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'zoom-controls',
    label: 'Zoom controls',
    viewRenderers: {
      zoomControls: (props) => createElement(ZoomControls, props),
    },
  })

export const CANVAS_APP_ZOOM_CONTROLS_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'zoom-controls',
    label: 'Zoom controls',
    viewFeaturePack: CANVAS_APP_ZOOM_CONTROLS_VIEW_FEATURE_PACK,
  })
