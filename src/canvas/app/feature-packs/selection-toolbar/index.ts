import { createElement } from 'react'
import {
  defineCanvasAppFeaturePack,
} from '../defineCanvasAppFeaturePack'
import { CanvasSelectionFloatingBar } from './CanvasSelectionFloatingBar'

export { CanvasSelectionFloatingBar } from './CanvasSelectionFloatingBar'

export const CANVAS_APP_SELECTION_TOOLBAR_FEATURE_PACK_MANIFEST =
  defineCanvasAppFeaturePack({
    id: 'selection-toolbar',
    label: 'Selection toolbar',
    viewRenderers: {
      selectionFloatingBar: (props) =>
        createElement(CanvasSelectionFloatingBar, props),
    },
  })

export const CANVAS_APP_SELECTION_TOOLBAR_VIEW_FEATURE_PACK =
  CANVAS_APP_SELECTION_TOOLBAR_FEATURE_PACK_MANIFEST.viewFeaturePack!
