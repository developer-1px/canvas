import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasAffordanceConfig,
  type CanvasCommandAvailability,
} from '../../../engine'
import {
  filterCanvasCommandPaletteItems,
  getCanvasCommandPaletteItems,
} from './CanvasCommandPaletteItems'

describe('CanvasCommandPaletteItems', () => {
  it('builds searchable actions from tools, components, commands, and view controls', () => {
    const onToolChange = vi.fn()
    const onInsertComponent = vi.fn()
    const onOpenShortcutHelp = vi.fn()
    const onDelete = vi.fn()
    const onFitItems = vi.fn()
    const onViewportReset = vi.fn()
    const onZoom = vi.fn()
    const onCustomCommand = vi.fn()

    const items = getCanvasCommandPaletteItems({
      commandAvailability: createCommandAvailability({ delete: true }),
      commandHandlers: createCommandHandlers({ onDelete }),
      components: [{
        id: 'card',
        title: 'Card',
      }],
      config: createCanvasAffordanceConfig({
        tools: { marker: false },
      }),
      customCommands: [{
        ariaLabel: 'Publish',
        disabled: false,
        id: 'publish',
        label: 'P',
        title: 'Publish',
      }],
      customTools: [{
        ariaLabel: 'Risk tool',
        id: 'custom:risk',
        label: '!',
        shortcut: { key: 'k', shiftKey: true },
        statusLabel: 'Risk',
        title: 'Risk',
      }],
      selection: ['rect-1'],
      onCustomCommand,
      onFitItems,
      onInsertComponent,
      onOpenShortcutHelp,
      onToolChange,
      onViewportReset,
      onZoom,
    })

    expect(items.map((item) => item.title)).toEqual(
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
    expect(items.find((item) => item.id === 'tool:marker')).toBeUndefined()
    expect(items.find((item) => item.id === 'tool:custom:risk')?.shortcut)
      .toBe('Shift+K')
    expect(items.find((item) => item.id === 'command:delete')?.shortcut)
      .toBe('Delete / Backspace')
    expect(items.find((item) => item.id === 'command:duplicate')?.shortcut)
      .toBe('Cmd+D / Alt+Drag')
    expect(items.find((item) => item.id === 'viewport:fit')?.shortcut)
      .toBe('0 / 1')
    expect(items.find((item) => item.id === 'system:shortcut-help')?.shortcut)
      .toBe('Shift+/')

    items.find((item) => item.id === 'tool:select')?.onSelect()
    items.find((item) => item.id === 'component:card')?.onSelect()
    items.find((item) => item.id === 'command:delete')?.onSelect()
    items.find((item) => item.id === 'custom-command:publish')?.onSelect()
    items.find((item) => item.id === 'system:shortcut-help')?.onSelect()
    items.find((item) => item.id === 'viewport:fit')?.onSelect()
    items.find((item) => item.id === 'viewport:reset-zoom')?.onSelect()
    items.find((item) => item.id === 'viewport:zoom-in')?.onSelect()

    expect(onToolChange).toHaveBeenCalledWith('select')
    expect(onInsertComponent).toHaveBeenCalledWith('card')
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onCustomCommand).toHaveBeenCalledWith('publish')
    expect(onOpenShortcutHelp).toHaveBeenCalledTimes(1)
    expect(onFitItems).toHaveBeenCalledWith(['rect-1'])
    expect(onViewportReset).toHaveBeenCalledTimes(1)
    expect(onZoom).toHaveBeenCalledWith('in')
  })

  it('marks unavailable commands disabled while keeping them discoverable', () => {
    const items = getCanvasCommandPaletteItems({
      commandAvailability: createCommandAvailability({ delete: false }),
      commandHandlers: createCommandHandlers(),
      components: [],
      config: createCanvasAffordanceConfig(),
      customCommands: [],
      customTools: [],
      selection: [],
      onCustomCommand: vi.fn(),
      onFitItems: vi.fn(),
      onInsertComponent: vi.fn(),
      onOpenShortcutHelp: vi.fn(),
      onToolChange: vi.fn(),
      onViewportReset: vi.fn(),
      onZoom: vi.fn(),
    })

    expect(items.find((item) => item.id === 'command:delete')).toMatchObject({
      disabled: true,
      title: 'Delete',
    })
  })

  it('filters by title, section, and shortcut terms', () => {
    const items = [
      createItem({ section: 'Tools', shortcut: 'V', title: 'Select' }),
      createItem({ section: 'Create', title: 'Add Card' }),
      createItem({ section: 'Commands', title: 'Delete' }),
    ]

    expect(filterCanvasCommandPaletteItems(items, 'add')).toEqual([items[1]])
    expect(filterCanvasCommandPaletteItems(items, 'tools v')).toEqual([
      items[0],
    ])
    expect(filterCanvasCommandPaletteItems(items, 'missing')).toEqual([])
  })
})

function createCommandAvailability(
  overrides: Partial<CanvasCommandAvailability> = {},
): CanvasCommandAvailability {
  return {
    alignBottom: false,
    alignCenter: false,
    alignLeft: false,
    alignMiddle: false,
    alignRight: false,
    alignTop: false,
    bringForward: false,
    bringToFront: false,
    delete: false,
    duplicate: false,
    distributeHorizontal: false,
    distributeVertical: false,
    group: false,
    lockSelection: false,
    redo: false,
    selectAll: false,
    sendBackward: false,
    sendToBack: false,
    undo: false,
    ungroup: false,
    unlockAll: false,
    ...overrides,
  }
}

function createCommandHandlers(
  overrides: Partial<Parameters<typeof getCanvasCommandPaletteItems>[0]['commandHandlers']> = {},
): Parameters<typeof getCanvasCommandPaletteItems>[0]['commandHandlers'] {
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

function createItem(
  overrides: Partial<ReturnType<typeof filterCanvasCommandPaletteItems>[number]>,
) {
  return {
    id: overrides.title ?? 'item',
    section: 'Commands',
    title: 'Command',
    onSelect: vi.fn(),
    ...overrides,
  }
}
