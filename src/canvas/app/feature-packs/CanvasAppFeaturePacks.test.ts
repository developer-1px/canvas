import { describe, expect, it } from 'vitest'
import { createCanvasAffordanceConfig } from '../../engine'
import {
  createCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  DEFAULT_CANVAS_APP_EXTENSION_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE,
  DEFAULT_CANVAS_APP_FEATURE_PACKS,
} from './CanvasAppDefaultFeaturePacks'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS,
  DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
} from './CanvasAppDefaultViewFeaturePacks'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
} from './CanvasAppDefaultFeaturePackManifests'
import {
  createCanvasAppFeaturePackManifest,
  getCanvasAppInstalledFeaturePackManifestIds,
  getCanvasAppManifestExtensionFeaturePacks,
  getCanvasAppManifestViewFeaturePacks,
} from './CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackExtensionBundle,
  getCanvasAppInstalledFeaturePacks,
} from './CanvasAppFeaturePacks'
import {
  getCanvasAppRuntimeFeatureConfig,
} from './CanvasAppFeaturePackRuntimeModel'
import {
  createCanvasAppFeaturePackViewRenderers,
  createCanvasAppViewFeaturePack,
} from './CanvasAppFeaturePackViews'
import {
  createCanvasAppAiLabsFeaturePackManifest,
} from '@interactive-os/canvas-pack-ai-labs'
import {
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
} from './board-io'
import {
  createCanvasAppDomEditStyleFeaturePackManifest,
} from './dom-edit-style'

describe('CanvasAppFeaturePacks', () => {
  it('installs feature pack extension bundles in pack order', () => {
    const publish = createCommand('publish')
    const archive = createCommand('archive')
    const packs = [
      createCanvasAppFeaturePack({
        extensionBundle: createCanvasAppExtensionBundle({
          customCommands: [publish],
        }),
        id: 'publish-pack',
        label: 'Publish pack',
      }),
      createCanvasAppFeaturePack({
        extensionBundle: createCanvasAppExtensionBundle({
          customCommands: [archive],
        }),
        id: 'archive-pack',
        label: 'Archive pack',
      }),
    ]

    const bundle = createCanvasAppFeaturePackExtensionBundle(packs)

    expect(bundle.customCommands.map((command) => command.id)).toEqual([
      'publish',
      'archive',
    ])
  })

  it('uninstalls disabled feature packs by id', () => {
    const packs = [
      createCanvasAppFeaturePack({
        extensionBundle: createCanvasAppExtensionBundle({
          customCommands: [createCommand('publish')],
        }),
        id: 'publish-pack',
        label: 'Publish pack',
      }),
      createCanvasAppFeaturePack({
        extensionBundle: createCanvasAppExtensionBundle({
          customCommands: [createCommand('archive')],
        }),
        id: 'archive-pack',
        label: 'Archive pack',
      }),
    ]

    expect(getCanvasAppInstalledFeaturePacks(packs, {
      disabledFeaturePackIds: ['publish-pack'],
    }).map((pack) => pack.id)).toEqual(['archive-pack'])
    expect(createCanvasAppFeaturePackExtensionBundle(packs, {
      disabledFeaturePackIds: ['publish-pack'],
    }).customCommands.map((command) => command.id)).toEqual(['archive'])
  })

  it('rejects duplicate feature pack ids and duplicate installed entries', () => {
    const publishPack = createCanvasAppFeaturePack({
      extensionBundle: createCanvasAppExtensionBundle({
        customCommands: [createCommand('publish')],
      }),
      id: 'publish-pack',
      label: 'Publish pack',
    })

    expect(() =>
      createCanvasAppFeaturePackExtensionBundle([publishPack, publishPack]),
    ).toThrow('Duplicate canvas app feature pack: publish-pack')
    expect(() =>
      createCanvasAppFeaturePackExtensionBundle([
        publishPack,
        createCanvasAppFeaturePack({
          extensionBundle: createCanvasAppExtensionBundle({
            customCommands: [createCommand('publish')],
          }),
          id: 'archive-pack',
          label: 'Archive pack',
        }),
      ]),
    ).toThrow('Duplicate canvas app assembly custom command: publish')
  })

  it('keeps default extension contributions behind default feature packs', () => {
    expect(
      DEFAULT_CANVAS_APP_EXTENSION_FEATURE_PACK_MANIFESTS.map(
        (manifest) => manifest.id,
      ),
    ).toEqual([
      'media-import',
      'arrow-routing-inspector',
      'checklist-inspector',
      'kanban-inspector',
    ])
    expect(DEFAULT_CANVAS_APP_FEATURE_PACKS.map((pack) => pack.id)).toEqual([
      'media-import',
      'arrow-routing-inspector',
      'checklist-inspector',
      'kanban-inspector',
    ])
    expect(
      DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE.inspectorPanels.map(
        (panel) => panel.id,
      ),
    ).toEqual([
      'link-preview-actions',
      'arrow-routing-actions',
      'checklist-actions',
      'kanban-actions',
    ])
  })

  it('installs view renderers by view feature pack id', () => {
    expect(DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS.map(
      (manifest) => manifest.id,
    )).toEqual([
      'command-palette',
      'component-authoring',
      'cursor-chat',
      'drawing-tools',
      'facilitation',
      'find-replace',
      'image-io',
      'minimap',
      'selection-toolbar',
      'shortcut-help',
      'stamp-authoring',
      'status-bar',
      'toolbar',
      'zoom-controls',
    ])
    expect(DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS.map((pack) => pack.id))
      .toEqual([
        'command-palette',
        'component-authoring',
        'cursor-chat',
        'drawing-tools',
        'facilitation',
        'find-replace',
        'image-io',
        'minimap',
        'selection-toolbar',
        'shortcut-help',
        'stamp-authoring',
        'status-bar',
        'toolbar',
        'zoom-controls',
      ])
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar)
      .toBeTypeOf('function')
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.selectionFloatingBar)
      .toBeTypeOf('function')
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.contextCommandMenu)
      .toBeTypeOf('function')

    const renderersWithoutToolbar = createCanvasAppFeaturePackViewRenderers(
      DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
      {
        disabledFeaturePackIds: ['toolbar', 'component-authoring'],
      },
    )

    expect(renderersWithoutToolbar.toolbar).toBeUndefined()
    expect(renderersWithoutToolbar.selectionFloatingBar)
      .toBe(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.selectionFloatingBar)
    expect(renderersWithoutToolbar.contextCommandMenu).toBeUndefined()
    expect(renderersWithoutToolbar.componentPalette).toBeUndefined()
    expect(renderersWithoutToolbar.stickyQuickCreate).toBeUndefined()
    expect(renderersWithoutToolbar.cursorChat)
      .toBe(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.cursorChat)

    const renderersWithoutSelectionToolbar =
      createCanvasAppFeaturePackViewRenderers(
        DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
        {
          disabledFeaturePackIds: ['selection-toolbar'],
        },
      )

    expect(renderersWithoutSelectionToolbar.toolbar)
      .toBe(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar)
    expect(renderersWithoutSelectionToolbar.contextCommandMenu)
      .toBe(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.contextCommandMenu)
    expect(renderersWithoutSelectionToolbar.selectionFloatingBar)
      .toBeUndefined()
    expect(renderersWithoutSelectionToolbar.cursorChat)
      .toBe(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.cursorChat)
  })

  it('derives installable contributions from folder-owned manifests', () => {
    const publish = createCommand('publish')
    const renderStatus = () => null
    const extensionFeaturePack = createCanvasAppFeaturePack({
      extensionBundle: createCanvasAppExtensionBundle({
        customCommands: [publish],
      }),
      id: 'publish-pack',
      label: 'Publish pack',
    })
    const viewFeaturePack = createCanvasAppViewFeaturePack({
      id: 'status-pack',
      label: 'Status pack',
      viewRenderers: {
        status: renderStatus,
      },
    })

    const manifests = [
      createCanvasAppFeaturePackManifest({
        extensionFeaturePack,
        id: 'publish-pack',
        label: 'Publish pack',
      }),
      createCanvasAppFeaturePackManifest({
        id: 'status-pack',
        label: 'Status pack',
        viewFeaturePack,
      }),
    ]

    expect(getCanvasAppManifestExtensionFeaturePacks(manifests))
      .toEqual([extensionFeaturePack])
    expect(getCanvasAppManifestViewFeaturePacks(manifests))
      .toEqual([viewFeaturePack])
    expect(getCanvasAppInstalledFeaturePackManifestIds(manifests, {
      disabledFeaturePackIds: ['publish-pack'],
    })).toEqual(['status-pack'])
    expect(getCanvasAppInstalledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
    )).toContain('text-paste-import')
  })

  it('derives optional feature pack manifests from pack factories', () => {
    const aiLabsManifest = createCanvasAppAiLabsFeaturePackManifest({
      provider: {
        complete: () => ({ text: 'Summary' }),
        id: 'test-ai',
      },
      requestReview: () => ({ kind: 'cancel' }),
    })
    const domEditStyleManifest =
      createCanvasAppDomEditStyleFeaturePackManifest({
        id: 'risk-dom-card-style',
        itemKind: 'risk',
        targetId: 'card',
      })
    const manifests = [
      aiLabsManifest,
      domEditStyleManifest,
      CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
    ]

    expect(getCanvasAppInstalledFeaturePackManifestIds(manifests))
      .toEqual(['ai-labs', 'risk-dom-card-style', 'board-io'])
    expect(getCanvasAppManifestExtensionFeaturePacks(manifests)
      .map((pack) => pack.id)).toEqual([
        'ai-labs',
        'risk-dom-card-style',
      ])
  })

  it('rejects duplicate view feature pack ids and renderer ids', () => {
    const renderStatus = () => null
    const statusPack = createCanvasAppViewFeaturePack({
      id: 'status-pack',
      label: 'Status pack',
      viewRenderers: {
        status: renderStatus,
      },
    })

    expect(() =>
      createCanvasAppFeaturePackViewRenderers([statusPack, statusPack]),
    ).toThrow('Duplicate canvas app view feature pack: status-pack')
    expect(() =>
      createCanvasAppFeaturePackViewRenderers([
        statusPack,
        createCanvasAppViewFeaturePack({
          id: 'alt-status-pack',
          label: 'Alt status pack',
          viewRenderers: {
            status: renderStatus,
          },
        }),
      ]),
    ).toThrow('Duplicate canvas app view feature renderer: status')
  })

  it('masks runtime affordances when a feature pack is uninstalled', () => {
    const config = createCanvasAffordanceConfig()

    expect(getCanvasAppRuntimeFeatureConfig({
      config,
      disabledConfig: {},
      enabled: true,
    })).toBe(config)

    const runtimeConfig = getCanvasAppRuntimeFeatureConfig({
      config,
      disabledConfig: {
        gestures: {
          emoteBurst: false,
        },
        overlays: {
          cursorChat: false,
          emoteBursts: false,
        },
        shortcuts: {
          cursorChat: false,
        },
      },
      enabled: false,
    })

    expect(runtimeConfig).not.toBe(config)
    expect(runtimeConfig.gestures.emoteBurst).toBe(false)
    expect(runtimeConfig.overlays.cursorChat).toBe(false)
    expect(runtimeConfig.overlays.emoteBursts).toBe(false)
    expect(runtimeConfig.shortcuts.cursorChat).toBe(false)
    expect(runtimeConfig.overlays.toolbar).toBe(true)
    expect(config.overlays.cursorChat).toBe(true)
  })
})

function createCommand(id: string) {
  return {
    id,
    label: id,
    run: () => undefined,
    title: id,
  }
}
