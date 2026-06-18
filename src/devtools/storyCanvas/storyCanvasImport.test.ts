import { describe, expect, it } from 'vitest';
import {
  CANVAS_STORY_IMPORT_JSON_MIME_TYPE,
  type CanvasAppComponentDefinition,
  type CanvasItem,
} from '../../canvas';
import {
  EMPTY_STORY_CANVAS_IMPORT_STATE,
  getStoryCanvasDataTransferImportActions,
  getStoryCanvasImportedAssemblyInput,
  hasStoryCanvasDataTransferImport,
  runStoryCanvasDataTransferImport,
  type StoryCanvasImportState,
} from './storyCanvasImport';

describe('storyCanvasImport', () => {
  it('runs Story import DataTransfer actions into imported canvas assembly state', () => {
    const baseItem = createBaseItem('story-existing');
    const baseDefinition = createDefinition({
      id: 'story-import-component-card',
      label: 'Old card',
      root: 'story-existing',
    });
    let importState: StoryCanvasImportState = EMPTY_STORY_CANVAS_IMPORT_STATE;
    const currentAssembly = getStoryCanvasImportedAssemblyInput({
      baseComponentDefinitions: [baseDefinition],
      baseItems: [baseItem],
      importState,
    });

    const result = runStoryCanvasDataTransferImport({
      baseComponentDefinitions: [baseDefinition],
      commitImportState: (state) => {
        importState = state;
      },
      currentComponentDefinitions: currentAssembly.componentDefinitions,
      currentImportState: importState,
      currentItems: currentAssembly.items,
      dataTransfer: createStoryImportDataTransfer(),
      scope: 'clipboard-paste',
    });

    expect(result).toMatchObject({
      attemptedActionCount: 1,
      consumed: true,
      consumedActionIndex: 0,
    });
    expect(result.actionResults[0]).toMatchObject({
      committed: true,
      status: 'committed',
    });
    expect(importState.items.map((item) => item.id)).toEqual([
      'group-component-card',
      'story-card-default',
    ]);
    expect(importState.componentDefinitions).toEqual([
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
    ]);

    const nextAssembly = getStoryCanvasImportedAssemblyInput({
      baseComponentDefinitions: [baseDefinition],
      baseItems: [baseItem],
      importState,
    });

    expect(nextAssembly.items.map((item) => item.id)).toEqual([
      'story-existing',
      'group-component-card',
      'story-card-default',
    ]);
    expect(nextAssembly.componentDefinitions).toEqual([
      importState.componentDefinitions[0],
    ]);
  });

  it('holds duplicate item id Story imports without changing imported state', () => {
    const baseItem = createBaseItem('story-card-default');
    let importState: StoryCanvasImportState = EMPTY_STORY_CANVAS_IMPORT_STATE;

    const result = runStoryCanvasDataTransferImport({
      baseComponentDefinitions: [],
      commitImportState: (state) => {
        importState = state;
      },
      currentComponentDefinitions: [],
      currentImportState: importState,
      currentItems: [baseItem],
      dataTransfer: createStoryImportDataTransfer(),
      scope: 'stage-drop',
    });

    expect(result).toMatchObject({
      attemptedActionCount: 1,
      consumed: false,
      consumedActionIndex: -1,
    });
    expect(result.actionResults[0]).toMatchObject({
      committed: false,
      holdReason: 'host-update-not-committed',
      status: 'held',
    });
    expect(importState).toBe(EMPTY_STORY_CANVAS_IMPORT_STATE);
  });

  it('preflights Story import DataTransfer actions for dragover/drop affordances', () => {
    expect(hasStoryCanvasDataTransferImport({
      dataTransfer: createStoryImportDataTransfer(),
      scope: 'stage-drop',
    })).toBe(true);
    expect(getStoryCanvasDataTransferImportActions({
      dataTransfer: createDataTransfer({}),
      scope: 'stage-drop',
    })).toEqual([]);
  });
});

function createStoryImportDataTransfer() {
  return createDataTransfer({
    [CANVAS_STORY_IMPORT_JSON_MIME_TYPE]: JSON.stringify({
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
        x: 10,
        y: 20,
      }],
    }),
  });
}

function createDataTransfer(values: Record<string, string>) {
  return {
    getData: (format: string) => values[format] ?? '',
  } as DataTransfer;
}

function createBaseItem(id: string): CanvasItem {
  return {
    h: 80,
    id,
    text: id,
    type: 'text',
    w: 160,
    x: 0,
    y: 0,
  };
}

function createDefinition({
  id,
  label,
  root,
}: {
  id: string
  label: string
  root: string
}): CanvasAppComponentDefinition {
  return {
    id,
    instances: [{
      label,
      slots: {
        root,
      },
    }],
    label,
  };
}
