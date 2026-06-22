import type {
  CanvasAppFeaturePackMarketplaceActionItem,
  CanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActions'
import type {
  CanvasAppFeaturePackProfileMarketplaceActionItem,
  CanvasAppFeaturePackProfileMarketplaceActionModel,
} from './CanvasAppFeaturePackProfileActions'
import type {
  CanvasAppFeaturePackSuiteMarketplaceActionItem,
  CanvasAppFeaturePackSuiteMarketplaceActionModel,
} from './CanvasAppFeaturePackSuiteActions'

export type CanvasAppFeaturePackMarketplaceSectionKind =
  | 'packs'
  | 'profiles'
  | 'suites'

export type CanvasAppFeaturePackMarketplaceModel = Readonly<{
  packs: CanvasAppFeaturePackMarketplaceActionModel
  profiles: CanvasAppFeaturePackProfileMarketplaceActionModel
  sections: readonly CanvasAppFeaturePackMarketplaceSection[]
  suites: CanvasAppFeaturePackSuiteMarketplaceActionModel
}>

export type CanvasAppFeaturePackMarketplaceSection =
  | CanvasAppFeaturePackMarketplacePackSection
  | CanvasAppFeaturePackMarketplaceProfileSection
  | CanvasAppFeaturePackMarketplaceSuiteSection

export type CanvasAppFeaturePackMarketplaceProfileSection = Readonly<{
  facets: readonly CanvasAppFeaturePackMarketplaceSectionFacet<
    CanvasAppFeaturePackMarketplaceProfileSectionFacetKind
  >[]
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
  kind: 'profiles'
  label: string
  summary: CanvasAppFeaturePackMarketplaceProfileSectionSummary
}>

export type CanvasAppFeaturePackMarketplaceSuiteSection = Readonly<{
  facets: readonly CanvasAppFeaturePackMarketplaceSectionFacet<
    CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind
  >[]
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
  kind: 'suites'
  label: string
  summary: CanvasAppFeaturePackMarketplaceSuiteSectionSummary
}>

export type CanvasAppFeaturePackMarketplacePackSection = Readonly<{
  facets: readonly CanvasAppFeaturePackMarketplaceSectionFacet<
    CanvasAppFeaturePackMarketplacePackSectionFacetKind
  >[]
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[]
  kind: 'packs'
  label: string
  summary: CanvasAppFeaturePackMarketplacePackSectionSummary
}>

export type CanvasAppFeaturePackMarketplaceProfileSectionFacetKind =
  | 'active'
  | 'all'
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind =
  | 'all'
  | 'blocked'
  | 'enabled'
  | 'ready'

export type CanvasAppFeaturePackMarketplacePackSectionFacetKind =
  | 'activation-failed'
  | 'all'
  | 'blocked'
  | 'enabled'
  | 'installed'
  | 'paid'
  | 'partially-updated'
  | 'private'
  | 'ready'
  | 'rollback-available'
  | 'updating'

export type CanvasAppFeaturePackMarketplaceSectionFacetKind =
  | CanvasAppFeaturePackMarketplacePackSectionFacetKind
  | CanvasAppFeaturePackMarketplaceProfileSectionFacetKind
  | CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind

export type CanvasAppFeaturePackMarketplaceSectionFacet<
  TKind extends CanvasAppFeaturePackMarketplaceSectionFacetKind =
    CanvasAppFeaturePackMarketplaceSectionFacetKind,
> = Readonly<{
  count: number
  kind: TKind
  label: string
}>

export type CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput =
  Readonly<{
    facetKind: CanvasAppFeaturePackMarketplaceProfileSectionFacetKind
    section: CanvasAppFeaturePackMarketplaceProfileSection
  }>

export type CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput =
  Readonly<{
    facetKind: CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind
    section: CanvasAppFeaturePackMarketplaceSuiteSection
  }>

export type CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput =
  Readonly<{
    facetKind: CanvasAppFeaturePackMarketplacePackSectionFacetKind
    section: CanvasAppFeaturePackMarketplacePackSection
  }>

export type CanvasAppFeaturePackMarketplaceSectionFacetItemsInput =
  | CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput
  | CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput
  | CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput

export type CanvasAppFeaturePackMarketplaceSectionFacetItems =
  | readonly CanvasAppFeaturePackMarketplaceActionItem[]
  | readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
  | readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]

export type CanvasAppFeaturePackMarketplaceSectionSummary =
  | CanvasAppFeaturePackMarketplacePackSectionSummary
  | CanvasAppFeaturePackMarketplaceProfileSectionSummary
  | CanvasAppFeaturePackMarketplaceSuiteSectionSummary

export type CanvasAppFeaturePackMarketplaceItem =
  | CanvasAppFeaturePackMarketplaceActionItem
  | CanvasAppFeaturePackProfileMarketplaceActionItem
  | CanvasAppFeaturePackSuiteMarketplaceActionItem

export type CanvasAppFeaturePackMarketplaceActionSectionSummary =
  Readonly<{
    blockedActionCount: number
    itemCount: number
    primaryBlockedItemCount: number
    primaryReadyItemCount: number
    readyActionCount: number
  }>

export type CanvasAppFeaturePackMarketplaceProfileSectionSummary =
  CanvasAppFeaturePackMarketplaceActionSectionSummary & Readonly<{
    activeItemCount: number
  }>

export type CanvasAppFeaturePackMarketplaceSuiteSectionSummary =
  CanvasAppFeaturePackMarketplaceActionSectionSummary & Readonly<{
    enabledItemCount: number
  }>

export type CanvasAppFeaturePackMarketplacePackSectionSummary =
  CanvasAppFeaturePackMarketplaceActionSectionSummary & Readonly<{
    activationFailedItemCount: number
    enabledItemCount: number
    installedItemCount: number
    paidItemCount: number
    partiallyUpdatedItemCount: number
    privateItemCount: number
    rollbackAvailableItemCount: number
    updatingItemCount: number
  }>

export type CanvasAppFeaturePackMarketplaceSectionActionItem = Readonly<{
  actions: readonly CanvasAppFeaturePackMarketplaceSectionAction[]
  primaryActionKind: string
}>

export type CanvasAppFeaturePackMarketplaceSectionAction = Readonly<{
  applicable: boolean
  kind: string
  ready: boolean
  status: 'active' | 'blocked' | 'ready'
}>
