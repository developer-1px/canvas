import type {
  CanvasCustomItem,
  CanvasItem,
} from '../../../entities'
import type {
  CanvasComponentDefinition,
  CanvasComponentSource,
} from '../../../host'
import type {
  CanvasDataTransferJSONCandidate,
  CanvasDataTransferJSONCandidateReadResult,
  CanvasTextDataTransfer,
} from '../../affordances/commands/CanvasDataTransferText'
import type {
  CanvasDataTransferImportRegistryScope,
} from '../../affordances/commands/CanvasDataTransferImportRegistry'
import type {
  CanvasAppDocumentSelectionHistory,
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'

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

export const EMPTY_CANVAS_STORY_IMPORT_HOST_STATE:
  CanvasStoryImportHostState = Object.freeze({
    componentDefinitions: Object.freeze([]),
    items: Object.freeze([]),
  })
