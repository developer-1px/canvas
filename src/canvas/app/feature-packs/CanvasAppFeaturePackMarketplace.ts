import {
  getCanvasAppFeaturePackMarketplaceActionModel,
  type CanvasAppFeaturePackMarketplaceAction,
  type CanvasAppFeaturePackMarketplaceActionItem,
  type CanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActions'
import {
  type CanvasAppFeaturePackContributionSurface,
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackStateTransitionUninstallPolicyEntry,
} from './CanvasAppFeaturePackStateTransitionPlan'
import {
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  getCanvasAppFeaturePackProfileMarketplaceActionModel,
  type CanvasAppFeaturePackProfileMarketplaceAction,
  type CanvasAppFeaturePackProfileMarketplaceActionItem,
  type CanvasAppFeaturePackProfileMarketplaceActionModel,
} from './CanvasAppFeaturePackProfileActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  type CanvasAppFeaturePackProfile,
  type CanvasAppFeaturePackProfileId,
} from './CanvasAppFeaturePackProfiles'
import {
  getCanvasAppFeaturePackSuiteMarketplaceActionModel,
  type CanvasAppFeaturePackSuiteMarketplaceAction,
  type CanvasAppFeaturePackSuiteMarketplaceActionItem,
  type CanvasAppFeaturePackSuiteMarketplaceActionModel,
} from './CanvasAppFeaturePackSuiteActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
} from './CanvasAppDefaultFeaturePackSuites'
import {
  type CanvasAppFeaturePackSuiteId,
  type CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'
import {
  type CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'

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

export function getCanvasAppFeaturePackMarketplaceModel({
  listings = [],
  manifests,
  options = {},
  profiles = DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  suiteManifests = DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
}: {
  listings?: readonly CanvasAppFeaturePackMarketplaceListingInput[]
  manifests: readonly CanvasAppFeaturePackManifest[]
  options?: CanvasAppFeaturePackManifestInstallOptions
  profiles?: readonly CanvasAppFeaturePackProfile[]
  suiteManifests?: readonly CanvasAppFeaturePackSuiteManifest[]
}): CanvasAppFeaturePackMarketplaceModel {
  const profileActions = getCanvasAppFeaturePackProfileMarketplaceActionModel({
    listings,
    manifests,
    options,
    profiles,
  })
  const suiteActions = getCanvasAppFeaturePackSuiteMarketplaceActionModel({
    listings,
    manifests,
    options,
    suiteManifests,
  })
  const packActions = getCanvasAppFeaturePackMarketplaceActionModel({
    listings,
    manifests,
    options,
  })
  const profileSummary =
    getCanvasAppFeaturePackMarketplaceProfileSectionSummary(
      profileActions.items,
    )
  const suiteSummary = getCanvasAppFeaturePackMarketplaceSuiteSectionSummary(
    suiteActions.items,
  )
  const packSummary = getCanvasAppFeaturePackMarketplacePackSectionSummary(
    packActions.items,
  )

  return Object.freeze({
    packs: packActions,
    profiles: profileActions,
    sections: Object.freeze([
      Object.freeze({
        facets: getCanvasAppFeaturePackMarketplaceProfileSectionFacets({
          items: profileActions.items,
          summary: profileSummary,
        }),
        items: profileActions.items,
        kind: 'profiles',
        label: 'Profiles',
        summary: profileSummary,
      }),
      Object.freeze({
        facets: getCanvasAppFeaturePackMarketplaceSuiteSectionFacets({
          items: suiteActions.items,
          summary: suiteSummary,
        }),
        items: suiteActions.items,
        kind: 'suites',
        label: 'Suites',
        summary: suiteSummary,
      }),
      Object.freeze({
        facets: getCanvasAppFeaturePackMarketplacePackSectionFacets({
          items: packActions.items,
          summary: packSummary,
        }),
        items: packActions.items,
        kind: 'packs',
        label: 'Feature packs',
        summary: packSummary,
      }),
    ]),
    suites: suiteActions,
  })
}

export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput,
): readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput,
): readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput,
): readonly CanvasAppFeaturePackMarketplaceActionItem[]
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): CanvasAppFeaturePackMarketplaceSectionFacetItems
export function getCanvasAppFeaturePackMarketplaceSectionFacetItems(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): CanvasAppFeaturePackMarketplaceSectionFacetItems {
  if (isCanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput(input)) {
    return Object.freeze(input.section.items.filter((item) =>
      isCanvasAppFeaturePackMarketplaceProfileSectionFacetItem({
        facetKind: input.facetKind,
        item,
      })
    ))
  }

  if (isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput(input)) {
    return Object.freeze(input.section.items.filter((item) =>
      isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItem({
        facetKind: input.facetKind,
        item,
      })
    ))
  }

  if (isCanvasAppFeaturePackMarketplacePackSectionFacetItemsInput(input)) {
    return Object.freeze(input.section.items.filter((item) =>
      isCanvasAppFeaturePackMarketplacePackSectionFacetItem({
        facetKind: input.facetKind,
        item,
      })
    ))
  }

  throw new Error('Unknown canvas app feature pack marketplace section')
}

export function getCanvasAppFeaturePackMarketplaceSectionControlModels(
  model: CanvasAppFeaturePackMarketplaceModel,
): readonly CanvasAppFeaturePackMarketplaceSectionControlModel[] {
  return Object.freeze(
    model.sections.map(getCanvasAppFeaturePackMarketplaceSectionControlModel),
  )
}

export function getCanvasAppFeaturePackMarketplaceSectionControlModel(
  section: CanvasAppFeaturePackMarketplaceSection,
): CanvasAppFeaturePackMarketplaceSectionControlModel {
  return Object.freeze({
    controls: getCanvasAppFeaturePackMarketplaceSectionTargetControls(section),
    diagnostics:
      getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel(
        section,
      ),
    facets: section.facets,
    kind: section.kind,
    label: section.label,
    section,
    summary: section.summary,
  })
}

export function getCanvasAppFeaturePackMarketplaceSectionFacetTargetControls(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): readonly CanvasAppFeaturePackMarketplaceTargetControl[] {
  return Object.freeze(
    getCanvasAppFeaturePackMarketplaceSectionFacetItems(input)
      .map(getCanvasAppFeaturePackMarketplaceItemTargetControl),
  )
}

export function getCanvasAppFeaturePackMarketplaceTargetItem({
  model,
  target,
}: CanvasAppFeaturePackMarketplaceTargetItemInput):
  CanvasAppFeaturePackMarketplaceItem | null {
  if (target.kind === 'pack') {
    return model.packs.items.find((item) =>
      item.featurePackId === target.featurePackId
    ) ?? null
  }

  if (target.kind === 'profile') {
    return model.profiles.items.find((item) =>
      item.profileId === target.profileId
    ) ?? null
  }

  return model.suites.items.find((item) =>
    item.suiteId === target.suiteId
  ) ?? null
}

export function getCanvasAppFeaturePackMarketplaceTargetPrimaryAction(
  input: CanvasAppFeaturePackMarketplaceTargetItemInput,
): CanvasAppFeaturePackMarketplacePrimaryAction | null {
  const item = getCanvasAppFeaturePackMarketplaceTargetItem(input)

  return item ? getCanvasAppFeaturePackMarketplacePrimaryAction(item) : null
}

export function getCanvasAppFeaturePackMarketplaceTargetPrimaryActionDiagnostic(
  input: CanvasAppFeaturePackMarketplaceTargetItemInput,
): CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic | null {
  const item = getCanvasAppFeaturePackMarketplaceTargetItem(input)

  return item
    ? getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic(item)
    : null
}

export function getCanvasAppFeaturePackMarketplaceTargetControl(
  input: CanvasAppFeaturePackMarketplaceTargetControlInput,
): CanvasAppFeaturePackMarketplaceTargetControl {
  const item = getCanvasAppFeaturePackMarketplaceTargetItem(input)

  return item
    ? getCanvasAppFeaturePackMarketplaceItemTargetControl(item)
    : createMissingCanvasAppFeaturePackMarketplaceTargetControl(input.target)
}

export function getCanvasAppFeaturePackMarketplaceSectionTargetControls(
  section: CanvasAppFeaturePackMarketplaceSection,
): readonly CanvasAppFeaturePackMarketplaceTargetControl[] {
  return Object.freeze(
    section.items.map(getCanvasAppFeaturePackMarketplaceItemTargetControl),
  )
}

export function getCanvasAppFeaturePackMarketplaceItemTargetControl(
  item: CanvasAppFeaturePackMarketplaceItem,
): CanvasAppFeaturePackMarketplaceTargetControl {
  const diagnostic =
    getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic(item)

  return Object.freeze({
    action: diagnostic.action,
    actionKind: diagnostic.actionKind,
    active: isCanvasAppFeaturePackMarketplaceItemActive(item),
    diagnostic,
    disabled: !diagnostic.ready,
    installed: isCanvasAppFeaturePackMarketplaceItemInstalled(item),
    item,
    label: getCanvasAppFeaturePackMarketplaceItemLabel(item),
    ready: diagnostic.ready,
    status: diagnostic.status,
    target: getCanvasAppFeaturePackMarketplaceItemTarget(item),
    totalBlockedReasonCount: diagnostic.totalBlockedReasonCount,
  })
}

export function getCanvasAppFeaturePackMarketplaceItemTarget(
  item: CanvasAppFeaturePackMarketplaceItem,
): CanvasAppFeaturePackMarketplaceTarget {
  if (isCanvasAppFeaturePackMarketplacePackItem(item)) {
    return Object.freeze({
      featurePackId: item.featurePackId,
      kind: 'pack',
    })
  }

  if (isCanvasAppFeaturePackMarketplaceProfileItem(item)) {
    return Object.freeze({
      kind: 'profile',
      profileId: item.profileId,
    })
  }

  return Object.freeze({
    kind: 'suite',
    suiteId: item.suiteId,
  })
}

export function getCanvasAppFeaturePackMarketplacePrimaryAction(
  item: CanvasAppFeaturePackProfileMarketplaceActionItem,
): CanvasAppFeaturePackProfileMarketplaceAction
export function getCanvasAppFeaturePackMarketplacePrimaryAction(
  item: CanvasAppFeaturePackSuiteMarketplaceActionItem,
): CanvasAppFeaturePackSuiteMarketplaceAction
export function getCanvasAppFeaturePackMarketplacePrimaryAction(
  item: CanvasAppFeaturePackMarketplaceActionItem,
): CanvasAppFeaturePackMarketplaceAction
export function getCanvasAppFeaturePackMarketplacePrimaryAction(
  item: CanvasAppFeaturePackMarketplaceItem,
): CanvasAppFeaturePackMarketplacePrimaryAction
export function getCanvasAppFeaturePackMarketplacePrimaryAction(
  item: CanvasAppFeaturePackMarketplaceItem,
): CanvasAppFeaturePackMarketplacePrimaryAction {
  const action = item.actions.find((candidate) =>
    candidate.kind === item.primaryActionKind
  )

  if (!action) {
    throw new Error(
      `Missing canvas app feature pack marketplace primary action: ${item.primaryActionKind}`,
    )
  }

  return action
}

export function getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic(
  item: CanvasAppFeaturePackMarketplaceItem,
): CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic {
  const action = getCanvasAppFeaturePackMarketplacePrimaryAction(item)
  const blockedReasonCount = action.blockedReasons.length
  const marketplaceBlockedReasonCount = action.marketplaceBlockedReasons.length

  return Object.freeze({
    action,
    actionKind: action.kind,
    applicable: action.applicable,
    blockedReasonCount,
    changedFeaturePackIds: action.changedFeaturePackIds,
    marketplaceBlockedReasonCount,
    partialUpdateSurfaceIds: action.partialUpdateSurfaceIds,
    ready: action.ready,
    status: action.status,
    totalBlockedReasonCount:
      blockedReasonCount + marketplaceBlockedReasonCount,
    uninstallPolicyEntries: action.uninstallPolicyEntries,
  })
}

export function getCanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel(
  section: CanvasAppFeaturePackMarketplaceSection,
): CanvasAppFeaturePackMarketplaceSectionPrimaryActionDiagnosticModel {
  const items: readonly CanvasAppFeaturePackMarketplaceItem[] = section.items
  const all = Object.freeze(items.map((item) =>
    getCanvasAppFeaturePackMarketplacePrimaryActionDiagnostic(item)
  ))

  return Object.freeze({
    all,
    blocked: Object.freeze(all.filter(
      isCanvasAppFeaturePackMarketplaceBlockedPrimaryActionDiagnostic,
    )),
    ready: Object.freeze(all.filter((diagnostic) => diagnostic.ready)),
  })
}

function createMissingCanvasAppFeaturePackMarketplaceTargetControl(
  target: CanvasAppFeaturePackMarketplaceTarget,
): CanvasAppFeaturePackMarketplaceTargetControl {
  return Object.freeze({
    action: null,
    actionKind: null,
    active: false,
    diagnostic: null,
    disabled: true,
    installed: false,
    item: null,
    label: getCanvasAppFeaturePackMarketplaceTargetFallbackLabel(target),
    ready: false,
    status: 'missing',
    target: snapshotCanvasAppFeaturePackMarketplaceTarget(target),
    totalBlockedReasonCount: 0,
  })
}

function getCanvasAppFeaturePackMarketplaceItemLabel(
  item: CanvasAppFeaturePackMarketplaceItem,
): string {
  if (isCanvasAppFeaturePackMarketplacePackItem(item)) {
    return item.catalogItem.label
  }

  return item.label
}

function isCanvasAppFeaturePackMarketplaceItemActive(
  item: CanvasAppFeaturePackMarketplaceItem,
): boolean {
  if (isCanvasAppFeaturePackMarketplacePackItem(item)) {
    return item.enabled
  }

  if (isCanvasAppFeaturePackMarketplaceProfileItem(item)) {
    return item.active
  }

  return item.status === 'enabled'
}

function isCanvasAppFeaturePackMarketplaceItemInstalled(
  item: CanvasAppFeaturePackMarketplaceItem,
): boolean {
  if (isCanvasAppFeaturePackMarketplacePackItem(item)) {
    return item.installed
  }

  if (isCanvasAppFeaturePackMarketplaceProfileItem(item)) {
    const installedIds = new Set(item.currentInstalledFeaturePackIds)

    return item.missingFeaturePackIds.length === 0 &&
      item.targetInstalledFeaturePackIds.every((id) => installedIds.has(id))
  }

  const installedIds = new Set(item.installedFeaturePackIds)

  return item.missingFeaturePackIds.length === 0 &&
    item.featurePackIds.every((id) => installedIds.has(id))
}

function getCanvasAppFeaturePackMarketplaceTargetFallbackLabel(
  target: CanvasAppFeaturePackMarketplaceTarget,
): string {
  if (target.kind === 'pack') {
    return target.featurePackId
  }

  if (target.kind === 'profile') {
    return target.profileId
  }

  return target.suiteId
}

function snapshotCanvasAppFeaturePackMarketplaceTarget(
  target: CanvasAppFeaturePackMarketplaceTarget,
): CanvasAppFeaturePackMarketplaceTarget {
  if (target.kind === 'pack') {
    return Object.freeze({
      featurePackId: target.featurePackId,
      kind: 'pack',
    })
  }

  if (target.kind === 'profile') {
    return Object.freeze({
      kind: 'profile',
      profileId: target.profileId,
    })
  }

  return Object.freeze({
    kind: 'suite',
    suiteId: target.suiteId,
  })
}

function isCanvasAppFeaturePackMarketplacePackItem(
  item: CanvasAppFeaturePackMarketplaceItem,
): item is CanvasAppFeaturePackMarketplaceActionItem {
  return 'featurePackId' in item
}

function isCanvasAppFeaturePackMarketplaceProfileItem(
  item: CanvasAppFeaturePackMarketplaceItem,
): item is CanvasAppFeaturePackProfileMarketplaceActionItem {
  return 'profileId' in item
}

function getCanvasAppFeaturePackMarketplaceProfileSectionSummary(
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplaceProfileSectionSummary {
  return Object.freeze({
    activeItemCount: items.filter((item) => item.active).length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplaceSuiteSectionSummary(
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplaceSuiteSectionSummary {
  return Object.freeze({
    enabledItemCount: items.filter((item) => item.status === 'enabled').length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplacePackSectionSummary(
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[],
): CanvasAppFeaturePackMarketplacePackSectionSummary {
  return Object.freeze({
    activationFailedItemCount: items.filter((item) =>
      item.status === 'activation-failed'
    ).length,
    enabledItemCount: items.filter((item) => item.enabled).length,
    installedItemCount: items.filter((item) => item.installed).length,
    paidItemCount: items.filter((item) => item.listing.access === 'paid').length,
    partiallyUpdatedItemCount: items.filter((item) =>
      item.status === 'partially-updated'
    ).length,
    privateItemCount: items.filter((item) =>
      item.listing.access === 'private'
    ).length,
    rollbackAvailableItemCount: items.filter((item) =>
      item.status === 'rollback-available'
    ).length,
    updatingItemCount: items.filter((item) => item.status === 'updating').length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplaceActionSectionSummary(
  items: readonly CanvasAppFeaturePackMarketplaceSectionActionItem[],
): CanvasAppFeaturePackMarketplaceActionSectionSummary {
  const actions = items.flatMap((item) => item.actions)

  return Object.freeze({
    blockedActionCount: actions.filter((action) =>
      action.applicable && action.status === 'blocked'
    ).length,
    itemCount: items.length,
    primaryBlockedItemCount: items.filter((item) =>
      isCanvasAppFeaturePackMarketplacePrimaryActionBlocked(item)
    ).length,
    primaryReadyItemCount: items.filter((item) =>
      isCanvasAppFeaturePackMarketplacePrimaryActionReady(item)
    ).length,
    readyActionCount: actions.filter((action) => action.ready).length,
  })
}

function isCanvasAppFeaturePackMarketplaceBlockedPrimaryActionDiagnostic(
  diagnostic: CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic,
) {
  return diagnostic.applicable && diagnostic.status === 'blocked'
}

function isCanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): input is CanvasAppFeaturePackMarketplaceProfileSectionFacetItemsInput {
  return input.section.kind === 'profiles'
}

function isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): input is CanvasAppFeaturePackMarketplaceSuiteSectionFacetItemsInput {
  return input.section.kind === 'suites'
}

function isCanvasAppFeaturePackMarketplacePackSectionFacetItemsInput(
  input: CanvasAppFeaturePackMarketplaceSectionFacetItemsInput,
): input is CanvasAppFeaturePackMarketplacePackSectionFacetItemsInput {
  return input.section.kind === 'packs'
}

function getCanvasAppFeaturePackMarketplaceProfileSectionFacets({
  items,
  summary,
}: {
  items: readonly CanvasAppFeaturePackProfileMarketplaceActionItem[]
  summary: CanvasAppFeaturePackMarketplaceProfileSectionSummary
}): readonly CanvasAppFeaturePackMarketplaceSectionFacet<
  CanvasAppFeaturePackMarketplaceProfileSectionFacetKind
>[] {
  return Object.freeze([
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.itemCount,
      kind: 'all',
      label: 'All',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.activeItemCount,
      kind: 'active',
      label: 'Active',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceReadyItemCount(items),
      kind: 'ready',
      label: 'Ready',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceBlockedItemCount(items),
      kind: 'blocked',
      label: 'Blocked',
    }),
  ])
}

function getCanvasAppFeaturePackMarketplaceSuiteSectionFacets({
  items,
  summary,
}: {
  items: readonly CanvasAppFeaturePackSuiteMarketplaceActionItem[]
  summary: CanvasAppFeaturePackMarketplaceSuiteSectionSummary
}): readonly CanvasAppFeaturePackMarketplaceSectionFacet<
  CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind
>[] {
  return Object.freeze([
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.itemCount,
      kind: 'all',
      label: 'All',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.enabledItemCount,
      kind: 'enabled',
      label: 'Enabled',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceReadyItemCount(items),
      kind: 'ready',
      label: 'Ready',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceBlockedItemCount(items),
      kind: 'blocked',
      label: 'Blocked',
    }),
  ])
}

function getCanvasAppFeaturePackMarketplacePackSectionFacets({
  items,
  summary,
}: {
  items: readonly CanvasAppFeaturePackMarketplaceActionItem[]
  summary: CanvasAppFeaturePackMarketplacePackSectionSummary
}): readonly CanvasAppFeaturePackMarketplaceSectionFacet<
  CanvasAppFeaturePackMarketplacePackSectionFacetKind
>[] {
  return Object.freeze([
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.itemCount,
      kind: 'all',
      label: 'All',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.installedItemCount,
      kind: 'installed',
      label: 'Installed',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.enabledItemCount,
      kind: 'enabled',
      label: 'Enabled',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.paidItemCount,
      kind: 'paid',
      label: 'Paid',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.privateItemCount,
      kind: 'private',
      label: 'Private',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.updatingItemCount,
      kind: 'updating',
      label: 'Updating',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.partiallyUpdatedItemCount,
      kind: 'partially-updated',
      label: 'Partially updated',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.activationFailedItemCount,
      kind: 'activation-failed',
      label: 'Activation failed',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: summary.rollbackAvailableItemCount,
      kind: 'rollback-available',
      label: 'Rollback available',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceReadyItemCount(items),
      kind: 'ready',
      label: 'Ready',
    }),
    createCanvasAppFeaturePackMarketplaceSectionFacet({
      count: getCanvasAppFeaturePackMarketplaceBlockedItemCount(items),
      kind: 'blocked',
      label: 'Blocked',
    }),
  ])
}

function getCanvasAppFeaturePackMarketplaceReadyItemCount(
  items: readonly CanvasAppFeaturePackMarketplaceSectionActionItem[],
) {
  return items.filter(hasCanvasAppFeaturePackMarketplaceReadyAction).length
}

function getCanvasAppFeaturePackMarketplaceBlockedItemCount(
  items: readonly CanvasAppFeaturePackMarketplaceSectionActionItem[],
) {
  return items.filter(hasCanvasAppFeaturePackMarketplaceBlockedAction).length
}

function isCanvasAppFeaturePackMarketplaceProfileSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: CanvasAppFeaturePackMarketplaceProfileSectionFacetKind
  item: CanvasAppFeaturePackProfileMarketplaceActionItem
}) {
  if (facetKind === 'active') {
    return item.active
  }

  return isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
    facetKind,
    item,
  })
}

function isCanvasAppFeaturePackMarketplaceSuiteSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: CanvasAppFeaturePackMarketplaceSuiteSectionFacetKind
  item: CanvasAppFeaturePackSuiteMarketplaceActionItem
}) {
  if (facetKind === 'enabled') {
    return item.status === 'enabled'
  }

  return isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
    facetKind,
    item,
  })
}

function isCanvasAppFeaturePackMarketplacePackSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: CanvasAppFeaturePackMarketplacePackSectionFacetKind
  item: CanvasAppFeaturePackMarketplaceActionItem
}) {
  if (facetKind === 'installed') {
    return item.installed
  }

  if (facetKind === 'enabled') {
    return item.enabled
  }

  if (facetKind === 'paid') {
    return item.listing.access === 'paid'
  }

  if (facetKind === 'private') {
    return item.listing.access === 'private'
  }

  if (
    facetKind === 'activation-failed' ||
    facetKind === 'partially-updated' ||
    facetKind === 'rollback-available' ||
    facetKind === 'updating'
  ) {
    return item.status === facetKind
  }

  return isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
    facetKind,
    item,
  })
}

function isCanvasAppFeaturePackMarketplaceCommonSectionFacetItem({
  facetKind,
  item,
}: {
  facetKind: 'all' | 'blocked' | 'ready'
  item: CanvasAppFeaturePackMarketplaceSectionActionItem
}) {
  if (facetKind === 'all') {
    return true
  }

  if (facetKind === 'ready') {
    return hasCanvasAppFeaturePackMarketplaceReadyAction(item)
  }

  return hasCanvasAppFeaturePackMarketplaceBlockedAction(item)
}

function hasCanvasAppFeaturePackMarketplaceReadyAction(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  return item.actions.some((action) => action.ready)
}

function hasCanvasAppFeaturePackMarketplaceBlockedAction(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  return item.actions.some((action) =>
    action.applicable && action.status === 'blocked'
  )
}

function isCanvasAppFeaturePackMarketplacePrimaryActionReady(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  return getCanvasAppFeaturePackMarketplaceItemPrimaryAction(item)?.ready === true
}

function isCanvasAppFeaturePackMarketplacePrimaryActionBlocked(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  const primaryAction = getCanvasAppFeaturePackMarketplaceItemPrimaryAction(item)

  return primaryAction?.applicable === true &&
    primaryAction.status === 'blocked'
}

function createCanvasAppFeaturePackMarketplaceSectionFacet<
  TKind extends CanvasAppFeaturePackMarketplaceSectionFacetKind,
>({
  count,
  kind,
  label,
}: CanvasAppFeaturePackMarketplaceSectionFacet<TKind>):
  CanvasAppFeaturePackMarketplaceSectionFacet<TKind> {
  return Object.freeze({
    count,
    kind,
    label,
  })
}

type CanvasAppFeaturePackMarketplaceSectionActionItem = Readonly<{
  actions: readonly CanvasAppFeaturePackMarketplaceSectionAction[]
  primaryActionKind: string
}>

type CanvasAppFeaturePackMarketplaceSectionAction = Readonly<{
  applicable: boolean
  kind: string
  ready: boolean
  status: 'active' | 'blocked' | 'ready'
}>

function getCanvasAppFeaturePackMarketplaceItemPrimaryAction(
  item: CanvasAppFeaturePackMarketplaceSectionActionItem,
) {
  return item.actions.find((action) => action.kind === item.primaryActionKind)
}
