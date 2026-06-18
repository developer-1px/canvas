import { describe, expect, it } from 'vitest'
import type { CanvasItem } from '../../../entities'
import {
  createCanvasComponentDefinitionRegistry,
} from '../../../host'
import {
  CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER,
  syncCanvasComponentItemsChange,
} from './CanvasComponentSyncItemsChangeTransformer'

describe('CanvasComponentSyncItemsChangeTransformer', () => {
  it('syncs replace-changed style and content across same-slot items', () => {
    const currentItems = [
      createRectItem('card-a-title', { x: 10, y: 20, text: 'Revenue' }),
      createRectItem('card-b-title', { x: 210, y: 20, text: 'Revenue' }),
      createRectItem('loose-title', { x: 410, y: 20, text: 'Loose' }),
    ]
    const registry = createRegistry()
    const changedTitle = {
      ...currentItems[0],
      fill: '#dbeafe',
      text: 'Pipeline',
      x: 40,
      y: 60,
    } as CanvasItem

    expect(syncCanvasComponentItemsChange({
      change: {
        type: 'replace-changed',
        items: [changedTitle],
      },
      componentDefinitionRegistry: registry,
      currentItems,
    })).toEqual({
      type: 'replace-changed',
      items: [
        changedTitle,
        {
          ...currentItems[1],
          fill: '#dbeafe',
          text: 'Pipeline',
        },
        currentItems[2],
      ],
    })
  })

  it('syncs set-text across same-slot editable text items', () => {
    const currentItems = [
      createStickyItem('card-a-body', { body: 'Draft', x: 10 }),
      createStickyItem('card-b-body', { body: 'Draft', x: 210 }),
    ]
    const registry = createRegistry()

    expect(CANVAS_COMPONENT_SYNC_ITEMS_CHANGE_TRANSFORMER.transform({
      change: {
        id: 'card-a-body',
        text: 'Final',
        type: 'set-text',
      },
      componentDefinitionRegistry: registry,
      currentItems,
    })).toEqual({
      type: 'replace-changed',
      items: [
        {
          ...currentItems[0],
          body: 'Final',
          h: 64,
        },
        {
          ...currentItems[1],
          body: 'Final',
          h: 64,
        },
      ],
    })
  })

  it('leaves changes untouched when no component sync applies', () => {
    const change = {
      id: 'loose',
      text: 'Final',
      type: 'set-text' as const,
    }

    expect(syncCanvasComponentItemsChange({
      change,
      componentDefinitionRegistry: createRegistry(),
      currentItems: [createRectItem('loose')],
    })).toBe(change)
  })
})

function createRegistry() {
  return createCanvasComponentDefinitionRegistry({
    definitions: [{
      id: 'card',
      instances: [
        {
          label: 'Card A',
          slots: {
            body: 'card-a-body',
            root: 'card-a-root',
            title: 'card-a-title',
          },
        },
        {
          label: 'Card B',
          slots: {
            body: 'card-b-body',
            root: 'card-b-root',
            title: 'card-b-title',
          },
        },
      ],
      label: 'Card',
    }],
  })
}

function createRectItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'rect' }>> = {},
): Extract<CanvasItem, { type: 'rect' }> {
  return {
    fill: '#ffffff',
    h: 40,
    id,
    stroke: '#111111',
    text: 'Title',
    type: 'rect',
    w: 120,
    x: 0,
    y: 0,
    ...overrides,
  }
}

function createStickyItem(
  id: string,
  overrides: Partial<Extract<CanvasItem, { type: 'component' }>> = {},
): Extract<CanvasItem, { type: 'component' }> {
  return {
    accent: '#2563eb',
    body: 'Draft',
    component: 'sticky',
    fill: '#dbeafe',
    h: 64,
    id,
    stroke: '#93c5fd',
    title: 'Sticky',
    type: 'component',
    w: 160,
    x: 0,
    y: 0,
    ...overrides,
  }
}
