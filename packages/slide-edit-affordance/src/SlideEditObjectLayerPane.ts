import type {
  SlideEditObjectVisibilityDescriptor,
  SlideEditObjectVisibilityHostCommandEffect,
  SlideEditVisibilityObjectId,
  SlideEditVisibilitySlideId,
} from './SlideEditObjectVisibility'
import {
  getSlideEditObjectVisibilityCommandEffect,
  getSlideEditObjectVisibilityState,
} from './SlideEditObjectVisibility'

export type SlideEditObjectLayerPaneGroupId = string

export type SlideEditObjectLayerPaneInteractionRole = 'tree'

export type SlideEditObjectLayerPaneAriaContract = {
  rowRole: 'treeitem'
  selectionMode: 'multi'
  surfaceRole: SlideEditObjectLayerPaneInteractionRole
}

export const SLIDE_EDIT_OBJECT_LAYER_PANE_ARIA_CONTRACT =
  Object.freeze({
    rowRole: 'treeitem',
    selectionMode: 'multi',
    surfaceRole: 'tree',
  } as const satisfies SlideEditObjectLayerPaneAriaContract)

export type SlideEditObjectLayerPaneSourceObject<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId =
    SlideEditObjectLayerPaneGroupId,
> = SlideEditObjectVisibilityDescriptor<TSlideId, TObjectId> & {
  depth?: number
  displayName: string
  groupId?: TGroupId | null
  isGroup?: boolean
  isGroupExpanded?: boolean
  kindLabel: string
  order: number
  parentGroupId?: TGroupId | null
}

export type SlideEditObjectLayerPaneRow<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId =
    SlideEditObjectLayerPaneGroupId,
> = {
  aria: {
    expanded?: boolean
    level: number
    posInSet: number
    role: 'treeitem'
    selected: boolean
    setSize: number
  }
  depth: number
  displayName: string
  groupId?: TGroupId | null
  isGrouped: boolean
  isGroup: boolean
  isHidden: boolean
  isLocked: boolean
  isSelectable: boolean
  isSelected: boolean
  kindLabel: string
  objectId: TObjectId
  order: number
  parentGroupId?: TGroupId | null
  slideId: TSlideId
}

export type SlideEditObjectLayerPaneDescriptor<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId =
    SlideEditObjectLayerPaneGroupId,
> = {
  aria: SlideEditObjectLayerPaneAriaContract
  rows: readonly SlideEditObjectLayerPaneRow<TSlideId, TObjectId, TGroupId>[]
  selectedObjectIds: readonly TObjectId[]
  slideId: TSlideId
}

export type SlideEditObjectLayerPaneCommandId =
  | 'additive-select-object'
  | 'hide-objects'
  | 'lock-objects'
  | 'rename-object'
  | 'reorder-object'
  | 'select-object'
  | 'show-objects'
  | 'unlock-objects'

export type SlideEditObjectLayerPaneIntent<
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
> =
  | {
    objectId: TObjectId
    type: 'additive-select'
  }
  | {
    objectIds: readonly TObjectId[]
    type: 'hide'
  }
  | {
    objectIds: readonly TObjectId[]
    type: 'lock'
  }
  | {
    displayName: string
    objectId: TObjectId
    type: 'rename'
  }
  | {
    objectId: TObjectId
    toIndex: number
    type: 'reorder'
  }
  | {
    objectId: TObjectId
    type: 'select'
  }
  | {
    objectIds: readonly TObjectId[]
    type: 'show'
  }
  | {
    objectIds: readonly TObjectId[]
    type: 'unlock'
  }

export type SlideEditObjectLayerPaneCommand<
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
> =
  | {
    id: 'additive-select-object'
    objectId: TObjectId
  }
  | {
    id: 'hide-objects'
    objectIds: readonly TObjectId[]
  }
  | {
    id: 'lock-objects'
    objectIds: readonly TObjectId[]
  }
  | {
    displayName: string
    id: 'rename-object'
    objectId: TObjectId
  }
  | {
    fromIndex: number
    id: 'reorder-object'
    objectId: TObjectId
    toIndex: number
  }
  | {
    id: 'select-object'
    objectIds: readonly TObjectId[]
  }
  | {
    id: 'show-objects'
    objectIds: readonly TObjectId[]
  }
  | {
    id: 'unlock-objects'
    objectIds: readonly TObjectId[]
  }

export type SlideEditObjectLayerPaneHostCommandEffect<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
> =
  | SlideEditObjectVisibilityHostCommandEffect<TSlideId, TObjectId>
  | {
    payload: SlideEditObjectLayerPaneCommand<TObjectId>
    selection: {
      objectIds: readonly TObjectId[]
      slideId: TSlideId
    }
    type: 'slide-command-effect'
  }

export function createSlideEditObjectLayerPaneDescriptor<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId =
    SlideEditObjectLayerPaneGroupId,
>({
  objects,
  selectedObjectIds,
  slideId,
}: {
  objects: readonly SlideEditObjectLayerPaneSourceObject<
    TSlideId,
    TObjectId,
    TGroupId
  >[]
  selectedObjectIds: readonly TObjectId[]
  slideId: TSlideId
}): SlideEditObjectLayerPaneDescriptor<TSlideId, TObjectId, TGroupId> {
  const selected = new Set(selectedObjectIds)
  const rows = [...objects]
    .sort((left, right) => left.order - right.order)
    .map<SlideEditObjectLayerPaneRow<TSlideId, TObjectId, TGroupId>>(
      (object, index, sortedObjects) => {
        const visibility = getSlideEditObjectVisibilityState({
          isHidden: object.isHidden,
          isLocked: object.isLocked,
          selectionPolicy: object.isSelectable
            ? 'allow-hidden-selection'
            : 'visible-only',
        })
        const depth = Math.max(0, object.depth ?? 0)
        const isGroup = object.isGroup ?? false

        return {
          aria: {
            expanded: isGroup ? object.isGroupExpanded ?? true : undefined,
            level: depth + 1,
            posInSet: index + 1,
            role: 'treeitem',
            selected: selected.has(object.objectId),
            setSize: sortedObjects.length,
          },
          depth,
          displayName: object.displayName,
          groupId: object.groupId ?? null,
          isGrouped: Boolean(object.groupId || object.parentGroupId),
          isGroup,
          isHidden: object.isHidden,
          isLocked: object.isLocked,
          isSelectable: visibility.isSelectable,
          isSelected: selected.has(object.objectId),
          kindLabel: object.kindLabel,
          objectId: object.objectId,
          order: object.order,
          parentGroupId: object.parentGroupId ?? null,
          slideId: object.slideId,
        }
      },
    )

  return {
    aria: SLIDE_EDIT_OBJECT_LAYER_PANE_ARIA_CONTRACT,
    rows,
    selectedObjectIds,
    slideId,
  }
}

export function getSlideEditObjectLayerPaneCommandEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId =
    SlideEditObjectLayerPaneGroupId,
>({
  descriptor,
  intent,
}: {
  descriptor: SlideEditObjectLayerPaneDescriptor<
    TSlideId,
    TObjectId,
    TGroupId
  >
  intent: SlideEditObjectLayerPaneIntent<TObjectId>
}): SlideEditObjectLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  switch (intent.type) {
    case 'additive-select':
      return getSlideEditObjectLayerPaneSelectEffect({
        descriptor,
        objectId: intent.objectId,
        mode: 'additive-select-object',
      })
    case 'hide':
      return getSlideEditObjectLayerPaneVisibilityEffect({
        commandId: 'hide-objects',
        descriptor,
        objectIds: intent.objectIds,
      })
    case 'lock':
      return getSlideEditObjectLayerPaneLockEffect({
        commandId: 'lock-objects',
        descriptor,
        objectIds: intent.objectIds,
      })
    case 'rename':
      return getSlideEditObjectLayerPaneRenameEffect({
        descriptor,
        displayName: intent.displayName,
        objectId: intent.objectId,
      })
    case 'reorder':
      return getSlideEditObjectLayerPaneReorderEffect({
        descriptor,
        objectId: intent.objectId,
        toIndex: intent.toIndex,
      })
    case 'select':
      return getSlideEditObjectLayerPaneSelectEffect({
        descriptor,
        objectId: intent.objectId,
        mode: 'select-object',
      })
    case 'show':
      return getSlideEditObjectLayerPaneVisibilityEffect({
        commandId: 'show-objects',
        descriptor,
        objectIds: intent.objectIds,
      })
    case 'unlock':
      return getSlideEditObjectLayerPaneLockEffect({
        commandId: 'unlock-objects',
        descriptor,
        objectIds: intent.objectIds,
      })
  }
}

function getSlideEditObjectLayerPaneSelectEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId,
>({
  descriptor,
  mode,
  objectId,
}: {
  descriptor: SlideEditObjectLayerPaneDescriptor<
    TSlideId,
    TObjectId,
    TGroupId
  >
  mode: 'additive-select-object' | 'select-object'
  objectId: TObjectId
}): SlideEditObjectLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const row = descriptor.rows.find((candidate) => candidate.objectId === objectId)

  if (!row?.isSelectable) {
    return null
  }

  return {
    payload: mode === 'select-object'
      ? {
          id: 'select-object',
          objectIds: [objectId],
        }
      : {
          id: 'additive-select-object',
          objectId,
        },
    selection: {
      objectIds: mode === 'select-object'
        ? [objectId]
        : descriptor.selectedObjectIds,
      slideId: descriptor.slideId,
    },
    type: 'slide-command-effect',
  }
}

function getSlideEditObjectLayerPaneRenameEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId,
>({
  descriptor,
  displayName,
  objectId,
}: {
  descriptor: SlideEditObjectLayerPaneDescriptor<
    TSlideId,
    TObjectId,
    TGroupId
  >
  displayName: string
  objectId: TObjectId
}): SlideEditObjectLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const row = descriptor.rows.find((candidate) => candidate.objectId === objectId)
  const normalizedName = displayName.trim()

  if (!row || row.isLocked || normalizedName.length === 0) {
    return null
  }

  return {
    payload: {
      displayName: normalizedName,
      id: 'rename-object',
      objectId,
    },
    selection: {
      objectIds: descriptor.selectedObjectIds,
      slideId: descriptor.slideId,
    },
    type: 'slide-command-effect',
  }
}

function getSlideEditObjectLayerPaneVisibilityEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId,
>({
  commandId,
  descriptor,
  objectIds,
}: {
  commandId: 'hide-objects' | 'show-objects'
  descriptor: SlideEditObjectLayerPaneDescriptor<
    TSlideId,
    TObjectId,
    TGroupId
  >
  objectIds: readonly TObjectId[]
}): SlideEditObjectLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  return getSlideEditObjectVisibilityCommandEffect({
    commandId,
    objects: descriptor.rows,
    selectedObjectIds: objectIds,
    slideId: descriptor.slideId,
  })
}

function getSlideEditObjectLayerPaneLockEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId,
>({
  commandId,
  descriptor,
  objectIds,
}: {
  commandId: 'lock-objects' | 'unlock-objects'
  descriptor: SlideEditObjectLayerPaneDescriptor<
    TSlideId,
    TObjectId,
    TGroupId
  >
  objectIds: readonly TObjectId[]
}): SlideEditObjectLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const selectedRows = descriptor.rows.filter((row) => (
    objectIds.includes(row.objectId)
  ))
  const targetRows = selectedRows.filter((row) => (
    commandId === 'lock-objects' ? !row.isLocked : row.isLocked
  ))

  if (targetRows.length === 0) {
    return null
  }

  return {
    payload: {
      id: commandId,
      objectIds: targetRows.map((row) => row.objectId),
    },
    selection: {
      objectIds,
      slideId: descriptor.slideId,
    },
    type: 'slide-command-effect',
  }
}

function getSlideEditObjectLayerPaneReorderEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TGroupId extends SlideEditObjectLayerPaneGroupId,
>({
  descriptor,
  objectId,
  toIndex,
}: {
  descriptor: SlideEditObjectLayerPaneDescriptor<
    TSlideId,
    TObjectId,
    TGroupId
  >
  objectId: TObjectId
  toIndex: number
}): SlideEditObjectLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const fromIndex = descriptor.rows.findIndex((row) => row.objectId === objectId)
  const row = descriptor.rows[fromIndex]
  const normalizedToIndex = normalizeSlideEditObjectLayerPaneIndex(
    toIndex,
    descriptor.rows.length,
  )

  if (!row || row.isLocked || fromIndex === normalizedToIndex) {
    return null
  }

  return {
    payload: {
      fromIndex,
      id: 'reorder-object',
      objectId,
      toIndex: normalizedToIndex,
    },
    selection: {
      objectIds: descriptor.selectedObjectIds,
      slideId: descriptor.slideId,
    },
    type: 'slide-command-effect',
  }
}

function normalizeSlideEditObjectLayerPaneIndex(
  index: number,
  length: number,
) {
  if (!Number.isFinite(index) || length <= 0) {
    return 0
  }

  return Math.max(0, Math.min(length - 1, Math.round(index)))
}
