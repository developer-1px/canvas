import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasStatus } from './CanvasStatus'

export {
  CanvasStatus,
  type CanvasStatusProps,
} from './CanvasStatus'
export { getCanvasStatusModel } from './CanvasStatusModel'

export const CANVAS_APP_STATUS_BAR_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'status-bar',
    label: 'Status bar',
    viewRenderers: {
      status: (props) => createElement(CanvasStatus, props),
    },
  })

export const CANVAS_APP_STATUS_BAR_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'status-bar',
    label: 'Status bar',
    viewFeaturePack: CANVAS_APP_STATUS_BAR_VIEW_FEATURE_PACK,
  })
