import { describe, expect, it } from 'vitest'
import {
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
} from '../story-preview'
import {
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
})
