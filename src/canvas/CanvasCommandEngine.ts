import type { CanvasAffordanceConfig } from './CanvasAffordances'
import {
  cloneCanvasItemsWithNewIds,
  cloneCanvasSelection,
  copyCanvasSelection,
  groupCanvasSelection,
  removeCanvasItems,
  translateCanvasItems,
  ungroupCanvasSelection,
} from './CanvasOperations'
import type { CanvasItem, Point } from './CanvasModel'
import { findCanvasItem } from './CanvasTree'

export type CanvasCommandAvailability = {
  delete: boolean
  duplicate: boolean
  group: boolean
  redo: boolean
  undo: boolean
  ungroup: boolean
}

export type CanvasCommandItemsResult = {
  items: CanvasItem[]
  selection: string[]
}

export type DuplicateCanvasCommandResult = CanvasCommandItemsResult & {
  clones: CanvasItem[]
}

export type DeleteCanvasCommandResult = CanvasCommandItemsResult & {
  clearEditingIds: string[]
}

export type PasteCanvasCommandResult = CanvasCommandItemsResult & {
  clipboard: CanvasItem[]
}

export type CutCanvasCommandResult = {
  clipboard: CanvasItem[] | null
  deletion: DeleteCanvasCommandResult | null
}

export const CANVAS_COMMAND_INSERT_OFFSET: Point = { x: 28, y: 28 }

export function getCanvasCommandAvailability({
  canRedo,
  canUndo,
  config,
  items,
  selection,
}: {
  canRedo: boolean
  canUndo: boolean
  config: CanvasAffordanceConfig
  items: CanvasItem[]
  selection: string[]
}): CanvasCommandAvailability {
  const hasSelection = selection.length > 0

  return {
    delete: config.commands.delete && hasSelection,
    duplicate: config.commands.duplicate && hasSelection,
    group: config.commands.group && selection.length > 1,
    redo: config.commands.redo && canRedo,
    undo: config.commands.undo && canUndo,
    ungroup:
      config.commands.ungroup &&
      selection.some((id) => findCanvasItem(items, id)?.type === 'group'),
  }
}

export function cloneCanvasCommandItems({
  createId,
  ids,
  items,
  offset,
}: {
  createId: (prefix: string) => string
  ids: string[]
  items: CanvasItem[]
  offset: Point
}) {
  return cloneCanvasSelection(items, ids, createId, offset)
}

export function duplicateCanvasCommand({
  config,
  createId,
  items,
  offset = CANVAS_COMMAND_INSERT_OFFSET,
  selection,
  sourceIds = selection,
}: {
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  offset?: Point
  selection: string[]
  sourceIds?: string[]
}): DuplicateCanvasCommandResult | null {
  if (!config.commands.duplicate) {
    return null
  }

  const clones = cloneCanvasCommandItems({
    createId,
    ids: sourceIds,
    items,
    offset,
  })

  if (clones.length === 0) {
    return null
  }

  return {
    clones,
    items: [...items, ...clones],
    selection: clones.map((item) => item.id),
  }
}

export function copyCanvasCommand({
  config,
  items,
  selection,
}: {
  config: CanvasAffordanceConfig
  items: CanvasItem[]
  selection: string[]
}) {
  if (!config.commands.copy) {
    return null
  }

  return copyCanvasSelection(items, selection)
}

export function pasteCanvasCommand({
  clipboard,
  config,
  createId,
  items,
  offset = CANVAS_COMMAND_INSERT_OFFSET,
}: {
  clipboard: CanvasItem[]
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  offset?: Point
}): PasteCanvasCommandResult | null {
  if (!config.commands.paste) {
    return null
  }

  const clones = cloneCanvasItemsWithNewIds(clipboard, createId, offset)

  if (clones.length === 0) {
    return null
  }

  return {
    clipboard: clones,
    items: [...items, ...clones],
    selection: clones.map((item) => item.id),
  }
}

export function deleteCanvasCommand({
  config,
  items,
  selection,
}: {
  config: CanvasAffordanceConfig
  items: CanvasItem[]
  selection: string[]
}): DeleteCanvasCommandResult | null {
  if (!config.commands.delete || selection.length === 0) {
    return null
  }

  return {
    clearEditingIds: selection,
    items: removeCanvasItems(items, selection),
    selection: [],
  }
}

export function groupCanvasCommand({
  config,
  createId,
  items,
  selection,
}: {
  config: CanvasAffordanceConfig
  createId: (prefix: string) => string
  items: CanvasItem[]
  selection: string[]
}): CanvasCommandItemsResult | null {
  if (!config.commands.group || selection.length < 2) {
    return null
  }

  const result = groupCanvasSelection(items, selection, createId('group'))

  if (result.items === items) {
    return null
  }

  return result
}

export function ungroupCanvasCommand({
  config,
  items,
  selection,
}: {
  config: CanvasAffordanceConfig
  items: CanvasItem[]
  selection: string[]
}): CanvasCommandItemsResult | null {
  if (!config.commands.ungroup) {
    return null
  }

  const result = ungroupCanvasSelection(items, selection)

  if (result.selection.length === 0) {
    return null
  }

  return result
}

export function cutCanvasCommand({
  config,
  items,
  selection,
}: {
  config: CanvasAffordanceConfig
  items: CanvasItem[]
  selection: string[]
}): CutCanvasCommandResult | null {
  if (!config.commands.cut) {
    return null
  }

  return {
    clipboard: copyCanvasCommand({ config, items, selection }),
    deletion: deleteCanvasCommand({ config, items, selection }),
  }
}

export function nudgeCanvasCommand({
  config,
  dx,
  dy,
  items,
  selection,
}: {
  config: CanvasAffordanceConfig
  dx: number
  dy: number
  items: CanvasItem[]
  selection: string[]
}) {
  if (!config.commands.nudge) {
    return null
  }

  return translateCanvasItems(items, selection, dx, dy)
}
