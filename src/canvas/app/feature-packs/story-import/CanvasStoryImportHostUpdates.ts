import type {
  CanvasItem,
} from '../../../entities'
import type {
  CanvasComponentDefinition,
} from '../../../host'
import {
  createCanvasStoryImportComponentDefinitions,
  createCanvasStoryImportItems,
} from './CanvasStoryImportItems'
import {
  assertCanvasStoryImportInput,
} from './CanvasStoryImportPayload'
import type {
  CanvasStoryImportAction,
  CanvasStoryImportActionHostUpdateInput,
  CanvasStoryImportActionHostUpdateResult,
  CanvasStoryImportActionInput,
  CanvasStoryImportActionItemsChange,
  CanvasStoryImportComponentDefinitionMergeInput,
  CanvasStoryImportComponentDefinitionMergeResult,
  CanvasStoryImportHostAssemblyInput,
  CanvasStoryImportHostAssemblyInputSource,
  CommitCanvasStoryImportActionHostStateInput,
  CommitCanvasStoryImportActionHostUpdateInput,
  CanvasStoryImportActionHostUpdateCommitResult,
} from './CanvasStoryImportContracts'
import type {
  CanvasAppDocumentSelectionHistory,
} from '../../workspace/document/CanvasAppDocumentContracts'

export function createCanvasStoryImportAction({
  input,
  readResult,
}: CanvasStoryImportActionInput): CanvasStoryImportAction {
  assertCanvasStoryImportInput(input)

  return Object.freeze({
    componentDefinitions: createCanvasStoryImportComponentDefinitions(input),
    input,
    items: createCanvasStoryImportItems(input),
    kind: 'story-import',
    readResult,
  })
}

export function getCanvasStoryImportActionItemsChange({
  action,
}: Pick<CanvasStoryImportActionHostUpdateInput, 'action'>):
  CanvasStoryImportActionItemsChange {
  return {
    items: [...action.items],
    type: 'add' as const,
  }
}

export function getCanvasStoryImportActionHostUpdate({
  action,
  currentComponentDefinitions = [],
  selection,
}: CanvasStoryImportActionHostUpdateInput):
  CanvasStoryImportActionHostUpdateResult {
  const componentDefinitionMerge =
    mergeCanvasStoryImportComponentDefinitions({
      currentComponentDefinitions,
      importedComponentDefinitions: action.componentDefinitions,
    })

  return Object.freeze({
    action,
    addedComponentDefinitionIds:
      componentDefinitionMerge.addedComponentDefinitionIds,
    componentDefinitions: action.componentDefinitions,
    itemsChange: getCanvasStoryImportActionItemsChange({ action }),
    nextComponentDefinitions:
      componentDefinitionMerge.nextComponentDefinitions,
    replacedComponentDefinitionIds:
      componentDefinitionMerge.replacedComponentDefinitionIds,
    selection: selection ?? getCanvasStoryImportActionSelection(action),
  })
}

export function commitCanvasStoryImportActionHostUpdate({
  action,
  commitHostUpdate,
  currentComponentDefinitions,
  selection,
}: CommitCanvasStoryImportActionHostUpdateInput):
  CanvasStoryImportActionHostUpdateCommitResult {
  const update = getCanvasStoryImportActionHostUpdate({
    action,
    currentComponentDefinitions,
    selection,
  })

  if (commitHostUpdate(update)) {
    return Object.freeze({
      action,
      committed: true,
      status: 'committed',
      update,
    })
  }

  return Object.freeze({
    action,
    committed: false,
    holdReason: 'host-update-not-committed',
    status: 'held',
    update,
  })
}

export function getCanvasStoryImportHostAssemblyInput({
  baseComponentDefinitions,
  baseItems,
  importState,
}: CanvasStoryImportHostAssemblyInputSource):
  CanvasStoryImportHostAssemblyInput {
  const baseItemIds = new Set(baseItems.map((item) => item.id))

  return Object.freeze({
    componentDefinitions: getCanvasStoryImportMergedHostComponentDefinitions({
      baseComponentDefinitions,
      importedComponentDefinitions: importState.componentDefinitions,
    }),
    items: [
      ...baseItems,
      ...importState.items.filter((item) => !baseItemIds.has(item.id)),
    ],
  })
}

export function commitCanvasStoryImportActionHostState({
  action,
  baseComponentDefinitions = [],
  commitImportState,
  currentComponentDefinitions,
  currentImportState,
  currentItems,
  selection,
}: CommitCanvasStoryImportActionHostStateInput):
  CanvasStoryImportActionHostUpdateCommitResult {
  return commitCanvasStoryImportActionHostUpdate({
    action,
    commitHostUpdate: (update) => {
      if (
        getCanvasStoryImportDuplicateHostItemIds({
          currentItems,
          update,
        }).length > 0
      ) {
        return false
      }

      commitImportState(Object.freeze({
        componentDefinitions:
          getCanvasStoryImportNextImportedComponentDefinitions({
            baseComponentDefinitions,
            currentImportedComponentDefinitions:
              currentImportState.componentDefinitions,
            importedComponentDefinitions: update.componentDefinitions,
          }),
        items: Object.freeze([
          ...currentImportState.items,
          ...update.itemsChange.items,
        ]),
      }))

      return true
    },
    currentComponentDefinitions,
    selection,
  })
}

export function mergeCanvasStoryImportComponentDefinitions({
  currentComponentDefinitions = [],
  importedComponentDefinitions,
}: CanvasStoryImportComponentDefinitionMergeInput):
  CanvasStoryImportComponentDefinitionMergeResult {
  const importedDefinitionById = new Map(
    importedComponentDefinitions.map((definition) => [
      definition.id,
      definition,
    ]),
  )
  const replacedComponentDefinitionIds: string[] = []
  const seenComponentDefinitionIds = new Set<string>()
  const nextComponentDefinitions = currentComponentDefinitions.map(
    (definition) => {
      const importedDefinition = importedDefinitionById.get(definition.id)

      seenComponentDefinitionIds.add(definition.id)

      if (!importedDefinition) {
        return definition
      }

      replacedComponentDefinitionIds.push(definition.id)

      return importedDefinition
    },
  )
  const addedComponentDefinitionIds: string[] = []

  for (const importedDefinition of importedComponentDefinitions) {
    if (seenComponentDefinitionIds.has(importedDefinition.id)) {
      continue
    }

    addedComponentDefinitionIds.push(importedDefinition.id)
    nextComponentDefinitions.push(importedDefinition)
  }

  return Object.freeze({
    addedComponentDefinitionIds: Object.freeze(addedComponentDefinitionIds),
    nextComponentDefinitions: Object.freeze(nextComponentDefinitions),
    replacedComponentDefinitionIds:
      Object.freeze(replacedComponentDefinitionIds),
  })
}

function getCanvasStoryImportActionSelection(
  action: CanvasStoryImportAction,
): CanvasAppDocumentSelectionHistory {
  return {
    after: action.items.map((item) => item.id),
    before: [],
  }
}

function getCanvasStoryImportMergedHostComponentDefinitions({
  baseComponentDefinitions,
  importedComponentDefinitions,
}: Readonly<{
  baseComponentDefinitions: readonly CanvasComponentDefinition[]
  importedComponentDefinitions: readonly CanvasComponentDefinition[]
}>): readonly CanvasComponentDefinition[] {
  const importedDefinitionById = new Map(
    importedComponentDefinitions.map((definition) => [
      definition.id,
      definition,
    ]),
  )
  const nextDefinitions = baseComponentDefinitions.map((definition) =>
    importedDefinitionById.get(definition.id) ?? definition
  )
  const baseDefinitionIds = new Set(
    baseComponentDefinitions.map((definition) => definition.id),
  )

  for (const definition of importedComponentDefinitions) {
    if (!baseDefinitionIds.has(definition.id)) {
      nextDefinitions.push(definition)
    }
  }

  return Object.freeze(nextDefinitions)
}

function getCanvasStoryImportNextImportedComponentDefinitions({
  baseComponentDefinitions,
  currentImportedComponentDefinitions,
  importedComponentDefinitions,
}: Readonly<{
  baseComponentDefinitions: readonly CanvasComponentDefinition[]
  currentImportedComponentDefinitions: readonly CanvasComponentDefinition[]
  importedComponentDefinitions: readonly CanvasComponentDefinition[]
}>): readonly CanvasComponentDefinition[] {
  const importedDefinitionById = new Map(
    currentImportedComponentDefinitions.map((definition) => [
      definition.id,
      definition,
    ]),
  )

  for (const definition of importedComponentDefinitions) {
    importedDefinitionById.set(definition.id, definition)
  }

  const baseDefinitionIds = new Set(
    baseComponentDefinitions.map((definition) => definition.id),
  )
  const nextImportedDefinitions = currentImportedComponentDefinitions
    .filter((definition) =>
      importedDefinitionById.get(definition.id) === definition
    )

  for (const definition of importedComponentDefinitions) {
    if (
      baseDefinitionIds.has(definition.id) ||
      !nextImportedDefinitions.some((candidate) =>
        candidate.id === definition.id
      )
    ) {
      nextImportedDefinitions.push(definition)
    }
  }

  return Object.freeze(nextImportedDefinitions)
}

function getCanvasStoryImportDuplicateHostItemIds({
  currentItems,
  update,
}: Readonly<{
  currentItems: readonly CanvasItem[]
  update: CanvasStoryImportActionHostUpdateResult
}>): readonly string[] {
  const currentItemIds = new Set(currentItems.map((item) => item.id))

  return Object.freeze(update.itemsChange.items
    .map((item) => item.id)
    .filter((itemId) => currentItemIds.has(itemId)))
}
