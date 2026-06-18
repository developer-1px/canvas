import { describe, expect, it } from 'vitest'
import {
  createCanvasComponentDefinitionRegistry,
  createCanvasComponentLibrary,
} from '../../host'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  createCanvasAppAssembly,
  createCanvasAppComponentPresentationRenderers,
  defineCanvasAppCustomItemModule,
} from './index'
import {
  createCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
  createCanvasAppAiLabsFeaturePackManifest,
  createCanvasAppDomEditStyleFeaturePackManifest,
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackManifest,
  createCanvasAppFeaturePackProfile,
  createCanvasAppViewFeaturePack,
} from '../feature-packs'
import { getCanvasAppAssemblyModel } from './CanvasAppAssemblyModel'
import type {
  CanvasAppComponentRendererStrategy,
  CanvasAppComponentDefinition,
  CanvasAppCustomItemRendererStrategy,
  CanvasAppItemLayerAdapter,
  CanvasAppPresenceProvider,
  CanvasAppStageAdapter,
  CanvasMediaImporter,
  CanvasWorkspaceStorageProvider,
} from './index'

describe('CanvasAppAssembly seams', () => {
  it('assembles product affordance config at the app assembly seam', () => {
    const assembly = createCanvasAppAssembly({
      affordanceConfig: {
        commands: { duplicate: false },
        gestures: { drawMarker: false },
        overlays: { grid: false },
        shortcuts: { markerTool: false },
        tools: { marker: false },
      },
    })

    expect(assembly.affordanceConfig.commands.duplicate).toBe(false)
    expect(assembly.affordanceConfig.gestures.drawMarker).toBe(false)
    expect(assembly.affordanceConfig.overlays.grid).toBe(false)
    expect(assembly.affordanceConfig.shortcuts.markerTool).toBe(false)
    expect(assembly.affordanceConfig.tools.marker).toBe(false)
    expect(assembly.affordanceConfig.tools.select).toBe(true)
  })

  it('applies host capability gates after product affordance config', () => {
    const assembly = createCanvasAppAssembly({
      affordanceConfig: {
        commands: {
          copy: true,
          delete: true,
        },
        gestures: {
          createComment: true,
          createShape: true,
          move: true,
          pan: true,
          textEdit: true,
        },
        overlays: {
          inspector: true,
          presentationMode: true,
          textEditor: true,
        },
        shortcuts: {
          copy: true,
          editSelection: true,
        },
        tools: {
          comment: true,
          rect: true,
          select: true,
        },
      },
      capabilities: {
        comment: false,
        editDocument: false,
        export: false,
        follow: false,
        present: false,
      },
    })

    expect(assembly.capabilities).toEqual({
      comment: false,
      editDocument: false,
      export: false,
      follow: false,
      present: false,
      view: true,
    })
    expect(assembly.affordanceConfig.commands.copy).toBe(false)
    expect(assembly.affordanceConfig.commands.delete).toBe(false)
    expect(assembly.affordanceConfig.gestures.createComment).toBe(false)
    expect(assembly.affordanceConfig.gestures.createShape).toBe(false)
    expect(assembly.affordanceConfig.gestures.move).toBe(false)
    expect(assembly.affordanceConfig.gestures.pan).toBe(true)
    expect(assembly.affordanceConfig.gestures.textEdit).toBe(false)
    expect(assembly.affordanceConfig.overlays.inspector).toBe(false)
    expect(assembly.affordanceConfig.overlays.presentationMode).toBe(false)
    expect(assembly.affordanceConfig.overlays.textEditor).toBe(false)
    expect(assembly.affordanceConfig.shortcuts.copy).toBe(false)
    expect(assembly.affordanceConfig.shortcuts.editSelection).toBe(false)
    expect(assembly.affordanceConfig.tools.comment).toBe(false)
    expect(assembly.affordanceConfig.tools.rect).toBe(false)
    expect(assembly.affordanceConfig.tools.select).toBe(true)
  })

  it('assembles product-specific component library and presentation registry', () => {
    const componentLibrary = createCanvasComponentLibrary({
      templates: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          w: 180,
          h: 96,
          fill: '#fff7ed',
          stroke: '#fb923c',
          accent: '#ea580c',
          presentation: 'risk-card',
        },
      ],
    })
    const renderRisk: CanvasAppComponentRendererStrategy = ({ item }) =>
      item.title
    const componentPresentationRenderers =
      createCanvasAppComponentPresentationRenderers({
        'risk-card': renderRisk,
      })
    const componentDefinitions = [{
      id: 'risk-card',
      instances: [
        {
          label: 'Primary',
          slots: {
            root: 'risk-card-primary',
            title: 'risk-card-primary-title',
          },
        },
        {
          label: 'Secondary',
          slots: {
            root: 'risk-card-secondary',
            title: 'risk-card-secondary-title',
          },
        },
      ],
      label: 'Risk card',
    }] satisfies readonly CanvasAppComponentDefinition[]
    const renderRiskItem: CanvasAppCustomItemRendererStrategy = ({ item }) =>
      item.title
    const mediaImporter: CanvasMediaImporter = {
      id: 'risk-media',
      createItems: () => [],
    }
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      presentation: 'risk-node',
      renderItem: renderRiskItem,
      validateItem: (item) => item.data.severity === 'high',
      customCommands: [
        {
          id: 'publish',
          label: 'Pub',
          title: 'Publish selection',
          run: () => undefined,
        },
      ],
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: ({ startWorld }) => ({
            title: 'Risk',
            x: startWorld.x,
            y: startWorld.y,
            w: 120,
            h: 80,
            data: { severity: 'high' },
          }),
        },
      ],
      inspectorPanels: [
        {
          id: 'risk-meta',
          render: ({ selection }) => selection.length,
        },
      ],
      mediaImporters: [mediaImporter],
      textPasteImporters: [{
        id: 'risk-paste',
        createItems: () => [],
      }],
    })

    const assembly = createCanvasAppAssembly({
      componentDefinitions,
      componentLibrary,
      componentPresentationRenderers,
      customItemModules: [riskModule],
      initialItems: [],
    })
    const assemblyModel = getCanvasAppAssemblyModel(assembly)

    expect(assembly.componentLibrary.getPresentation('risk')).toBe('risk-card')
    expect(assembly.componentDefinitionRegistry.getBinding(
      'risk-card-primary-title',
    )?.slotItemIds).toEqual([
      'risk-card-primary-title',
      'risk-card-secondary-title',
    ])
    expect(assemblyModel.component.componentDefinitionRegistry)
      .toBe(assembly.componentDefinitionRegistry)
    expect(assemblyModel.control.componentSets.map(
      (componentSet) => componentSet.id,
    )).toEqual(['risk-card'])
    expect(assembly.componentPresentationRenderers['risk-card']).toBe(renderRisk)
    expect(assembly.customItemRenderers['risk-node']).toBe(renderRiskItem)
    expect(assembly.customItemValidators.risk({
      id: 'risk-1',
      type: 'custom',
      kind: 'risk',
      presentation: 'risk-node',
      title: 'Risk',
      x: 0,
      y: 0,
      w: 120,
      h: 80,
      data: { severity: 'high' },
    })).toBe(true)
    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      'publish',
    ])
    expect(assembly.customCreationTools.map((tool) => tool.id)).toEqual([
      'risk',
    ])
    expect(assembly.textPasteImporters.map((importer) => importer.id)).toEqual([
      'risk-paste',
    ])
    expect(assembly.inspectorPanels.map((panel) => panel.id)).toEqual([
      'component-binding',
      'link-preview-actions',
      'arrow-routing-actions',
      'checklist-actions',
      'kanban-actions',
      'risk-meta',
    ])
    expect(assembly.mediaImporters.map((importer) => importer.id)).toEqual([
      'risk-media',
    ])
    expect(assembly.initialItems).toEqual([])
  })

  it('treats direct component presentation renderers as extensions', () => {
    const renderRisk: CanvasAppComponentRendererStrategy = ({ item }) =>
      item.title

    const assembly = createCanvasAppAssembly({
      componentPresentationRenderers: {
        'risk-card': renderRisk,
      },
    })

    expect(assembly.componentPresentationRenderers['risk-card']).toBe(renderRisk)
    expect(assembly.componentPresentationRenderers['note-card']).toBeDefined()
  })

  it('accepts a product-specific component definition registry', () => {
    const componentDefinitionRegistry = createCanvasComponentDefinitionRegistry({
      definitions: [{
        id: 'score-card',
        instances: [{
          label: 'Score',
          slots: {
            root: 'score-card-root',
            value: 'score-card-value',
          },
        }],
        label: 'Score card',
      }],
    })

    const assembly = createCanvasAppAssembly({
      componentDefinitionRegistry,
    })

    expect(assembly.componentDefinitionRegistry.getBinding('score-card-value'))
      .toMatchObject({
        componentId: 'score-card',
        slotId: 'value',
      })
  })

  it('accepts rendering adapters at the app assembly seam', () => {
    const itemLayerAdapter: CanvasAppItemLayerAdapter = {
      renderItems: ({ items }) => items.length,
    }
    const stageAdapter: CanvasAppStageAdapter = {
      renderStage: ({ children }) => children,
    }

    const assembly = createCanvasAppAssembly({
      itemLayerAdapter,
      stageAdapter,
    })

    expect(assembly.itemLayerAdapter.renderItems(
      createItemLayerInput({ items: DEFAULT_CANVAS_APP_ASSEMBLY.initialItems }),
    )).toBe(DEFAULT_CANVAS_APP_ASSEMBLY.initialItems.length)
    expect(assembly.stageAdapter.renderStage).toBe(stageAdapter.renderStage)
  })

  it('assembles view feature packs at the app assembly seam', () => {
    const assembly = createCanvasAppAssembly({
      disabledViewFeaturePackIds: ['toolbar', 'component-authoring'],
    })

    expect(assembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(assembly.featurePackViewRenderers.contextCommandMenu).toBeUndefined()
    expect(assembly.featurePackViewRenderers.selectionFloatingBar)
      .toBeUndefined()
    expect(assembly.featurePackViewRenderers.componentPalette).toBeUndefined()
    expect(assembly.featurePackViewRenderers.stickyQuickCreate).toBeUndefined()
    expect(assembly.featurePackViewRenderers.status).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.status,
    )

    const renderStatus = () => null
    const statusOnlyAssembly = createCanvasAppAssembly({
      viewFeaturePacks: [
        createCanvasAppViewFeaturePack({
          id: 'status-only',
          label: 'Status only',
          viewRenderers: {
            status: renderStatus,
          },
        }),
      ],
    })

    expect(statusOnlyAssembly.featurePackViewRenderers.status)
      .toBe(renderStatus)
    expect(statusOnlyAssembly.featurePackViewRenderers.toolbar).toBeUndefined()

    const directAssembly = createCanvasAppAssembly({
      featurePackViewRenderers: {
        status: renderStatus,
      },
    })

    expect(directAssembly.featurePackViewRenderers.status).toBe(renderStatus)
    expect(Object.isFrozen(directAssembly.featurePackViewRenderers)).toBe(true)
  })

  it('assembles feature pack manifests as installable app assembly units', () => {
    const disabledAssembly = createCanvasAppAssembly({
      disabledFeaturePackIds: ['toolbar', 'media-import'],
    })

    expect(disabledAssembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(disabledAssembly.featurePackViewRenderers.contextCommandMenu)
      .toBeUndefined()
    expect(disabledAssembly.featurePackViewRenderers.status).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.status,
    )
    expect(disabledAssembly.installedFeaturePackIds).not.toContain('toolbar')
    expect(disabledAssembly.installedFeaturePackIds).not.toContain(
      'media-import',
    )
    expect(disabledAssembly.installedFeaturePackIds).toContain('table-import')
    expect(disabledAssembly.inspectorPanels.map((panel) => panel.id))
      .not.toContain('link-preview-actions')
    expect(disabledAssembly.inspectorPanels.map((panel) => panel.id))
      .toContain('arrow-routing-actions')

    const renderStatus = () => null
    const customAssembly = createCanvasAppAssembly({
      featurePackManifests: [
        createCanvasAppFeaturePackManifest({
          extensionFeaturePack: createCanvasAppFeaturePack({
            extensionBundle: createCanvasAppExtensionBundle({
              customCommands: [{
                id: 'status-pack-command',
                label: 'Status pack',
                run: () => undefined,
                title: 'Status pack',
              }],
            }),
            id: 'status-pack',
            label: 'Status pack',
          }),
          id: 'status-pack',
          label: 'Status pack',
          viewFeaturePack: createCanvasAppViewFeaturePack({
            id: 'status-pack',
            label: 'Status pack',
            viewRenderers: {
              status: renderStatus,
            },
          }),
        }),
      ],
    })

    expect(customAssembly.featurePackViewRenderers.status).toBe(renderStatus)
    expect(customAssembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(customAssembly.installedFeaturePackIds).toEqual(['status-pack'])
    expect(customAssembly.customCommands.map((command) => command.id))
      .toContain('status-pack-command')
    expect(customAssembly.inspectorPanels).toEqual([])
  })

  it('assembles feature pack profiles as installable app assembly units', () => {
    const minimalAssembly = createCanvasAppAssembly({
      featurePackProfileId: 'minimal-viewer',
    })

    expect(minimalAssembly.installedFeaturePackIds).toEqual(['zoom-controls'])
    expect(minimalAssembly.featurePackViewRenderers.zoomControls).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.zoomControls,
    )
    expect(minimalAssembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(minimalAssembly.inspectorPanels).toEqual([])

    const renderStatus = () => null
    const statusManifest = createCanvasAppFeaturePackManifest({
      extensionFeaturePack: createCanvasAppFeaturePack({
        extensionBundle: createCanvasAppExtensionBundle({
          customCommands: [{
            id: 'status-pack-command',
            label: 'Status pack',
            run: () => undefined,
            title: 'Status pack',
          }],
        }),
        id: 'status-pack',
        label: 'Status pack',
      }),
      id: 'status-pack',
      label: 'Status pack',
      viewFeaturePack: createCanvasAppViewFeaturePack({
        id: 'status-pack',
        label: 'Status pack',
        viewRenderers: {
          status: renderStatus,
        },
      }),
    })
    const disabledStatusProfile = createCanvasAppFeaturePackProfile({
      enabledFeaturePackIds: [],
      id: 'disabled-status',
      installedFeaturePackIds: ['status-pack'],
      label: 'Disabled status',
    })

    const disabledStatusAssembly = createCanvasAppAssembly({
      featurePackManifests: [statusManifest],
      featurePackProfile: disabledStatusProfile,
    })

    expect(disabledStatusAssembly.installedFeaturePackIds).toEqual([
      'status-pack',
    ])
    expect(disabledStatusAssembly.featurePackViewRenderers.status)
      .toBeUndefined()
    expect(disabledStatusAssembly.customCommands.map((command) => command.id))
      .toEqual([])

    const explicitEnabledAssembly = createCanvasAppAssembly({
      featurePackManifests: [statusManifest],
      featurePackProfile: disabledStatusProfile,
      featurePackStates: [{
        id: 'status-pack',
        status: 'enabled',
      }],
    })

    expect(explicitEnabledAssembly.installedFeaturePackIds).toEqual([
      'status-pack',
    ])
    expect(explicitEnabledAssembly.featurePackViewRenderers.status)
      .toBe(renderStatus)
    expect(explicitEnabledAssembly.customCommands.map((command) => command.id))
      .toEqual(['status-pack-command'])

    const explicitlyUninstalledMinimalAssembly = createCanvasAppAssembly({
      featurePackProfileId: 'minimal-viewer',
      featurePackStates: [{
        id: 'zoom-controls',
        status: 'uninstalled',
      }],
    })

    expect(explicitlyUninstalledMinimalAssembly.installedFeaturePackIds)
      .toEqual([])
    expect(explicitlyUninstalledMinimalAssembly.featurePackViewRenderers
      .zoomControls).toBeUndefined()
  })

  it('adds optional feature pack manifests without replacing defaults', () => {
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

    const assembly = createCanvasAppAssembly({
      additionalFeaturePackManifests: [
        aiLabsManifest,
        domEditStyleManifest,
        CANVAS_APP_BOARD_IO_FEATURE_PACK_MANIFEST,
      ],
    })

    expect(assembly.installedFeaturePackIds).toContain('toolbar')
    expect(assembly.installedFeaturePackIds).toContain('ai-labs')
    expect(assembly.installedFeaturePackIds).toContain('risk-dom-card-style')
    expect(assembly.installedFeaturePackIds).toContain('board-io')
    expect(assembly.featurePackViewRenderers.toolbar).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar,
    )
    expect(assembly.customCommands.map((command) => command.id))
      .toContain('ai-labs-summarize-selection')
    expect(assembly.inspectorPanels.map((panel) => panel.id))
      .toContain('risk-dom-card-style')

    const disabledAssembly = createCanvasAppAssembly({
      additionalFeaturePackManifests: [aiLabsManifest],
      disabledFeaturePackIds: ['ai-labs'],
    })

    expect(disabledAssembly.installedFeaturePackIds).not.toContain('ai-labs')
    expect(disabledAssembly.customCommands.map((command) => command.id))
      .not.toContain('ai-labs-summarize-selection')
    expect(disabledAssembly.featurePackViewRenderers.toolbar).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar,
    )
  })

  it('accepts workspace storage provider at the app assembly seam', () => {
    const workspaceStorageProvider: CanvasWorkspaceStorageProvider = () => null

    const assembly = createCanvasAppAssembly({
      workspaceStorageProvider,
    })

    expect(assembly.workspaceStorageProvider).toBe(workspaceStorageProvider)
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.workspaceStorageProvider()).toBeNull()
  })

  it('accepts live presence providers at the app assembly seam', () => {
    const presenceProvider: CanvasAppPresenceProvider = ({
      selection,
      viewport,
    }) => [{
      color: '#2563eb',
      id: 'remote-mia',
      label: `${selection[0] ?? 'none'}:${viewport.scale}`,
      point: { x: 10, y: 20 },
      selectionBounds: { h: 40, w: 80, x: 5, y: 6 },
    }]

    const assembly = createCanvasAppAssembly({
      presenceProvider,
    })

    expect(assembly.presenceProvider({
      selection: ['rect-1'],
      viewport: { scale: 2, x: 0, y: 0 },
    })).toEqual([{
      color: '#2563eb',
      id: 'remote-mia',
      label: 'rect-1:2',
      point: { x: 10, y: 20 },
      selectionBounds: { h: 40, w: 80, x: 5, y: 6 },
    }])
    expect(DEFAULT_CANVAS_APP_ASSEMBLY.presenceProvider({
      selection: [],
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual([])
  })

  it('keeps demo default selection inside the default assembly only', () => {
    const customInitialItems = [{
      fill: '#ffffff',
      h: 40,
      id: 'rect-1',
      stroke: '#111111',
      type: 'rect',
      w: 80,
      x: 0,
      y: 0,
    }] as const

    expect(DEFAULT_CANVAS_APP_ASSEMBLY.initialSelection).toEqual([
      'component-sticky',
      'component-card',
    ])
    expect(createCanvasAppAssembly({
      initialItems: [...customInitialItems],
    }).initialSelection).toEqual([])
    expect(createCanvasAppAssembly({
      initialItems: [...customInitialItems],
      initialSelection: ['rect-1'],
    }).initialSelection).toEqual(['rect-1'])
  })

  it('can disable custom item modules at the app assembly seam', () => {
    const riskModule = defineCanvasAppCustomItemModule({
      id: 'risk',
      presentation: 'risk-node',
      renderItem: () => 'risk',
      validateItem: () => true,
      customCreationTools: [
        {
          id: 'risk',
          label: '!',
          title: 'Risk',
          createItem: () => null,
        },
      ],
    })

    const assembly = createCanvasAppAssembly({
      customItemModules: [riskModule],
      disabledCustomItemModuleIds: ['risk'],
    })

    expect(assembly.customCreationTools).toEqual([])
    expect(assembly.customItemValidators).toEqual({})
  })
})

function createItemLayerInput(
  input: Partial<
    Parameters<CanvasAppItemLayerAdapter['renderItems']>[0]
  > = {},
): Parameters<CanvasAppItemLayerAdapter['renderItems']>[0] {
  return {
    componentPresentationRenderers: {},
    customItemRenderers: {},
    getComponentPresentation: () => 'note-card',
    items: [],
    onArrowEndpointPointerDown: () => undefined,
    onItemPointerDown: () => undefined,
    onTextDoubleClick: () => undefined,
    outlineIds: new Set(),
    selected: new Set(),
    ...input,
  }
}
