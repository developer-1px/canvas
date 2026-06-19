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
  CANVAS_COMMAND_PALETTE_ITEMS_MODEL,
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
  type CanvasCommandPaletteKeyboardItem,
} from './CanvasCommandPaletteKeyboard'
export {
  createCanvasCommandPaletteListboxDescriptor,
  type CanvasCommandPaletteEmptyAttributes,
  type CanvasCommandPaletteListboxDescriptor,
  type CanvasCommandPaletteListboxDescriptorInput,
  type CanvasCommandPaletteListboxItem,
  type CanvasCommandPaletteListboxOptionDescriptor,
  type CanvasCommandPaletteListboxRootAttributes,
  type CanvasCommandPaletteOptionAttributes,
} from './CanvasCommandPaletteListbox'

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
