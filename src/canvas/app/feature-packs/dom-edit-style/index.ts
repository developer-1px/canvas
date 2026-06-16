import {
  createCanvasAppExtensionBundle,
} from '../../extensions/CanvasAppExtensionBundle'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePack,
  type CanvasAppFeaturePackId,
} from '../CanvasAppFeaturePacks'
import {
  createCanvasDomEditStyleInspectorPanel,
  type CanvasDomEditStyleOptions,
} from './CanvasDomEditStyle'

export {
  createCanvasDomEditStyleInspectorPanel,
  getCanvasDomEditStyle,
  getCanvasDomEditStyleProperties,
  setCanvasDomEditStyleValue,
  type CanvasDomEditStyle,
  type CanvasDomEditStyleChannel,
  type CanvasDomEditStyleLimit,
  type CanvasDomEditStyleOptions,
} from './CanvasDomEditStyle'

export type CanvasAppDomEditStyleFeaturePackManifestInput = {
  id: CanvasAppFeaturePackId
  itemKind: string
  label?: string
  options?: CanvasDomEditStyleOptions
  targetId: string
  targetLabel?: string
}

export function createCanvasAppDomEditStyleFeaturePackManifest({
  id,
  itemKind,
  label = 'DOM edit style',
  options,
  targetId,
  targetLabel,
}: CanvasAppDomEditStyleFeaturePackManifestInput) {
  return createCanvasAppFeaturePackManifest({
    extensionFeaturePack: createCanvasAppFeaturePack({
      extensionBundle: createCanvasAppExtensionBundle({
        inspectorPanels: [
          createCanvasDomEditStyleInspectorPanel({
            itemKind,
            options,
            targetId,
            targetLabel,
          }),
        ],
      }),
      id,
      label,
    }),
    id,
    label,
  })
}
