import {
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import {
  createCanvasAppExtensionBundle,
  type CanvasAppExtensionBundleInput,
} from '../extensions/CanvasAppExtensionBundle'
import {
  createCanvasAppFeaturePack,
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import {
  createCanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
  type CanvasAppFeaturePackViewRenderers,
} from './CanvasAppFeaturePackViews'

export type CanvasAppFeaturePackDefinition = Readonly<{
  extensions?: CanvasAppExtensionBundleInput
  id: CanvasAppFeaturePackId
  label: string
  viewRenderers?: CanvasAppFeaturePackViewRenderers
}>

export function defineCanvasAppFeaturePack(
  definition: CanvasAppFeaturePackDefinition,
): CanvasAppFeaturePackManifest {
  const { extensions, id, label, viewRenderers } = definition

  assertCanvasAppExtensionId({ id, label: 'feature pack' })
  assertCanvasAppDescriptorStringField({
    field: 'label',
    owner: `feature pack ${id}`,
    value: label,
  })

  if (extensions === undefined && viewRenderers === undefined) {
    throw new Error(`Feature pack ${id} must provide extensions or viewRenderers`)
  }

  const extensionFeaturePack =
    extensions === undefined
      ? undefined
      : createCanvasAppFeaturePack({
          extensionBundle: createCanvasAppExtensionBundle(extensions),
          id,
          label,
        })
  const viewFeaturePack =
    viewRenderers === undefined
      ? undefined
      : createCanvasAppViewFeaturePack({
          id,
          label,
          viewRenderers,
        })

  return createCanvasAppFeaturePackManifest({
    extensionFeaturePack,
    id,
    label,
    viewFeaturePack,
  })
}
