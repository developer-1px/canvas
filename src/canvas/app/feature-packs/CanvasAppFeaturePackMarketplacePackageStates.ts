import {
  type CanvasAppFeaturePackContributionSurface,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackRuntimeStateStatus,
} from './CanvasAppFeaturePacks'

export type CanvasAppFeaturePackMarketplacePackageKind =
  | 'pack'
  | 'profile'
  | 'suite'

export type CanvasAppFeaturePackMarketplacePackageStatus =
  | 'activation-failed'
  | 'active'
  | 'available'
  | 'blocked'
  | 'disabled'
  | 'enabled'
  | 'installed'
  | 'partial'
  | 'partially-updated'
  | 'ready'
  | 'rollback-available'
  | 'updating'

export type CanvasAppFeaturePackMarketplacePackageActionKind =
  | 'apply'
  | 'disable'
  | 'enable'
  | 'install'
  | 'uninstall'

export type CanvasAppFeaturePackMarketplacePackageActionStatus =
  | 'active'
  | 'blocked'
  | 'ready'

export type CanvasAppFeaturePackMarketplacePackageState = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePackageActionKind
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  active: boolean
  blocked: boolean
  blockedReasonCount: number
  enabled: boolean
  id: string
  installed: boolean
  kind: CanvasAppFeaturePackMarketplacePackageKind
  marketplaceBlockedReasonCount: number
  partialUpdateSurfaceIds: readonly CanvasAppFeaturePackContributionSurface[]
  primaryStatus: CanvasAppFeaturePackMarketplacePackageStatus
  ready: boolean
  statuses: readonly CanvasAppFeaturePackMarketplacePackageStatus[]
  totalBlockedReasonCount: number
}>

export type CanvasAppFeaturePackMarketplacePackageStateInput = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePackageActionKind
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  active?: boolean
  blockedReasonCount: number
  enabled: boolean
  id: string
  installed: boolean
  kind: CanvasAppFeaturePackMarketplacePackageKind
  marketplaceBlockedReasonCount: number
  partialUpdateSurfaceIds?: readonly CanvasAppFeaturePackContributionSurface[]
  primaryStatus: CanvasAppFeaturePackMarketplacePackageStatus
  ready: boolean
  statuses: readonly CanvasAppFeaturePackMarketplacePackageStatus[]
}>

export function createCanvasAppFeaturePackMarketplacePackageState(
  input: CanvasAppFeaturePackMarketplacePackageStateInput,
): CanvasAppFeaturePackMarketplacePackageState {
  const totalBlockedReasonCount =
    input.blockedReasonCount + input.marketplaceBlockedReasonCount

  return Object.freeze({
    actionKind: input.actionKind,
    actionStatus: input.actionStatus,
    active: input.active ?? input.enabled,
    blocked: input.actionStatus === 'blocked' && totalBlockedReasonCount > 0,
    blockedReasonCount: input.blockedReasonCount,
    enabled: input.enabled,
    id: input.id,
    installed: input.installed,
    kind: input.kind,
    marketplaceBlockedReasonCount: input.marketplaceBlockedReasonCount,
    partialUpdateSurfaceIds: Object.freeze([
      ...(input.partialUpdateSurfaceIds ?? []),
    ]),
    primaryStatus: input.primaryStatus,
    ready: input.ready,
    statuses: snapshotCanvasAppFeaturePackMarketplacePackageStatuses(
      input.statuses,
    ),
    totalBlockedReasonCount,
  })
}

export function getCanvasAppFeaturePackMarketplacePackPackageStatuses({
  actionStatus,
  enabled,
  installed,
  runtimeStatus,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  enabled: boolean
  installed: boolean
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus
  totalBlockedReasonCount: number
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return snapshotCanvasAppFeaturePackMarketplacePackageStatuses([
    ...getCanvasAppFeaturePackMarketplaceInstallStatuses({
      enabled,
      installed,
    }),
    ...getCanvasAppFeaturePackMarketplaceRuntimeStatuses(runtimeStatus),
    ...getCanvasAppFeaturePackMarketplaceBlockedStatuses({
      actionStatus,
      totalBlockedReasonCount,
    }),
  ])
}

export function getCanvasAppFeaturePackMarketplacePackPackagePrimaryStatus({
  actionStatus,
  enabled,
  installed,
  runtimeStatus,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  enabled: boolean
  installed: boolean
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus
  totalBlockedReasonCount: number
}): CanvasAppFeaturePackMarketplacePackageStatus {
  const runtimePrimaryStatus =
    getCanvasAppFeaturePackMarketplaceRuntimePrimaryStatus(runtimeStatus)

  if (runtimePrimaryStatus) {
    return runtimePrimaryStatus
  }

  if (
    !installed &&
    actionStatus === 'blocked' &&
    totalBlockedReasonCount > 0
  ) {
    return 'blocked'
  }

  if (enabled) {
    return 'enabled'
  }

  if (installed) {
    return 'disabled'
  }

  return 'available'
}

export function getCanvasAppFeaturePackMarketplaceSuitePackageStatuses({
  actionStatus,
  status,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  status: 'disabled' | 'enabled' | 'partial' | 'uninstalled'
  totalBlockedReasonCount: number
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return snapshotCanvasAppFeaturePackMarketplacePackageStatuses([
    ...(status === 'uninstalled' ? ['available' as const] : []),
    ...(status === 'enabled' || status === 'disabled'
      ? ['installed' as const]
      : []),
    ...(status === 'enabled' ? ['enabled' as const] : []),
    ...(status === 'disabled' ? ['disabled' as const] : []),
    ...(status === 'partial' ? ['partial' as const] : []),
    ...getCanvasAppFeaturePackMarketplaceBlockedStatuses({
      actionStatus,
      totalBlockedReasonCount,
    }),
  ])
}

export function getCanvasAppFeaturePackMarketplaceSuitePackagePrimaryStatus({
  actionStatus,
  status,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  status: 'disabled' | 'enabled' | 'partial' | 'uninstalled'
  totalBlockedReasonCount: number
}): CanvasAppFeaturePackMarketplacePackageStatus {
  if (
    status === 'uninstalled' &&
    actionStatus === 'blocked' &&
    totalBlockedReasonCount > 0
  ) {
    return 'blocked'
  }

  if (status === 'uninstalled') {
    return 'available'
  }

  return status
}

export function getCanvasAppFeaturePackMarketplaceProfilePackageStatuses({
  status,
}: {
  status: 'active' | 'blocked' | 'ready'
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  if (status === 'active') {
    return Object.freeze(['active', 'installed', 'enabled'])
  }

  if (status === 'ready') {
    return Object.freeze(['available', 'ready'])
  }

  return Object.freeze(['available', 'blocked'])
}

function getCanvasAppFeaturePackMarketplaceInstallStatuses({
  enabled,
  installed,
}: {
  enabled: boolean
  installed: boolean
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  if (!installed) {
    return Object.freeze(['available'])
  }

  return Object.freeze([
    'installed',
    enabled ? 'enabled' : 'disabled',
  ])
}

function getCanvasAppFeaturePackMarketplaceRuntimeStatuses(
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus,
): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  const primaryStatus =
    getCanvasAppFeaturePackMarketplaceRuntimePrimaryStatus(runtimeStatus)

  return primaryStatus ? Object.freeze([primaryStatus]) : Object.freeze([])
}

function getCanvasAppFeaturePackMarketplaceRuntimePrimaryStatus(
  runtimeStatus: CanvasAppFeaturePackRuntimeStateStatus,
): CanvasAppFeaturePackMarketplacePackageStatus | null {
  if (
    runtimeStatus === 'activation-failed' ||
    runtimeStatus === 'partially-updated' ||
    runtimeStatus === 'rollback-available' ||
    runtimeStatus === 'updating'
  ) {
    return runtimeStatus
  }

  return null
}

function getCanvasAppFeaturePackMarketplaceBlockedStatuses({
  actionStatus,
  totalBlockedReasonCount,
}: {
  actionStatus: CanvasAppFeaturePackMarketplacePackageActionStatus
  totalBlockedReasonCount: number
}): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return actionStatus === 'blocked' && totalBlockedReasonCount > 0
    ? Object.freeze(['blocked'])
    : Object.freeze([])
}

function snapshotCanvasAppFeaturePackMarketplacePackageStatuses(
  statuses: readonly CanvasAppFeaturePackMarketplacePackageStatus[],
): readonly CanvasAppFeaturePackMarketplacePackageStatus[] {
  return Object.freeze([...new Set(statuses)])
}
