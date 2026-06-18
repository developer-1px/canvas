import { describe, expect, it } from 'vitest'
import {
  getCanvasAppFeaturePackStateTransitionPlan,
} from './CanvasAppFeaturePackStateTransitionPlan'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'
import {
  CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST,
} from './component-authoring'
import {
  CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST,
} from './component-library'

describe('CanvasAppFeaturePackStateTransitionPlan', () => {
  it('plans enable transitions with dependency closure and partial surfaces', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        partialUpdate: ['runtime-model'],
        runtimeToggleable: true,
      },
      provides: ['runtime-capability'],
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      id: 'inspector-pack',
      label: 'Inspector pack',
      lifecycle: {
        partialUpdate: ['inspector'],
        runtimeToggleable: true,
      },
      requires: ['runtime-capability'],
    })

    const plan = getCanvasAppFeaturePackStateTransitionPlan({
      manifests: [
        runtimeManifest,
        inspectorManifest,
      ],
      operation: 'enable',
      options: {
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'uninstalled',
          },
          {
            id: 'inspector-pack',
            status: 'uninstalled',
          },
        ],
      },
      targetFeaturePackIds: ['inspector-pack'],
    })

    expect(plan).toMatchObject({
      blockedReasons: [],
      changedFeaturePackIds: ['runtime-pack', 'inspector-pack'],
      enableFeaturePackIds: ['runtime-pack', 'inspector-pack'],
      installFeaturePackIds: ['runtime-pack', 'inspector-pack'],
      operation: 'enable',
      partialUpdateSurfaceIds: ['runtime-model', 'inspector'],
      ready: true,
      status: 'ready',
    })
    expect(plan.featurePackStates).toEqual([
      {
        id: 'runtime-pack',
        status: 'enabled',
      },
      {
        id: 'inspector-pack',
        status: 'enabled',
      },
    ])
    expect(plan.stateChanges.map((change) => ({
      from: change.from.status,
      id: change.id,
      to: change.to.status,
    }))).toEqual([
      {
        from: 'uninstalled',
        id: 'runtime-pack',
        to: 'enabled',
      },
      {
        from: 'uninstalled',
        id: 'inspector-pack',
        to: 'enabled',
      },
    ])
  })

  it('plans install transitions without enabling packs', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      provides: ['runtime-capability'],
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      id: 'inspector-pack',
      label: 'Inspector pack',
      requires: ['runtime-capability'],
    })

    expect(getCanvasAppFeaturePackStateTransitionPlan({
      manifests: [
        runtimeManifest,
        inspectorManifest,
      ],
      operation: 'install',
      options: {
        featurePackStates: [
          {
            id: 'runtime-pack',
            status: 'uninstalled',
          },
          {
            id: 'inspector-pack',
            status: 'uninstalled',
          },
        ],
      },
      targetFeaturePackIds: ['inspector-pack'],
    })).toMatchObject({
      changedFeaturePackIds: ['runtime-pack', 'inspector-pack'],
      enableFeaturePackIds: [],
      featurePackStates: [
        {
          id: 'runtime-pack',
          status: 'disabled',
        },
        {
          id: 'inspector-pack',
          status: 'disabled',
        },
      ],
      installFeaturePackIds: ['runtime-pack', 'inspector-pack'],
      partialUpdateSurfaceIds: [],
      status: 'ready',
    })
  })

  it('enables the component runtime when component authoring is enabled', () => {
    const plan = getCanvasAppFeaturePackStateTransitionPlan({
      manifests: [
        CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST,
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST,
      ],
      operation: 'enable',
      options: {
        featurePackStates: [
          {
            id: CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
            status: 'uninstalled',
          },
          {
            id: CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
            status: 'uninstalled',
          },
        ],
      },
      targetFeaturePackIds: [
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
      ],
    })

    expect(CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.requires)
      .toEqual(['component-runtime'])
    expect(plan).toMatchObject({
      changedFeaturePackIds: [
        CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
      ],
      enableFeaturePackIds: [
        CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
      ],
      installFeaturePackIds: [
        CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
      ],
      partialUpdateSurfaceIds: ['runtime-model', 'view-renderer'],
      ready: true,
      status: 'ready',
    })
    expect(plan.featurePackStates).toEqual([
      {
        id: CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
        status: 'enabled',
      },
      {
        id: CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
        status: 'enabled',
      },
    ])
  })

  it('blocks disabling a provider required by an enabled pack', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      lifecycle: {
        partialUpdate: ['runtime-model'],
        runtimeToggleable: true,
      },
      provides: ['runtime-capability'],
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      id: 'inspector-pack',
      label: 'Inspector pack',
      requires: ['runtime-capability'],
    })

    expect(getCanvasAppFeaturePackStateTransitionPlan({
      manifests: [
        runtimeManifest,
        inspectorManifest,
      ],
      operation: 'disable',
      targetFeaturePackIds: ['runtime-pack'],
    })).toMatchObject({
      blockedReasons: [{
        dependentFeaturePackId: 'inspector-pack',
        featurePackId: 'runtime-pack',
        kind: 'required-by-enabled-pack',
        requiredId: 'runtime-capability',
      }],
      changedFeaturePackIds: ['runtime-pack'],
      disableFeaturePackIds: ['runtime-pack'],
      featurePackStates: [
        {
          id: 'runtime-pack',
          status: 'disabled',
        },
        {
          id: 'inspector-pack',
          status: 'enabled',
        },
      ],
      partialUpdateSurfaceIds: ['runtime-model'],
      ready: false,
      status: 'blocked',
    })
  })

  it('blocks uninstalling a provider required by an installed pack', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
      provides: ['runtime-capability'],
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      id: 'inspector-pack',
      label: 'Inspector pack',
      requires: ['runtime-capability'],
    })

    expect(getCanvasAppFeaturePackStateTransitionPlan({
      manifests: [
        runtimeManifest,
        inspectorManifest,
      ],
      operation: 'uninstall',
      options: {
        featurePackStates: [{
          id: 'inspector-pack',
          status: 'disabled',
        }],
      },
      targetFeaturePackIds: ['runtime-pack'],
    })).toMatchObject({
      blockedReasons: [{
        dependentFeaturePackId: 'inspector-pack',
        featurePackId: 'runtime-pack',
        kind: 'required-by-installed-pack',
        requiredId: 'runtime-capability',
      }],
      changedFeaturePackIds: ['runtime-pack'],
      featurePackStates: [
        {
          id: 'runtime-pack',
          status: 'uninstalled',
        },
        {
          id: 'inspector-pack',
          status: 'disabled',
        },
      ],
      ready: false,
      status: 'blocked',
      uninstallFeaturePackIds: ['runtime-pack'],
    })
  })

  it('reports install, partial update, lifecycle, and unknown target blockers', () => {
    const lockedManifest = createCanvasAppFeaturePackManifest({
      id: 'locked-pack',
      label: 'Locked pack',
      lifecycle: {
        installable: false,
      },
    })
    const staticManifest = createCanvasAppFeaturePackManifest({
      id: 'static-pack',
      label: 'Static pack',
    })

    expect(getCanvasAppFeaturePackStateTransitionPlan({
      manifests: [
        lockedManifest,
        staticManifest,
      ],
      operation: 'install',
      options: {
        featurePackStates: [{
          id: 'locked-pack',
          status: 'uninstalled',
        }],
      },
      targetFeaturePackIds: ['locked-pack'],
    }).blockedReasons).toContainEqual({
      featurePackId: 'locked-pack',
      kind: 'install-unavailable',
    })

    expect(getCanvasAppFeaturePackStateTransitionPlan({
      manifests: [
        lockedManifest,
        staticManifest,
      ],
      operation: 'disable',
      targetFeaturePackIds: [
        'static-pack',
        'missing-pack',
      ],
    }).blockedReasons).toEqual([
      {
        kind: 'unknown-target-pack',
        targetId: 'missing-pack',
      },
      {
        featurePackId: 'static-pack',
        kind: 'runtime-toggle-unavailable',
      },
      {
        kind: 'partial-update-blocked',
        reason: {
          featurePackId: 'static-pack',
          kind: 'empty-partial-update',
        },
      },
      {
        kind: 'partial-update-blocked',
        reason: {
          featurePackId: 'static-pack',
          kind: 'runtime-toggle-unavailable',
          operation: 'runtime-toggle',
        },
      },
    ])
  })
})
