import { describe, expect, it } from 'vitest'
import {
  createCanvasComponentDefinitionRegistry,
  createCanvasComponentLibrary,
} from '../../host'
import {
  DEFAULT_CANVAS_APP_ASSEMBLY,
  createCanvasAppAssembly,
  createCanvasAppComponentPresentationRenderers,
  getCanvasAppFeaturePackMarketplaceActionAssemblyPlan,
  getCanvasAppFeaturePackMarketplaceActionAssemblyInput,
  defineCanvasAppCustomItemModule,
} from './index'
import {
  createCanvasAppExtensionBundle,
} from '../extensions/CanvasAppExtensionBundle'
import {
  DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS,
  createCanvasAppAiLabsFeaturePackManifest,
  createCanvasAppDomEditStyleFeaturePackManifest,
  createCanvasAppFeaturePack,
  createCanvasAppFeaturePackManifest,
  getCanvasAppFeaturePackMarketplaceModel,
  getCanvasAppFeaturePackMarketplacePrimaryAction,
  createCanvasAppFeaturePackProfile,
  createCanvasAppFeaturePackSuiteManifest,
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
    expect(assembly.itemsChangeTransformers.map(
      (transformer) => transformer.id,
    )).toEqual([
      'component-sync-items-change',
    ])
    expect(assemblyModel.workspace.itemsChangeTransformers)
      .toBe(assembly.itemsChangeTransformers)
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
      disabledFeaturePackIds: ['toolbar', 'media-import', 'component-sync'],
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
    expect(disabledAssembly.installedFeaturePackIds).not.toContain(
      'component-sync',
    )
    expect(disabledAssembly.enabledFeaturePackIds).not.toContain('toolbar')
    expect(disabledAssembly.enabledFeaturePackIds).not.toContain(
      'media-import',
    )
    expect(disabledAssembly.enabledFeaturePackIds).not.toContain(
      'component-sync',
    )
    expect(disabledAssembly.installedFeaturePackIds).toContain('table-import')
    expect(disabledAssembly.enabledFeaturePackIds).toContain('table-import')
    expect(disabledAssembly.itemsChangeTransformers.map(
      (transformer) => transformer.id,
    )).not.toContain('component-sync-items-change')
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
    expect(customAssembly.enabledFeaturePackIds).toEqual(['status-pack'])
    expect(customAssembly.customCommands.map((command) => command.id))
      .toContain('status-pack-command')
    expect(customAssembly.inspectorPanels).toEqual([])
  })

  it('assembles feature pack profiles as installable app assembly units', () => {
    const minimalAssembly = createCanvasAppAssembly({
      featurePackProfileId: 'minimal-viewer',
    })

    expect(minimalAssembly.installedFeaturePackIds).toEqual(['zoom-controls'])
    expect(minimalAssembly.enabledFeaturePackIds).toEqual(['zoom-controls'])
    expect(minimalAssembly.featurePackViewRenderers.zoomControls).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.zoomControls,
    )
    expect(minimalAssembly.featurePackViewRenderers.toolbar).toBeUndefined()
    expect(minimalAssembly.inspectorPanels).toEqual([])

    const basicEditorAssembly = createCanvasAppAssembly({
      featurePackProfileId: 'basic-editor',
    })

    expect(basicEditorAssembly.installedFeaturePackIds).toEqual([
      'shape-authoring',
      'command-palette',
      'drawing-tools',
      'stamp-authoring',
      'toolbar',
      'zoom-controls',
    ])
    expect(basicEditorAssembly.enabledFeaturePackIds)
      .toEqual(basicEditorAssembly.installedFeaturePackIds)
    expect(basicEditorAssembly.featurePackViewRenderers.toolbar).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.toolbar,
    )
    expect(basicEditorAssembly.featurePackViewRenderers.commandPalette).toBe(
      DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.commandPalette,
    )
    expect(basicEditorAssembly.featurePackViewRenderers.componentPalette)
      .toBeUndefined()
    expect(basicEditorAssembly.featurePackViewRenderers.imageControls)
      .toBeUndefined()
    expect(basicEditorAssembly.featurePackViewRenderers.minimap).toBeUndefined()

    const componentEditorAssembly = createCanvasAppAssembly({
      featurePackProfileId: 'component-editor',
    })

    expect(componentEditorAssembly.installedFeaturePackIds).toEqual([
      'shape-authoring',
      'component-library',
      'component-source-outline',
      'command-palette',
      'component-authoring',
      'drawing-tools',
      'stamp-authoring',
      'toolbar',
      'zoom-controls',
      'component-sync',
      'component-inspector',
    ])
    expect(componentEditorAssembly.enabledFeaturePackIds)
      .toEqual(componentEditorAssembly.installedFeaturePackIds)
    expect(componentEditorAssembly.featurePackViewRenderers.componentPalette)
      .toBe(DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS.componentPalette)
    expect(componentEditorAssembly.itemsChangeTransformers.map(
      (transformer) => transformer.id,
    )).toEqual(['component-sync-items-change'])
    expect(componentEditorAssembly.inspectorPanels.map((panel) => panel.id))
      .toEqual(['component-binding'])

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
    expect(disabledStatusAssembly.enabledFeaturePackIds).toEqual([])
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
    expect(explicitEnabledAssembly.enabledFeaturePackIds).toEqual([
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
    expect(explicitlyUninstalledMinimalAssembly.enabledFeaturePackIds)
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

  it('applies ready marketplace actions to feature pack assembly input', () => {
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
      lifecycle: {
        partialUpdate: ['command'],
        runtimeToggleable: true,
      },
    })
    const marketplaceModel = getCanvasAppFeaturePackMarketplaceModel({
      manifests: [statusManifest],
    })
    const primaryAction = getCanvasAppFeaturePackMarketplacePrimaryAction(
      marketplaceModel.packs.items[0]!,
    )
    const actionAssemblyInput = {
      action: primaryAction,
      assemblyInput: {
        featurePackManifests: [statusManifest],
      },
    }
    const assemblyPlan =
      getCanvasAppFeaturePackMarketplaceActionAssemblyPlan(actionAssemblyInput)
    const assemblyInput =
      getCanvasAppFeaturePackMarketplaceActionAssemblyInput(
        actionAssemblyInput,
      )
    const assembly = createCanvasAppAssembly(assemblyInput)

    expect(primaryAction.kind).toBe('disable')
    expect(assemblyPlan.status).toBe('ready')
    if (assemblyPlan.status !== 'ready') {
      throw new Error('Expected ready action assembly plan')
    }

    expect(assemblyPlan.actionKind).toBe('disable')
    expect(assemblyPlan.changedFeaturePackIds).toEqual(['status-pack'])
    expect(assemblyPlan.partialUpdateSurfaceIds).toEqual(['command'])
    expect(assemblyPlan.assemblyInput).toEqual(assemblyInput)
    expect(Object.isFrozen(assemblyPlan)).toBe(true)
    expect(assemblyInput).toEqual({
      featurePackManifests: [statusManifest],
      featurePackStates: [{
        id: 'status-pack',
        status: 'disabled',
      }],
    })
    expect(Object.isFrozen(assemblyInput)).toBe(true)
    expect(assembly.installedFeaturePackIds).toEqual(['status-pack'])
    expect(assembly.enabledFeaturePackIds).toEqual([])
    expect(assembly.customCommands.map((command) => command.id)).toEqual([])
  })

  it('normalizes legacy disabled feature pack ids when applying marketplace actions', () => {
    const statusManifest = createCanvasAppFeaturePackManifest({
      id: 'status-pack',
      label: 'Status pack',
    })
    const marketplaceModel = getCanvasAppFeaturePackMarketplaceModel({
      manifests: [statusManifest],
      options: {
        disabledFeaturePackIds: ['status-pack'],
      },
      profiles: [],
      suiteManifests: [],
    })
    const primaryAction = getCanvasAppFeaturePackMarketplacePrimaryAction(
      marketplaceModel.packs.items[0]!,
    )
    const assemblyPlan =
      getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
        action: primaryAction,
        assemblyInput: {
          disabledFeaturePackIds: ['status-pack'],
          featurePackManifests: [statusManifest],
        },
      })

    expect(primaryAction.kind).toBe('install')
    expect(assemblyPlan.status).toBe('ready')
    if (assemblyPlan.status !== 'ready') {
      throw new Error('Expected ready action assembly plan')
    }

    expect('disabledFeaturePackIds' in assemblyPlan.assemblyInput).toBe(false)
    expect(assemblyPlan.assemblyInput).toEqual({
      featurePackManifests: [statusManifest],
      featurePackStates: [{
        id: 'status-pack',
        status: 'disabled',
      }],
    })

    const assembly = createCanvasAppAssembly(assemblyPlan.assemblyInput)

    expect(assembly.installedFeaturePackIds).toEqual(['status-pack'])
    expect(assembly.enabledFeaturePackIds).toEqual([])
  })

  it('applies profile marketplace actions to assembly input', () => {
    const baseManifest = createCanvasAppFeaturePackManifest({
      id: 'base-pack',
      label: 'Base pack',
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const profile = createCanvasAppFeaturePackProfile({
      id: 'addon-profile',
      installedFeaturePackIds: ['addon-pack'],
      label: 'Addon profile',
    })
    const currentFeaturePackStates = [
      {
        id: 'base-pack',
        status: 'enabled',
      },
      {
        id: 'addon-pack',
        status: 'uninstalled',
      },
    ] as const
    const marketplaceModel = getCanvasAppFeaturePackMarketplaceModel({
      manifests: [baseManifest, addonManifest],
      options: {
        featurePackStates: currentFeaturePackStates,
      },
      profiles: [profile],
      suiteManifests: [],
    })
    const primaryAction = getCanvasAppFeaturePackMarketplacePrimaryAction(
      marketplaceModel.profiles.items[0]!,
    )
    const assemblyInput =
      getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
        action: primaryAction,
        assemblyInput: {
          featurePackManifests: [baseManifest, addonManifest],
          featurePackStates: currentFeaturePackStates,
        },
      })
    const assembly = createCanvasAppAssembly(assemblyInput)

    expect(primaryAction.kind).toBe('apply')
    expect(primaryAction.ready).toBe(true)
    expect(assemblyInput.featurePackStates).toEqual([
      {
        id: 'base-pack',
        status: 'uninstalled',
      },
      {
        id: 'addon-pack',
        status: 'enabled',
      },
    ])
    expect(assembly.installedFeaturePackIds).toEqual(['addon-pack'])
    expect(assembly.enabledFeaturePackIds).toEqual(['addon-pack'])
  })

  it('applies suite marketplace actions to assembly input', () => {
    const runtimeManifest = createCanvasAppFeaturePackManifest({
      id: 'runtime-pack',
      label: 'Runtime pack',
    })
    const addonManifest = createCanvasAppFeaturePackManifest({
      id: 'addon-pack',
      label: 'Addon pack',
    })
    const suiteManifest = createCanvasAppFeaturePackSuiteManifest({
      featurePackIds: ['runtime-pack', 'addon-pack'],
      id: 'addon-suite',
      label: 'Addon suite',
    })
    const currentFeaturePackStates = [
      {
        id: 'runtime-pack',
        status: 'uninstalled',
      },
      {
        id: 'addon-pack',
        status: 'uninstalled',
      },
    ] as const
    const marketplaceModel = getCanvasAppFeaturePackMarketplaceModel({
      manifests: [runtimeManifest, addonManifest],
      options: {
        featurePackStates: currentFeaturePackStates,
      },
      profiles: [],
      suiteManifests: [suiteManifest],
    })
    const primaryAction = getCanvasAppFeaturePackMarketplacePrimaryAction(
      marketplaceModel.suites.items[0]!,
    )
    const assemblyInput =
      getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
        action: primaryAction,
        assemblyInput: {
          featurePackManifests: [runtimeManifest, addonManifest],
          featurePackStates: currentFeaturePackStates,
        },
      })
    const assembly = createCanvasAppAssembly(assemblyInput)

    expect(primaryAction.kind).toBe('install')
    expect(primaryAction.ready).toBe(true)
    expect(assemblyInput.featurePackStates).toEqual([
      {
        id: 'runtime-pack',
        status: 'disabled',
      },
      {
        id: 'addon-pack',
        status: 'disabled',
      },
    ])
    expect(assembly.installedFeaturePackIds).toEqual([
      'runtime-pack',
      'addon-pack',
    ])
    expect(assembly.enabledFeaturePackIds).toEqual([])
  })

  it('rejects blocked marketplace actions before assembly input is changed', () => {
    const paidManifest = createCanvasAppFeaturePackManifest({
      id: 'paid-pack',
      label: 'Paid pack',
    })
    const marketplaceModel = getCanvasAppFeaturePackMarketplaceModel({
      listings: [{
        access: 'private',
        distribution: 'available',
        featurePackId: 'paid-pack',
      }],
      manifests: [paidManifest],
      options: {
        featurePackStates: [{
          id: 'paid-pack',
          status: 'uninstalled',
        }],
      },
    })
    const primaryAction = getCanvasAppFeaturePackMarketplacePrimaryAction(
      marketplaceModel.packs.items[0]!,
    )
    const blockedPlan =
      getCanvasAppFeaturePackMarketplaceActionAssemblyPlan({
        action: primaryAction,
        assemblyInput: {
          featurePackManifests: [paidManifest],
        },
      })

    expect(primaryAction.ready).toBe(false)
    expect(blockedPlan).toMatchObject({
      actionKind: 'install',
      blockedReasonCount: 0,
      changedFeaturePackIds: ['paid-pack'],
      marketplaceBlockedReasonCount: 1,
      partialUpdateSurfaceIds: [],
      status: 'blocked',
      totalBlockedReasonCount: 1,
    })
    expect('assemblyInput' in blockedPlan).toBe(false)
    expect(Object.isFrozen(blockedPlan)).toBe(true)
    expect(() =>
      getCanvasAppFeaturePackMarketplaceActionAssemblyInput({
        action: primaryAction,
        assemblyInput: {
          featurePackManifests: [paidManifest],
        },
      })
    ).toThrow('Canvas app feature pack marketplace action is not ready: install')
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
