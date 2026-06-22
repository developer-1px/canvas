import type {
  CanvasAppFeaturePackMarketplaceAction,
  CanvasAppFeaturePackMarketplaceActionItem,
} from './CanvasAppFeaturePackActions'
import type {
  CanvasAppFeaturePackMarketplaceItem,
} from './CanvasAppFeaturePackMarketplaceSections'
import type {
  CanvasAppFeaturePackProfileMarketplaceAction,
  CanvasAppFeaturePackProfileMarketplaceActionItem,
} from './CanvasAppFeaturePackProfileActions'
import type {
  CanvasAppFeaturePackSuiteMarketplaceAction,
  CanvasAppFeaturePackSuiteMarketplaceActionItem,
} from './CanvasAppFeaturePackSuiteActions'
import type {
  CanvasAppFeaturePackMarketplacePrimaryAction,
  CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic,
  CanvasAppFeaturePackMarketplaceTarget,
  CanvasAppFeaturePackMarketplaceTargetControl,
  CanvasAppFeaturePackMarketplaceTargetControlInput,
  CanvasAppFeaturePackMarketplaceTargetItemInput,
} from './CanvasAppFeaturePackMarketplaceControlContracts'
import {
  getCanvasAppFeaturePackMarketplaceItemLabel,
  getCanvasAppFeaturePackMarketplaceTargetFallbackLabel,
  isCanvasAppFeaturePackMarketplacePackItem,
  isCanvasAppFeaturePackMarketplaceProfileItem,
  isCanvasAppFeaturePackMarketplaceItemActive,
  isCanvasAppFeaturePackMarketplaceItemInstalled,
  snapshotCanvasAppFeaturePackMarketplaceTarget,
} from './CanvasAppFeaturePackMarketplaceTargetControlHelpers'

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
    packageContract: item.packageContract,
    packageState: item.packageState,
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

export function isCanvasAppFeaturePackMarketplaceSameTarget(
  left: CanvasAppFeaturePackMarketplaceTarget,
  right: CanvasAppFeaturePackMarketplaceTarget,
): boolean {
  if (left.kind !== right.kind) {
    return false
  }

  if (left.kind === 'pack' && right.kind === 'pack') {
    return left.featurePackId === right.featurePackId
  }

  if (left.kind === 'profile' && right.kind === 'profile') {
    return left.profileId === right.profileId
  }

  return left.kind === 'suite' &&
    right.kind === 'suite' &&
    left.suiteId === right.suiteId
}

export function isCanvasAppFeaturePackMarketplaceBlockedPrimaryActionDiagnostic(
  diagnostic: CanvasAppFeaturePackMarketplacePrimaryActionDiagnostic,
) {
  return diagnostic.applicable && diagnostic.status === 'blocked'
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
    packageContract: null,
    packageState: null,
    ready: false,
    status: 'missing',
    target: snapshotCanvasAppFeaturePackMarketplaceTarget(target),
    totalBlockedReasonCount: 0,
  })
}
