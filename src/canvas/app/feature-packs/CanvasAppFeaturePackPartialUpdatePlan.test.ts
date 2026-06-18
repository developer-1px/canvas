import { describe, expect, it } from 'vitest'
import {
  getCanvasAppFeaturePackPartialUpdatePlan,
} from './CanvasAppFeaturePackPartialUpdatePlan'
import {
  createCanvasAppFeaturePackManifest,
} from './CanvasAppFeaturePackManifests'

describe('CanvasAppFeaturePackPartialUpdatePlan', () => {
  it('plans deduped runtime toggle update surfaces by target pack', () => {
    const overlayManifest = createCanvasAppFeaturePackManifest({
      id: 'overlay-pack',
      label: 'Overlay pack',
      lifecycle: {
        partialUpdate: ['overlay'],
        runtimeToggleable: true,
      },
    })
    const inspectorManifest = createCanvasAppFeaturePackManifest({
      id: 'inspector-pack',
      label: 'Inspector pack',
      lifecycle: {
        partialUpdate: ['overlay', 'inspector'],
        runtimeToggleable: true,
      },
    })

    expect(getCanvasAppFeaturePackPartialUpdatePlan({
      manifests: [
        overlayManifest,
        inspectorManifest,
      ],
      targetFeaturePackIds: [
        'overlay-pack',
        'inspector-pack',
        'overlay-pack',
      ],
    })).toEqual({
      blockedReasons: [],
      entries: [
        {
          featurePackId: 'overlay-pack',
          hotReloadable: false,
          label: 'Overlay pack',
          runtimeToggleable: true,
          surfaceIds: ['overlay'],
        },
        {
          featurePackId: 'inspector-pack',
          hotReloadable: false,
          label: 'Inspector pack',
          runtimeToggleable: true,
          surfaceIds: ['overlay', 'inspector'],
        },
      ],
      operation: 'runtime-toggle',
      ready: true,
      status: 'ready',
      surfaceIds: ['overlay', 'inspector'],
      targetFeaturePackIds: [
        'overlay-pack',
        'inspector-pack',
        'overlay-pack',
      ],
    })
  })

  it('blocks runtime toggle plans without partial surfaces or runtime toggle support', () => {
    const defaultManifest = createCanvasAppFeaturePackManifest({
      id: 'default-pack',
      label: 'Default pack',
    })
    const commandManifest = createCanvasAppFeaturePackManifest({
      id: 'command-pack',
      label: 'Command pack',
      lifecycle: {
        partialUpdate: ['command'],
      },
    })

    expect(getCanvasAppFeaturePackPartialUpdatePlan({
      manifests: [
        defaultManifest,
        commandManifest,
      ],
      targetFeaturePackIds: [
        'default-pack',
        'command-pack',
      ],
    })).toMatchObject({
      blockedReasons: [
        {
          featurePackId: 'default-pack',
          kind: 'empty-partial-update',
        },
        {
          featurePackId: 'default-pack',
          kind: 'runtime-toggle-unavailable',
          operation: 'runtime-toggle',
        },
        {
          featurePackId: 'command-pack',
          kind: 'runtime-toggle-unavailable',
          operation: 'runtime-toggle',
        },
      ],
      ready: false,
      status: 'blocked',
      surfaceIds: ['command'],
    })
  })

  it('blocks hot reload plans without hot reload support', () => {
    const assetManifest = createCanvasAppFeaturePackManifest({
      id: 'asset-pack',
      label: 'Asset pack',
      lifecycle: {
        hotReloadable: true,
        partialUpdate: ['asset'],
      },
    })
    const commandManifest = createCanvasAppFeaturePackManifest({
      id: 'command-pack',
      label: 'Command pack',
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })

    expect(getCanvasAppFeaturePackPartialUpdatePlan({
      manifests: [
        assetManifest,
        commandManifest,
      ],
      operation: 'hot-reload',
      targetFeaturePackIds: [
        'asset-pack',
        'command-pack',
      ],
    })).toMatchObject({
      blockedReasons: [{
        featurePackId: 'command-pack',
        kind: 'hot-reload-unavailable',
        operation: 'hot-reload',
      }],
      entries: [
        {
          featurePackId: 'asset-pack',
          hotReloadable: true,
          runtimeToggleable: false,
          surfaceIds: ['asset'],
        },
        {
          featurePackId: 'command-pack',
          hotReloadable: false,
          runtimeToggleable: true,
          surfaceIds: ['command'],
        },
      ],
      operation: 'hot-reload',
      ready: false,
      status: 'blocked',
      surfaceIds: ['asset', 'command'],
    })
  })

  it('reports unknown targets without dropping known target surfaces', () => {
    const overlayManifest = createCanvasAppFeaturePackManifest({
      id: 'overlay-pack',
      label: 'Overlay pack',
      lifecycle: {
        partialUpdate: ['overlay'],
        runtimeToggleable: true,
      },
    })

    expect(getCanvasAppFeaturePackPartialUpdatePlan({
      manifests: [overlayManifest],
      targetFeaturePackIds: [
        'missing-pack',
        'overlay-pack',
      ],
    })).toMatchObject({
      blockedReasons: [{
        kind: 'unknown-target-pack',
        targetId: 'missing-pack',
      }],
      entries: [{
        featurePackId: 'overlay-pack',
        surfaceIds: ['overlay'],
      }],
      ready: false,
      status: 'blocked',
      surfaceIds: ['overlay'],
    })
  })
})
