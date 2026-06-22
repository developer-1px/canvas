import {
  createCanvasAppExtensionBundle,
} from '../../extensions/CanvasAppExtensionBundle'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePack,
} from '../CanvasAppFeaturePacks'
import {
  CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY,
} from '../component-library'
import {
  CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER,
} from './CanvasComponentSyncItemsChangeTransformer'

export {
  CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER,
  syncCanvasComponentItemsChange,
} from './CanvasComponentSyncItemsChangeTransformer'

export const CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK =
  createCanvasAppFeaturePack({
    extensionBundle: createCanvasAppExtensionBundle({
      itemsChangeTransformers: [CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER],
    }),
    id: 'component-sync',
    label: 'Component sync',
  })

export const CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'foundation',
    contributes: {
      surfaces: ['document-change'],
    },
    extensionFeaturePack: CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK,
    id: 'component-sync',
    label: 'Component sync',
    lifecycle: {
      hotReloadable: true,
      orphanedDataPolicy: 'preserve',
      partialUpdate: ['document-change'],
      runtimeToggleable: true,
    },
    requires: [CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY],
  })
