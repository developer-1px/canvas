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
  CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST,
  CANVAS_COMPONENT_SYSTEM_SUITE_ID,
  CANVAS_STORY_CANVAS_FEATURE_PACK_SUITE_MANIFEST,
  CANVAS_STORY_CANVAS_SUITE_ID,
  DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
} from './CanvasAppDefaultFeaturePackSuites'
import {
  createCanvasAppFeaturePackManifest,
  getCanvasAppEnabledFeaturePackManifestIds,
  getCanvasAppEnabledFeaturePackManifests,
  getCanvasAppInstalledFeaturePackManifestIds,
  getCanvasAppManifestExtensionFeaturePacks,
  getCanvasAppManifestViewFeaturePacks,
} from './CanvasAppFeaturePackManifests'
import {
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackExtensionBundle,
  getCanvasAppEnabledFeaturePackIds,
  getCanvasAppInstalledFeaturePackIds,
  getCanvasAppInstalledFeaturePacks,
  getCanvasAppResolvedFeaturePackStates,
} from './CanvasAppFeaturePacks'
import {
  CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE,
  CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE,
  CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
  DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE,
  createCanvasAppFeaturePackProfile,
  getCanvasAppFeaturePackProfileById,
  getCanvasAppFeaturePackProfileRuntimeStates,
} from './CanvasAppFeaturePackProfiles'
import {
  createCanvasAppFeaturePackSuiteManifest,
  getCanvasAppFeaturePackSuiteFeaturePackIds,
} from './CanvasAppFeaturePackSuites'
import {
  getCanvasAppRuntimeFeatureConfig,
} from './CanvasAppFeaturePackRuntimeModel'
import {
  createCanvasAppFeaturePackViewRenderers,
  createCanvasAppViewFeaturePack,
} from './CanvasAppFeaturePackViews'
import {
  createCanvasAppAiLabsFeaturePackManifest,
} from './ai-labs'
import {
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
} from './board-io'
import {
  createCanvasAppDomEditStyleFeaturePackManifest,
} from './dom-edit-style'
import {
  CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST,
} from './component-authoring'
import {
  CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST,
} from './component-inspector'
import {
  CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST,
} from './component-sync'
import {
  CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST,
} from './component-library'
import {
  CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
} from './story-preview'
import {
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
} from './story-import'

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

  it('resolves installed and enabled feature pack states separately', () => {
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
    const packIds = packs.map((pack) => pack.id)

    expect(getCanvasAppResolvedFeaturePackStates(packIds)).toEqual([
      {
        enabled: true,
        id: 'publish-pack',
        installed: true,
        status: 'enabled',
      },
      {
        enabled: true,
        id: 'archive-pack',
        installed: true,
        status: 'enabled',
      },
    ])
    expect(getCanvasAppInstalledFeaturePackIds(packIds, {
      featurePackStates: [
        {
          id: 'publish-pack',
          status: 'disabled',
        },
      ],
    })).toEqual(['publish-pack', 'archive-pack'])
    expect(getCanvasAppEnabledFeaturePackIds(packIds, {
      featurePackStates: [
        {
          id: 'publish-pack',
          status: 'disabled',
        },
      ],
    })).toEqual(['archive-pack'])
    expect(getCanvasAppInstalledFeaturePacks(packs, {
      featurePackStates: [
        {
          id: 'publish-pack',
          status: 'disabled',
        },
      ],
    }).map((pack) => pack.id)).toEqual(['archive-pack'])
    expect(createCanvasAppFeaturePackExtensionBundle(packs, {
      featurePackStates: [
        {
          id: 'publish-pack',
          status: 'disabled',
        },
      ],
    }).customCommands.map((command) => command.id)).toEqual(['archive'])
    expect(() =>
      getCanvasAppResolvedFeaturePackStates(packIds, {
        featurePackStates: [
          {
            enabled: true,
            id: 'publish-pack',
            installed: false,
          },
        ],
      }),
    ).toThrow('cannot be enabled when uninstalled')
    expect(() =>
      getCanvasAppResolvedFeaturePackStates(packIds, {
        featurePackStates: [
          {
            id: 'missing-pack',
            status: 'enabled',
          },
        ],
      }),
    ).toThrow('Unknown canvas app feature pack state: missing-pack')
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
      'component-sync',
      'component-inspector',
      'media-import',
      'arrow-routing-inspector',
      'checklist-inspector',
      'kanban-inspector',
    ])
    expect(DEFAULT_CANVAS_APP_FEATURE_PACKS.map((pack) => pack.id)).toEqual([
      'component-sync',
      'component-inspector',
      'media-import',
      'arrow-routing-inspector',
      'checklist-inspector',
      'kanban-inspector',
    ])
    expect(
      DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE
        .itemsChangeTransformers.map((transformer) => transformer.id),
    ).toEqual([
      'component-sync-items-change',
    ])
    expect(
      DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE.inspectorPanels.map(
        (panel) => panel.id,
      ),
    ).toEqual([
      'component-binding',
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
        'shortcut-help',
        'stamp-authoring',
        'status-bar',
        'toolbar',
        'zoom-controls',
      ])
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar)
      .toBeTypeOf('function')
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.contextCommandMenu)
      .toBeTypeOf('function')

    const renderers = createCanvasAppFeaturePackViewRenderers(
      DEFAULT_CANVAS_APP_VIEW_FEATURE_PACKS,
      {
        disabledFeaturePackIds: ['toolbar', 'component-authoring'],
      },
    )

    expect(renderers.toolbar).toBeUndefined()
    expect(renderers.selectionFloatingBar).toBeUndefined()
    expect(renderers.contextCommandMenu).toBeUndefined()
    expect(renderers.componentPalette).toBeUndefined()
    expect(renderers.stickyQuickCreate).toBeUndefined()
    expect(renderers.cursorChat)
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
    expect(getCanvasAppInstalledFeaturePackManifestIds(
      DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS,
    )).toContain(CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id)
    expect(CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST)
      .toMatchObject({
        category: 'authoring',
        contributes: {
          surfaces: ['overlay', 'view-renderer'],
        },
        lifecycle: {
          partialUpdate: ['overlay', 'view-renderer'],
          runtimeToggleable: true,
        },
      })
  })

  it('stores marketplace-ready manifest metadata with defaults and overrides', () => {
    const publishPack = createCanvasAppFeaturePack({
      extensionBundle: createCanvasAppExtensionBundle({
        customCommands: [createCommand('publish')],
      }),
      id: 'publish-pack',
      label: 'Publish pack',
    })
    const defaultManifest = createCanvasAppFeaturePackManifest({
      extensionFeaturePack: publishPack,
      id: 'publish-pack',
      label: 'Publish pack',
    })
    const customManifest = createCanvasAppFeaturePackManifest({
      category: 'automation',
      compatibility: {
        documentSchemaVersion: '2',
        engineVersion: '^1.0.0',
        featureStateVersion: '3',
      },
      conflicts: ['legacy-publish-pack'],
      contributes: {
        surfaces: ['command', 'runtime-model'],
      },
      extensionFeaturePack: publishPack,
      id: 'publish-pack',
      label: 'Publish pack',
      lifecycle: {
        hotReloadable: true,
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
      optionalRequires: ['audit-pack'],
      provides: ['publish-capability'],
      requires: ['workflow-pack'],
      version: '1.2.3',
    })

    expect(defaultManifest.category).toBe('view')
    expect(defaultManifest.version).toBe('0.1.0')
    expect(defaultManifest.lifecycle.installable).toBe(true)
    expect(defaultManifest.lifecycle.runtimeToggleable).toBe(false)
    expect(defaultManifest.compatibility.engineVersion).toBe('0.1.x')
    expect(defaultManifest.contributes.surfaces).toEqual([])
    expect(customManifest.category).toBe('automation')
    expect(customManifest.version).toBe('1.2.3')
    expect(customManifest.lifecycle).toEqual({
      hotReloadable: true,
      installable: true,
      partialUpdate: ['command'],
      runtimeToggleable: true,
      uninstallable: true,
    })
    expect(customManifest.contributes.surfaces).toEqual([
      'command',
      'runtime-model',
    ])
    expect(customManifest.requires).toEqual(['workflow-pack'])
    expect(customManifest.optionalRequires).toEqual(['audit-pack'])
    expect(customManifest.conflicts).toEqual(['legacy-publish-pack'])
    expect(customManifest.provides).toEqual(['publish-capability'])
    expect(() =>
      createCanvasAppFeaturePackManifest({
        contributes: {
          surfaces: ['command', 'command'],
        },
        id: 'duplicate-surfaces-pack',
        label: 'Duplicate surfaces pack',
      }),
    ).toThrow('Duplicate feature pack contribution surface: command')
  })

  it('derives installed and enabled manifest ids separately', () => {
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
    const options = {
      featurePackStates: [
        {
          id: 'publish-pack',
          status: 'disabled',
        },
      ],
    } as const

    expect(getCanvasAppInstalledFeaturePackManifestIds(
      manifests,
      options,
    )).toEqual(['publish-pack', 'status-pack'])
    expect(getCanvasAppEnabledFeaturePackManifestIds(
      manifests,
      options,
    )).toEqual(['status-pack'])
    expect(getCanvasAppEnabledFeaturePackManifests(
      manifests,
      options,
    ).map((manifest) => manifest.id)).toEqual(['status-pack'])
    expect(getCanvasAppManifestExtensionFeaturePacks(
      manifests,
      options,
    )).toEqual([])
    expect(getCanvasAppManifestViewFeaturePacks(
      manifests,
      options,
    )).toEqual([viewFeaturePack])
  })

  it('defines feature pack suite manifests as profile install units', () => {
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: [
        'smoke-preview-items',
        'smoke-story-import',
      ],
      id: 'smoke-story-canvas',
      label: 'Smoke story canvas',
    })

    expect(getCanvasAppFeaturePackSuiteFeaturePackIds(
      [suiteManifest],
      ['smoke-story-canvas'],
    )).toEqual([
      'smoke-preview-items',
      'smoke-story-import',
    ])
    expect(DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS.map(
      (manifest) => manifest.id,
    )).toEqual([
      CANVAS_COMPONENT_SYSTEM_SUITE_ID,
      CANVAS_STORY_CANVAS_SUITE_ID,
    ])
    expect(CANVAS_COMPONENT_SYSTEM_FEATURE_PACK_SUITE_MANIFEST.featurePackIds)
      .toEqual([
        CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id,
        CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id,
        CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id,
        CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id,
      ])
    expect(CANVAS_STORY_CANVAS_FEATURE_PACK_SUITE_MANIFEST.featurePackIds)
      .toEqual([
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
      ])
    expect(() =>
      getCanvasAppFeaturePackSuiteFeaturePackIds(
        [suiteManifest],
        ['missing-story-canvas'],
      ),
    ).toThrow('Unknown canvas app feature pack suite: missing-story-canvas')
    expect(() =>
      createCanvasAppFeaturePackSuiteManifest({
        featurePackIds: ['smoke-preview-items', 'smoke-preview-items'],
        id: 'duplicate-story-canvas',
        label: 'Duplicate story canvas',
      }),
    ).toThrow(
      'Duplicate canvas app feature pack suite feature pack: smoke-preview-items',
    )
  })

  it('defines feature pack profile skeletons', () => {
    expect(CANVAS_APP_CORE_ONLY_FEATURE_PACK_PROFILE).toEqual({
      enabledFeaturePackIds: [],
      enabledSuiteIds: [],
      id: 'core-only',
      installedFeaturePackIds: [],
      installedSuiteIds: [],
      label: 'Core only',
    })
    expect(CANVAS_APP_MINIMAL_VIEWER_FEATURE_PACK_PROFILE).toEqual({
      enabledFeaturePackIds: ['zoom-controls'],
      enabledSuiteIds: [],
      id: 'minimal-viewer',
      installedFeaturePackIds: ['zoom-controls'],
      installedSuiteIds: [],
      label: 'Minimal viewer',
    })
    expect(CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE).toEqual({
      enabledFeaturePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
      ],
      enabledSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
      id: 'story-viewer',
      installedFeaturePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
      ],
      installedSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
      label: 'Story viewer',
    })
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.id).toBe('editor')
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.installedSuiteIds)
      .toEqual([CANVAS_COMPONENT_SYSTEM_SUITE_ID])
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.enabledSuiteIds)
      .toEqual([CANVAS_COMPONENT_SYSTEM_SUITE_ID])
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.installedFeaturePackIds)
      .toContain('toolbar')
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.enabledFeaturePackIds)
      .toContain('toolbar')
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.installedFeaturePackIds)
      .toContain(CANVAS_APP_COMPONENT_LIBRARY_FEATURE_PACK_MANIFEST.id)
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.enabledFeaturePackIds)
      .toContain(CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST.id)
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.enabledFeaturePackIds)
      .toContain(CANVAS_APP_COMPONENT_INSPECTOR_FEATURE_PACK_MANIFEST.id)
    expect(DEFAULT_CANVAS_APP_EDITOR_FEATURE_PACK_PROFILE.enabledFeaturePackIds)
      .toContain(CANVAS_APP_COMPONENT_SYNC_FEATURE_PACK_MANIFEST.id)
    expect(() =>
      createCanvasAppFeaturePackProfile({
        enabledFeaturePackIds: ['toolbar'],
        id: 'broken-profile',
        installedFeaturePackIds: [],
        label: 'Broken profile',
      }),
    ).toThrow('Feature pack profile broken-profile enables uninstalled pack: toolbar')
    expect(createCanvasAppFeaturePackProfile({
      id: 'story-and-zoom',
      installedFeaturePackIds: ['zoom-controls'],
      installedSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
      label: 'Story and zoom',
      suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
    })).toEqual({
      enabledFeaturePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
        'zoom-controls',
      ],
      enabledSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
      id: 'story-and-zoom',
      installedFeaturePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
        'zoom-controls',
      ],
      installedSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
      label: 'Story and zoom',
    })
    expect(() =>
      createCanvasAppFeaturePackProfile({
        enabledSuiteIds: [CANVAS_STORY_CANVAS_SUITE_ID],
        id: 'broken-suite-profile',
        installedSuiteIds: [],
        label: 'Broken suite profile',
        suiteManifests: DEFAULT_CANVAS_APP_FEATURE_PACK_SUITE_MANIFESTS,
      }),
    ).toThrow(
      'Feature pack profile broken-suite-profile enables uninstalled suite: story-canvas',
    )
    expect(getCanvasAppFeaturePackProfileById(
      [CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE],
      'story-viewer',
    )).toBe(CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE)
    expect(getCanvasAppFeaturePackProfileRuntimeStates({
      featurePackIds: [
        CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
        'zoom-controls',
      ],
      profile: CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
    })).toEqual([
      {
        id: CANVAS_STORY_PREVIEW_ITEMS_FEATURE_PACK_ID,
        status: 'enabled',
      },
      {
        id: CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
        status: 'enabled',
      },
      {
        id: 'zoom-controls',
        status: 'uninstalled',
      },
    ])
    expect(() =>
      getCanvasAppFeaturePackProfileRuntimeStates({
        featurePackIds: ['zoom-controls'],
        profile: CANVAS_APP_STORY_VIEWER_FEATURE_PACK_PROFILE,
      }),
    ).toThrow(
      'Feature pack profile story-viewer installs unknown pack: story-preview-items',
    )
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
