import {
  getCanvasItemIds,
  getCanvasValidSelection,
  normalizeCanvasItems,
} from '../../host'
import type { CanvasItem } from '../../entities'
import type { CanvasWorkspaceStorageProvider } from '../document/CanvasWorkspacePersistence'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
} from '../extensions/CanvasAppDescriptorContracts'
import type {
  CanvasAppCustomItemValidators,
} from '../modules/CanvasAppCustomItemValidatorContracts'

export type CanvasAppWorkspaceAssemblyContract = {
  customItemValidators: CanvasAppCustomItemValidators
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
  workspaceStorageProvider: CanvasWorkspaceStorageProvider
}

type CanvasAppInitialSelectionContract = {
  initialItems: CanvasItem[]
  initialSelection: readonly string[]
}

export function assertCanvasAppWorkspaceAssembly({
  customItemValidators,
  initialItems,
  initialSelection,
  workspaceStorageProvider,
}: CanvasAppWorkspaceAssemblyContract) {
  assertCanvasAppArray(initialItems, 'assembly initial items')
  assertCanvasAppArray(
    initialSelection,
    'assembly initial selection',
  )
  assertCanvasAppDescriptorFunctionField({
    field: 'workspaceStorageProvider',
    owner: 'assembly',
    value: workspaceStorageProvider,
  })

  const normalizedItems = normalizeCanvasItems(initialItems, {
    customItemValidators,
  })

  assertCanvasAppInitialSelection({
    initialItems: normalizedItems,
    initialSelection,
  })
}

function assertCanvasAppInitialSelection({
  initialItems,
  initialSelection,
}: CanvasAppInitialSelectionContract) {
  const selectionIds = initialSelection.map((id) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error(
        `Invalid assembly initial selection: ${String(id)}`,
      )
    }

    return id
  })
  const validSelection = getCanvasValidSelection(initialItems, selectionIds)

  if (hasSameCanvasInitialSelection(selectionIds, validSelection)) {
    return
  }

  const allIds = new Set(getCanvasItemIds(initialItems))
  const invalidSelection = selectionIds.filter((id) => !allIds.has(id))
  const invalidLabel = invalidSelection.length === 0
    ? selectionIds
    : invalidSelection

  throw new Error(
    `Invalid assembly initial selection: ${invalidLabel.join(', ')}`,
  )
}

function hasSameCanvasInitialSelection(
  selection: readonly string[],
  validSelection: readonly string[],
) {
  return selection.length === validSelection.length &&
    selection.every((id, index) => id === validSelection[index])
}
