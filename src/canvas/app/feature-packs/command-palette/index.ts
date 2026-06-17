import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasCommandPalette } from './CanvasCommandPalette'

export { CanvasCommandPalette } from './CanvasCommandPalette'
export {
  filterCanvasCommandPaletteItems,
  getCanvasCommandPaletteItems,
  type CanvasCommandPaletteComponent,
  type CanvasCommandPaletteItem,
  type CanvasCommandPaletteItemsInput,
} from './CanvasCommandPaletteItems'
export {
  getCanvasCommandPaletteKeyboardIntent,
  type CanvasCommandPaletteKeyboardIntent,
  type CanvasCommandPaletteKeyboardIntentInput,
} from './CanvasCommandPaletteKeyboard'

export const CANVAS_APP_COMMAND_PALETTE_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'command-palette',
    label: 'Command palette',
    viewRenderers: {
      commandPalette: (props) => createElement(CanvasCommandPalette, props),
    },
  })

export const CANVAS_APP_COMMAND_PALETTE_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'command-palette',
    label: 'Command palette',
    viewFeaturePack: CANVAS_APP_COMMAND_PALETTE_VIEW_FEATURE_PACK,
  })
