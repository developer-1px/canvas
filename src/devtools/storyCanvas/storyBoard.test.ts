import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST,
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
} from '../../canvas';
import type { StoryRecord } from './storyData';

describe('storyBoard', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      cancelAnimationFrame: () => undefined,
      requestAnimationFrame: () => 1,
    });
  });

  it('creates story preview items through the story import feature pack contract', async () => {
    const {
      STORY_IMPORT_FEATURE_PACK_ID,
      createStoryBoard,
    } = await import('./storyBoard');
    const board = createStoryBoard([
      createStoryRecord({
        id: 'button-default',
        name: 'Default',
        storyExport: 'Default',
      }),
      createStoryRecord({
        id: 'button-hover',
        name: 'Hover',
        storyExport: 'Hover',
      }),
    ], undefined, {
      sectionForStory: () => ({
        key: 'components',
        label: 'Components',
        order: 1,
      }),
    });

    expect(STORY_IMPORT_FEATURE_PACK_ID).toBe(
      CANVAS_APP_STORY_IMPORT_FEATURE_PACK_MANIFEST.id,
    );
    expect(board.items.some((item) =>
      item.type === 'custom' && item.kind === CANVAS_STORY_PREVIEW_GROUP_KIND,
    )).toBe(true);
    expect(board.items.filter((item) =>
      item.type === 'custom' && item.kind === CANVAS_STORY_PREVIEW_ITEM_KIND,
    ).map((item) => item.id)).toEqual([
      'story-button-default',
      'story-button-hover',
    ]);
    expect(board.componentDefinitions).toEqual([
      {
        id: 'story-import-src-components-button-stories-tsx-src-components-button-tsx',
        instances: [
          {
            label: 'Default',
            slots: {
              root: 'story-button-default',
            },
          },
          {
            label: 'Hover',
            slots: {
              root: 'story-button-hover',
            },
          },
        ],
        label: 'Button',
        source: {
          exportName: 'Button',
          importPath: '/src/components/Button.tsx',
          layer: 'components',
        },
      },
    ]);
  }, 10_000);
});

function createStoryRecord({
  id,
  name,
  storyExport,
}: {
  id: string
  name: string
  storyExport: string
}): StoryRecord {
  return {
    area: 'components',
    args: {},
    category: 'button',
    id,
    layer: 'item',
    modulePath: '/src/components/Button.stories.tsx',
    name,
    path: '/src/components/Button.tsx',
    preview: null,
    role: 'button',
    size: {
      h: 80,
      w: 160,
    },
    storyExport,
    storyTitle: 'Button',
  };
}
