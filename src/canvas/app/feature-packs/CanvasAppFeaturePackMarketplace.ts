import {
  getCanvasAppFeaturePackMarketplaceActionModel,
  type CanvasAppFeaturePackMarketplaceActionItem,
  type CanvasAppFeaturePackMarketplaceActionModel,
} from './CanvasAppFeaturePackActions'
import {
  type CanvasAppFeaturePackManifest,
  type CanvasAppFeaturePackManifestInstallOptions,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackMarketplaceListingInput,
} from './CanvasAppFeaturePackMarketplaceListings'
import {
  getCanvasAppFeaturePackProfileMarketplaceActionModel,
  type CanvasAppFeaturePackProfileMarketplaceActionItem,
  type CanvasAppFeaturePackProfileMarketplaceActionModel,
} from './CanvasAppFeaturePackProfileActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_PROFILES,
  type CanvasAppFeaturePackProfile,
} from './CanvasAppFeaturePackProfiles'
import {
  getCanvasAppFeaturePackSuiteMarketplaceActionModel,
  type CanvasAppFeaturePackSuiteMarketplaceActionItem,
  type CanvasAppFeaturePackSuiteMarketplaceActionModel,
} from './CanvasAppFeaturePackSuiteActions'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
} from './CanvasAppDefaultFeaturePackSuites'
import {
  type CanvasAppFeaturePackSuiteManifest,
} from './CanvasAppFeaturePackSuites'

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
  | 'all'
  | 'blocked'
  | 'enabled'
  | 'installed'
  | 'paid'
  | 'private'
  | 'ready'

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

export type CanvasAppFeaturePackMarketplaceActionSectionSummary =
  Readonly<{
    blockedActionCount: number
    itemCount: number
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
    enabledItemCount: number
    installedItemCount: number
    paidItemCount: number
    privateItemCount: number
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
    enabledItemCount: items.filter((item) => item.enabled).length,
    installedItemCount: items.filter((item) => item.installed).length,
    paidItemCount: items.filter((item) => item.listing.access === 'paid').length,
    privateItemCount: items.filter((item) =>
      item.listing.access === 'private'
    ).length,
    ...getCanvasAppFeaturePackMarketplaceActionSectionSummary(items),
  })
}

function getCanvasAppFeaturePackMarketplaceActionSectionSummary(
  items: readonly {
    actions: readonly {
      applicable: boolean
      ready: boolean
      status: 'active' | 'blocked' | 'ready'
    }[]
  }[],
): CanvasAppFeaturePackMarketplaceActionSectionSummary {
  const actions = items.flatMap((item) => item.actions)

  return Object.freeze({
    blockedActionCount: actions.filter((action) =>
      action.applicable && action.status === 'blocked'
    ).length,
    itemCount: items.length,
    readyActionCount: actions.filter((action) => action.ready).length,
  })
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
}>

type CanvasAppFeaturePackMarketplaceSectionAction = Readonly<{
  applicable: boolean
  ready: boolean
  status: 'active' | 'blocked' | 'ready'
}>
