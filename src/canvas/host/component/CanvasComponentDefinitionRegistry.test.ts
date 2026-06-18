import { describe, expect, it } from 'vitest'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  createCanvasComponentDefinitionRegistry,
  type CanvasComponentDefinition,
} from './CanvasComponentDefinitionRegistry'

describe('CanvasComponentDefinitionRegistry', () => {
  it('lists component sets with instances, parts, source, and root items', () => {
    const registry = createCanvasComponentDefinitionRegistry({
      definitions: [statCardDefinition],
    })

    expect(registry.listSets()).toEqual([{
      id: 'stat-card',
      instances: [
        {
          itemIds: ['stat-revenue', 'stat-revenue-label', 'stat-revenue-value'],
          label: 'Revenue',
          rootItemId: 'stat-revenue',
          slots: [
            {
              itemId: 'stat-revenue',
              label: 'Root',
              slotId: 'root',
            },
            {
              itemId: 'stat-revenue-label',
              label: 'Label',
              slotId: 'label',
            },
            {
              itemId: 'stat-revenue-value',
              label: 'Value',
              slotId: 'value',
            },
          ],
        },
        {
          itemIds: [
            'stat-conversion',
            'stat-conversion-label',
            'stat-conversion-value',
          ],
          label: 'Conversion',
          rootItemId: 'stat-conversion',
          slots: [
            {
              itemId: 'stat-conversion',
              label: 'Root',
              slotId: 'root',
            },
            {
              itemId: 'stat-conversion-label',
              label: 'Label',
              slotId: 'label',
            },
            {
              itemId: 'stat-conversion-value',
              label: 'Value',
              slotId: 'value',
            },
          ],
        },
      ],
      label: 'Stat card',
      parts: [
        {
          itemIds: ['stat-revenue', 'stat-conversion'],
          label: 'Root',
          slotId: 'root',
        },
        {
          itemIds: ['stat-revenue-label', 'stat-conversion-label'],
          label: 'Label',
          slotId: 'label',
        },
        {
          itemIds: ['stat-revenue-value', 'stat-conversion-value'],
          label: 'Value',
          slotId: 'value',
        },
      ],
      source: {
        exportName: 'StatCard',
        importPath: 'src/widgets/stat-card',
        layer: 'widgets',
      },
      syncDescription: 'Layout and style edits sync across stat cards.',
    }])
    expect(registry.isRootItem('stat-revenue')).toBe(true)
    expect(registry.isRootItem('stat-revenue-value')).toBe(false)
  })

  it('resolves component binding and same-slot sync item ids', () => {
    const registry = createCanvasComponentDefinitionRegistry({
      definitions: [statCardDefinition],
    })

    expect(registry.getBinding('stat-revenue-value')).toEqual({
      componentId: 'stat-card',
      componentLabel: 'Stat card',
      currentItemId: 'stat-revenue-value',
      instanceCount: 2,
      instanceLabel: 'Revenue',
      slotId: 'value',
      slotItemIds: ['stat-revenue-value', 'stat-conversion-value'],
      syncDescription: 'Layout and style edits sync across stat cards.',
    })
    expect(registry.getSyncItemIds('stat-revenue-value')).toEqual([
      'stat-revenue-value',
      'stat-conversion-value',
    ])
    expect(registry.getBinding('loose-item')).toBeNull()
    expect(registry.getSyncItemIds('loose-item')).toEqual(['loose-item'])
  })

  it('applies updates across matching component slots', () => {
    const registry = createCanvasComponentDefinitionRegistry({
      definitions: [statCardDefinition],
    })
    const state = {
      'deal-row': { padding: 12 },
      'stat-conversion': { padding: 12 },
      'stat-revenue': { padding: 12 },
    }
    const next = registry.syncItems({
      itemId: 'stat-revenue',
      state,
      update: (current, itemId) => ({
        ...current,
        [itemId]: {
          padding: 20,
        },
      }),
    })

    expect(next).toEqual({
      'deal-row': { padding: 12 },
      'stat-conversion': { padding: 20 },
      'stat-revenue': { padding: 20 },
    })
    expect(state['stat-conversion'].padding).toBe(12)
  })

  it('snapshots definitions after registry creation', () => {
    const definitions = [createMutableStatCardDefinition()]
    const registry = createCanvasComponentDefinitionRegistry({ definitions })

    definitions.push({
      ...statCardDefinition,
      id: 'mutated-card',
    })
    definitions[0].instances[0].slots.root = 'mutated-root'

    expect(registry.definitions.map((definition) => definition.id))
      .toEqual(['stat-card'])
    expect(registry.getBinding('stat-revenue')?.currentItemId)
      .toBe('stat-revenue')
    expect(Object.isFrozen(registry.definitions)).toBe(true)
    expect(Object.isFrozen(registry.definitions[0])).toBe(true)
    expect(Object.isFrozen(registry.definitions[0].instances[0].slots))
      .toBe(true)
  })

  it('rejects ambiguous or malformed component definitions', () => {
    expect(CANVAS_COMPONENT_DEFINITION_REGISTRY.listSets()).toEqual([])
    expect(() =>
      createCanvasComponentDefinitionRegistry({
        definitions: [
          statCardDefinition,
          {
            ...statCardDefinition,
            id: 'stat-card',
          },
        ],
      }),
    ).toThrow('Duplicate canvas component definition: stat-card')
    expect(() =>
      createCanvasComponentDefinitionRegistry({
        definitions: [{
          ...statCardDefinition,
          instances: [{
            label: 'Broken',
            slots: {
              root: 'stat-revenue',
              value: 'stat-revenue',
            },
          }],
        }],
      }),
    ).toThrow('Duplicate canvas component definition item id: stat-revenue')
    expect(() =>
      createCanvasComponentDefinitionRegistry({
        definitions: [{
          ...statCardDefinition,
          instances: [{
            label: 'Broken',
            slots: {
              label: 'broken-label',
            },
          }],
        }],
      }),
    ).toThrow('Canvas component definition stat-card requires a root slot')
  })
})

const statCardDefinition = {
  id: 'stat-card',
  instances: [
    {
      label: 'Revenue',
      slots: {
        label: 'stat-revenue-label',
        root: 'stat-revenue',
        value: 'stat-revenue-value',
      },
    },
    {
      label: 'Conversion',
      slots: {
        label: 'stat-conversion-label',
        root: 'stat-conversion',
        value: 'stat-conversion-value',
      },
    },
  ],
  label: 'Stat card',
  source: {
    exportName: 'StatCard',
    importPath: 'src/widgets/stat-card',
    layer: 'widgets',
  },
  syncDescription: 'Layout and style edits sync across stat cards.',
} satisfies CanvasComponentDefinition

function createMutableStatCardDefinition() {
  return {
    id: 'stat-card',
    instances: [
      {
        label: 'Revenue',
        slots: {
          label: 'stat-revenue-label',
          root: 'stat-revenue',
          value: 'stat-revenue-value',
        },
      },
      {
        label: 'Conversion',
        slots: {
          label: 'stat-conversion-label',
          root: 'stat-conversion',
          value: 'stat-conversion-value',
        },
      },
    ],
    label: 'Stat card',
    source: {
      exportName: 'StatCard',
      importPath: 'src/widgets/stat-card',
      layer: 'widgets',
    },
    syncDescription: 'Layout and style edits sync across stat cards.',
  }
}
