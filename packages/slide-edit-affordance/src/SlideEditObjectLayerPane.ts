export type SlideEditLayerPaneSlideId = string
export type SlideEditLayerPaneObjectId = string
export type SlideEditLayerPaneGroupId = string

export type SlideEditLayerPaneAriaContract = {
  containerRole: 'tree'
  keyboardModel: 'roving-tabindex'
  rowRole: 'treeitem'
  selectionModel: 'host-controlled-multi-select'
}

export const SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT = Object.freeze({
  containerRole: 'tree',
  keyboardModel: 'roving-tabindex',
  rowRole: 'treeitem',
  selectionModel: 'host-controlled-multi-select',
} as const satisfies SlideEditLayerPaneAriaContract)

export type SlideEditLayerPaneObjectInput<
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId = SlideEditLayerPaneGroupId,
> = {
  displayName: string
  groupId?: TGroupId | null
  isGroup?: boolean
  isHidden?: boolean
  isLocked?: boolean
  isRenamable?: boolean
  isReorderable?: boolean
  isSelectable?: boolean
  kindLabel: string
  objectId: TObjectId
  order?: number
  parentObjectId?: TObjectId | null
}

export type SlideEditLayerPaneRowDescriptor<
  TSlideId extends SlideEditLayerPaneSlideId = SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId = SlideEditLayerPaneGroupId,
> = {
  ariaLevel: number
  ariaPosInSet: number
  ariaSetSize: number
  displayName: string
  groupId?: TGroupId | null
  isGrouped: boolean
  isGroup: boolean
  isHidden: boolean
  isLocked: boolean
  isRenamable: boolean
  isReorderable: boolean
  isSelectable: boolean
  isSelected: boolean
  kindLabel: string
  objectId: TObjectId
  order: number
  parentObjectId?: TObjectId | null
  slideId: TSlideId
}

export type SlideEditLayerPaneDescriptor<
  TSlideId extends SlideEditLayerPaneSlideId = SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId = SlideEditLayerPaneGroupId,
> = {
  activeObjectId: TObjectId | null
  aria: SlideEditLayerPaneAriaContract
  rows: readonly SlideEditLayerPaneRowDescriptor<TSlideId, TObjectId, TGroupId>[]
  selectedObjectIds: readonly TObjectId[]
  slideId: TSlideId
}

export type SlideEditLayerPaneCommandId =
  | 'hide-objects'
  | 'lock-objects'
  | 'rename-object'
  | 'reorder-object'
  | 'select-objects'
  | 'show-objects'
  | 'unlock-objects'

export type SlideEditLayerPaneCommandDescriptor = {
  id: SlideEditLayerPaneCommandId
  requiredAdapterSlot: 'command-effect'
}

export const SLIDE_EDIT_LAYER_PANE_COMMANDS = Object.freeze([
  { id: 'select-objects', requiredAdapterSlot: 'command-effect' },
  { id: 'rename-object', requiredAdapterSlot: 'command-effect' },
  { id: 'hide-objects', requiredAdapterSlot: 'command-effect' },
  { id: 'show-objects', requiredAdapterSlot: 'command-effect' },
  { id: 'lock-objects', requiredAdapterSlot: 'command-effect' },
  { id: 'unlock-objects', requiredAdapterSlot: 'command-effect' },
  { id: 'reorder-object', requiredAdapterSlot: 'command-effect' },
] as const satisfies readonly SlideEditLayerPaneCommandDescriptor[])

export type SlideEditLayerPaneCommand<
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
> =
  | {
    id: 'hide-objects' | 'lock-objects' | 'show-objects' | 'unlock-objects'
    objectIds: readonly TObjectId[]
  }
  | {
    id: 'rename-object'
    name: string
    objectId: TObjectId
  }
  | {
    fromIndex: number
    id: 'reorder-object'
    objectId: TObjectId
    toIndex: number
  }
  | {
    id: 'select-objects'
    mode: 'additive' | 'range' | 'replace'
    objectIds: readonly TObjectId[]
  }

export type SlideEditLayerPaneHostCommandEffect<
  TSlideId extends SlideEditLayerPaneSlideId = SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
> = {
  payload: SlideEditLayerPaneCommand<TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditLayerPaneIntent<
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
> =
  | {
    additive?: boolean
    objectId: TObjectId
    rangeAnchorObjectId?: TObjectId | null
    type: 'row-press'
  }
  | {
    name: string
    objectId: TObjectId
    type: 'rename-submit'
  }
  | {
    objectId: TObjectId
    type: 'visibility-toggle'
  }
  | {
    objectId: TObjectId
    type: 'lock-toggle'
  }
  | {
    objectId: TObjectId
    toIndex: number
    type: 'row-drop'
  }

export function createSlideEditLayerPaneDescriptor<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>({
  activeObjectId = null,
  objects,
  selectedObjectIds,
  slideId,
}: {
  activeObjectId?: TObjectId | null
  objects: readonly SlideEditLayerPaneObjectInput<TObjectId, TGroupId>[]
  selectedObjectIds: readonly TObjectId[]
  slideId: TSlideId
}): SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId> {
  const selected = new Set(selectedObjectIds)
  const rows = objects
    .map((object, index) => ({
      object,
      order: object.order ?? index,
    }))
    .sort((a, b) => a.order - b.order)
    .map(({ object, order }, index, sorted) => {
      const ariaLevel = object.parentObjectId ? 2 : 1

      return {
        ariaLevel,
        ariaPosInSet: index + 1,
        ariaSetSize: sorted.length,
        displayName: object.displayName,
        groupId: object.groupId ?? null,
        isGrouped: Boolean(object.groupId),
        isGroup: object.isGroup === true,
        isHidden: object.isHidden === true,
        isLocked: object.isLocked === true,
        isRenamable: object.isRenamable !== false,
        isReorderable: object.isReorderable ?? object.isLocked !== true,
        isSelectable: object.isSelectable !== false,
        isSelected: selected.has(object.objectId),
        kindLabel: object.kindLabel,
        objectId: object.objectId,
        order,
        parentObjectId: object.parentObjectId ?? null,
        slideId,
      } satisfies SlideEditLayerPaneRowDescriptor<TSlideId, TObjectId, TGroupId>
    })

  return {
    activeObjectId,
    aria: SLIDE_EDIT_LAYER_PANE_ARIA_CONTRACT,
    rows,
    selectedObjectIds,
    slideId,
  }
}

export function getSlideEditLayerPaneCommandEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  intent: SlideEditLayerPaneIntent<TObjectId>,
): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  switch (intent.type) {
    case 'row-press':
      return getSlideEditLayerPaneSelectEffect(descriptor, intent)
    case 'rename-submit':
      return getSlideEditLayerPaneRenameEffect(descriptor, intent)
    case 'visibility-toggle':
      return getSlideEditLayerPaneVisibilityEffect(descriptor, intent.objectId)
    case 'lock-toggle':
      return getSlideEditLayerPaneLockEffect(descriptor, intent.objectId)
    case 'row-drop':
      return getSlideEditLayerPaneReorderEffect(descriptor, intent)
  }
}

function getSlideEditLayerPaneSelectEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  intent: Extract<SlideEditLayerPaneIntent<TObjectId>, { type: 'row-press' }>,
): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const row = findSlideEditLayerPaneRow(descriptor, intent.objectId)

  if (!row?.isSelectable) {
    return null
  }

  const objectIds = intent.rangeAnchorObjectId
    ? getSlideEditLayerPaneRangeSelection(
        descriptor,
        intent.rangeAnchorObjectId,
        intent.objectId,
      )
    : intent.additive === true
      ? toggleSlideEditLayerPaneSelection(
          descriptor.selectedObjectIds,
          intent.objectId,
        )
      : [intent.objectId]
  const mode = intent.rangeAnchorObjectId
    ? 'range'
    : intent.additive === true
      ? 'additive'
      : 'replace'

  return toSlideEditLayerPaneHostCommandEffect({
    descriptor,
    payload: {
      id: 'select-objects',
      mode,
      objectIds,
    },
    selectionObjectIds: objectIds,
  })
}

function getSlideEditLayerPaneRenameEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  intent: Extract<
    SlideEditLayerPaneIntent<TObjectId>,
    { type: 'rename-submit' }
  >,
): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const row = findSlideEditLayerPaneRow(descriptor, intent.objectId)
  const name = intent.name.trim()

  if (!row?.isRenamable || name.length === 0) {
    return null
  }

  return toSlideEditLayerPaneHostCommandEffect({
    descriptor,
    payload: {
      id: 'rename-object',
      name,
      objectId: intent.objectId,
    },
    selectionObjectIds: [intent.objectId],
  })
}

function getSlideEditLayerPaneVisibilityEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  objectId: TObjectId,
): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const row = findSlideEditLayerPaneRow(descriptor, objectId)

  if (!row || row.isLocked) {
    return null
  }

  return toSlideEditLayerPaneHostCommandEffect({
    descriptor,
    payload: {
      id: row.isHidden ? 'show-objects' : 'hide-objects',
      objectIds: [objectId],
    },
    selectionObjectIds: [objectId],
  })
}

function getSlideEditLayerPaneLockEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  objectId: TObjectId,
): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const row = findSlideEditLayerPaneRow(descriptor, objectId)

  if (!row) {
    return null
  }

  return toSlideEditLayerPaneHostCommandEffect({
    descriptor,
    payload: {
      id: row.isLocked ? 'unlock-objects' : 'lock-objects',
      objectIds: [objectId],
    },
    selectionObjectIds: [objectId],
  })
}

function getSlideEditLayerPaneReorderEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  intent: Extract<SlideEditLayerPaneIntent<TObjectId>, { type: 'row-drop' }>,
): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  const row = findSlideEditLayerPaneRow(descriptor, intent.objectId)
  const fromIndex = descriptor.rows.findIndex(
    (candidate) => candidate.objectId === intent.objectId,
  )
  const toIndex = normalizeSlideEditLayerPaneIndex(
    intent.toIndex,
    descriptor.rows.length,
  )

  if (!row?.isReorderable || fromIndex < 0 || fromIndex === toIndex) {
    return null
  }

  return toSlideEditLayerPaneHostCommandEffect({
    descriptor,
    payload: {
      fromIndex,
      id: 'reorder-object',
      objectId: intent.objectId,
      toIndex,
    },
    selectionObjectIds: [intent.objectId],
  })
}

function toSlideEditLayerPaneHostCommandEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>({
  descriptor,
  payload,
  selectionObjectIds,
}: {
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>
  payload: SlideEditLayerPaneCommand<TObjectId>
  selectionObjectIds: readonly TObjectId[]
}): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> {
  return {
    payload,
    selection: {
      objectIds: selectionObjectIds,
      slideId: descriptor.slideId,
    },
    type: 'slide-command-effect',
  }
}

function findSlideEditLayerPaneRow<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  objectId: TObjectId,
) {
  return descriptor.rows.find((row) => row.objectId === objectId) ?? null
}

function toggleSlideEditLayerPaneSelection<TObjectId extends string>(
  selectedObjectIds: readonly TObjectId[],
  objectId: TObjectId,
) {
  return selectedObjectIds.includes(objectId)
    ? selectedObjectIds.filter((selectedId) => selectedId !== objectId)
    : [...selectedObjectIds, objectId]
}

function getSlideEditLayerPaneRangeSelection<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  anchorObjectId: TObjectId,
  objectId: TObjectId,
) {
  const anchorIndex = descriptor.rows.findIndex(
    (row) => row.objectId === anchorObjectId,
  )
  const targetIndex = descriptor.rows.findIndex((row) => row.objectId === objectId)

  if (anchorIndex < 0 || targetIndex < 0) {
    return [objectId]
  }

  const start = Math.min(anchorIndex, targetIndex)
  const end = Math.max(anchorIndex, targetIndex)

  return descriptor.rows
    .slice(start, end + 1)
    .filter((row) => row.isSelectable)
    .map((row) => row.objectId)
}

function normalizeSlideEditLayerPaneIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, Math.max(0, length - 1)))
}
