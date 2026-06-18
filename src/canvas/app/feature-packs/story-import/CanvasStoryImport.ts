import type {
  CanvasItem,
  CanvasCustomItem,
} from '../../../entities'
import {
  CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID,
  type CanvasComponentDefinition,
  type CanvasComponentSource,
} from '../../../host'
import {
  readCanvasDataTransferJSONCandidate,
  type CanvasDataTransferJSONCandidate,
  type CanvasDataTransferJSONCandidateReadResult,
  type CanvasTextDataTransfer,
} from '../../affordances/commands/CanvasDataTransferText'
import {
  createCanvasDataTransferImportActionPlanFromRegistry,
  createCanvasDataTransferImportRegistry,
} from '../../affordances/commands/CanvasDataTransferImportRegistry'
import type {
  CanvasDataTransferImportRegistryResolver,
  CanvasDataTransferImportRegistryScope,
} from '../../affordances/commands/CanvasDataTransferImportRegistry'
import {
  runCanvasDataTransferImportActionPlan,
} from '../../affordances/commands/CanvasDataTransferImportActionPlan'
import type {
  CanvasAppDocumentSelectionHistory,
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'
import {
  CANVAS_STORY_PREVIEW_GROUP_KIND,
  CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
  CANVAS_STORY_PREVIEW_ITEM_KIND,
  CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
  type CanvasStoryPreviewGroupData,
  type CanvasStoryPreviewItemData,
} from '../story-preview'

export const CANVAS_STORY_IMPORT_JSON_KIND = 'canvas-story-import'
export const CANVAS_STORY_IMPORT_JSON_MIME_TYPE =
  'application/vnd.interactive-os.canvas.story-import+json'
export const CANVAS_STORY_IMPORT_JSON_VERSION = 1

export type CanvasStoryImportStory = Readonly<{
  h: number
  id: string
  title: string
  w: number
  x: number
  y: number
}>

export type CanvasStoryImportGroup = Readonly<{
  count?: number
  h: number
  id: string
  label?: string | null
  source?: CanvasComponentSource
  stories: readonly CanvasStoryImportStory[]
  title?: string
  w: number
  x: number
  y: number
}>

export type CanvasStoryImportInput = Readonly<{
  groups: readonly CanvasStoryImportGroup[]
}>

export type CanvasStoryImportJSONPayload =
  | CanvasStoryImportInput
  | Readonly<{
    input: CanvasStoryImportInput
    kind: typeof CANVAS_STORY_IMPORT_JSON_KIND
    version?: typeof CANVAS_STORY_IMPORT_JSON_VERSION
  }>

export type CanvasStoryImportDataTransferJSONCandidate =
  CanvasDataTransferJSONCandidate & Readonly<{
    source:
      | 'application-json'
      | 'story-import-json'
      | 'text-json'
      | 'text-plain'
  }>

export type CanvasStoryImportDataTransferReadResult =
  CanvasDataTransferJSONCandidateReadResult<
    CanvasStoryImportInput,
    CanvasStoryImportDataTransferJSONCandidate
  >

export type CanvasStoryImportAction = Readonly<{
  componentDefinitions: readonly CanvasComponentDefinition[]
  input: CanvasStoryImportInput
  items: readonly CanvasCustomItem[]
  kind: 'story-import'
  readResult?: CanvasStoryImportDataTransferReadResult
}>

export type CanvasStoryImportActionItemsChange = Extract<
  CanvasAppItemsChange<CanvasCustomItem>,
  { type: 'add' }
>

export type CanvasStoryImportActionInput = Readonly<{
  input: CanvasStoryImportInput
  readResult?: CanvasStoryImportDataTransferReadResult
}>

export type CanvasStoryImportActionHostUpdateInput = Readonly<{
  action: CanvasStoryImportAction
  currentComponentDefinitions?: readonly CanvasComponentDefinition[]
  selection?: CanvasAppDocumentSelectionHistory
}>

export type CanvasStoryImportActionHostUpdateResult = Readonly<{
  action: CanvasStoryImportAction
  addedComponentDefinitionIds: readonly string[]
  componentDefinitions: readonly CanvasComponentDefinition[]
  itemsChange: CanvasStoryImportActionItemsChange
  nextComponentDefinitions: readonly CanvasComponentDefinition[]
  replacedComponentDefinitionIds: readonly string[]
  selection: CanvasAppDocumentSelectionHistory
}>

export type CanvasStoryImportActionHostUpdateCommitter = (
  update: CanvasStoryImportActionHostUpdateResult,
) => boolean

export type CommitCanvasStoryImportActionHostUpdateInput =
  CanvasStoryImportActionHostUpdateInput & Readonly<{
    commitHostUpdate: CanvasStoryImportActionHostUpdateCommitter
  }>

export type CanvasStoryImportActionHostUpdateCommittedResult = Readonly<{
  action: CanvasStoryImportAction
  committed: true
  status: 'committed'
  update: CanvasStoryImportActionHostUpdateResult
}>

export type CanvasStoryImportActionHostUpdateHeldResult = Readonly<{
  action: CanvasStoryImportAction
  committed: false
  holdReason: 'host-update-not-committed'
  status: 'held'
  update: CanvasStoryImportActionHostUpdateResult
}>

export type CanvasStoryImportActionHostUpdateCommitResult =
  | CanvasStoryImportActionHostUpdateCommittedResult
  | CanvasStoryImportActionHostUpdateHeldResult

export type CanvasStoryImportComponentDefinitionMergeInput = Readonly<{
  currentComponentDefinitions?: readonly CanvasComponentDefinition[]
  importedComponentDefinitions: readonly CanvasComponentDefinition[]
}>

export type CanvasStoryImportComponentDefinitionMergeResult = Readonly<{
  addedComponentDefinitionIds: readonly string[]
  nextComponentDefinitions: readonly CanvasComponentDefinition[]
  replacedComponentDefinitionIds: readonly string[]
}>

export type CanvasStoryImportHostState = Readonly<{
  componentDefinitions: readonly CanvasComponentDefinition[]
  items: readonly CanvasItem[]
}>

export type CanvasStoryImportHostAssemblyInput = Readonly<{
  componentDefinitions: readonly CanvasComponentDefinition[]
  items: CanvasItem[]
}>

export type CanvasStoryImportHostAssemblyInputSource = Readonly<{
  baseComponentDefinitions: readonly CanvasComponentDefinition[]
  baseItems: readonly CanvasItem[]
  importState: CanvasStoryImportHostState
}>

export type CommitCanvasStoryImportActionHostStateInput = Readonly<{
  action: CanvasStoryImportAction
  baseComponentDefinitions?: readonly CanvasComponentDefinition[]
  commitImportState: (state: CanvasStoryImportHostState) => void
  currentComponentDefinitions?: readonly CanvasComponentDefinition[]
  currentImportState: CanvasStoryImportHostState
  currentItems: readonly CanvasItem[]
  selection?: CanvasAppDocumentSelectionHistory
}>

export type CanvasStoryImportDataTransferHostStateImportInput<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = Readonly<{
  baseComponentDefinitions?: readonly CanvasComponentDefinition[]
  candidates?: readonly CanvasStoryImportDataTransferJSONCandidate[]
  commitImportState: (state: CanvasStoryImportHostState) => void
  currentComponentDefinitions?: readonly CanvasComponentDefinition[]
  currentImportState: CanvasStoryImportHostState
  currentItems: readonly CanvasItem[]
  dataTransfer: DataTransfer | null
  resolverScope?: TScope | readonly TScope[]
  scope: TScope
}>

export type CanvasStoryImportDataTransferActionsInput<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = Readonly<{
  candidates?: readonly CanvasStoryImportDataTransferJSONCandidate[]
  dataTransfer: DataTransfer | null
  resolverScope?: TScope | readonly TScope[]
  scope: TScope
}>

export type CanvasStoryImportDataTransferHostStateImportResult = Readonly<{
  actionResults: readonly CanvasStoryImportActionHostUpdateCommitResult[]
  attemptedActionCount: number
  consumed: boolean
  consumedActionIndex: number
}>

export type CanvasStoryImportDataTransferReadInput = Readonly<{
  candidates?: readonly CanvasStoryImportDataTransferJSONCandidate[]
  dataTransfer: CanvasTextDataTransfer | null
}>

export type CanvasStoryImportDataTransferActionInput =
  CanvasStoryImportDataTransferReadInput

export type CanvasStoryImportDataTransferActionResolverInput<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = Readonly<{
  candidates?: readonly CanvasStoryImportDataTransferJSONCandidate[]
  id?: string
  mode?: 'append' | 'exclusive'
  order?: number
  scope: TScope | readonly TScope[]
  title?: string
}>

export const DEFAULT_CANVAS_STORY_IMPORT_DATA_TRANSFER_JSON_CANDIDATES:
  readonly CanvasStoryImportDataTransferJSONCandidate[] = Object.freeze([
    Object.freeze({
      mimeType: CANVAS_STORY_IMPORT_JSON_MIME_TYPE,
      source: 'story-import-json',
    }),
    Object.freeze({
      mimeType: 'application/json',
      source: 'application-json',
    }),
    Object.freeze({
      mimeType: 'text/json',
      source: 'text-json',
    }),
    Object.freeze({
      mimeType: 'text/plain',
      source: 'text-plain',
    }),
  ])

export const EMPTY_CANVAS_STORY_IMPORT_HOST_STATE:
  CanvasStoryImportHostState = Object.freeze({
    componentDefinitions: Object.freeze([]),
    items: Object.freeze([]),
  })

export function createCanvasStoryImportItems({
  groups,
}: CanvasStoryImportInput): readonly CanvasCustomItem[] {
  const items: CanvasCustomItem[] = []
  const itemIds = new Set<string>()

  for (const group of groups) {
    if (group.label) {
      const groupItem = createCanvasStoryPreviewGroupItem(group)

      assertCanvasStoryImportUniqueItemId(itemIds, groupItem.id)
      items.push(groupItem)
    }

    for (const story of group.stories) {
      const storyItem = createCanvasStoryPreviewItem(story)

      assertCanvasStoryImportUniqueItemId(itemIds, storyItem.id)
      items.push(storyItem)
    }
  }

  return Object.freeze(items)
}

export function createCanvasStoryImportComponentDefinitions({
  groups,
}: CanvasStoryImportInput): readonly CanvasComponentDefinition[] {
  const definitions: CanvasComponentDefinition[] = []
  const definitionIds = new Set<string>()

  for (const group of groups) {
    const label = group.label ?? null

    if (!label || group.stories.length === 0) {
      continue
    }

    const definition = createCanvasStoryImportComponentDefinition(group, label)

    assertCanvasStoryImportUniqueComponentDefinitionId(
      definitionIds,
      definition.id,
    )
    definitions.push(definition)
  }

  return Object.freeze(definitions)
}

export function parseCanvasStoryImportJSONPayload(
  json: unknown,
): CanvasStoryImportInput {
  const input = unwrapCanvasStoryImportJSONPayload(json)

  assertCanvasStoryImportInput(input)

  return input
}

export function readCanvasStoryImportDataTransfer({
  candidates = DEFAULT_CANVAS_STORY_IMPORT_DATA_TRANSFER_JSON_CANDIDATES,
  dataTransfer,
}: CanvasStoryImportDataTransferReadInput):
  CanvasStoryImportDataTransferReadResult | null {
  return readCanvasDataTransferJSONCandidate<
    CanvasStoryImportInput,
    CanvasStoryImportDataTransferJSONCandidate
  >({
    candidates,
    dataTransfer,
    parseValue: ({ json }) => parseCanvasStoryImportJSONPayload(json),
  })
}

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

export function createCanvasStoryImportActionFromDataTransfer(
  input: CanvasStoryImportDataTransferActionInput,
): CanvasStoryImportAction | null {
  const readResult = readCanvasStoryImportDataTransfer(input)

  if (!readResult) {
    return null
  }

  return createCanvasStoryImportAction({
    input: readResult.value,
    readResult,
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

export function getCanvasStoryImportDataTransferActions<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
>({
  candidates,
  dataTransfer,
  resolverScope,
  scope,
}: CanvasStoryImportDataTransferActionsInput<TScope>):
  readonly CanvasStoryImportAction[] {
  const registry = createCanvasDataTransferImportRegistry({
    resolvers: [
      createCanvasStoryImportDataTransferActionResolver({
        candidates,
        scope: resolverScope ?? scope,
      }),
    ],
  })

  return createCanvasDataTransferImportActionPlanFromRegistry({
    dataTransfer,
    registry,
    scope,
  })
}

export function hasCanvasStoryImportDataTransferAction<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
>(
  input: CanvasStoryImportDataTransferActionsInput<TScope>,
) {
  return getCanvasStoryImportDataTransferActions(input).length > 0
}

export function runCanvasStoryImportDataTransferHostStateImport<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
>({
  baseComponentDefinitions = [],
  candidates,
  commitImportState,
  currentComponentDefinitions = baseComponentDefinitions,
  currentImportState,
  currentItems,
  dataTransfer,
  resolverScope,
  scope,
}: CanvasStoryImportDataTransferHostStateImportInput<TScope>):
  CanvasStoryImportDataTransferHostStateImportResult {
  const actions = getCanvasStoryImportDataTransferActions({
    candidates,
    dataTransfer,
    resolverScope,
    scope,
  })
  const actionResults: CanvasStoryImportActionHostUpdateCommitResult[] = []
  let nextCurrentComponentDefinitions = currentComponentDefinitions
  let nextCurrentImportState = currentImportState
  let nextCurrentItems = currentItems
  const runResult = runCanvasDataTransferImportActionPlan({
    actions,
    runAction: (action) => {
      const actionResult = commitCanvasStoryImportActionHostState({
        action,
        baseComponentDefinitions,
        commitImportState: (state) => {
          nextCurrentImportState = state
          commitImportState(state)
        },
        currentComponentDefinitions: nextCurrentComponentDefinitions,
        currentImportState: nextCurrentImportState,
        currentItems: nextCurrentItems,
      })

      actionResults.push(actionResult)

      if (actionResult.committed) {
        nextCurrentComponentDefinitions =
          actionResult.update.nextComponentDefinitions
        nextCurrentItems = [
          ...nextCurrentItems,
          ...actionResult.update.itemsChange.items,
        ]
      }

      return actionResult.committed
    },
  })

  return Object.freeze({
    actionResults: Object.freeze(actionResults),
    attemptedActionCount: runResult.attemptedActions.length,
    consumed: runResult.consumed,
    consumedActionIndex: runResult.consumedActionIndex,
  })
}

export function createCanvasStoryImportDataTransferActionResolver<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
>({
  candidates,
  id = 'story-import',
  mode = 'exclusive',
  order,
  scope,
  title = 'Story import',
}: CanvasStoryImportDataTransferActionResolverInput<TScope>):
  CanvasDataTransferImportRegistryResolver<CanvasStoryImportAction, TScope> {
  return Object.freeze({
    id,
    mode,
    order,
    resolve: ({ dataTransfer }) =>
      createCanvasStoryImportActionFromDataTransfer({
        candidates,
        dataTransfer,
      }),
    scope,
    supportedFormats: Object.freeze([
      ...(candidates ?? DEFAULT_CANVAS_STORY_IMPORT_DATA_TRANSFER_JSON_CANDIDATES)
        .map((candidate) => candidate.mimeType),
    ]),
    title,
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

function createCanvasStoryImportComponentDefinition(
  group: CanvasStoryImportGroup,
  label: string,
): CanvasComponentDefinition {
  return {
    id: `story-import-${group.id}`,
    instances: group.stories.map((story) => ({
      label: story.title,
      slots: {
        [CANVAS_COMPONENT_DEFINITION_ROOT_SLOT_ID]: `story-${story.id}`,
      },
    })),
    label,
    source: group.source,
  }
}

function createCanvasStoryPreviewGroupItem(
  group: CanvasStoryImportGroup,
): CanvasCustomItem & { data: CanvasStoryPreviewGroupData } {
  const groupLabel = group.label ?? group.title ?? group.id

  return {
    data: {
      count: group.count ?? group.stories.length,
      groupLabel,
    },
    h: group.h,
    id: `group-${group.id}`,
    kind: CANVAS_STORY_PREVIEW_GROUP_KIND,
    presentation: CANVAS_STORY_PREVIEW_GROUP_PRESENTATION,
    title: group.title ?? groupLabel,
    type: 'custom',
    w: group.w,
    x: group.x,
    y: group.y,
  }
}

function createCanvasStoryPreviewItem(
  story: CanvasStoryImportStory,
): CanvasCustomItem & { data: CanvasStoryPreviewItemData } {
  return {
    data: {
      storyId: story.id,
    },
    h: story.h,
    id: `story-${story.id}`,
    kind: CANVAS_STORY_PREVIEW_ITEM_KIND,
    presentation: CANVAS_STORY_PREVIEW_ITEM_PRESENTATION,
    title: story.title,
    type: 'custom',
    w: story.w,
    x: story.x,
    y: story.y,
  }
}

function assertCanvasStoryImportUniqueItemId(
  itemIds: Set<string>,
  itemId: string,
) {
  if (itemIds.has(itemId)) {
    throw new Error(`Duplicate canvas story import item: ${itemId}`)
  }

  itemIds.add(itemId)
}

function assertCanvasStoryImportUniqueComponentDefinitionId(
  definitionIds: Set<string>,
  definitionId: string,
) {
  if (definitionIds.has(definitionId)) {
    throw new Error(
      `Duplicate canvas story import component definition: ${definitionId}`,
    )
  }

  definitionIds.add(definitionId)
}

function unwrapCanvasStoryImportJSONPayload(
  json: unknown,
): CanvasStoryImportInput {
  assertCanvasJsonObject(json, 'canvas story import payload')

  if ('kind' in json) {
    if (json.kind !== CANVAS_STORY_IMPORT_JSON_KIND) {
      throw new Error('Invalid canvas story import payload kind')
    }

    if (
      'version' in json &&
      json.version !== CANVAS_STORY_IMPORT_JSON_VERSION
    ) {
      throw new Error('Invalid canvas story import payload version')
    }

    if (!('input' in json)) {
      throw new Error('Missing canvas story import payload input')
    }

    return json.input as CanvasStoryImportInput
  }

  return json as CanvasStoryImportInput
}

function assertCanvasStoryImportInput(
  input: CanvasStoryImportInput,
) {
  assertCanvasJsonObject(input, 'canvas story import input')

  if (!Array.isArray(input.groups)) {
    throw new Error('Invalid canvas story import groups')
  }

  input.groups.forEach(assertCanvasStoryImportGroup)
}

function assertCanvasStoryImportGroup(
  group: unknown,
) {
  assertCanvasJsonObject(group, 'canvas story import group')
  assertCanvasStoryImportString(group.id, 'canvas story import group id')
  assertCanvasStoryImportFiniteNumber(group.h, 'canvas story import group h')
  assertCanvasStoryImportFiniteNumber(group.w, 'canvas story import group w')
  assertCanvasStoryImportFiniteNumber(group.x, 'canvas story import group x')
  assertCanvasStoryImportFiniteNumber(group.y, 'canvas story import group y')

  if (
    group.count !== undefined &&
    !Number.isFinite(group.count)
  ) {
    throw new Error('Invalid canvas story import group count')
  }

  if (
    group.label !== undefined &&
    group.label !== null &&
    typeof group.label !== 'string'
  ) {
    throw new Error('Invalid canvas story import group label')
  }

  if (
    group.title !== undefined &&
    typeof group.title !== 'string'
  ) {
    throw new Error('Invalid canvas story import group title')
  }

  if (group.source !== undefined) {
    assertCanvasStoryImportSource(group.source)
  }

  if (!Array.isArray(group.stories)) {
    throw new Error('Invalid canvas story import group stories')
  }

  group.stories.forEach(assertCanvasStoryImportStory)
}

function assertCanvasStoryImportStory(
  story: unknown,
) {
  assertCanvasJsonObject(story, 'canvas story import story')
  assertCanvasStoryImportString(story.id, 'canvas story import story id')
  assertCanvasStoryImportString(story.title, 'canvas story import story title')
  assertCanvasStoryImportFiniteNumber(story.h, 'canvas story import story h')
  assertCanvasStoryImportFiniteNumber(story.w, 'canvas story import story w')
  assertCanvasStoryImportFiniteNumber(story.x, 'canvas story import story x')
  assertCanvasStoryImportFiniteNumber(story.y, 'canvas story import story y')
}

function assertCanvasStoryImportSource(
  source: unknown,
) {
  assertCanvasJsonObject(source, 'canvas story import source')
  assertCanvasStoryImportString(
    source.exportName,
    'canvas story import source exportName',
  )
  assertCanvasStoryImportString(
    source.importPath,
    'canvas story import source importPath',
  )
  assertCanvasStoryImportString(
    source.layer,
    'canvas story import source layer',
  )
}

function assertCanvasJsonObject(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(`Invalid ${label}`)
  }
}

function assertCanvasStoryImportString(
  value: unknown,
  label: string,
): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid ${label}`)
  }
}

function assertCanvasStoryImportFiniteNumber(
  value: unknown,
  label: string,
): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`)
  }
}
