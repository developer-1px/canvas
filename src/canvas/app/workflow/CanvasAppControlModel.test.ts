import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasSceneAdapter,
} from '../../engine'
import type { CanvasComponentTemplate } from '../../host'
import type { CanvasAppCustomCreationToolState } from '../tools/CanvasAppCustomCreationTools'
import { getCanvasAppControlModel } from './CanvasAppControlModel'

describe('CanvasAppControlModel', () => {
  it('builds control props from component, command, selection, and viewport state', () => {
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
      components,
      customCommands,
      customTools,
      scene: createSceneAdapter(new Set(['group-1'])),
      selection: ['rect-1', 'group-1'],
      tool: 'custom:risk',
      viewport: { scale: 1.5, x: 0, y: 0 },
    }))

    expect(model.componentPalette.components).toBe(components)
    expect(model.componentPalette.visible).toBe(true)
    expect(model.status).toMatchObject({
      mode: 'Risk',
      scale: 1.5,
      selectionLength: 2,
      visible: true,
    })
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
          status: false,
          toolbar: false,
          zoomControls: false,
        },
      }),
      onFitItems,
      selection: ['rect-1'],
    }))

    selectedModel.zoomControls.onFit()

    expect(onFitItems).toHaveBeenLastCalledWith(['rect-1'])
    expect(selectedModel.componentPalette.visible).toBe(false)
    expect(selectedModel.status.visible).toBe(false)
    expect(selectedModel.toolbar.visible).toBe(false)
    expect(selectedModel.zoomControls.visible).toBe(false)

    getCanvasAppControlModel(createInput({
      onFitItems,
      selection: [],
    })).zoomControls.onFit()

    expect(onFitItems).toHaveBeenLastCalledWith(undefined)
  })

  it('wires command callbacks without knowing toolbar rendering details', () => {
    const onAlign = vi.fn()
    const onRunCustomCommand = vi.fn()
    const onZoomBy = vi.fn()
    const model = getCanvasAppControlModel(createInput({
      commandHandlers: createCommandHandlers({ onAlign }),
      onRunCustomCommand,
      onZoomBy,
    }))

    model.toolbar.commandHandlers.onAlign('alignLeft')
    model.toolbar.onCustomCommand('publish')
    model.zoomControls.onZoomIn()
    model.zoomControls.onZoomOut()

    expect(onAlign).toHaveBeenCalledWith('alignLeft')
    expect(onRunCustomCommand).toHaveBeenCalledWith('publish')
    expect(onZoomBy).toHaveBeenNthCalledWith(1, 1.25)
    expect(onZoomBy).toHaveBeenNthCalledWith(2, 0.8)
  })
})

function createInput(
  overrides: Partial<Parameters<typeof getCanvasAppControlModel>[0]> = {},
): Parameters<typeof getCanvasAppControlModel>[0] {
  return {
    canRedo: true,
    canUndo: true,
    components: [createComponentTemplate()],
    config: createCanvasAffordanceConfig(),
    customCommands: [],
    customTools: [createCustomTool()],
    gesture: 'none',
    scene: createSceneAdapter(),
    selection: [],
    tool: 'select',
    viewport: { scale: 1, x: 0, y: 0 },
    commandHandlers: createCommandHandlers(),
    onFitItems: vi.fn(),
    onInsertComponent: vi.fn(),
    onRunCustomCommand: vi.fn(),
    onToolChange: vi.fn(),
    onViewportReset: vi.fn(),
    onZoomBy: vi.fn(),
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
    onUndo: vi.fn(),
    onUngroup: vi.fn(),
    onUnlockAll: vi.fn(),
    ...overrides,
  }
}

function createComponentTemplate(): CanvasComponentTemplate {
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

function createCustomTool(): CanvasAppCustomCreationToolState {
  return {
    ariaLabel: 'Risk tool',
    id: 'custom:risk',
    label: '!',
    statusLabel: 'Risk',
    title: 'Risk',
  }
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
