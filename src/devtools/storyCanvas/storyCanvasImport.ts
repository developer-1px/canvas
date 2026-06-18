import {
  type CanvasAppComponentDefinition,
  type CanvasItem,
} from '../../canvas';
import {
  commitCanvasStoryImportActionHostUpdate,
  createCanvasDataTransferImportActionPlanFromRegistry,
  createCanvasDataTransferImportRegistry,
  createCanvasStoryImportDataTransferActionResolver,
  runCanvasDataTransferImportActionPlan,
  type CanvasStoryImportAction,
  type CanvasStoryImportActionHostUpdateCommitResult,
  type CanvasStoryImportActionHostUpdateResult,
} from '../../canvas/app';

export type StoryCanvasImportState = Readonly<{
  componentDefinitions: readonly CanvasAppComponentDefinition[]
  items: readonly CanvasItem[]
}>

export type StoryCanvasImportedAssemblyInput = Readonly<{
  componentDefinitions: readonly CanvasAppComponentDefinition[]
  items: CanvasItem[]
}>

export type StoryCanvasImportCommitInput = Readonly<{
  action: CanvasStoryImportAction
  baseComponentDefinitions: readonly CanvasAppComponentDefinition[]
  currentComponentDefinitions: readonly CanvasAppComponentDefinition[]
  currentItems: readonly CanvasItem[]
  currentImportState: StoryCanvasImportState
  commitImportState: (state: StoryCanvasImportState) => void
}>

export type StoryCanvasDataTransferImportInput = Readonly<{
  baseComponentDefinitions: readonly CanvasAppComponentDefinition[]
  currentComponentDefinitions: readonly CanvasAppComponentDefinition[]
  currentItems: readonly CanvasItem[]
  currentImportState: StoryCanvasImportState
  dataTransfer: DataTransfer | null
  scope: StoryCanvasImportScope
  commitImportState: (state: StoryCanvasImportState) => void
}>

export type StoryCanvasImportScope = 'clipboard-paste' | 'stage-drop'

export type StoryCanvasDataTransferImportResult = Readonly<{
  actionResults: readonly CanvasStoryImportActionHostUpdateCommitResult[]
  consumed: boolean
  consumedActionIndex: number
  attemptedActionCount: number
}>

export const EMPTY_STORY_CANVAS_IMPORT_STATE: StoryCanvasImportState =
  Object.freeze({
    componentDefinitions: Object.freeze([]),
    items: Object.freeze([]),
  });

export function getStoryCanvasImportedAssemblyInput({
  baseComponentDefinitions,
  baseItems,
  importState,
}: Readonly<{
  baseComponentDefinitions: readonly CanvasAppComponentDefinition[]
  baseItems: readonly CanvasItem[]
  importState: StoryCanvasImportState
}>): StoryCanvasImportedAssemblyInput {
  const baseItemIds = new Set(baseItems.map((item) => item.id));

  return Object.freeze({
    componentDefinitions: mergeStoryCanvasComponentDefinitions({
      baseComponentDefinitions,
      importedComponentDefinitions: importState.componentDefinitions,
    }),
    items: [
      ...baseItems,
      ...importState.items.filter((item) => !baseItemIds.has(item.id)),
    ],
  });
}

export function commitStoryCanvasImportAction({
  action,
  baseComponentDefinitions,
  commitImportState,
  currentComponentDefinitions,
  currentImportState,
  currentItems,
}: StoryCanvasImportCommitInput):
  CanvasStoryImportActionHostUpdateCommitResult {
  return commitCanvasStoryImportActionHostUpdate({
    action,
    commitHostUpdate: (update) => {
      const duplicateItemIds = getDuplicateStoryCanvasImportItemIds({
        currentItems,
        update,
      });

      if (duplicateItemIds.length > 0) {
        return false;
      }

      commitImportState(Object.freeze({
        componentDefinitions: mergeStoryCanvasImportedComponentDefinitions({
          baseComponentDefinitions,
          currentImportedComponentDefinitions:
            currentImportState.componentDefinitions,
          importedComponentDefinitions: update.componentDefinitions,
        }),
        items: Object.freeze([
          ...currentImportState.items,
          ...update.itemsChange.items,
        ]),
      }));

      return true;
    },
    currentComponentDefinitions,
  });
}

export function runStoryCanvasDataTransferImport({
  baseComponentDefinitions,
  commitImportState,
  currentComponentDefinitions,
  currentImportState,
  currentItems,
  dataTransfer,
  scope,
}: StoryCanvasDataTransferImportInput): StoryCanvasDataTransferImportResult {
  const actions = getStoryCanvasDataTransferImportActions({
    dataTransfer,
    scope,
  });
  const actionResults: CanvasStoryImportActionHostUpdateCommitResult[] = [];
  const runResult = runCanvasDataTransferImportActionPlan({
    actions,
    runAction: (action) => {
      const actionResult = commitStoryCanvasImportAction({
        action,
        baseComponentDefinitions,
        commitImportState,
        currentComponentDefinitions,
        currentImportState,
        currentItems,
      });

      actionResults.push(actionResult);

      return actionResult.committed;
    },
  });

  return Object.freeze({
    actionResults: Object.freeze(actionResults),
    attemptedActionCount: runResult.attemptedActions.length,
    consumed: runResult.consumed,
    consumedActionIndex: runResult.consumedActionIndex,
  });
}

export function getStoryCanvasDataTransferImportActions({
  dataTransfer,
  scope,
}: Readonly<{
  dataTransfer: DataTransfer | null
  scope: StoryCanvasImportScope
}>): readonly CanvasStoryImportAction[] {
  const registry = createCanvasDataTransferImportRegistry({
    resolvers: [
      createCanvasStoryImportDataTransferActionResolver({
        scope: ['clipboard-paste', 'stage-drop'],
      }),
    ],
  });

  return createCanvasDataTransferImportActionPlanFromRegistry({
    dataTransfer,
    registry,
    scope,
  });
}

export function hasStoryCanvasDataTransferImport(
  input: Parameters<typeof getStoryCanvasDataTransferImportActions>[0],
) {
  return getStoryCanvasDataTransferImportActions(input).length > 0;
}

function mergeStoryCanvasComponentDefinitions({
  baseComponentDefinitions,
  importedComponentDefinitions,
}: Readonly<{
  baseComponentDefinitions: readonly CanvasAppComponentDefinition[]
  importedComponentDefinitions: readonly CanvasAppComponentDefinition[]
}>): readonly CanvasAppComponentDefinition[] {
  const importedDefinitionById = new Map(
    importedComponentDefinitions.map((definition) => [
      definition.id,
      definition,
    ]),
  );
  const nextDefinitions = baseComponentDefinitions.map((definition) =>
    importedDefinitionById.get(definition.id) ?? definition
  );
  const baseDefinitionIds = new Set(
    baseComponentDefinitions.map((definition) => definition.id),
  );

  for (const definition of importedComponentDefinitions) {
    if (!baseDefinitionIds.has(definition.id)) {
      nextDefinitions.push(definition);
    }
  }

  return Object.freeze(nextDefinitions);
}

function mergeStoryCanvasImportedComponentDefinitions({
  baseComponentDefinitions,
  currentImportedComponentDefinitions,
  importedComponentDefinitions,
}: Readonly<{
  baseComponentDefinitions: readonly CanvasAppComponentDefinition[]
  currentImportedComponentDefinitions: readonly CanvasAppComponentDefinition[]
  importedComponentDefinitions: readonly CanvasAppComponentDefinition[]
}>): readonly CanvasAppComponentDefinition[] {
  const importedDefinitionById = new Map(
    currentImportedComponentDefinitions.map((definition) => [
      definition.id,
      definition,
    ]),
  );

  for (const definition of importedComponentDefinitions) {
    importedDefinitionById.set(definition.id, definition);
  }

  const baseDefinitionIds = new Set(
    baseComponentDefinitions.map((definition) => definition.id),
  );
  const nextImportedDefinitions = currentImportedComponentDefinitions
    .filter((definition) => importedDefinitionById.get(definition.id) ===
      definition);

  for (const definition of importedComponentDefinitions) {
    if (
      baseDefinitionIds.has(definition.id) ||
      !nextImportedDefinitions.some((candidate) =>
        candidate.id === definition.id
      )
    ) {
      nextImportedDefinitions.push(definition);
    }
  }

  return Object.freeze(nextImportedDefinitions);
}

function getDuplicateStoryCanvasImportItemIds({
  currentItems,
  update,
}: Readonly<{
  currentItems: readonly CanvasItem[]
  update: CanvasStoryImportActionHostUpdateResult
}>): readonly string[] {
  const currentItemIds = new Set(currentItems.map((item) => item.id));

  return Object.freeze(update.itemsChange.items
    .map((item) => item.id)
    .filter((itemId) => currentItemIds.has(itemId)));
}
