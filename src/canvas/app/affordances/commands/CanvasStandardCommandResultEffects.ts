import type {
  CanvasCommandItem,
  CanvasReorderMode,
} from '../../../engine'
import type { CanvasItem } from '../../../entities'
import {
  createCanvasStandardGroupSelectionEffect,
  createCanvasStandardRemoveSelectionEffect,
  createCanvasStandardReorderSelectionEffect,
  createCanvasStandardReplaceChangedEffect,
  createCanvasStandardSelectionEffect,
  createCanvasStandardUngroupSelectionEffect,
} from './CanvasStandardCommandDocumentEffects'
import type {
  CanvasStandardCommandDocumentEffect,
} from './CanvasStandardCommandDocumentEffectContracts'

export type CanvasStandardChangedItemsResult<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  items: TItem[]
  selection: string[]
}

export type CanvasStandardSelectionResult = {
  selection: string[]
}

export type CanvasStandardRemoveSelectionResult<
  TItem extends CanvasCommandItem = CanvasItem,
> =
  CanvasStandardChangedItemsResult<TItem> & {
    clearEditingIds: readonly string[]
  }

export function createCanvasStandardChangedItemsResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  fallbackSelection,
  result,
}: {
  fallbackSelection?: string[]
  result: CanvasStandardChangedItemsResult<TItem>
}): CanvasStandardCommandDocumentEffect<TItem> {
  return createCanvasStandardReplaceChangedEffect<TItem>({
    afterSelection: result.selection,
    fallbackSelection,
    items: result.items,
  })
}

export function createCanvasStandardRemoveSelectionResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  result,
  selection,
}: {
  result: CanvasStandardRemoveSelectionResult<TItem>
  selection: string[]
}): CanvasStandardCommandDocumentEffect<TItem> {
  return createCanvasStandardRemoveSelectionEffect<TItem>({
    afterSelection: result.selection,
    clearEditingIds: result.clearEditingIds,
    selection,
  })
}

export function createCanvasStandardGroupSelectionResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  groupId,
  result,
  selection,
}: {
  groupId: string
  result: CanvasStandardChangedItemsResult<TItem>
  selection: string[]
}): CanvasStandardCommandDocumentEffect<TItem> {
  return createCanvasStandardGroupSelectionEffect<TItem>({
    afterSelection: result.selection,
    groupId,
    selection,
  })
}

export function createCanvasStandardUngroupSelectionResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  result,
  selection,
}: {
  result: CanvasStandardSelectionResult
  selection: string[]
}): CanvasStandardCommandDocumentEffect<TItem> {
  return createCanvasStandardUngroupSelectionEffect<TItem>({
    afterSelection: result.selection,
    selection,
  })
}

export function createCanvasStandardNudgeResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  items,
}: {
  items: TItem[]
}): CanvasStandardCommandDocumentEffect<TItem> {
  return createCanvasStandardReplaceChangedEffect<TItem>({ items })
}

export function createCanvasStandardReorderSelectionResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  mode,
  result,
  selection,
}: {
  mode: CanvasReorderMode
  result: CanvasStandardSelectionResult
  selection: string[]
}): CanvasStandardCommandDocumentEffect<TItem> {
  return createCanvasStandardReorderSelectionEffect<TItem>({
    afterSelection: result.selection,
    mode,
    selection,
  })
}

export function createCanvasStandardSelectAllResultEffect<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  selection,
}: {
  selection: string[]
}): CanvasStandardCommandDocumentEffect<TItem> {
  return createCanvasStandardSelectionEffect<TItem>({ selection })
}
