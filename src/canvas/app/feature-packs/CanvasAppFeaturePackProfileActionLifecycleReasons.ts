import type {
  CanvasAppFeaturePackId,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackProfileId,
} from './CanvasAppFeaturePackProfiles'
import type {
  CanvasAppFeaturePackProfileMarketplaceContext,
  CanvasAppFeaturePackProfileMarketplaceLifecycleReason,
  CanvasAppFeaturePackProfileMarketplaceStateChange,
} from './CanvasAppFeaturePackProfileActionContracts'

export function getCanvasAppFeaturePackProfileMarketplaceLifecycleReasons({
  context,
  stateChanges,
}: {
  context: CanvasAppFeaturePackProfileMarketplaceContext
  stateChanges: readonly CanvasAppFeaturePackProfileMarketplaceStateChange[]
}): readonly CanvasAppFeaturePackProfileMarketplaceLifecycleReason[] {
  return Object.freeze(stateChanges.flatMap((change) => {
    const manifest = context.manifestById.get(change.id)

    if (!manifest) {
      return []
    }

    if (!change.from.installed && change.to.installed) {
      return manifest.lifecycle.installable
        ? []
        : [createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
          featurePackId: change.id,
          kind: 'install-unavailable',
          profileId: context.profile.id,
        })]
    }

    if (change.from.installed && !change.to.installed) {
      return manifest.lifecycle.uninstallable
        ? []
        : [createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
          featurePackId: change.id,
          kind: 'uninstall-unavailable',
          profileId: context.profile.id,
        })]
    }

    if (
      change.from.installed &&
      change.to.installed &&
      change.from.enabled !== change.to.enabled &&
      !manifest.lifecycle.runtimeToggleable
    ) {
      return [createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
        featurePackId: change.id,
        kind: 'runtime-toggle-unavailable',
        profileId: context.profile.id,
      })]
    }

    return []
  }))
}

function createCanvasAppFeaturePackProfileMarketplaceLifecycleReason({
  featurePackId,
  kind,
  profileId,
}: {
  featurePackId: CanvasAppFeaturePackId
  kind: CanvasAppFeaturePackProfileMarketplaceLifecycleReason['kind']
  profileId: CanvasAppFeaturePackProfileId
}): CanvasAppFeaturePackProfileMarketplaceLifecycleReason {
  return Object.freeze({
    featurePackId,
    kind,
    profileId,
  })
}
