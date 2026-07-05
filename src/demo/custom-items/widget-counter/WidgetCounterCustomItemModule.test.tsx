import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import {
  CanvasHost,
} from '../../../canvas'
import {
  createCanvasAppAssembly,
} from '../../../canvas/app/authoring'
import {
  createWidgetCounterItem,
  WIDGET_COUNTER_CUSTOM_ITEM_MODULE,
  WIDGET_COUNTER_INCREMENT_COMMAND,
} from './index'

describe('WidgetCounterCustomItemModule', () => {
  it('keeps widget-like state serialized in a custom item module fixture', () => {
    const item = createWidgetCounterItem({
      data: {
        count: 2,
        label: 'Votes',
        stuckTo: 'engine-shape',
      },
    })

    expect(WIDGET_COUNTER_CUSTOM_ITEM_MODULE.validateItem(item)).toBe(true)
    expect(WIDGET_COUNTER_CUSTOM_ITEM_MODULE.validateItem({
      ...item,
      data: {
        count: 2,
        label: 'Votes',
        stuckTo: 'Engine Shape',
      },
    })).toBe(false)
    const markup = renderToStaticMarkup(
      <svg>{WIDGET_COUNTER_CUSTOM_ITEM_MODULE.renderItem({ item })}</svg>,
    )

    expect(markup).toContain('data-widget-counter="widget-counter-1"')
    expect(markup).toContain('Votes')
  })

  it('assembles creation, renderer, validator, and selection action off the default demo path', () => {
    const assembly = createCanvasAppAssembly({
      customItemModules: [WIDGET_COUNTER_CUSTOM_ITEM_MODULE],
    })
    const item = assembly.customCreationTools[0]?.createItem({
      createId: (prefix) => `${prefix}-1`,
      currentWorld: { x: 260, y: 180 },
      moved: true,
      startWorld: { x: 100, y: 80 },
    })

    expect(item).toMatchObject({
      data: {
        count: 0,
        label: 'Counter',
      },
      kind: 'widget-counter',
      presentation: 'widget-counter-card',
      type: 'custom',
      x: 100,
      y: 80,
      w: 160,
      h: 100,
    })
    expect(Object.keys(assembly.customItemRenderers)).toEqual([
      'widget-counter-card',
    ])
    expect(Object.keys(assembly.customItemValidators)).toEqual([
      'widget-counter',
    ])
    expect(assembly.customCommands.map((command) => command.id)).toEqual([
      WIDGET_COUNTER_INCREMENT_COMMAND,
    ])
  })

  it('moves, duplicates, and deletes the widget-like item as a normal canvas object', () => {
    const item = createWidgetCounterItem({ x: 10, y: 20 })
    const moved =
      CanvasHost.CANVAS_ITEM_ENGINE_ADAPTERS.command.nudgeSelection({
        dx: 12,
        dy: 8,
        items: [item],
        selection: [item.id],
      })
    const cloned =
      CanvasHost.CANVAS_ITEM_ENGINE_ADAPTERS.command.cloneSelection({
        createId: (prefix) => `${prefix}-copy`,
        ids: [item.id],
        items: moved,
        offset: { x: 24, y: 24 },
      })
    const removed =
      CanvasHost.CANVAS_ITEM_ENGINE_ADAPTERS.command.deleteSelection({
        items: moved,
        selection: [item.id],
      })

    expect(moved[0]).toMatchObject({ x: 22, y: 28 })
    expect(cloned[0]).toMatchObject({
      data: {
        count: 0,
        label: 'Counter',
      },
      id: 'custom-copy',
      x: 46,
      y: 52,
    })
    expect(removed).toEqual([])
  })

  it('exposes an enabled selection-floating custom command that updates local state', () => {
    const item = createWidgetCounterItem({
      data: {
        count: 4,
        label: 'Votes',
      },
    })
    const commitItemsChange = vi.fn(() => true)
    const context = {
      commitItemsChange,
      commitSelection: vi.fn(() => true),
      createId: (prefix: string) => `${prefix}-1`,
      items: [item],
      selection: [item.id],
      setEditing: vi.fn(),
      viewport: { scale: 1, x: 0, y: 0 },
    }
    const command = WIDGET_COUNTER_CUSTOM_ITEM_MODULE.customCommands?.[0]

    expect(command).toMatchObject({
      ariaLabel: 'Increment widget counter',
      id: WIDGET_COUNTER_INCREMENT_COMMAND,
      label: '+1',
      title: 'Increment counter',
    })
    expect(command?.isEnabled?.(context)).toBe(true)

    command?.run(context)
    expect(commitItemsChange).toHaveBeenCalledWith({
      type: 'replace-changed',
      items: [{
        ...item,
        data: {
          count: 5,
          label: 'Votes',
        },
      }],
    }, {
      after: [item.id],
      before: [item.id],
    })
  })
})
