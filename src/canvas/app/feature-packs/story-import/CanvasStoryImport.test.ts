import { describe, expect, it, vi } from 'vitest'
import {
  createCanvasDataTransferImportActionPlanFromRegistry,
  createCanvasDataTransferImportRegistry,
  getCanvasDataTransferImportRegistryMetadata,
} from '../../affordances/commands/CanvasDataTransferImportRegistry'
import {
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
} from '../story-preview'
import {
  CANVAS_STORY_IMPORT_JSON_KIND,
  CANVAS_STORY_IMPORT_JSON_MIME_TYPE,
  CANVAS_STORY_IMPORT_JSON_VERSION,
  EMPTY_CANVAS_STORY_IMPORT_HOST_STATE,
  commitCanvasStoryImportActionHostState,
  commitCanvasStoryImportActionHostUpdate,
  createCanvasStoryImportActionFromDataTransfer,
  createCanvasStoryImportComponentDefinitions,
  createCanvasStoryImportDataTransferActionResolver,
  createCanvasStoryImportItems,
  getCanvasStoryImportHostAssemblyInput,
  hasCanvasStoryImportDataTransferAction,
  getCanvasStoryImportActionHostUpdate,
  getCanvasStoryImportActionItemsChange,
  mergeCanvasStoryImportComponentDefinitions,
  parseCanvasStoryImportJSONPayload,
  runCanvasStoryImportDataTransferHostStateImport,
  type CanvasStoryImportHostState,
} from './CanvasStoryImport'

describe('CanvasStoryImport', () => {
  it('creates story preview group and story custom items', () => {
    const items = createCanvasStoryImportItems({
      groups: [{
        h: 120,
        id: 'component-card',
        label: 'ComponentCard',
        stories: [{
          h: 80,
          id: 'card-default',
          title: 'Default',
          w: 160,
          x: 24,
          y: 24,
        }],
        w: 220,
        x: 40,
        y: 64,
      }],
    })

    expect(items).toEqual([
      {
        data: {
          count: 1,
          groupLabel: 'ComponentCard',
        },
        h: 120,
        id: 'group-component-card',
        kind: CANVAS_STORY_PREVIEW_GROUP_KIND,
        presentation: CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
        title: 'ComponentCard',
        type: 'custom',
        w: 220,
        x: 40,
        y: 64,
      },
      {
        data: {
          storyId: 'card-default',
        },
        h: 80,
        id: 'story-card-default',
        kind: CANVAS_STORY_PREVIEW_ITEM_KIND,
        presentation: CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
        title: 'Default',
        type: 'custom',
        w: 160,
        x: 24,
        y: 24,
      },
    ])
  })

  it('supports ungrouped story preview items', () => {
    const items = createCanvasStoryImportItems({
      groups: [{
        h: 96,
        id: 'standalone-card',
        label: null,
        stories: [{
          h: 96,
          id: 'standalone',
          title: 'Standalone',
          w: 192,
          x: 80,
          y: 120,
        }],
        w: 192,
        x: 80,
        y: 120,
      }],
    })

    expect(items.map((item) => item.id)).toEqual(['story-standalone'])
  })

  it('creates component definitions from labeled story groups', () => {
    const definitions = createCanvasStoryImportComponentDefinitions({
      groups: [
        {
          h: 120,
          id: 'component-card',
          label: 'ComponentCard',
          source: {
            exportName: 'ComponentCard',
            importPath: 'src/widgets/component-card',
            layer: 'widgets',
          },
          stories: [
            {
              h: 80,
              id: 'card-default',
              title: 'Default',
              w: 160,
              x: 24,
              y: 24,
            },
            {
              h: 80,
              id: 'card-active',
              title: 'Active',
              w: 160,
              x: 204,
              y: 24,
            },
          ],
          w: 380,
          x: 40,
          y: 64,
        },
        {
          h: 96,
          id: 'standalone-card',
          label: null,
          stories: [{
            h: 96,
            id: 'standalone',
            title: 'Standalone',
            w: 192,
            x: 80,
            y: 120,
          }],
          w: 192,
          x: 80,
          y: 120,
        },
      ],
    })

    expect(definitions).toEqual([
      {
        id: 'story-import-component-card',
        instances: [
          {
            label: 'Default',
            slots: {
              root: 'story-card-default',
            },
          },
          {
            label: 'Active',
            slots: {
              root: 'story-card-active',
            },
          },
        ],
        label: 'ComponentCard',
        source: {
          exportName: 'ComponentCard',
          importPath: 'src/widgets/component-card',
          layer: 'widgets',
        },
      },
    ])
  })

  it('rejects duplicate generated item ids', () => {
    expect(() =>
      createCanvasStoryImportItems({
        groups: [
          {
            h: 80,
            id: 'group-a',
            label: null,
            stories: [{
              h: 80,
              id: 'duplicate',
              title: 'Duplicate',
              w: 120,
              x: 0,
              y: 0,
            }],
            w: 120,
            x: 0,
            y: 0,
          },
          {
            h: 80,
            id: 'group-b',
            label: null,
            stories: [{
              h: 80,
              id: 'duplicate',
              title: 'Duplicate',
              w: 120,
              x: 0,
              y: 0,
            }],
            w: 120,
            x: 0,
            y: 0,
          },
        ],
      }),
    ).toThrow('Duplicate canvas story import item: story-duplicate')
  })

  it('rejects duplicate generated component definition ids', () => {
    expect(() =>
      createCanvasStoryImportComponentDefinitions({
        groups: [
          {
            h: 80,
            id: 'component-card',
            label: 'ComponentCard',
            stories: [{
              h: 80,
              id: 'default',
              title: 'Default',
              w: 120,
              x: 0,
              y: 0,
            }],
            w: 120,
            x: 0,
            y: 0,
          },
          {
            h: 80,
            id: 'component-card',
            label: 'ComponentCard Copy',
            stories: [{
              h: 80,
              id: 'copy',
              title: 'Copy',
              w: 120,
              x: 0,
              y: 0,
            }],
            w: 120,
            x: 0,
            y: 0,
          },
        ],
      }),
    ).toThrow(
      'Duplicate canvas story import component definition: story-import-component-card',
    )
  })

  it('creates a story import action from DataTransfer JSON candidates', () => {
    const payload = {
      input: createStoryImportInput(),
      kind: CANVAS_STORY_IMPORT_JSON_KIND,
      version: CANVAS_STORY_IMPORT_JSON_VERSION,
    }
    const getData = (format: string) => {
      if (format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE) {
        return '{'
      }

      if (format === 'application/json') {
        return JSON.stringify(payload)
      }

      return ''
    }
    const action = createCanvasStoryImportActionFromDataTransfer({
      dataTransfer: { getData },
    })

    expect(action).toMatchObject({
      kind: 'story-import',
      readResult: {
        candidateIndex: 1,
        mimeType: 'application/json',
        source: 'application-json',
      },
    })
    expect(action?.items.map((item) => item.id)).toEqual([
      'group-component-card',
      'story-card-default',
    ])
    expect(action?.componentDefinitions).toEqual([
      {
        id: 'story-import-component-card',
        instances: [{
          label: 'Default',
          slots: {
            root: 'story-card-default',
          },
        }],
        label: 'ComponentCard',
        source: {
          exportName: 'ComponentCard',
          importPath: 'src/widgets/component-card',
          layer: 'widgets',
        },
      },
    ])
  })

  it('creates a registry resolver for story import DataTransfer actions', () => {
    const resolver = createCanvasStoryImportDataTransferActionResolver({
      order: 8,
      scope: ['clipboard-paste', 'stage-drop'],
      title: 'Import stories',
    })
    const registry = createCanvasDataTransferImportRegistry({
      resolvers: [resolver],
    })
    const dataTransfer = {
      getData: (format: string) =>
        format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE
          ? JSON.stringify(createStoryImportInput())
          : '',
    }

    expect(getCanvasDataTransferImportRegistryMetadata({
      registry,
      scope: 'clipboard-paste',
    })).toEqual([{
      id: 'story-import',
      mode: 'exclusive',
      order: 0,
      scope: 'clipboard-paste',
      supportedFormats: [
        CANVAS_STORY_IMPORT_JSON_MIME_TYPE,
        'application/json',
        'text/json',
        'text/plain',
      ],
      title: 'Import stories',
    }])
    expect(createCanvasDataTransferImportActionPlanFromRegistry({
      dataTransfer,
      registry,
      scope: 'stage-drop',
    })[0]?.items.map((item) => item.id)).toEqual([
      'group-component-card',
      'story-card-default',
    ])
    expect(createCanvasDataTransferImportActionPlanFromRegistry({
      dataTransfer,
      registry,
      scope: 'other-scope',
    })).toEqual([])
  })

  it('creates host update payloads from story import actions', () => {
    const action = createCanvasStoryImportActionFromDataTransfer({
      dataTransfer: {
        getData: (format) =>
          format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE
            ? JSON.stringify(createStoryImportInput())
            : '',
      },
    })

    if (!action) {
      throw new Error('Expected story import action')
    }

    const currentDefinition = {
      id: 'story-import-component-card',
      instances: [{
        label: 'Old',
        slots: {
          root: 'story-old-card',
        },
      }],
      label: 'Old card',
    }
    const unrelatedDefinition = {
      id: 'existing-component',
      instances: [{
        label: 'Existing',
        slots: {
          root: 'existing-root',
        },
      }],
      label: 'Existing component',
    }
    const update = getCanvasStoryImportActionHostUpdate({
      action,
      currentComponentDefinitions: [
        unrelatedDefinition,
        currentDefinition,
      ],
    })

    expect(getCanvasStoryImportActionItemsChange({ action })).toEqual({
      items: action.items,
      type: 'add',
    })
    expect(update.itemsChange).toEqual({
      items: action.items,
      type: 'add',
    })
    expect(update.selection).toEqual({
      after: [
        'group-component-card',
        'story-card-default',
      ],
      before: [],
    })
    expect(update.nextComponentDefinitions).toEqual([
      unrelatedDefinition,
      action.componentDefinitions[0],
    ])
    expect(update.addedComponentDefinitionIds).toEqual([])
    expect(update.replacedComponentDefinitionIds).toEqual([
      'story-import-component-card',
    ])
    expect(Object.isFrozen(update)).toBe(true)
  })

  it('commits story import action host updates through a host callback', () => {
    const action = createCanvasStoryImportActionFromDataTransfer({
      dataTransfer: {
        getData: (format) =>
          format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE
            ? JSON.stringify(createStoryImportInput())
            : '',
      },
    })

    if (!action) {
      throw new Error('Expected story import action')
    }

    const commitHostUpdate = vi.fn(() => true)
    const result = commitCanvasStoryImportActionHostUpdate({
      action,
      commitHostUpdate,
      currentComponentDefinitions: [],
    })

    expect(result).toMatchObject({
      action,
      committed: true,
      status: 'committed',
    })
    expect(result.update.itemsChange.items.map((item) => item.id)).toEqual([
      'group-component-card',
      'story-card-default',
    ])
    expect(result.update.addedComponentDefinitionIds).toEqual([
      'story-import-component-card',
    ])
    expect(commitHostUpdate).toHaveBeenCalledWith(result.update)
    expect(Object.isFrozen(result)).toBe(true)
  })

  it('holds story import action host update commits when the host callback rejects them', () => {
    const action = createCanvasStoryImportActionFromDataTransfer({
      dataTransfer: {
        getData: (format) =>
          format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE
            ? JSON.stringify(createStoryImportInput())
            : '',
      },
    })

    if (!action) {
      throw new Error('Expected story import action')
    }

    const commitHostUpdate = vi.fn(() => false)
    const result = commitCanvasStoryImportActionHostUpdate({
      action,
      commitHostUpdate,
      currentComponentDefinitions: action.componentDefinitions,
    })

    expect(result).toMatchObject({
      action,
      committed: false,
      holdReason: 'host-update-not-committed',
      status: 'held',
    })
    expect(result.update.replacedComponentDefinitionIds).toEqual([
      'story-import-component-card',
    ])
    expect(commitHostUpdate).toHaveBeenCalledWith(result.update)
  })

  it('commits story import actions into reusable host import state', () => {
    const action = createCanvasStoryImportActionFromDataTransfer({
      dataTransfer: {
        getData: (format) =>
          format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE
            ? JSON.stringify(createStoryImportInput())
            : '',
      },
    })

    if (!action) {
      throw new Error('Expected story import action')
    }

    const baseItem = createTextItem('story-existing')
    const baseDefinition = {
      id: 'story-import-component-card',
      instances: [{
        label: 'Old',
        slots: {
          root: 'story-existing',
        },
      }],
      label: 'Old card',
    }
    let importState: CanvasStoryImportHostState =
      EMPTY_CANVAS_STORY_IMPORT_HOST_STATE
    const result = commitCanvasStoryImportActionHostState({
      action,
      baseComponentDefinitions: [baseDefinition],
      commitImportState: (state) => {
        importState = state
      },
      currentComponentDefinitions: [baseDefinition],
      currentImportState: importState,
      currentItems: [baseItem],
    })
    const assemblyInput = getCanvasStoryImportHostAssemblyInput({
      baseComponentDefinitions: [baseDefinition],
      baseItems: [baseItem],
      importState,
    })

    expect(result).toMatchObject({
      action,
      committed: true,
      status: 'committed',
    })
    expect(importState.items.map((item) => item.id)).toEqual([
      'group-component-card',
      'story-card-default',
    ])
    expect(assemblyInput.items.map((item) => item.id)).toEqual([
      'story-existing',
      'group-component-card',
      'story-card-default',
    ])
    expect(assemblyInput.componentDefinitions).toEqual([
      action.componentDefinitions[0],
    ])
  })

  it('runs story import DataTransfer actions into host import state and holds duplicate item ids', () => {
    let importState: CanvasStoryImportHostState =
      EMPTY_CANVAS_STORY_IMPORT_HOST_STATE
    const dataTransfer = {
      getData: (format: string) =>
        format === CANVAS_STORY_IMPORT_JSON_MIME_TYPE
          ? JSON.stringify(createStoryImportInput())
          : '',
    } as DataTransfer

    expect(hasCanvasStoryImportDataTransferAction({
      dataTransfer,
      scope: 'stage-drop',
    })).toBe(true)

    const result = runCanvasStoryImportDataTransferHostStateImport({
      commitImportState: (state) => {
        importState = state
      },
      currentImportState: importState,
      currentItems: [createTextItem('story-card-default')],
      dataTransfer,
      scope: 'stage-drop',
    })

    expect(result).toMatchObject({
      attemptedActionCount: 1,
      consumed: false,
      consumedActionIndex: -1,
    })
    expect(result.actionResults[0]).toMatchObject({
      committed: false,
      holdReason: 'host-update-not-committed',
      status: 'held',
    })
    expect(importState).toBe(EMPTY_CANVAS_STORY_IMPORT_HOST_STATE)
  })

  it('merges new story import component definitions after existing definitions', () => {
    const merge = mergeCanvasStoryImportComponentDefinitions({
      currentComponentDefinitions: [{
        id: 'existing-component',
        instances: [{
          label: 'Existing',
          slots: {
            root: 'existing-root',
          },
        }],
        label: 'Existing component',
      }],
      importedComponentDefinitions: createCanvasStoryImportComponentDefinitions({
        groups: [createStoryImportInput().groups[0]],
      }),
    })

    expect(merge.nextComponentDefinitions.map((definition) => definition.id))
      .toEqual([
        'existing-component',
        'story-import-component-card',
      ])
    expect(merge.addedComponentDefinitionIds).toEqual([
      'story-import-component-card',
    ])
    expect(merge.replacedComponentDefinitionIds).toEqual([])
    expect(Object.isFrozen(merge.nextComponentDefinitions)).toBe(true)
  })

  it('parses raw story import inputs and rejects unrelated JSON payloads', () => {
    expect(parseCanvasStoryImportJSONPayload(createStoryImportInput()).groups)
      .toHaveLength(1)
    expect(() => parseCanvasStoryImportJSONPayload({
      groups: [{
        id: 'broken',
        stories: [],
      }],
    })).toThrow('Invalid canvas story import group h')
    expect(() => parseCanvasStoryImportJSONPayload({
      input: createStoryImportInput(),
      kind: 'other-import',
    })).toThrow('Invalid canvas story import payload kind')
  })
})

function createStoryImportInput() {
  return {
    groups: [{
      h: 120,
      id: 'component-card',
      label: 'ComponentCard',
      source: {
        exportName: 'ComponentCard',
        importPath: 'src/widgets/component-card',
        layer: 'widgets',
      },
      stories: [{
        h: 80,
        id: 'card-default',
        title: 'Default',
        w: 160,
        x: 24,
        y: 24,
      }],
      w: 220,
      x: 40,
      y: 64,
    }],
  }
}

function createTextItem(id: string) {
  return {
    h: 80,
    id,
    text: id,
    type: 'text' as const,
    w: 160,
    x: 0,
    y: 0,
  }
}
