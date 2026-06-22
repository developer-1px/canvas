import type {
  CanvasAppFeaturePackMarketplaceAction,
} from './CanvasAppFeaturePackActions'
import type {
  CanvasAppFeaturePackContributionSurface,
} from './CanvasAppFeaturePackManifests'
import type {
  CanvasAppFeaturePackMarketplacePackageContract,
  CanvasAppFeaturePackMarketplacePackageState,
} from './CanvasAppFeaturePackMarketplacePackages'
import type {
  CanvasAppFeaturePackMarketplaceItem,
  CanvasAppFeaturePackMarketplaceModel,
  CanvasAppFeaturePackMarketplaceSection,
  CanvasAppFeaturePackMarketplaceSectionFacet,
  CanvasAppFeaturePackMarketplaceSectionFacetKind,
  CanvasAppFeaturePackMarketplaceSectionKind,
  CanvasAppFeaturePackMarketplaceSectionSummary,
} from './CanvasAppFeaturePackMarketplaceSections'
import type {
  CanvasAppFeaturePackProfileMarketplaceAction,
} from './CanvasAppFeaturePackProfileActions'
import type {
  CanvasAppFeaturePackProfileId,
} from './CanvasAppFeaturePackProfiles'
import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
} from './CanvasAppFeaturePackStateTransitionPlan'
import type {
  CanvasAppFeaturePackSuiteMarketplaceAction,
} from './CanvasAppFeaturePackSuiteActions'
import type {
  CanvasAppFeaturePackSuiteId,
} from './CanvasAppFeaturePackSuites'

export type CanvasAppFeaturePackMarketplaceTarget =
  | CanvasAppFeaturePackMarketplacePackTarget
  | CanvasAppFeaturePackMarketplaceProfileTarget
  | CanvasAppFeaturePackMarketplaceSuiteTarget

export type CanvasAppFeaturePackMarketplacePackTarget = Readonly<{
  featurePackId: CanvasAppFeaturePackId
  kind: 'pack'
}>

export type CanvasAppFeaturePackMarketplaceProfileTarget = Readonly<{
  kind: 'profile'
  profileId: CanvasAppFeaturePackProfileId
}>

export type CanvasAppFeaturePackMarketplaceSuiteTarget = Readonly<{
  kind: 'suite'
  suiteId: CanvasAppFeaturePackSuiteId
}>

export type CanvasAppFeaturePackMarketplaceTargetItemInput = Readonly<{
  model: CanvasAppFeaturePackMarketplaceModel
  target: CanvasAppFeaturePackMarketplaceTarget
}>

export type CanvasAppFeaturePackMarketplacePrimaryAction =
  | CanvasAppFeaturePackMarketplaceAction
  | CanvasAppFeaturePackProfileMarketplaceAction
  | CanvasAppFeaturePackSuiteMarketplaceAction

export type CanvasAppFeaturePackMarketplacePrimaryActionKind =
  CanvasAppFeaturePackMarketplacePrimaryAction['kind']

export type CanvasAppFeaturePackMarketplacePrimaryActionStatus =
  CanvasAppFeaturePackMarketplacePrimaryAction['status']

export type CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic =
  Readonly<{
    action: CanvasAppFeaturePackMarketplacePrimaryAction
    actionKind: CanvasAppFeaturePackMarketplacePrimaryActionKind
    applicable: boolean
    blockedReasonCount: number
    changedFeaturePackIds: readonly CanvasAppFeaturePackId[]
    marketplaceBlockedReasonCount: number
    partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
    ready: boolean
    status: CanvasAppFeaturePackMarketplacePrimaryActionStatus
    totalBlockedReasonCount: number
    uninstallPolicyEntries:
      readonly CanvasAppFeaturePackStateTransitionUninstallPolicyEntry[]
  }>

export type CanvasAppFeaturePackMarketplaceTargetControlStatus =
  | CanvasAppFeaturePackMarketplacePrimaryActionStatus
  | 'missing'

export type CanvasAppFeaturePackMarketplaceTargetControl = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction | null
  actionKind: CanvasAppFeaturePackMarketplacePrimaryActionKind | null
  active: boolean
  diagnostic: CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic | null
  disabled: boolean
  installed: boolean
  item: CanvasAppFeaturePackMarketplaceItem | null
  label: string
  packageContract: CanvasAppFeaturePackMarketplacePackageContract | null
  packageState: CanvasAppFeaturePackMarketplacePackageState | null
  ready: boolean
  status: CanvasAppFeaturePackMarketplaceTargetControlStatus
  target: CanvasAppFeaturePackMarketplaceTarget
  totalBlockedReasonCount: number
}>

export type CanvasAppFeaturePackMarketplaceTargetControlInput =
  CanvasAppFeaturePackMarketplaceTargetItemInput

export type CanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel =
  Readonly<{
    all: readonly CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic[]
    blocked: readonly CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic[]
    ready: readonly CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic[]
  }>

export type CanvasAppFeaturePackMarketplaceSectionControlModel = Readonly<{
  controls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
  diagnostics: CanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel
  facets: readonly CanvasAppFeaturePackMarketplaceSectionFacet[]
  kind: CanvasAppFeaturePackMarketplaceSectionKind
  label: string
  section: CanvasAppFeaturePackMarketplaceSection
  summary: CanvasAppFeaturePackMarketplaceSectionSummary
}>

export type CanvasAppFeaturePackMarketplaceSelectionControlModelInput =
  Readonly<{
    facetKind?: CanvasAppFeaturePackMarketplaceSectionFacetKind | string
    model: CanvasAppFeaturePackMarketplaceModel
    sectionKind?: CanvasAppFeaturePackMarketplaceSectionKind | string
  }>

export type CanvasAppFeaturePackMarketplaceSelectionTargetControlInput =
  Readonly<{
    selection: CanvasAppFeaturePackMarketplaceSelectionControlModel
    target: CanvasAppFeaturePackMarketplaceTarget
  }>

export type CanvasAppFeaturePackMarketplaceSelectionControlModelStatus =
  | 'empty'
  | 'fallback'
  | 'selected'

export type CanvasAppFeaturePackMarketplaceSelectionFallbackReason =
  | 'missing-facet'
  | 'missing-section'

export type CanvasAppFeaturePackMarketplaceSectionSelectionControl =
  Readonly<{
    count: number
    kind: CanvasAppFeaturePackMarketplaceSectionKind
    label: string
    section: CanvasAppFeaturePackMarketplaceSection
    selected: boolean
  }>

export type CanvasAppFeaturePackMarketplaceFacetSelectionControl =
  CanvasAppFeaturePackMarketplaceSectionFacet & Readonly<{
    selected: boolean
  }>

export type CanvasAppFeaturePackMarketplaceSelectionControlModel =
  Readonly<{
    controls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
    facetControls: readonly CanvasAppFeaturePackMarketplaceFacetSelectionControl[]
    fallbackReasons:
      readonly CanvasAppFeaturePackMarketplaceSelectionFallbackReason[]
    requestedFacetKind:
      | CanvasAppFeaturePackMarketplaceSectionFacetKind
      | string
      | undefined
    requestedSectionKind:
      | CanvasAppFeaturePackMarketplaceSectionKind
      | string
      | undefined
    sectionControlModel: CanvasAppFeaturePackMarketplaceSectionControlModel | null
    sectionControls: readonly CanvasAppFeaturePackMarketplaceSectionSelectionControl[]
    selectedFacet: CanvasAppFeaturePackMarketplaceSectionFacet | null
    selectedFacetKind: CanvasAppFeaturePackMarketplaceSectionFacetKind | null
    selectedSection: CanvasAppFeaturePackMarketplaceSection | null
    selectedSectionKind: CanvasAppFeaturePackMarketplaceSectionKind | null
    status: CanvasAppFeaturePackMarketplaceSelectionControlModelStatus
  }>

export type CanvasAppFeaturePackMarketplaceSelectionExecutionStatus =
  | 'empty'
  | 'held'
  | 'ready'

export type CanvasAppFeaturePackMarketplaceSelectionExecutionSummary =
  Readonly<{
    blockedControlCount: number
    controlCount: number
    heldControlCount: number
    readyControlCount: number
    totalBlockedReasonCount: number
  }>

export type CanvasAppFeaturePackMarketplaceSelectionExecutionModel =
  Readonly<{
    blockedControls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
    blockedTargets: readonly CanvasAppFeaturePackMarketplaceTarget[]
    controls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
    disabled: boolean
    heldControls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
    heldTargets: readonly CanvasAppFeaturePackMarketplaceTarget[]
    ready: boolean
    readyControls: readonly CanvasAppFeaturePackMarketplaceTargetControl[]
    readyTargets: readonly CanvasAppFeaturePackMarketplaceTarget[]
    selection: CanvasAppFeaturePackMarketplaceSelectionControlModel
    status: CanvasAppFeaturePackMarketplaceSelectionExecutionStatus
    summary: CanvasAppFeaturePackMarketplaceSelectionExecutionSummary
    targets: readonly CanvasAppFeaturePackMarketplaceTarget[]
  }>
