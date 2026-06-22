import {
  type CanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  type CanvasAppFeaturePackId,
  type CanvasAppFeaturePackRuntimeState,
} from './CanvasAppFeaturePacks'
import type {
  CanvasAppFeaturePackCatalogBlockScope,
  CanvasAppFeaturePackCatalogConflictBlockReason,
  CanvasAppFeaturePackCatalogItem,
  CanvasAppFeaturePackCatalogRequiredBlockReason,
  CanvasAppFeaturePackCatalogRequiredBlockReasonKind,
} from './CanvasAppFeaturePackCatalog'

type CanvasAppFeaturePackCatalogGraph = Readonly<{
  enabledIds: ReadonlySet<CanvasAppFeaturePackId>
  installedIds: ReadonlySet<CanvasAppFeaturePackId>
  knownIds: ReadonlySet<CanvasAppFeaturePackId>
  stateById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackRuntimeState>
}>

export function createCanvasAppFeaturePackCatalogItem({
  graph,
  manifest,
}: {
  graph: CanvasAppFeaturePackCatalogGraph
  manifest: CanvasAppFeaturePackManifest
}): CanvasAppFeaturePackCatalogItem {
  const state = graph.stateById.get(manifest.id)

  if (!state) {
    throw new Error(`Missing canvas app feature pack catalog state: ${manifest.id}`)
  }

  return Object.freeze({
    blockedReasons: Object.freeze([
      ...getCanvasAppFeaturePackCatalogRequiredBlockReasons({
        graph,
        manifest,
        scope: 'installed',
      }),
      ...getCanvasAppFeaturePackCatalogConflictBlockReasons({
        graph,
        manifest,
        scope: 'installed',
      }),
      ...getCanvasAppFeaturePackCatalogRequiredBlockReasons({
        graph,
        manifest,
        scope: 'enabled',
      }),
      ...getCanvasAppFeaturePackCatalogConflictBlockReasons({
        graph,
        manifest,
        scope: 'enabled',
      }),
    ]),
    category: manifest.category,
    compatibility: manifest.compatibility,
    conflicts: manifest.conflicts,
    contributes: manifest.contributes,
    enabled: state.enabled,
    id: manifest.id,
    installed: state.installed,
    label: manifest.label,
    lifecycle: manifest.lifecycle,
    optionalRequires: manifest.optionalRequires,
    package: manifest.package,
    partialUpdate: manifest.lifecycle.partialUpdate,
    provides: manifest.provides,
    requires: manifest.requires,
    state,
    status: state.status,
    version: manifest.version,
  })
}

export function createCanvasAppFeaturePackCatalogGraph({
  manifests,
  states,
}: {
  manifests: readonly CanvasAppFeaturePackManifest[]
  states: readonly CanvasAppFeaturePackRuntimeState[]
}): CanvasAppFeaturePackCatalogGraph {
  const stateById = new Map(states.map((state) => [state.id, state]))

  return Object.freeze({
    enabledIds: createCanvasAppFeaturePackCatalogActiveIdSet({
      manifests,
      stateById,
      stateKey: 'enabled',
    }),
    installedIds: createCanvasAppFeaturePackCatalogActiveIdSet({
      manifests,
      stateById,
      stateKey: 'installed',
    }),
    knownIds: new Set(
      manifests.flatMap((manifest) => [manifest.id, ...manifest.provides]),
    ),
    stateById,
  })
}

function createCanvasAppFeaturePackCatalogActiveIdSet({
  manifests,
  stateById,
  stateKey,
}: {
  manifests: readonly CanvasAppFeaturePackManifest[]
  stateById: ReadonlyMap<CanvasAppFeaturePackId, CanvasAppFeaturePackRuntimeState>
  stateKey: 'enabled' | 'installed'
}) {
  return new Set(
    manifests
      .filter((manifest) => stateById.get(manifest.id)?.[stateKey])
      .flatMap((manifest) => [manifest.id, ...manifest.provides]),
  )
}

export function getCanvasAppFeaturePackCatalogRequiredBlockReasons({
  graph,
  manifest,
  scope,
}: {
  graph: CanvasAppFeaturePackCatalogGraph
  manifest: CanvasAppFeaturePackManifest
  scope: CanvasAppFeaturePackCatalogBlockScope
}): CanvasAppFeaturePackCatalogRequiredBlockReason[] {
  return manifest.requires.flatMap((requiredId) => {
    const reason = getCanvasAppFeaturePackCatalogRequiredBlockReason({
      graph,
      manifest,
      requiredId,
      scope,
    })

    return reason ? [reason] : []
  })
}

function getCanvasAppFeaturePackCatalogRequiredBlockReason({
  graph,
  manifest,
  requiredId,
  scope,
}: {
  graph: CanvasAppFeaturePackCatalogGraph
  manifest: CanvasAppFeaturePackManifest
  requiredId: CanvasAppFeaturePackId
  scope: CanvasAppFeaturePackCatalogBlockScope
}): CanvasAppFeaturePackCatalogRequiredBlockReason | undefined {
  if (!graph.knownIds.has(requiredId)) {
    return createCanvasAppFeaturePackCatalogRequiredBlockReason({
      kind: 'missing-required-pack',
      manifest,
      requiredId,
      scope,
    })
  }

  const activeIds = scope === 'installed' ? graph.installedIds : graph.enabledIds

  if (activeIds.has(requiredId)) {
    return undefined
  }

  if (scope === 'enabled' && graph.installedIds.has(requiredId)) {
    return createCanvasAppFeaturePackCatalogRequiredBlockReason({
      kind: 'disabled-required-pack',
      manifest,
      requiredId,
      scope,
    })
  }

  return createCanvasAppFeaturePackCatalogRequiredBlockReason({
    kind: 'uninstalled-required-pack',
    manifest,
    requiredId,
    scope,
  })
}

function createCanvasAppFeaturePackCatalogRequiredBlockReason({
  kind,
  manifest,
  requiredId,
  scope,
}: {
  kind: CanvasAppFeaturePackCatalogRequiredBlockReasonKind
  manifest: CanvasAppFeaturePackManifest
  requiredId: CanvasAppFeaturePackId
  scope: CanvasAppFeaturePackCatalogBlockScope
}): CanvasAppFeaturePackCatalogRequiredBlockReason {
  return Object.freeze({
    featurePackId: manifest.id,
    kind,
    requiredId,
    scope,
  })
}

export function getCanvasAppFeaturePackCatalogConflictBlockReasons({
  graph,
  manifest,
  scope,
}: {
  graph: CanvasAppFeaturePackCatalogGraph
  manifest: CanvasAppFeaturePackManifest
  scope: CanvasAppFeaturePackCatalogBlockScope
}): CanvasAppFeaturePackCatalogConflictBlockReason[] {
  const activeIds = scope === 'installed' ? graph.installedIds : graph.enabledIds

  return manifest.conflicts.flatMap((conflictId) => {
    if (!activeIds.has(conflictId)) {
      return []
    }

    return [Object.freeze({
      conflictId,
      featurePackId: manifest.id,
      kind: scope === 'installed' ? 'installed-conflict' : 'enabled-conflict',
      scope,
    })]
  })
}
