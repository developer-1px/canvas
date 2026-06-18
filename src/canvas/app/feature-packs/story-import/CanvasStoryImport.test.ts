import { describe, expect, it } from 'vitest'
import {
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
} from '../story-preview'
import {
  createCanvasStoryImportComponentDefinitions,
  createCanvasStoryImportItems,
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
})
