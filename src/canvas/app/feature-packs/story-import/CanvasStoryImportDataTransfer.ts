import {
  createCanvasDataTransferImportActionPlanFromRegistry,
  createCanvasDataTransferImportRegistry,
  type CanvasDataTransferImportRegistryResolver,
  type CanvasDataTransferImportRegistryScope,
} from '../../affordances/commands/CanvasDataTransferImportRegistry'
import {
  runCanvasDataTransferImportActionPlan,
} from '../../affordances/commands/CanvasDataTransferImportActionPlan'
import {
  readCanvasDataTransferJSONCandidate,
} from '../../affordances/commands/CanvasDataTransferText'
import {
  createCanvasStoryImportAction,
  commitCanvasStoryImportActionHostState,
} from './CanvasStoryImportHostUpdates'
import {
  parseCanvasStoryImportJSONPayload,
} from './CanvasStoryImportPayload'
import {
  CANVAS_STORY_IMPORT_JSON_MIME_TYPE,
  type CanvasStoryImportAction,
  type CanvasStoryImportActionHostUpdateCommitResult,
  type CanvasStoryImportDataTransferActionInput,
  type CanvasStoryImportDataTransferActionResolverInput,
  type CanvasStoryImportDataTransferActionsInput,
  type CanvasStoryImportDataTransferHostStateImportInput,
  type CanvasStoryImportDataTransferHostStateImportResult,
  type CanvasStoryImportDataTransferJSONCandidate,
  type CanvasStoryImportDataTransferReadInput,
  type CanvasStoryImportDataTransferReadResult,
  type CanvasStoryImportInput,
} from './CanvasStoryImportContracts'

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
