import type { CanvasCommandItem } from '../../../foundation'
import {
  CANVAS_COMPONENT_DEFINITION_REGISTRY,
  type CanvasComponentDefinitionRegistry,
} from '../../../host'
import {
  transformCanvasAppItemsChange,
  type CanvasAppItemsChangeTransformer,
} from '../../extensions/items-change-transformers'
import type {
  CanvasAppCommitItemsChange,
  CanvasAppDocumentSelectionHistory,
  CanvasAppItemsChange,
} from './CanvasAppDocumentContracts'

const EMPTY_CANVAS_APP_ITEMS_CHANGE_TRANSFORMERS = Object.freeze([])

export type CanvasAppHostItemsChangeCommittedResult<
  TItem extends CanvasCommandItem,
> = Readonly<{
  committed: true
  currentItems: readonly TItem[]
  selection?: CanvasAppDocumentSelectionHistory
  transformedChange: CanvasAppItemsChange<TItem>
}>

export type CanvasAppHostItemsChangeSkippedResult<
  TItem extends CanvasCommandItem,
> = Readonly<{
  committed: false
  currentItems: readonly TItem[]
  selection?: CanvasAppDocumentSelectionHistory
  transformedChange: CanvasAppItemsChange<TItem>
}>

export type CanvasAppHostItemsChangeCommitResult<
  TItem extends CanvasCommandItem,
> =
  | CanvasAppHostItemsChangeCommittedResult<TItem>
  | CanvasAppHostItemsChangeSkippedResult<TItem>

export type CommitCanvasAppHostItemsChangeArgs<
  TItem extends CanvasCommandItem,
> = Readonly<{
  change: CanvasAppItemsChange<TItem>
  commitItemsChange: CanvasAppCommitItemsChange<TItem>
  componentDefinitionRegistry?: CanvasComponentDefinitionRegistry
  currentItems: readonly TItem[]
  itemsChangeTransformers?: readonly CanvasAppItemsChangeTransformer<TItem>[]
  selection?: CanvasAppDocumentSelectionHistory
}>

export type CanvasAppHostItemsChangeCommitInput<
  TItem extends CanvasCommandItem,
> = Readonly<{
  change: CanvasAppItemsChange<TItem>
  selection?: CanvasAppDocumentSelectionHistory
}>

export type CreateCanvasAppHostItemsChangeCommitterInput<
  TItem extends CanvasCommandItem,
> = Readonly<{
  commitItemsChange: CanvasAppCommitItemsChange<TItem>
  componentDefinitionRegistry?: CanvasComponentDefinitionRegistry
  getCurrentItems: () => readonly TItem[]
  itemsChangeTransformers?: readonly CanvasAppItemsChangeTransformer<TItem>[]
}>

export type CanvasAppHostItemsChangeCommitter<
  TItem extends CanvasCommandItem,
> =
  CanvasAppCommitItemsChange<TItem> &
  Readonly<{
    commit: (
      input: CanvasAppHostItemsChangeCommitInput<TItem>,
    ) => CanvasAppHostItemsChangeCommitResult<TItem>
  }>

export function commitCanvasAppHostItemsChange<
  TItem extends CanvasCommandItem,
>({
  change,
  commitItemsChange,
  componentDefinitionRegistry = CANVAS_COMPONENT_DEFINITION_REGISTRY,
  currentItems,
  itemsChangeTransformers,
  selection,
}: CommitCanvasAppHostItemsChangeArgs<TItem>):
  CanvasAppHostItemsChangeCommitResult<TItem> {
  const transformedChange = transformCanvasAppItemsChange<TItem>({
    change,
    componentDefinitionRegistry,
    currentItems,
    transformers:
      itemsChangeTransformers ?? EMPTY_CANVAS_APP_ITEMS_CHANGE_TRANSFORMERS,
  })

  const didCommit = commitItemsChange(transformedChange, selection)

  return didCommit
    ? {
        committed: true,
        currentItems,
        selection,
        transformedChange,
      }
    : {
        committed: false,
        currentItems,
        selection,
        transformedChange,
      }
}

export function createCanvasAppHostItemsChangeCommitter<
  TItem extends CanvasCommandItem,
>({
  commitItemsChange,
  componentDefinitionRegistry,
  getCurrentItems,
  itemsChangeTransformers,
}: CreateCanvasAppHostItemsChangeCommitterInput<TItem>):
  CanvasAppHostItemsChangeCommitter<TItem> {
  const commit = ({
    change,
    selection,
  }: CanvasAppHostItemsChangeCommitInput<TItem>) =>
    commitCanvasAppHostItemsChange({
      change,
      commitItemsChange,
      componentDefinitionRegistry,
      currentItems: getCurrentItems(),
      itemsChangeTransformers,
      selection,
    })

  return Object.assign(
    (
      change: CanvasAppItemsChange<TItem>,
      selection?: CanvasAppDocumentSelectionHistory,
    ) => commit({ change, selection }).committed,
    { commit },
  )
}
