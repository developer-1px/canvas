import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasStampControls } from './CanvasStampControls'

export {
  CANVAS_STAMP_DEFINITIONS,
  type CanvasStampDefinition,
} from './CanvasStampCatalog'
export {
  CanvasStampControls,
  type CanvasStampControlsProps,
} from './CanvasStampControls'
export {
  getCanvasStampInsertPlacement,
  insertCanvasStamp,
  type CanvasStampInsertPlacement,
  type CanvasStampInsertPlacementInput,
  type CanvasStampInsertionContext,
} from './CanvasStampInsertion'
export {
  useCanvasStampControls,
  type CanvasStampControlsInput,
  type CanvasStampControlsModel,
} from './useCanvasStampControls'

export const CANVAS_APP_STAMP_AUTHORING_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'stamp-authoring',
    label: 'Stamp authoring',
    viewRenderers: {
      stampControls: (props) => createElement(CanvasStampControls, props),
    },
  })

export const CANVAS_APP_STAMP_AUTHORING_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'stamp-authoring',
    label: 'Stamp authoring',
    viewFeaturePack: CANVAS_APP_STAMP_AUTHORING_VIEW_FEATURE_PACK,
  })
