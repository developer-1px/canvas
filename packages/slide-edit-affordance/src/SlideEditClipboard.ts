import type { Bounds, Point } from '../../../src/canvas/core'

export type SlideEditClipboardSlideId = string
export type SlideEditClipboardObjectId = string
export type SlideEditClipboardGroupId = string
export type SlideEditClipboardPlaceholderId = string

export type SlideEditClipboardOperation = 'copy' | 'cut'

export type SlideEditClipboardObjectMetadata<
  TObjectId extends SlideEditClipboardObjectId = SlideEditClipboardObjectId,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
> = {
  groupId?: TGroupId | null
  objectId: TObjectId
  placeholderId?: TPlaceholderId | null
}

export type SlideEditClipboardPayload<
  TSlideId extends SlideEditClipboardSlideId = SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId = SlideEditClipboardObjectId,
  TObject = unknown,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
> = {
  metadata: readonly SlideEditClipboardObjectMetadata<
    TObjectId,
    TGroupId,
    TPlaceholderId
  >[]
  objects: readonly TObject[]
  operation: SlideEditClipboardOperation
  selectedObjectIds: readonly TObjectId[]
  sourceSlideId: TSlideId
  type: 'slide-object-clipboard'
}

export type SlideEditClipboardPasteTarget<
  TSlideId extends SlideEditClipboardSlideId = SlideEditClipboardSlideId,
> =
  | {
    kind: 'active-slide'
    slideId: TSlideId
  }
  | {
    kind: 'pointer-position'
    pointerPosition: Point
    slideId: TSlideId
  }
  | {
    kind: 'slide-frame-offset'
    offset: Point
    slideId: TSlideId
  }
  | {
    kind: 'viewport-center'
    slideId: TSlideId
    viewportCenter: Point
  }

export type SlideEditClipboardRemapPolicy<
  TObjectId extends SlideEditClipboardObjectId = SlideEditClipboardObjectId,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
> = {
  createGroupId?: (sourceGroupId: TGroupId) => TGroupId | null
  createObjectId: (sourceObjectId: TObjectId, index: number) => TObjectId
  createPlaceholderId?: (
    sourcePlaceholderId: TPlaceholderId,
  ) => TPlaceholderId | null
}

export type SlideEditClipboardPasteObjectMapping<
  TObjectId extends SlideEditClipboardObjectId = SlideEditClipboardObjectId,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
> = {
  sourceGroupId?: TGroupId | null
  sourceObjectId: TObjectId
  sourcePlaceholderId?: TPlaceholderId | null
  targetGroupId?: TGroupId | null
  targetObjectId: TObjectId
  targetPlaceholderId?: TPlaceholderId | null
}

export type SlideEditClipboardPastePlan<
  TSlideId extends SlideEditClipboardSlideId = SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId = SlideEditClipboardObjectId,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
> = {
  anchor: Point
  mappings: readonly SlideEditClipboardPasteObjectMapping<
    TObjectId,
    TGroupId,
    TPlaceholderId
  >[]
  operation: SlideEditClipboardOperation
  sourceSlideId: TSlideId
  targetSlideId: TSlideId
}

export type SlideEditClipboardPasteCommand<
  TSlideId extends SlideEditClipboardSlideId = SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId = SlideEditClipboardObjectId,
  TObject = unknown,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
> = {
  id: 'paste-slide-objects'
  pastePlan: SlideEditClipboardPastePlan<
    TSlideId,
    TObjectId,
    TGroupId,
    TPlaceholderId
  >
  payload: SlideEditClipboardPayload<
    TSlideId,
    TObjectId,
    TObject,
    TGroupId,
    TPlaceholderId
  >
}

export type SlideEditClipboardPasteHostCommandEffect<
  TSlideId extends SlideEditClipboardSlideId = SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId = SlideEditClipboardObjectId,
  TObject = unknown,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
> = {
  payload: SlideEditClipboardPasteCommand<
    TSlideId,
    TObjectId,
    TObject,
    TGroupId,
    TPlaceholderId
  >
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export function createSlideEditClipboardPayload<
  TSlideId extends SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId,
  TObject,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
>({
  metadata = [],
  objects,
  operation = 'copy',
  selectedObjectIds,
  sourceSlideId,
}: {
  metadata?: readonly SlideEditClipboardObjectMetadata<
    TObjectId,
    TGroupId,
    TPlaceholderId
  >[]
  objects: readonly TObject[]
  operation?: SlideEditClipboardOperation
  selectedObjectIds: readonly TObjectId[]
  sourceSlideId: TSlideId
}): SlideEditClipboardPayload<TSlideId, TObjectId, TObject, TGroupId, TPlaceholderId> {
  return {
    metadata,
    objects,
    operation,
    selectedObjectIds,
    sourceSlideId,
    type: 'slide-object-clipboard',
  }
}

export function getSlideEditClipboardPasteAnchor<
  TSlideId extends SlideEditClipboardSlideId,
>({
  slideFrame,
  target,
}: {
  slideFrame: Bounds
  target: SlideEditClipboardPasteTarget<TSlideId>
}): Point {
  switch (target.kind) {
    case 'active-slide':
      return {
        x: slideFrame.x,
        y: slideFrame.y,
      }
    case 'pointer-position':
      return target.pointerPosition
    case 'slide-frame-offset':
      return {
        x: slideFrame.x + target.offset.x,
        y: slideFrame.y + target.offset.y,
      }
    case 'viewport-center':
      return target.viewportCenter
  }
}

export function createSlideEditClipboardPastePlan<
  TSlideId extends SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId,
  TObject,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
>({
  payload,
  remapPolicy,
  slideFrame,
  target,
}: {
  payload: SlideEditClipboardPayload<
    TSlideId,
    TObjectId,
    TObject,
    TGroupId,
    TPlaceholderId
  >
  remapPolicy: SlideEditClipboardRemapPolicy<TObjectId, TGroupId, TPlaceholderId>
  slideFrame: Bounds
  target: SlideEditClipboardPasteTarget<TSlideId>
}): SlideEditClipboardPastePlan<TSlideId, TObjectId, TGroupId, TPlaceholderId> | null {
  if (payload.selectedObjectIds.length === 0 || payload.objects.length === 0) {
    return null
  }

  return {
    anchor: getSlideEditClipboardPasteAnchor({ slideFrame, target }),
    mappings: getSlideEditClipboardPasteObjectMappings({
      metadata: payload.metadata,
      remapPolicy,
      selectedObjectIds: payload.selectedObjectIds,
    }),
    operation: payload.operation,
    sourceSlideId: payload.sourceSlideId,
    targetSlideId: target.slideId,
  }
}

export function createSlideEditClipboardPasteCommandEffect<
  TSlideId extends SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId,
  TObject,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
>({
  payload,
  remapPolicy,
  slideFrame,
  target,
}: {
  payload: SlideEditClipboardPayload<
    TSlideId,
    TObjectId,
    TObject,
    TGroupId,
    TPlaceholderId
  >
  remapPolicy: SlideEditClipboardRemapPolicy<TObjectId, TGroupId, TPlaceholderId>
  slideFrame: Bounds
  target: SlideEditClipboardPasteTarget<TSlideId>
}): SlideEditClipboardPasteHostCommandEffect<
  TSlideId,
  TObjectId,
  TObject,
  TGroupId,
  TPlaceholderId
> | null {
  const pastePlan = createSlideEditClipboardPastePlan({
    payload,
    remapPolicy,
    slideFrame,
    target,
  })

  if (!pastePlan) {
    return null
  }

  return {
    payload: {
      id: 'paste-slide-objects',
      pastePlan,
      payload,
    },
    selection: {
      objectIds: pastePlan.mappings.map((mapping) => mapping.targetObjectId),
      slideId: pastePlan.targetSlideId,
    },
    type: 'slide-command-effect',
  }
}

export function createSlideEditClipboardAdapterExample<
  TSlideId extends SlideEditClipboardSlideId,
  TObjectId extends SlideEditClipboardObjectId,
  TObject,
  TGroupId extends SlideEditClipboardGroupId = SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId =
    SlideEditClipboardPlaceholderId,
>({
  remapPolicy,
}: {
  remapPolicy: SlideEditClipboardRemapPolicy<TObjectId, TGroupId, TPlaceholderId>
}) {
  return {
    copySelection(input: Parameters<
      typeof createSlideEditClipboardPayload<
        TSlideId,
        TObjectId,
        TObject,
        TGroupId,
        TPlaceholderId
      >
    >[0]) {
      return createSlideEditClipboardPayload(input)
    },
    pasteIntoTarget(input: {
      payload: SlideEditClipboardPayload<
        TSlideId,
        TObjectId,
        TObject,
        TGroupId,
        TPlaceholderId
      >
      slideFrame: Bounds
      target: SlideEditClipboardPasteTarget<TSlideId>
    }) {
      return createSlideEditClipboardPasteCommandEffect({
        payload: input.payload,
        remapPolicy,
        slideFrame: input.slideFrame,
        target: input.target,
      })
    },
  }
}

function getSlideEditClipboardPasteObjectMappings<
  TObjectId extends SlideEditClipboardObjectId,
  TGroupId extends SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId,
>({
  metadata,
  remapPolicy,
  selectedObjectIds,
}: {
  metadata: readonly SlideEditClipboardObjectMetadata<
    TObjectId,
    TGroupId,
    TPlaceholderId
  >[]
  remapPolicy: SlideEditClipboardRemapPolicy<TObjectId, TGroupId, TPlaceholderId>
  selectedObjectIds: readonly TObjectId[]
}) {
  const metadataByObjectId = new Map(metadata.map((item) => [item.objectId, item]))
  const groupIdMap = new Map<TGroupId, TGroupId | null>()
  const placeholderIdMap = new Map<TPlaceholderId, TPlaceholderId | null>()

  return selectedObjectIds.map((sourceObjectId, index) => {
    const item = metadataByObjectId.get(sourceObjectId)

    return {
      sourceGroupId: item?.groupId ?? null,
      sourceObjectId,
      sourcePlaceholderId: item?.placeholderId ?? null,
      targetGroupId: remapSlideEditClipboardGroupId({
        groupIdMap,
        remapPolicy,
        sourceGroupId: item?.groupId ?? null,
      }),
      targetObjectId: remapPolicy.createObjectId(sourceObjectId, index),
      targetPlaceholderId: remapSlideEditClipboardPlaceholderId({
        placeholderIdMap,
        remapPolicy,
        sourcePlaceholderId: item?.placeholderId ?? null,
      }),
    }
  })
}

function remapSlideEditClipboardGroupId<
  TObjectId extends SlideEditClipboardObjectId,
  TGroupId extends SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId,
>({
  groupIdMap,
  remapPolicy,
  sourceGroupId,
}: {
  groupIdMap: Map<TGroupId, TGroupId | null>
  remapPolicy: SlideEditClipboardRemapPolicy<TObjectId, TGroupId, TPlaceholderId>
  sourceGroupId: TGroupId | null
}) {
  if (!sourceGroupId) {
    return null
  }

  if (!groupIdMap.has(sourceGroupId)) {
    groupIdMap.set(
      sourceGroupId,
      remapPolicy.createGroupId?.(sourceGroupId) ?? sourceGroupId,
    )
  }

  return groupIdMap.get(sourceGroupId) ?? null
}

function remapSlideEditClipboardPlaceholderId<
  TObjectId extends SlideEditClipboardObjectId,
  TGroupId extends SlideEditClipboardGroupId,
  TPlaceholderId extends SlideEditClipboardPlaceholderId,
>({
  placeholderIdMap,
  remapPolicy,
  sourcePlaceholderId,
}: {
  placeholderIdMap: Map<TPlaceholderId, TPlaceholderId | null>
  remapPolicy: SlideEditClipboardRemapPolicy<TObjectId, TGroupId, TPlaceholderId>
  sourcePlaceholderId: TPlaceholderId | null
}) {
  if (!sourcePlaceholderId) {
    return null
  }

  if (!placeholderIdMap.has(sourcePlaceholderId)) {
    placeholderIdMap.set(
      sourcePlaceholderId,
      remapPolicy.createPlaceholderId?.(sourcePlaceholderId) ?? null,
    )
  }

  return placeholderIdMap.get(sourcePlaceholderId) ?? null
}
