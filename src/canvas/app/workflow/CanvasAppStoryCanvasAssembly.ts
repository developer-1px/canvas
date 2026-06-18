import {
  createCanvasStoryCanvasFeaturePackManifests,
  type CanvasAppFeaturePackMarketplaceListingInput,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackSuiteManifest,
  type CanvasStoryCanvasFeaturePackManifestsInput,
} from '../feature-packs'
import {
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  type CanvasAppFeaturePackAssemblyInput,
  type CanvasAppFeaturePackMarketplaceAssemblyModel,
} from './CanvasAppFeaturePackAssembly'

export type CanvasStoryCanvasFeaturePackAssemblyInput =
  CanvasStoryCanvasFeaturePackManifestsInput & Readonly<{
    assemblyInput?: CanvasAppFeaturePackAssemblyInput
  }>

export type CanvasStoryCanvasFeaturePackMarketplaceAssemblyModelInput =
  CanvasStoryCanvasFeaturePackAssemblyInput & Readonly<{
    listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
    profiles?: readonly CanvasAppFeaturePackProfile[]
    suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
  }>

export function createCanvasStoryCanvasFeaturePackAssemblyInput({
  assemblyInput = {},
  renderGroupItem,
  renderPreviewItem,
}: CanvasStoryCanvasFeaturePackAssemblyInput): CanvasAppFeaturePackAssemblyInput {
  const storyCanvasManifests = createCanvasStoryCanvasFeaturePackManifests({
    renderGroupItem,
    renderPreviewItem,
  })

  return Object.freeze({
    ...assemblyInput,
    additionalFeaturePackManifests:
      mergeCanvasStoryCanvasAdditionalFeaturePackManifests({
        currentManifests: assemblyInput.additionalFeaturePackManifests ?? [],
        storyCanvasManifests,
      }),
  })
}

export function getCanvasStoryCanvasFeaturePackMarketplaceAssemblyModel({
  assemblyInput,
  listings,
  profiles,
  renderGroupItem,
  renderPreviewItem,
  suiteManifests,
}: CanvasStoryCanvasFeaturePackMarketplaceAssemblyModelInput):
  CanvasAppFeaturePackMarketplaceAssemblyModel {
  return getCanvasAppFeaturePackMarketplaceAssemblyModel({
    assemblyInput: createCanvasStoryCanvasFeaturePackAssemblyInput({
      assemblyInput,
      renderGroupItem,
      renderPreviewItem,
    }),
    listings,
    profiles,
    suiteManifests,
  })
}

function mergeCanvasStoryCanvasAdditionalFeaturePackManifests({
  currentManifests,
  storyCanvasManifests,
}: Readonly<{
  currentManifests: readonly CanvasAppFeaturePackManifest[]
  storyCanvasManifests: readonly CanvasAppFeaturePackManifest[]
}>): readonly CanvasAppFeaturePackManifest[] {
  const storyCanvasManifestIds = new Set(
    storyCanvasManifests.map((manifest) => manifest.id),
  )

  return Object.freeze([
    ...currentManifests.filter((manifest) =>
      !storyCanvasManifestIds.has(manifest.id)
    ),
    ...storyCanvasManifests,
  ])
}
