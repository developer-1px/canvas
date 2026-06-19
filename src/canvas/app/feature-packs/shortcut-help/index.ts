import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasShortcutHelpOverlay } from './CanvasShortcutHelpOverlay'

export {
  getCanvasShortcutHelpItems,
  groupCanvasShortcutHelpItems,
  type CanvasShortcutHelpItem,
  type CanvasShortcutHelpItemsInput,
  type CanvasShortcutHelpSection,
  type CanvasShortcutHelpSectionGroup,
} from './CanvasShortcutHelpItems'
export {
  createCanvasShortcutHelpDialogDescriptor,
  type CanvasShortcutHelpDialogDescriptor,
  type CanvasShortcutHelpDialogDescriptorInput,
  type CanvasShortcutHelpDialogHeadingAttributes,
  type CanvasShortcutHelpDialogRootAttributes,
  type CanvasShortcutHelpSectionDescriptor,
  type CanvasShortcutHelpSectionRootAttributes,
} from './CanvasShortcutHelpDialog'
export { CanvasShortcutHelpOverlay } from './CanvasShortcutHelpOverlay'

export const CANVAS_APP_SHORTCUT_HELP_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'shortcut-help',
    label: 'Shortcut help',
    viewRenderers: {
      shortcutHelp: (props) =>
        createElement(CanvasShortcutHelpOverlay, props),
    },
  })

export const CANVAS_APP_SHORTCUT_HELP_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'shortcut-help',
    label: 'Shortcut help',
    viewFeaturePack: CANVAS_APP_SHORTCUT_HELP_VIEW_FEATURE_PACK,
  })
