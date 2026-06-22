import type { Bounds } from '@interactive-os/canvas/core'

export type SlideEditVisibilitySlideId = string
export type SlideEditVisibilityObjectId = string
export type SlideEditPlaceholderId = string

export type SlideEditPlaceholderRole =
  | 'body'
  | 'chart'
  | 'custom'
  | 'date'
  | 'footer'
  | 'media'
  | 'slide-number'
  | 'table'
  | 'title'

export type SlideEditPlaceholderDescriptor<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  bounds: Bounds
  isLocked: boolean
  isVisible: boolean
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  slideId: TSlideId
  title: string
}

export type SlideEditObjectSelectionPolicy =
  | 'allow-hidden-selection'
  | 'visible-only'

export type SlideEditObjectVisibilityDescriptor<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  isHidden: boolean
  isLocked: boolean
  isSelectable: boolean
  objectId: TObjectId
  placeholderId?: TPlaceholderId | null
  slideId: TSlideId
}

export type SlideEditObjectVisibilityState = {
  isHidden: boolean
  isLocked: boolean
  isSelectable: boolean
  isVisible: boolean
  selectionBlockReason?: 'hidden' | 'locked'
}

export type SlideEditObjectVisibilityCommandId =
  | 'hide-objects'
  | 'show-objects'

export type SlideEditObjectVisibilityCommandAvailability<
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
> = {
  commandId: SlideEditObjectVisibilityCommandId
  isAvailable: boolean
  targetObjectIds: readonly TObjectId[]
  unavailableReason?:
    | 'already-hidden'
    | 'already-visible'
    | 'empty-selection'
    | 'locked-selection'
}

export type SlideEditObjectVisibilityCommand<
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
> = {
  id: SlideEditObjectVisibilityCommandId
  objectIds: readonly TObjectId[]
}

export type SlideEditObjectVisibilityHostCommandEffect<
  TSlideId extends SlideEditVisibilitySlideId = SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId = SlideEditVisibilityObjectId,
> = {
  payload: SlideEditObjectVisibilityCommand<TObjectId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export function createSlideEditPlaceholderDescriptor<
  TSlideId extends SlideEditVisibilitySlideId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  bounds,
  isLocked = false,
  isVisible = true,
  placeholderId,
  role,
  slideId,
  title,
}: {
  bounds: Bounds
  isLocked?: boolean
  isVisible?: boolean
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  slideId: TSlideId
  title: string
}): SlideEditPlaceholderDescriptor<TSlideId, TPlaceholderId> {
  return {
    bounds,
    isLocked,
    isVisible,
    placeholderId,
    role,
    slideId,
    title,
  }
}

export function getSlideEditObjectVisibilityState({
  isHidden,
  isLocked,
  selectionPolicy = 'visible-only',
}: {
  isHidden: boolean
  isLocked: boolean
  selectionPolicy?: SlideEditObjectSelectionPolicy
}): SlideEditObjectVisibilityState {
  const isSelectable = !isLocked &&
    (!isHidden || selectionPolicy === 'allow-hidden-selection')

  return {
    isHidden,
    isLocked,
    isSelectable,
    isVisible: !isHidden,
    selectionBlockReason: getSlideEditObjectSelectionBlockReason({
      isHidden,
      isLocked,
      selectionPolicy,
    }),
  }
}

export function getSlideEditObjectVisibilityCommandAvailability<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  commandId,
  objects,
  selectedObjectIds,
}: {
  commandId: SlideEditObjectVisibilityCommandId
  objects: readonly SlideEditObjectVisibilityDescriptor<
    TSlideId,
    TObjectId,
    TPlaceholderId
  >[]
  selectedObjectIds: readonly TObjectId[]
}): SlideEditObjectVisibilityCommandAvailability<TObjectId> {
  const selectedObjects = getSlideEditSelectedVisibilityObjects({
    objects,
    selectedObjectIds,
  })

  if (selectedObjects.length === 0) {
    return {
      commandId,
      isAvailable: false,
      targetObjectIds: [],
      unavailableReason: 'empty-selection',
    }
  }

  const unlockedObjects = selectedObjects.filter((object) => !object.isLocked)

  if (unlockedObjects.length === 0) {
    return {
      commandId,
      isAvailable: false,
      targetObjectIds: [],
      unavailableReason: 'locked-selection',
    }
  }

  const targetObjects = unlockedObjects.filter((object) => (
    commandId === 'hide-objects' ? !object.isHidden : object.isHidden
  ))

  if (targetObjects.length === 0) {
    return {
      commandId,
      isAvailable: false,
      targetObjectIds: [],
      unavailableReason: commandId === 'hide-objects'
        ? 'already-hidden'
        : 'already-visible',
    }
  }

  return {
    commandId,
    isAvailable: true,
    targetObjectIds: targetObjects.map((object) => object.objectId),
  }
}

export function getSlideEditObjectVisibilityCommandEffect<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  commandId,
  objects,
  selectedObjectIds,
  slideId,
}: {
  commandId: SlideEditObjectVisibilityCommandId
  objects: readonly SlideEditObjectVisibilityDescriptor<
    TSlideId,
    TObjectId,
    TPlaceholderId
  >[]
  selectedObjectIds: readonly TObjectId[]
  slideId: TSlideId
}): SlideEditObjectVisibilityHostCommandEffect<TSlideId, TObjectId> | null {
  const availability = getSlideEditObjectVisibilityCommandAvailability({
    commandId,
    objects,
    selectedObjectIds,
  })

  if (!availability.isAvailable) {
    return null
  }

  return {
    payload: {
      id: commandId,
      objectIds: availability.targetObjectIds,
    },
    selection: {
      objectIds: selectedObjectIds,
      slideId,
    },
    type: 'slide-command-effect',
  }
}

function getSlideEditObjectSelectionBlockReason({
  isHidden,
  isLocked,
  selectionPolicy,
}: {
  isHidden: boolean
  isLocked: boolean
  selectionPolicy: SlideEditObjectSelectionPolicy
}): SlideEditObjectVisibilityState['selectionBlockReason'] {
  if (isLocked) {
    return 'locked'
  }

  if (isHidden && selectionPolicy === 'visible-only') {
    return 'hidden'
  }

  return undefined
}

function getSlideEditSelectedVisibilityObjects<
  TSlideId extends SlideEditVisibilitySlideId,
  TObjectId extends SlideEditVisibilityObjectId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  objects,
  selectedObjectIds,
}: {
  objects: readonly SlideEditObjectVisibilityDescriptor<
    TSlideId,
    TObjectId,
    TPlaceholderId
  >[]
  selectedObjectIds: readonly TObjectId[]
}) {
  const selected = new Set(selectedObjectIds)

  return objects.filter((object) => selected.has(object.objectId))
}
