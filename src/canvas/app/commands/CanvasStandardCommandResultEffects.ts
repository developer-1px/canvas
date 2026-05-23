import type { CanvasReorderMode } from '../../engine'
import type { CanvasItem } from '../../entities'
import {
  createCanvasStandardGroupSelectionEffect,
  createCanvasStandardRemoveSelectionEffect,
  createCanvasStandardReorderSelectionEffect,
  createCanvasStandardReplaceChangedEffect,
  createCanvasStandardSelectionEffect,
  createCanvasStandardUngroupSelectionEffect,
  type CanvasStandardCommandDocumentEffect,
} from './CanvasStandardCommandDocumentEffects'

export type CanvasStandardChangedItemsResult = {
  items: CanvasItem[]
  selection: string[]
}

export type CanvasStandardSelectionResult = {
  selection: string[]
}

export type CanvasStandardRemoveSelectionResult =
  CanvasStandardChangedItemsResult & {
    clearEditingIds: readonly string[]
  }

export function createCanvasStandardChangedItemsResultEffect({
  fallbackSelection,
  result,
}: {
  fallbackSelection?: string[]
  result: CanvasStandardChangedItemsResult
}): CanvasStandardCommandDocumentEffect {
  return createCanvasStandardReplaceChangedEffect({
    afterSelection: result.selection,
    fallbackSelection,
    items: result.items,
  })
}

export function createCanvasStandardRemoveSelectionResultEffect({
  result,
  selection,
}: {
  result: CanvasStandardRemoveSelectionResult
  selection: string[]
}): CanvasStandardCommandDocumentEffect {
  return createCanvasStandardRemoveSelectionEffect({
    afterSelection: result.selection,
    clearEditingIds: result.clearEditingIds,
    selection,
  })
}

export function createCanvasStandardGroupSelectionResultEffect({
  groupId,
  result,
  selection,
}: {
  groupId: string
  result: CanvasStandardChangedItemsResult
  selection: string[]
}): CanvasStandardCommandDocumentEffect {
  return createCanvasStandardGroupSelectionEffect({
    afterSelection: result.selection,
    groupId,
    selection,
  })
}

export function createCanvasStandardUngroupSelectionResultEffect({
  result,
  selection,
}: {
  result: CanvasStandardSelectionResult
  selection: string[]
}): CanvasStandardCommandDocumentEffect {
  return createCanvasStandardUngroupSelectionEffect({
    afterSelection: result.selection,
    selection,
  })
}

export function createCanvasStandardNudgeResultEffect({
  items,
}: {
  items: CanvasItem[]
}): CanvasStandardCommandDocumentEffect {
  return createCanvasStandardReplaceChangedEffect({ items })
}

export function createCanvasStandardReorderSelectionResultEffect({
  mode,
  result,
  selection,
}: {
  mode: CanvasReorderMode
  result: CanvasStandardSelectionResult
  selection: string[]
}): CanvasStandardCommandDocumentEffect {
  return createCanvasStandardReorderSelectionEffect({
    afterSelection: result.selection,
    mode,
    selection,
  })
}

export function createCanvasStandardSelectAllResultEffect({
  selection,
}: {
  selection: string[]
}): CanvasStandardCommandDocumentEffect {
  return createCanvasStandardSelectionEffect({ selection })
}
