import { getCanvasSelectionListRangeIds } from '../../../src/canvas/app/affordances/controls/selection-list/CanvasSelectionListRange'

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

export const SLIDE_EDIT_LAYER_PANE_KEYBOARD_INTENT_MODEL =
  'slide-edit-layer-pane-keyboard-intent'

export const SLIDE_EDIT_LAYER_PANE_KEYBOARD_KEYS =
  'arrow-left-right-up-down-home-end-enter-space-shift-range-alt-reorder-f2-rename'

export const SLIDE_EDIT_LAYER_PANE_DROP_INDICATOR_MODEL =
  'slide-edit-layer-pane-drop-indicator'

export type SlideEditLayerPaneObjectInput<
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId = SlideEditLayerPaneGroupId,
> = {
  displayName: string
  groupId?: TGroupId | null
  isExpanded?: boolean
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
  ariaExpanded?: boolean
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

export type SlideEditLayerPaneDropPlacement = 'after' | 'before' | 'none'

export type SlideEditLayerPaneDropIndicator<
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
> = {
  draggedObjectId: TObjectId
  indicator: '' | 'after' | 'before'
  placement: SlideEditLayerPaneDropPlacement
  targetObjectId: TObjectId | null
  toIndex: number | null
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

export const SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-name+json'

export const SLIDE_EDIT_LAYER_PANE_OBJECT_METADATA_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-metadata+json'

export const SLIDE_EDIT_LAYER_PANE_RENAME_JSON_MIME_TYPES = Object.freeze([
  SLIDE_EDIT_LAYER_PANE_OBJECT_NAME_JSON_MIME_TYPE,
  SLIDE_EDIT_LAYER_PANE_OBJECT_METADATA_JSON_MIME_TYPE,
] as const)

export const SLIDE_EDIT_LAYER_PANE_RENAME_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_LAYER_PANE_RENAME_JSON_WRAPPER_KEYS = Object.freeze([
  'objectMetadata',
  'objectName',
  'layerName',
] as const)

export const SLIDE_EDIT_LAYER_PANE_OBJECT_LAYER_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-layer+json'

export const SLIDE_EDIT_LAYER_PANE_OBJECT_LAYER_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_LAYER_PANE_OBJECT_LAYER_JSON_WRAPPER_KEYS =
  Object.freeze([
    'objectLayer',
    'layerOrder',
    'zOrder',
  ] as const)

export const SLIDE_EDIT_LAYER_PANE_OBJECT_STATE_JSON_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.object-state+json'

export const SLIDE_EDIT_LAYER_PANE_OBJECT_STATE_JSON_TYPES = Object.freeze([
  'application/json',
  'text/json',
  'text/plain',
] as const)

export const SLIDE_EDIT_LAYER_PANE_OBJECT_STATE_JSON_WRAPPER_KEYS =
  Object.freeze([
    'objectState',
    'objectVisibility',
    'layerState',
    'selectionState',
  ] as const)

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

export type SlideEditLayerPaneDataTransfer = Pick<DataTransfer, 'getData'>

export type SlideEditLayerPaneRenameJSONPasteValue = {
  name: string
  nameField: string
  surface: 'object-layer-pane-rename'
}

export type SlideEditLayerPaneRenameJSONPasteInput = {
  dataTransfer: SlideEditLayerPaneDataTransfer | null
  jsonMimeTypes?: readonly string[]
}

export type SlideEditLayerPaneRenamePasteCommandEffectInput<
  TSlideId extends SlideEditLayerPaneSlideId = SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId = SlideEditLayerPaneGroupId,
> = {
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>
  objectId?: TObjectId | null
  pasteValue: SlideEditLayerPaneRenameJSONPasteValue
}

export type SlideEditLayerPaneObjectLayerPosition =
  | 'back'
  | 'backward'
  | 'forward'
  | 'front'

export type SlideEditLayerPaneObjectLayerJSONPasteValue =
  | {
    position: SlideEditLayerPaneObjectLayerPosition
    sourceField: string
    surface: 'object-layer-pane-order'
    type: 'position'
  }
  | {
    sourceField: string
    surface: 'object-layer-pane-order'
    toIndex: number
    type: 'to-index'
  }

export type SlideEditLayerPaneObjectLayerJSONPasteInput = {
  dataTransfer: SlideEditLayerPaneDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditLayerPaneObjectLayerPasteCommandEffectInput<
  TSlideId extends SlideEditLayerPaneSlideId = SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId = SlideEditLayerPaneGroupId,
> = {
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>
  objectId?: TObjectId | null
  pasteValue: SlideEditLayerPaneObjectLayerJSONPasteValue
}

export type SlideEditLayerPaneObjectStateVisibilityValue = {
  isHidden: boolean
  sourceField: string
}

export type SlideEditLayerPaneObjectStateLockValue = {
  isLocked: boolean
  sourceField: string
}

export type SlideEditLayerPaneObjectStateJSONPasteValue = {
  lock?: SlideEditLayerPaneObjectStateLockValue
  surface: 'object-layer-pane-state'
  visibility?: SlideEditLayerPaneObjectStateVisibilityValue
}

export type SlideEditLayerPaneObjectStateJSONPasteInput = {
  dataTransfer: SlideEditLayerPaneDataTransfer | null
  jsonMimeType?: string
}

export type SlideEditLayerPaneObjectStatePasteCommandEffectsInput<
  TSlideId extends SlideEditLayerPaneSlideId = SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId = SlideEditLayerPaneGroupId,
> = {
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>
  objectId?: TObjectId | null
  pasteValue: SlideEditLayerPaneObjectStateJSONPasteValue
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

export type SlideEditLayerPaneKeyboardKey =
  | 'ArrowDown'
  | 'ArrowLeft'
  | 'ArrowRight'
  | 'ArrowUp'
  | 'End'
  | 'F2'
  | 'Enter'
  | 'Home'
  | ' '

export type SlideEditLayerPaneKeyboardIntent<
  TObjectId extends SlideEditLayerPaneObjectId = SlideEditLayerPaneObjectId,
> =
  | {
    preventDefault: false
    type: 'none'
  }
  | {
    objectId: TObjectId
    preventDefault: true
    type:
      | 'collapse-row'
      | 'expand-row'
      | 'focus-parent-row'
      | 'focus-row'
      | 'rename-row'
      | 'select-row'
  }
  | {
    objectId: TObjectId
    preventDefault: true
    toIndex: number
    type: 'reorder-row'
  }
  | {
    objectId: TObjectId
    preventDefault: true
    rangeAnchorObjectId: TObjectId
    type: 'range-select-row'
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
    .map(({ object, order }, _index, sorted) => {
      const parentObjectId = object.parentObjectId ?? null
      const siblingRows = sorted.filter(
        (candidate) => (candidate.object.parentObjectId ?? null) === parentObjectId,
      )
      const ariaLevel = getSlideEditLayerPaneAriaLevel(sorted, object)

      return {
        ariaLevel,
        ariaExpanded: object.isGroup === true
          ? object.isExpanded !== false
          : undefined,
        ariaPosInSet: siblingRows.findIndex(
          (candidate) => candidate.object.objectId === object.objectId,
        ) + 1,
        ariaSetSize: siblingRows.length,
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
        parentObjectId,
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

export function getSlideEditLayerPaneResolvedFocusObjectId<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  {
    defaultObjectId = null,
    preferredObjectId = descriptor.activeObjectId,
  }: {
    defaultObjectId?: TObjectId | null
    preferredObjectId?: TObjectId | null
  } = {},
): TObjectId | null {
  if (
    preferredObjectId !== null &&
    findSlideEditLayerPaneRow(descriptor, preferredObjectId)
  ) {
    return preferredObjectId
  }

  if (
    defaultObjectId !== null &&
    findSlideEditLayerPaneRow(descriptor, defaultObjectId)
  ) {
    return defaultObjectId
  }

  const selectedRow = descriptor.rows.find((row) => row.isSelected)

  return selectedRow?.objectId ?? descriptor.rows[0]?.objectId ?? null
}

export function getSlideEditLayerPaneKeyboardIntent<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  {
    altKey = false,
    currentObjectId,
    key,
    rangeAnchorObjectId = null,
    shiftKey = false,
  }: {
    altKey?: boolean
    currentObjectId: TObjectId
    key: string
    rangeAnchorObjectId?: TObjectId | null
    shiftKey?: boolean
  },
): SlideEditLayerPaneKeyboardIntent<TObjectId> {
  const rows = descriptor.rows.filter((row) => row.isSelectable)
  const currentIndex = rows.findIndex((row) => row.objectId === currentObjectId)

  if (rows.length === 0 || currentIndex < 0) {
    return { preventDefault: false, type: 'none' }
  }

  if (!altKey && !shiftKey && key === 'F2') {
    return rows[currentIndex].isRenamable
      ? toSlideEditLayerPaneKeyboardIntent(rows[currentIndex], 'rename-row')
      : { preventDefault: false, type: 'none' }
  }

  if (altKey && key === 'ArrowUp') {
    return getSlideEditLayerPaneKeyboardReorderIntent(
      descriptor,
      currentObjectId,
      'up',
    )
  }

  if (altKey && key === 'ArrowDown') {
    return getSlideEditLayerPaneKeyboardReorderIntent(
      descriptor,
      currentObjectId,
      'down',
    )
  }

  if (shiftKey && key === 'ArrowDown') {
    return toSlideEditLayerPaneRangeKeyboardIntent(
      rows[Math.min(currentIndex + 1, rows.length - 1)],
      rangeAnchorObjectId ?? currentObjectId,
    )
  }

  if (shiftKey && key === 'ArrowUp') {
    return toSlideEditLayerPaneRangeKeyboardIntent(
      rows[Math.max(currentIndex - 1, 0)],
      rangeAnchorObjectId ?? currentObjectId,
    )
  }

  if (shiftKey && key === 'Home') {
    return toSlideEditLayerPaneRangeKeyboardIntent(
      rows[0],
      rangeAnchorObjectId ?? currentObjectId,
    )
  }

  if (shiftKey && key === 'End') {
    return toSlideEditLayerPaneRangeKeyboardIntent(
      rows.at(-1),
      rangeAnchorObjectId ?? currentObjectId,
    )
  }

  if (key === 'ArrowDown') {
    return toSlideEditLayerPaneKeyboardIntent(
      rows[Math.min(currentIndex + 1, rows.length - 1)],
      'focus-row',
    )
  }

  if (key === 'ArrowUp') {
    return toSlideEditLayerPaneKeyboardIntent(
      rows[Math.max(currentIndex - 1, 0)],
      'focus-row',
    )
  }

  if (key === 'Home') {
    return toSlideEditLayerPaneKeyboardIntent(rows[0], 'focus-row')
  }

  if (key === 'End') {
    return toSlideEditLayerPaneKeyboardIntent(rows.at(-1), 'focus-row')
  }

  if (key === 'Enter' || key === ' ') {
    return toSlideEditLayerPaneKeyboardIntent(rows[currentIndex], 'select-row')
  }

  if (key === 'ArrowRight') {
    return getSlideEditLayerPaneArrowRightIntent(descriptor, rows[currentIndex])
  }

  if (key === 'ArrowLeft') {
    return getSlideEditLayerPaneArrowLeftIntent(descriptor, rows[currentIndex])
  }

  return { preventDefault: false, type: 'none' }
}

function toSlideEditLayerPaneRangeKeyboardIntent<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  row: SlideEditLayerPaneRowDescriptor<TSlideId, TObjectId, TGroupId> | undefined,
  rangeAnchorObjectId: TObjectId,
): SlideEditLayerPaneKeyboardIntent<TObjectId> {
  if (!row) {
    return { preventDefault: false, type: 'none' }
  }

  return {
    objectId: row.objectId,
    preventDefault: true,
    rangeAnchorObjectId,
    type: 'range-select-row',
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

export function getSlideEditLayerPaneRenameJSONPasteValue({
  dataTransfer,
  jsonMimeTypes = SLIDE_EDIT_LAYER_PANE_RENAME_JSON_MIME_TYPES,
}: SlideEditLayerPaneRenameJSONPasteInput):
  SlideEditLayerPaneRenameJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  for (const type of jsonMimeTypes) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const value = parseSlideEditLayerPaneRenameJSON(text)
    const directPasteValue =
      getSlideEditLayerPaneRenameDirectJSONPasteValue(value)

    if (directPasteValue !== null) {
      return directPasteValue
    }

    const wrappedPasteValue =
      getSlideEditLayerPaneRenameWrappedJSONPasteValue(value)

    if (wrappedPasteValue !== null) {
      return wrappedPasteValue
    }
  }

  for (const type of SLIDE_EDIT_LAYER_PANE_RENAME_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const value = parseSlideEditLayerPaneRenameJSON(text)
    const pasteValue = getSlideEditLayerPaneRenameWrappedJSONPasteValue(value)

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditLayerPaneRenamePasteCommandEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>({
  descriptor,
  objectId = getSlideEditLayerPaneRenamePasteTargetObjectId(descriptor),
  pasteValue,
}: SlideEditLayerPaneRenamePasteCommandEffectInput<
  TSlideId,
  TObjectId,
  TGroupId
>): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  if (objectId === null) {
    return null
  }

  return getSlideEditLayerPaneCommandEffect(descriptor, {
    name: pasteValue.name,
    objectId,
    type: 'rename-submit',
  })
}

export function getSlideEditLayerPaneObjectLayerJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_LAYER_PANE_OBJECT_LAYER_JSON_MIME_TYPE,
}: SlideEditLayerPaneObjectLayerJSONPasteInput):
  SlideEditLayerPaneObjectLayerJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customValue = parseSlideEditLayerPaneJSON(customText)
      const customPasteValue =
        getSlideEditLayerPaneObjectLayerAnyJSONPasteValue(customValue)

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_LAYER_PANE_OBJECT_LAYER_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const value = parseSlideEditLayerPaneJSON(text)
    const pasteValue =
      getSlideEditLayerPaneObjectLayerAnyJSONPasteValue(value)

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditLayerPaneObjectLayerPasteCommandEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>({
  descriptor,
  objectId = getSlideEditLayerPaneSinglePasteTargetObjectId(descriptor),
  pasteValue,
}: SlideEditLayerPaneObjectLayerPasteCommandEffectInput<
  TSlideId,
  TObjectId,
  TGroupId
>): SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId> | null {
  if (objectId === null) {
    return null
  }

  const row = findSlideEditLayerPaneRow(descriptor, objectId)
  const fromIndex = descriptor.rows.findIndex(
    (candidate) => candidate.objectId === objectId,
  )

  if (!row?.isReorderable || row.isLocked || fromIndex < 0) {
    return null
  }

  const toIndex = getSlideEditLayerPaneObjectLayerToIndex(
    pasteValue,
    fromIndex,
    descriptor.rows.length,
  )

  if (toIndex === null) {
    return null
  }

  return getSlideEditLayerPaneCommandEffect(descriptor, {
    objectId,
    toIndex,
    type: 'row-drop',
  })
}

export function getSlideEditLayerPaneObjectStateJSONPasteValue({
  dataTransfer,
  jsonMimeType = SLIDE_EDIT_LAYER_PANE_OBJECT_STATE_JSON_MIME_TYPE,
}: SlideEditLayerPaneObjectStateJSONPasteInput):
  SlideEditLayerPaneObjectStateJSONPasteValue | null {
  if (!dataTransfer) {
    return null
  }

  if (jsonMimeType) {
    const customText = dataTransfer.getData(jsonMimeType)

    if (customText.trim()) {
      const customValue = parseSlideEditLayerPaneJSON(customText)
      const customPasteValue =
        getSlideEditLayerPaneObjectStateAnyJSONPasteValue(customValue)

      if (customPasteValue !== null) {
        return customPasteValue
      }
    }
  }

  for (const type of SLIDE_EDIT_LAYER_PANE_OBJECT_STATE_JSON_TYPES) {
    const text = dataTransfer.getData(type)

    if (!text.trim()) {
      continue
    }

    const value = parseSlideEditLayerPaneJSON(text)
    const pasteValue =
      getSlideEditLayerPaneObjectStateAnyJSONPasteValue(value)

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

export function getSlideEditLayerPaneObjectStatePasteCommandEffects<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>({
  descriptor,
  objectId = getSlideEditLayerPaneSinglePasteTargetObjectId(descriptor),
  pasteValue,
}: SlideEditLayerPaneObjectStatePasteCommandEffectsInput<
  TSlideId,
  TObjectId,
  TGroupId
>): readonly SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId>[] | null {
  if (objectId === null) {
    return null
  }

  const row = findSlideEditLayerPaneRow(descriptor, objectId)

  if (!row) {
    return null
  }

  const effects: SlideEditLayerPaneHostCommandEffect<TSlideId, TObjectId>[] = []
  const currentHidden = row.isHidden
  let currentLocked = row.isLocked

  if (pasteValue.lock?.isLocked === false && currentLocked) {
    effects.push(getSlideEditLayerPaneObjectStateCommandEffect({
      commandId: 'unlock-objects',
      descriptor,
      objectId,
    }))
    currentLocked = false
  }

  if (
    pasteValue.visibility &&
    pasteValue.visibility.isHidden !== currentHidden
  ) {
    effects.push(getSlideEditLayerPaneObjectStateCommandEffect({
      commandId: pasteValue.visibility.isHidden
        ? 'hide-objects'
        : 'show-objects',
      descriptor,
      objectId,
    }))
  }

  if (pasteValue.lock?.isLocked === true && !currentLocked) {
    effects.push(getSlideEditLayerPaneObjectStateCommandEffect({
      commandId: 'lock-objects',
      descriptor,
      objectId,
    }))
  }

  return effects.length > 0 ? effects : null
}

function getSlideEditLayerPaneRenameDirectJSONPasteValue(
  value: unknown,
  wrapper?: string,
): SlideEditLayerPaneRenameJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  if (!Object.hasOwn(record, 'name')) {
    return null
  }

  return getSlideEditLayerPaneRenameStringJSONPasteValue(
    record.name,
    wrapper ? `${wrapper}.name` : 'name',
  )
}

function getSlideEditLayerPaneRenameWrappedJSONPasteValue(
  value: unknown,
): SlideEditLayerPaneRenameJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_LAYER_PANE_RENAME_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const wrapperValue = record[key]
    const stringPasteValue = getSlideEditLayerPaneRenameStringJSONPasteValue(
      wrapperValue,
      key,
    )

    if (stringPasteValue !== null) {
      return stringPasteValue
    }

    const directPasteValue = getSlideEditLayerPaneRenameDirectJSONPasteValue(
      wrapperValue,
      key,
    )

    if (directPasteValue !== null) {
      return directPasteValue
    }
  }

  return null
}

function getSlideEditLayerPaneRenameStringJSONPasteValue(
  value: unknown,
  nameField: string,
): SlideEditLayerPaneRenameJSONPasteValue | null {
  if (typeof value !== 'string') {
    return null
  }

  const name = value.trim()

  if (!name) {
    return null
  }

  return {
    name,
    nameField,
    surface: 'object-layer-pane-rename',
  }
}

function getSlideEditLayerPaneRenamePasteTargetObjectId<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
): TObjectId | null {
  return getSlideEditLayerPaneSinglePasteTargetObjectId(descriptor)
}

function getSlideEditLayerPaneSinglePasteTargetObjectId<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
): TObjectId | null {
  if (
    descriptor.activeObjectId !== null &&
    findSlideEditLayerPaneRow(descriptor, descriptor.activeObjectId)
  ) {
    return descriptor.activeObjectId
  }

  if (descriptor.selectedObjectIds.length === 1) {
    const selectedObjectId = descriptor.selectedObjectIds[0]!

    return findSlideEditLayerPaneRow(descriptor, selectedObjectId)
      ? selectedObjectId
      : null
  }

  return null
}

function getSlideEditLayerPaneObjectLayerAnyJSONPasteValue(
  value: unknown,
): SlideEditLayerPaneObjectLayerJSONPasteValue | null {
  return getSlideEditLayerPaneObjectLayerDirectJSONPasteValue(value) ??
    getSlideEditLayerPaneObjectLayerWrappedJSONPasteValue(value)
}

function getSlideEditLayerPaneObjectLayerDirectJSONPasteValue(
  value: unknown,
  wrapper?: string,
): SlideEditLayerPaneObjectLayerJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const toIndex = getSlideEditLayerPaneObjectLayerToIndexValue(
    record.toIndex,
  )

  if (toIndex !== null) {
    return {
      sourceField: wrapper ? `${wrapper}.toIndex` : 'toIndex',
      surface: 'object-layer-pane-order',
      toIndex,
      type: 'to-index',
    }
  }

  const position = getSlideEditLayerPaneObjectLayerPositionValue(
    record.position,
  )

  if (position !== null) {
    return {
      position,
      sourceField: wrapper ? `${wrapper}.position` : 'position',
      surface: 'object-layer-pane-order',
      type: 'position',
    }
  }

  return null
}

function getSlideEditLayerPaneObjectLayerWrappedJSONPasteValue(
  value: unknown,
): SlideEditLayerPaneObjectLayerJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_LAYER_PANE_OBJECT_LAYER_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditLayerPaneObjectLayerDirectJSONPasteValue(
      record[key],
      key,
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditLayerPaneObjectLayerToIndexValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value)
    : null
}

function getSlideEditLayerPaneObjectLayerPositionValue(
  value: unknown,
): SlideEditLayerPaneObjectLayerPosition | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()

  switch (normalized) {
    case 'bring-to-front':
    case 'front':
    case 'to-front':
      return 'front'
    case 'back':
    case 'send-to-back':
    case 'to-back':
      return 'back'
    case 'bring-forward':
    case 'forward':
      return 'forward'
    case 'backward':
    case 'send-backward':
      return 'backward'
    default:
      return null
  }
}

function getSlideEditLayerPaneObjectLayerToIndex(
  pasteValue: SlideEditLayerPaneObjectLayerJSONPasteValue,
  fromIndex: number,
  rowCount: number,
) {
  if (pasteValue.type === 'to-index') {
    return pasteValue.toIndex
  }

  switch (pasteValue.position) {
    case 'front':
      return rowCount
    case 'back':
      return 0
    case 'forward':
      return fromIndex + 2
    case 'backward':
      return fromIndex - 1
  }
}

function getSlideEditLayerPaneObjectStateCommandEffect<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>({
  commandId,
  descriptor,
  objectId,
}: {
  commandId: Extract<
    SlideEditLayerPaneCommandId,
    'hide-objects' | 'lock-objects' | 'show-objects' | 'unlock-objects'
  >
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>
  objectId: TObjectId
}) {
  return toSlideEditLayerPaneHostCommandEffect({
    descriptor,
    payload: {
      id: commandId,
      objectIds: [objectId],
    },
    selectionObjectIds: [objectId],
  })
}

function getSlideEditLayerPaneObjectStateAnyJSONPasteValue(
  value: unknown,
): SlideEditLayerPaneObjectStateJSONPasteValue | null {
  return getSlideEditLayerPaneObjectStateDirectJSONPasteValue(value) ??
    getSlideEditLayerPaneObjectStateWrappedJSONPasteValue(value)
}

function getSlideEditLayerPaneObjectStateDirectJSONPasteValue(
  value: unknown,
  wrapper?: string,
): SlideEditLayerPaneObjectStateJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>
  const visibility = getSlideEditLayerPaneObjectStateVisibilityValue(
    record,
    wrapper,
  )
  const lock = getSlideEditLayerPaneObjectStateLockValue(record, wrapper)

  if (!visibility && !lock) {
    return null
  }

  return {
    ...(lock ? { lock } : {}),
    surface: 'object-layer-pane-state',
    ...(visibility ? { visibility } : {}),
  }
}

function getSlideEditLayerPaneObjectStateWrappedJSONPasteValue(
  value: unknown,
): SlideEditLayerPaneObjectStateJSONPasteValue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const record = value as Record<string, unknown>

  for (const key of SLIDE_EDIT_LAYER_PANE_OBJECT_STATE_JSON_WRAPPER_KEYS) {
    if (!Object.hasOwn(record, key)) {
      continue
    }

    const pasteValue = getSlideEditLayerPaneObjectStateDirectJSONPasteValue(
      record[key],
      key,
    )

    if (pasteValue !== null) {
      return pasteValue
    }
  }

  return null
}

function getSlideEditLayerPaneObjectStateVisibilityValue(
  record: Record<string, unknown>,
  wrapper?: string,
): SlideEditLayerPaneObjectStateVisibilityValue | null {
  if (typeof record.visible === 'boolean') {
    return {
      isHidden: !record.visible,
      sourceField: wrapper ? `${wrapper}.visible` : 'visible',
    }
  }

  if (typeof record.hidden === 'boolean') {
    return {
      isHidden: record.hidden,
      sourceField: wrapper ? `${wrapper}.hidden` : 'hidden',
    }
  }

  return null
}

function getSlideEditLayerPaneObjectStateLockValue(
  record: Record<string, unknown>,
  wrapper?: string,
): SlideEditLayerPaneObjectStateLockValue | null {
  if (typeof record.locked !== 'boolean') {
    return null
  }

  return {
    isLocked: record.locked,
    sourceField: wrapper ? `${wrapper}.locked` : 'locked',
  }
}

function parseSlideEditLayerPaneRenameJSON(value: string) {
  return parseSlideEditLayerPaneJSON(value)
}

function parseSlideEditLayerPaneJSON(value: string) {
  if (!value.trim()) {
    return null
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return null
  }
}

function getSlideEditLayerPaneKeyboardReorderIntent<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  currentObjectId: TObjectId,
  direction: 'down' | 'up',
): SlideEditLayerPaneKeyboardIntent<TObjectId> {
  const currentIndex = descriptor.rows.findIndex(
    (row) => row.objectId === currentObjectId,
  )
  const currentRow = descriptor.rows[currentIndex]

  if (!currentRow?.isSelectable || !currentRow.isReorderable) {
    return { preventDefault: false, type: 'none' }
  }

  const targetEntries = direction === 'up'
    ? descriptor.rows
        .slice(0, currentIndex)
        .map((row, index) => ({ index, row }))
        .reverse()
    : descriptor.rows
        .slice(currentIndex + 1)
        .map((row, offset) => ({ index: currentIndex + 1 + offset, row }))
  const target = targetEntries.find(({ row }) =>
    row.isSelectable &&
      row.isReorderable &&
      !isSlideEditLayerPaneDescendantRow(descriptor, row, currentObjectId))

  if (!target) {
    return { preventDefault: false, type: 'none' }
  }

  const toIndex = normalizeSlideEditLayerPaneIndex(
    direction === 'up' ? target.index : target.index + 1,
    descriptor.rows.length,
  )
  const insertionIndex = getSlideEditLayerPaneInsertionIndex(
    currentIndex,
    toIndex,
  )

  if (insertionIndex === currentIndex) {
    return { preventDefault: false, type: 'none' }
  }

  return {
    objectId: currentObjectId,
    preventDefault: true,
    toIndex,
    type: 'reorder-row',
  }
}

export function getSlideEditLayerPaneDropIndicator<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  {
    draggedObjectId,
    pointerOffsetY,
    rowHeight,
    targetObjectId,
  }: {
    draggedObjectId: TObjectId
    pointerOffsetY: number
    rowHeight: number
    targetObjectId: TObjectId
  },
): SlideEditLayerPaneDropIndicator<TObjectId> {
  const draggedIndex = descriptor.rows.findIndex(
    (row) => row.objectId === draggedObjectId,
  )
  const targetIndex = descriptor.rows.findIndex(
    (row) => row.objectId === targetObjectId,
  )
  const draggedRow = descriptor.rows[draggedIndex]
  const targetRow = descriptor.rows[targetIndex]

  if (
    draggedIndex < 0 ||
    targetIndex < 0 ||
    draggedObjectId === targetObjectId ||
    !draggedRow?.isReorderable ||
    !targetRow?.isReorderable ||
    isSlideEditLayerPaneDescendantRow(descriptor, targetRow, draggedObjectId) ||
    rowHeight <= 0
  ) {
    return toSlideEditLayerPaneEmptyDropIndicator(draggedObjectId)
  }

  const placement: Exclude<SlideEditLayerPaneDropPlacement, 'none'> =
    pointerOffsetY < rowHeight / 2 ? 'before' : 'after'
  const toIndex = normalizeSlideEditLayerPaneIndex(
    placement === 'before' ? targetIndex : targetIndex + 1,
    descriptor.rows.length,
  )
  const insertionIndex = getSlideEditLayerPaneInsertionIndex(
    draggedIndex,
    toIndex,
  )

  if (insertionIndex === draggedIndex) {
    return toSlideEditLayerPaneEmptyDropIndicator(draggedObjectId)
  }

  return {
    draggedObjectId,
    indicator: placement,
    placement,
    targetObjectId,
    toIndex,
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
  const insertionIndex = getSlideEditLayerPaneInsertionIndex(
    fromIndex,
    toIndex,
  )

  if (!row?.isReorderable || fromIndex < 0 || insertionIndex === fromIndex) {
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

function getSlideEditLayerPaneArrowRightIntent<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  row:
    | SlideEditLayerPaneRowDescriptor<TSlideId, TObjectId, TGroupId>
    | undefined,
): SlideEditLayerPaneKeyboardIntent<TObjectId> {
  if (!row?.isGroup) {
    return { preventDefault: false, type: 'none' }
  }

  if (row.ariaExpanded === false) {
    return {
      objectId: row.objectId,
      preventDefault: true,
      type: 'expand-row',
    }
  }

  const child = descriptor.rows.find(
    (candidate) =>
      candidate.parentObjectId === row.objectId && candidate.isSelectable,
  )

  return toSlideEditLayerPaneKeyboardIntent(child, 'focus-row')
}

function getSlideEditLayerPaneArrowLeftIntent<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  row:
    | SlideEditLayerPaneRowDescriptor<TSlideId, TObjectId, TGroupId>
    | undefined,
): SlideEditLayerPaneKeyboardIntent<TObjectId> {
  if (!row) {
    return { preventDefault: false, type: 'none' }
  }

  if (row.isGroup && row.ariaExpanded === true) {
    return {
      objectId: row.objectId,
      preventDefault: true,
      type: 'collapse-row',
    }
  }

  if (row.parentObjectId) {
    const parent = findSlideEditLayerPaneRow(descriptor, row.parentObjectId)

    return toSlideEditLayerPaneKeyboardIntent(parent, 'focus-parent-row')
  }

  return { preventDefault: false, type: 'none' }
}

function toSlideEditLayerPaneKeyboardIntent<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  row:
    | SlideEditLayerPaneRowDescriptor<TSlideId, TObjectId, TGroupId>
    | undefined
    | null,
  type: Extract<
    SlideEditLayerPaneKeyboardIntent<TObjectId>['type'],
    'focus-parent-row' | 'focus-row' | 'rename-row' | 'select-row'
  >,
): SlideEditLayerPaneKeyboardIntent<TObjectId> {
  if (!row?.isSelectable) {
    return { preventDefault: false, type: 'none' }
  }

  return {
    objectId: row.objectId,
    preventDefault: true,
    type,
  }
}

function getSlideEditLayerPaneAriaLevel<
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  sorted: readonly {
    object: SlideEditLayerPaneObjectInput<TObjectId, TGroupId>
    order: number
  }[],
  object: SlideEditLayerPaneObjectInput<TObjectId, TGroupId>,
) {
  let level = 1
  let parentObjectId = object.parentObjectId ?? null
  const visited = new Set<TObjectId>()

  while (parentObjectId) {
    if (visited.has(parentObjectId)) {
      break
    }

    visited.add(parentObjectId)
    level += 1

    const parent = sorted.find(
      (candidate) => candidate.object.objectId === parentObjectId,
    )

    if (!parent) {
      break
    }

    parentObjectId = parent.object.parentObjectId ?? null
  }

  return level
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

function isSlideEditLayerPaneDescendantRow<
  TSlideId extends SlideEditLayerPaneSlideId,
  TObjectId extends SlideEditLayerPaneObjectId,
  TGroupId extends SlideEditLayerPaneGroupId,
>(
  descriptor: SlideEditLayerPaneDescriptor<TSlideId, TObjectId, TGroupId>,
  row: SlideEditLayerPaneRowDescriptor<TSlideId, TObjectId, TGroupId>,
  ancestorObjectId: TObjectId,
) {
  let parentObjectId = row.parentObjectId ?? null
  const visited = new Set<TObjectId>()

  while (parentObjectId) {
    if (parentObjectId === ancestorObjectId) {
      return true
    }

    if (visited.has(parentObjectId)) {
      return false
    }

    visited.add(parentObjectId)
    parentObjectId = findSlideEditLayerPaneRow(
      descriptor,
      parentObjectId,
    )?.parentObjectId ?? null
  }

  return false
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
  const rangeObjectIds = getCanvasSelectionListRangeIds({
    anchorId: anchorObjectId,
    ids: descriptor.rows.map((row) => row.objectId),
    targetId: objectId,
  })

  return descriptor.rows
    .filter((row) => rangeObjectIds.includes(row.objectId))
    .filter((row) => row.isSelectable)
    .map((row) => row.objectId)
}

function normalizeSlideEditLayerPaneIndex(index: number, length: number) {
  return Math.max(0, Math.min(index, Math.max(0, length)))
}

function getSlideEditLayerPaneInsertionIndex(fromIndex: number, toIndex: number) {
  return fromIndex < toIndex ? Math.max(0, toIndex - 1) : toIndex
}

function toSlideEditLayerPaneEmptyDropIndicator<
  TObjectId extends SlideEditLayerPaneObjectId,
>(draggedObjectId: TObjectId): SlideEditLayerPaneDropIndicator<TObjectId> {
  return {
    draggedObjectId,
    indicator: '',
    placement: 'none',
    targetObjectId: null,
    toIndex: null,
  }
}
