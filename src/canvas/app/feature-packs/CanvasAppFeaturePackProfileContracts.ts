import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePackContracts'
import type {
  CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePackRuntimeStateContracts'
import type {
  CanvasAppFeaturePackSuiteId,
  CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

export type CanvasAppFeaturePackProfileId = string

export type CanvasAppFeaturePackProfile = Readonly<{
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  enabledSuiteIds: readonly CanvasAppFeaturePackSuiteId[]
  id: CanvasAppFeaturePackProfileId
  installedFeaturePackIds: readonly CanvasAppFeaturePackId[]
  installedSuiteIds: readonly CanvasAppFeaturePackSuiteId[]
  label: string
}>

export type CanvasAppFeaturePackProfileInput = Readonly<{
  enabledFeaturePackIds?: readonly CanvasAppFeaturePackId[]
  enabledSuiteIds?: readonly CanvasAppFeaturePackSuiteId[]
  id: CanvasAppFeaturePackProfileId
  installedFeaturePackIds?: readonly CanvasAppFeaturePackId[]
  installedSuiteIds?: readonly CanvasAppFeaturePackSuiteId[]
  label: string
  suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
}>

export type CanvasAppFeaturePackProfileRuntimeStatesInput = Readonly<{
  featurePackIds: readonly CanvasAppFeaturePackId[]
  profile: CanvasAppFeaturePackProfile
}>

export type CanvasAppFeaturePackProfileRuntimeStateInput =
  CanvasAppFeaturePackRuntimeStateInput
