import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasContextCommandMenu } from './CanvasContextCommandMenu'
import { CanvasToolbar } from './CanvasToolbar'

export {
  CanvasContextCommandMenu,
  type CanvasContextCommandMenuState,
} from './CanvasContextCommandMenu'
export { CanvasToolbar } from './CanvasToolbar'
export {
  CANVAS_MENU_FOCUS_MODEL,
  CANVAS_MENU_ITEM_PROPS,
  CANVAS_MENU_KEYBOARD_KEYS,
  CANVAS_MENU_ROVING_FOCUS_MODEL,
  CANVAS_SELECTION_TOOLBAR_DROPDOWN_MENU_MODEL,
  getCanvasMenuRovingActiveIndex,
  getCanvasMenuRovingKeyIndex,
  getCanvasMenuTriggerKeyboardIntent,
  useCanvasMenuRovingFocus,
  type CanvasMenuRovingActiveIndexInput,
  type CanvasMenuRovingFocusOptions,
  type CanvasMenuRovingKeyIndexInput,
  type CanvasMenuTriggerKeyboardIntent,
  type CanvasMenuTriggerKeyboardIntentInput,
} from './CanvasMenuRovingFocus'
export {
  CANVAS_TOOLBAR_COMMAND_GROUPS,
  type CanvasToolbarCommandAction,
  type CanvasToolbarCommandDescriptor,
  type CanvasToolbarCommandGroupDescriptor,
  type CanvasToolbarCommandGroupId,
} from './CanvasToolbarCommandCatalog'
export type {
  CanvasToolbarCommandHandlers,
} from './CanvasToolbarCommandContracts'
export {
  runCanvasToolbarCommandAction,
} from './CanvasToolbarCommandDispatch'
export {
  getCanvasToolbarCommandGroups,
  type CanvasFeatureCommandSurface,
  type CanvasToolbarCommandGroup,
  type CanvasToolbarCommandItem,
  type CanvasToolbarCommandItemsInput,
} from './CanvasToolbarCommandItems'
export {
  CANVAS_TOOLBAR_FOCUS_MODEL,
  CANVAS_TOOLBAR_ITEM_PROPS,
  CANVAS_TOOLBAR_KEYBOARD_MODEL,
  CANVAS_TOOLBAR_ROVING_FOCUS_MODEL,
  useCanvasToolbarRovingFocus,
} from './CanvasToolbarRovingFocus'
export {
  getCanvasToolbarToolItems,
  type CanvasToolbarCustomTool,
  type CanvasToolbarToolItem,
  type CanvasToolbarToolItemsInput,
} from './CanvasToolbarToolItems'

export const CANVAS_APP_TOOLBAR_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'toolbar',
    label: 'Toolbar',
  viewRenderers: {
    contextCommandMenu: (props) =>
      createElement(CanvasContextCommandMenu, props),
    toolbar: (props) => createElement(CanvasToolbar, props),
  },
})

export const CANVAS_APP_TOOLBAR_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'toolbar',
    label: 'Toolbar',
    viewFeaturePack: CANVAS_APP_TOOLBAR_VIEW_FEATURE_PACK,
  })
