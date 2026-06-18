import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasSceneAdapter,
} from '../../engine'
import type {
  CanvasAppCustomCreationToolState,
} from '../extensions/CanvasAppExtensionStateContracts'
import type { CanvasItem } from '../../entities'
import type {
  CanvasComponentSetSummary,
} from '../../host'
import type { CanvasAppItemReadModel } from './CanvasAppItemReadModelContracts'
import type { CanvasAppComponentTemplate } from './CanvasAppComponentAssemblyContracts'
import { getCanvasAppControlModel } from './CanvasAppControlModel'

describe('CanvasAppControlModel', () => {
  it('builds control props from component, command, selection, and viewport state', () => {
    const componentSets = [createComponentSet()]
    const components = [createComponentTemplate()]
    const customTools = [createCustomTool()]
    const customCommands = [
      {
        ariaLabel: 'Publish',
        disabled: false,
        id: 'publish',
        label: 'P',
        title: 'Publish',
      },
    ]
    const model = getCanvasAppControlModel(createInput({
      canRedo: false,
      canUndo: true,
      componentSets,
      components,
      customCommands,
      customTools,
      scene: createSceneAdapter(new Set(['group-1'])),
      selection: ['rect-1', 'group-1'],
      tool: 'custom:risk',
      viewport: { scale: 1.5, x: 0, y: 0 },
    }))

    expect(model.componentPalette.components).toBe(components)
    expect(model.componentPalette.componentSets).toBe(componentSets)
    expect(model.componentPalette.visible).toBe(true)
    expect(model.commandPalette.visible).toBe(true)
    expect(model.commandPalette.items.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        'Select',
        'Risk',
        'Add Card',
        'Delete',
        'Publish',
        'Keyboard shortcuts',
        'Fit view',
      ]),
    )
    expect(model.status).toMatchObject({
      mode: 'Risk',
      selectionLength: 2,
      visible: true,
    })
    expect(model.shortcutHelp).toMatchObject({
      visible: true,
    })
    expect(model.shortcutHelp.items.map((item) => item.id)).toEqual(
      expect.arrayContaining(['tool:select', 'system:shortcutHelp']),
    )
    expect(model.minimap.visible).toBe(true)
    expect(model.minimap.model?.itemRects).toHaveLength(2)
    expect(model.toolbar).toMatchObject({
      commandAvailability: expect.objectContaining({
        alignLeft: true,
        delete: true,
        distributeHorizontal: false,
        group: true,
        redo: false,
        undo: true,
        ungroup: true,
      }),
      customCommands,
      customTools,
      tool: 'custom:risk',
      visible: true,
    })
    expect(model.zoomControls).toMatchObject({
      scale: 1.5,
      visible: true,
    })
  })

  it('prioritizes gesture status over tool status and falls back custom tools', () => {
    expect(
      getCanvasAppControlModel(createInput({
        gesture: 'move',
        tool: 'custom:risk',
      })).status.mode,
    ).toBe('Moving')
    expect(
      getCanvasAppControlModel(createInput({
        tool: 'custom:missing',
      })).status.mode,
    ).toBe('Canvas')
    expect(
      getCanvasAppControlModel(createInput({
        tool: 'marker',
      })).status.mode,
    ).toBe('Marker')
  })

  it('keeps overlay visibility and zoom fit target rules out of App Model', () => {
    const onFitItems = vi.fn()
    const selectedModel = getCanvasAppControlModel(createInput({
      config: createCanvasAffordanceConfig({
        overlays: {
          componentPalette: false,
          commandPalette: false,
          shortcutHelp: false,
          status: false,
          toolbar: false,
          zoomControls: false,
          minimap: false,
        },
      }),
      onFitItems,
      selection: ['rect-1'],
    }))

    selectedModel.zoomControls.onFit()

    expect(onFitItems).toHaveBeenLastCalledWith(['rect-1'])
    selectedModel.viewportFocus.fitSelection()
    expect(onFitItems).toHaveBeenLastCalledWith(['rect-1'])
    selectedModel.viewportFocus.fitItems(['rect-2'])
    expect(onFitItems).toHaveBeenLastCalledWith(['rect-2'])
    selectedModel.viewportFocus.fitAll()
    expect(onFitItems).toHaveBeenLastCalledWith(undefined)
    expect(selectedModel.componentPalette.visible).toBe(false)
    expect(selectedModel.commandPalette.visible).toBe(false)
    expect(selectedModel.shortcutHelp.visible).toBe(false)
    expect(selectedModel.status.visible).toBe(false)
    expect(selectedModel.toolbar.visible).toBe(false)
    expect(selectedModel.zoomControls.visible).toBe(false)
    expect(selectedModel.minimap.visible).toBe(false)
    expect(selectedModel.minimap.model).toBeNull()

    getCanvasAppControlModel(createInput({
      onFitItems,
      selection: [],
    })).viewportFocus.fitSelection()

    expect(onFitItems).toHaveBeenLastCalledWith(undefined)
  })

  it('wires command callbacks without knowing toolbar rendering details', () => {
    const onAlign = vi.fn()
    const onCenterViewportAtWorldPoint = vi.fn()
    const onRunCustomCommand = vi.fn()
    const onOpenShortcutHelp = vi.fn()
    const onZoom = vi.fn()
    const model = getCanvasAppControlModel(createInput({
      commandHandlers: createCommandHandlers({ onAlign }),
      customCommands: [{
        ariaLabel: 'Publish',
        disabled: false,
        id: 'publish',
        label: 'P',
        title: 'Publish',
      }],
      onCenterViewportAtWorldPoint,
      onRunCustomCommand,
      onOpenShortcutHelp,
      onZoom,
    }))

    model.minimap.onNavigateToWorldPoint({ x: 50, y: 60 })
    model.viewportFocus.centerAtWorldPoint({ x: 70, y: 80 })
    model.toolbar.commandHandlers.onAlign('alignLeft')
    model.commandPalette.items
      .find((item) => item.id === 'command:alignLeft')
      ?.onSelect()
    model.toolbar.onCustomCommand('publish')
    model.commandPalette.items
      .find((item) => item.id === 'custom-command:publish')
      ?.onSelect()
    model.commandPalette.items
      .find((item) => item.id === 'system:shortcut-help')
      ?.onSelect()
    model.zoomControls.onZoomIn()
    model.commandPalette.items
      .find((item) => item.id === 'viewport:zoom-out')
      ?.onSelect()
    model.zoomControls.onZoomOut()

    expect(onAlign).toHaveBeenCalledTimes(2)
    expect(onAlign).toHaveBeenLastCalledWith('alignLeft')
    expect(onCenterViewportAtWorldPoint).toHaveBeenCalledWith({ x: 50, y: 60 })
    expect(onCenterViewportAtWorldPoint).toHaveBeenCalledWith({ x: 70, y: 80 })
    expect(onRunCustomCommand).toHaveBeenCalledTimes(2)
    expect(onRunCustomCommand).toHaveBeenLastCalledWith('publish')
    expect(onOpenShortcutHelp).toHaveBeenCalledTimes(1)
    expect(onZoom).toHaveBeenNthCalledWith(1, 'in')
    expect(onZoom).toHaveBeenNthCalledWith(2, 'out')
    expect(onZoom).toHaveBeenNthCalledWith(3, 'out')
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasAppControlModel>[0]> = {},
): Parameters<typeof getCanvasAppControlModel>[0] {
  return {
    canRedo: true,
    canUndo: true,
    componentSets: [createComponentSet()],
    components: [createComponentTemplate()],
    config: createCanvasAffordanceConfig(),
    customCommands: [],
    customTools: [createCustomTool()],
    gesture: 'none',
    itemReadModel: createItemReadModel(),
    scene: createSceneAdapter(),
    selection: [],
    tool: 'select',
    viewport: { scale: 1, x: 0, y: 0 },
    commandHandlers: createCommandHandlers(),
    onCenterViewportAtWorldPoint: vi.fn(),
    onFitItems: vi.fn(),
    onInsertComponent: vi.fn(),
    onOpenShortcutHelp: vi.fn(),
    onRunCustomCommand: vi.fn(),
    onToolChange: vi.fn(),
    onViewportReset: vi.fn(),
    onZoom: vi.fn(),
    viewportRect: {
      height: 600,
      left: 0,
      top: 0,
      width: 900,
    },
    ...overrides,
  }
}

function createCommandHandlers(
  overrides: Partial<Parameters<typeof getCanvasAppControlModel>[0]['commandHandlers']> = {},
): Parameters<typeof getCanvasAppControlModel>[0]['commandHandlers'] {
  return {
    onAlign: vi.fn(),
    onDelete: vi.fn(),
    onDistribute: vi.fn(),
    onDuplicate: vi.fn(),
    onGroup: vi.fn(),
    onLock: vi.fn(),
    onRedo: vi.fn(),
    onReorder: vi.fn(),
    onUndo: vi.fn(),
    onUngroup: vi.fn(),
    onUnlockAll: vi.fn(),
    ...overrides,
  }
}

function createComponentTemplate(): CanvasAppComponentTemplate {
  return {
    accent: '#111111',
    fill: '#ffffff',
    h: 120,
    id: 'card',
    label: 'C',
    presentation: 'card',
    stroke: '#cccccc',
    title: 'Card',
    w: 160,
  }
}

function createComponentSet(): CanvasComponentSetSummary {
  return {
    id: 'score-card',
    instances: [{
      itemIds: ['score-card-a', 'score-card-value-a'],
      label: 'Score card A',
      rootItemId: 'score-card-a',
      slots: [
        {
          itemId: 'score-card-a',
          label: 'Root',
          slotId: 'root',
        },
        {
          itemId: 'score-card-value-a',
          label: 'Value',
          slotId: 'value',
        },
      ],
    }],
    label: 'Score card',
    parts: [
      {
        itemIds: ['score-card-a'],
        label: 'Root',
        slotId: 'root',
      },
      {
        itemIds: ['score-card-value-a'],
        label: 'Value',
        slotId: 'value',
      },
    ],
  }
}

function createCustomTool(): CanvasAppCustomCreationToolState {
  return {
    ariaLabel: 'Risk tool',
    id: 'custom:risk',
    label: '!',
    statusLabel: 'Risk',
    title: 'Risk',
  }
}

function createItemReadModel(): CanvasAppItemReadModel {
  const items = [
    { h: 80, id: 'rect-1', w: 120, x: 20, y: 30 },
    { h: 140, id: 'rect-2', w: 160, x: 260, y: 180 },
  ] as unknown as CanvasItem[]

  return {
    findEditableTextItem: vi.fn(() => null),
    findItem: vi.fn(),
    getAllIds: vi.fn(() => items.map((item) => item.id)),
    getAllItems: vi.fn(() => items),
    getItemBounds: vi.fn((item: CanvasItem) => item),
    getSelection: vi.fn((ids: string[]) => ids),
    getSelectionBounds: vi.fn(() => null),
    getSelectedItems: vi.fn(() => []),
  } as unknown as CanvasAppItemReadModel
}

function createSceneAdapter(groups = new Set<string>()): CanvasSceneAdapter {
  return {
    entries: [],
    getBounds: vi.fn(),
    getParentId: vi.fn(),
    getSelectedAncestorId: vi.fn(),
    isGroup: (id) => groups.has(id),
  }
}
