import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasFindReplacePanel } from './CanvasFindReplacePanel'

export { CanvasFindReplacePanel } from './CanvasFindReplacePanel'
export {
  CANVAS_FIND_REPLACE_PANEL_MODEL,
  createCanvasFindReplacePanelDescriptor,
  getCanvasFindReplaceMatchCountLabel,
  type CanvasFindReplaceCountStatusAttributes,
  type CanvasFindReplaceMatchCountLabelInput,
  type CanvasFindReplacePanelDescriptor,
  type CanvasFindReplacePanelDescriptorInput,
  type CanvasFindReplacePanelRootAttributes,
  type CanvasFindReplaceQueryInputAttributes,
  type CanvasFindReplaceReplacementInputAttributes,
} from './CanvasFindReplacePanelDescriptor'
export {
  getCanvasFindInputKeyboardIntent,
  type CanvasFindInputKeyboardIntent,
  type CanvasFindInputKeyboardIntentInput,
} from './CanvasFindReplaceKeyboard'
export { getCanvasFindReplaceModel } from './CanvasFindReplaceModel'
export { useCanvasFindReplaceModel } from './useCanvasFindReplaceModel'

export const CANVAS_APP_FIND_REPLACE_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'find-replace',
    label: 'Find replace',
    viewRenderers: {
      findReplacePanel: (props) => createElement(CanvasFindReplacePanel, props),
    },
  })

export const CANVAS_APP_FIND_REPLACE_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'find-replace',
    label: 'Find replace',
    viewFeaturePack: CANVAS_APP_FIND_REPLACE_VIEW_FEATURE_PACK,
  })
