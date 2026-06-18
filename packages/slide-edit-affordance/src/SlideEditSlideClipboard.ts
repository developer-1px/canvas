export type SlideEditSlideClipboardSlideId = string
export type SlideEditSlideClipboardObjectId = string

export type SlideEditSlideClipboardOperation = 'copy' | 'cut'

export type SlideEditSlideClipboardSlideMetadata<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
> = {
  index: number
  objectCount: number
  slideId: TSlideId
  title?: string
}

export type SlideEditSlideClipboardDebugMetadata<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
> = {
  objectCount: number
  slideCount: number
  sourceSlideId: TSlideId
}

export type SlideEditSlideClipboardPayload<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
  TSlide = unknown,
> = {
  activeSlideId?: TSlideId | null
  debug: SlideEditSlideClipboardDebugMetadata<TSlideId>
  metadata: readonly SlideEditSlideClipboardSlideMetadata<TSlideId>[]
  operation: SlideEditSlideClipboardOperation
  selectedSlideIds: readonly TSlideId[]
  slides: readonly TSlide[]
  sourceSlideId: TSlideId
  type: 'slide-clipboard'
  version: 1
}

export type SlideEditSlideClipboardPasteTarget<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
> =
  | {
    activeSlideId: TSlideId | null
    kind: 'active-slide'
  }
  | {
    focusedSlideId: TSlideId | null
    kind: 'focused-rail-slide'
  }
  | {
    kind: 'after-slide'
    slideId: TSlideId | null
  }

export type SlideEditSlideClipboardPastePlacementReason =
  | 'after-target'
  | 'append'
  | 'empty-deck'

export type SlideEditSlideClipboardPastePlacement<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
> = {
  afterSlideId: TSlideId | null
  insertIndex: number
  reason: SlideEditSlideClipboardPastePlacementReason
}

export type SlideEditSlideClipboardObjectRemapInput<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId =
    SlideEditSlideClipboardObjectId,
  TSlide = unknown,
> = {
  objectIndex: number
  slideIndex: number
  sourceObjectId: TObjectId
  sourceSlide: TSlide
  sourceSlideId: TSlideId
  targetSlideId: TSlideId
}

export type SlideEditSlideClipboardRemapPolicy<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId =
    SlideEditSlideClipboardObjectId,
  TSlide = unknown,
> = {
  createObjectId?: (
    input: SlideEditSlideClipboardObjectRemapInput<
      TSlideId,
      TObjectId,
      TSlide
    >,
  ) => TObjectId
  createSlideId: (
    sourceSlideId: TSlideId,
    index: number,
    sourceSlide: TSlide,
  ) => TSlideId
  getObjectIds?: (
    sourceSlide: TSlide,
    index: number,
  ) => readonly TObjectId[]
}

export type SlideEditSlideClipboardPasteObjectMapping<
  TObjectId extends SlideEditSlideClipboardObjectId =
    SlideEditSlideClipboardObjectId,
> = {
  sourceObjectId: TObjectId
  targetObjectId: TObjectId
}

export type SlideEditSlideClipboardPasteSlideMapping<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId =
    SlideEditSlideClipboardObjectId,
> = {
  objectMappings: readonly SlideEditSlideClipboardPasteObjectMapping<TObjectId>[]
  sourceSlideId: TSlideId
  targetSlideId: TSlideId
}

export type SlideEditSlideClipboardPastePlan<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId =
    SlideEditSlideClipboardObjectId,
> = {
  afterSlideId: TSlideId | null
  insertIndex: number
  mappings: readonly SlideEditSlideClipboardPasteSlideMapping<
    TSlideId,
    TObjectId
  >[]
  operation: SlideEditSlideClipboardOperation
  sourceSlideId: TSlideId
  targetSlideIds: readonly TSlideId[]
}

export type SlideEditSlideClipboardPasteCommand<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId =
    SlideEditSlideClipboardObjectId,
  TSlide = unknown,
> = {
  id: 'paste-slides'
  pastePlan: SlideEditSlideClipboardPastePlan<TSlideId, TObjectId>
  payload: SlideEditSlideClipboardPayload<TSlideId, TSlide>
}

export type SlideEditSlideClipboardPasteHostCommandEffect<
  TSlideId extends SlideEditSlideClipboardSlideId =
    SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId =
    SlideEditSlideClipboardObjectId,
  TSlide = unknown,
> = {
  payload: SlideEditSlideClipboardPasteCommand<TSlideId, TObjectId, TSlide>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_SLIDE_CLIPBOARD_MIME_TYPE =
  'application/vnd.interactive-os.slide-edit.slides+json'
export const SLIDE_EDIT_SLIDE_CLIPBOARD_HTML_SCRIPT_ATTRIBUTE =
  'data-slide-edit-slide-clipboard-json'

export function createSlideEditSlideClipboardPayload<
  TSlideId extends SlideEditSlideClipboardSlideId,
  TSlide,
>({
  activeSlideId,
  getObjectCount = () => 0,
  getSlideId,
  getTitle,
  metadata,
  operation = 'copy',
  selectedSlideIds,
  slides,
  sourceSlideId,
}: {
  activeSlideId?: TSlideId | null
  getObjectCount?: (slide: TSlide, index: number) => number
  getSlideId: (slide: TSlide, index: number) => TSlideId
  getTitle?: (slide: TSlide, index: number) => string | null | undefined
  metadata?: readonly SlideEditSlideClipboardSlideMetadata<TSlideId>[]
  operation?: SlideEditSlideClipboardOperation
  selectedSlideIds?: readonly unknown[] | null
  slides: readonly TSlide[]
  sourceSlideId?: TSlideId | null
}): SlideEditSlideClipboardPayload<TSlideId, TSlide> | null {
  if (slides.length === 0) {
    return null
  }

  const slideIds = slides.map(getSlideId)
  const normalizedSelectedSlideIds =
    normalizeSlideEditSlideClipboardSelectedSlideIds({
      selectedSlideIds,
      slideIds,
    })
  const normalizedSourceSlideId = normalizeSlideEditSlideClipboardSourceSlideId({
    selectedSlideIds: normalizedSelectedSlideIds,
    slideIds,
    sourceSlideId,
  })
  const normalizedMetadata = metadata ?? slides.map((slide, index) => {
    const title = getTitle?.(slide, index)?.trim()

    return {
      index,
      objectCount: normalizeSlideEditSlideClipboardObjectCount(
        getObjectCount(slide, index),
      ),
      slideId: slideIds[index]!,
      ...(title ? { title } : {}),
    }
  })
  const objectCount = normalizedMetadata.reduce(
    (total, item) => total + normalizeSlideEditSlideClipboardObjectCount(
      item.objectCount,
    ),
    0,
  )

  return {
    activeSlideId: activeSlideId && slideIds.includes(activeSlideId)
      ? activeSlideId
      : null,
    debug: {
      objectCount,
      slideCount: slides.length,
      sourceSlideId: normalizedSourceSlideId,
    },
    metadata: normalizedMetadata,
    operation,
    selectedSlideIds: normalizedSelectedSlideIds,
    slides,
    sourceSlideId: normalizedSourceSlideId,
    type: 'slide-clipboard',
    version: 1,
  }
}

export function parseSlideEditSlideClipboardPayload(
  value: unknown,
): SlideEditSlideClipboardPayload<string, unknown> | null {
  if (!isRecord(value) || value.type !== 'slide-clipboard' || value.version !== 1) {
    return null
  }

  if (
    !Array.isArray(value.slides) ||
    !Array.isArray(value.selectedSlideIds) ||
    !Array.isArray(value.metadata) ||
    !isSlideEditSlideClipboardOperation(value.operation) ||
    typeof value.sourceSlideId !== 'string'
  ) {
    return null
  }

  const selectedSlideIds = value.selectedSlideIds.filter(
    (slideId): slideId is string => typeof slideId === 'string',
  )
  const metadata = value.metadata.flatMap((item) => {
    const parsed = parseSlideEditSlideClipboardMetadata(item)

    return parsed ? [parsed] : []
  })

  if (selectedSlideIds.length === 0 || metadata.length === 0) {
    return null
  }

  return {
    activeSlideId: typeof value.activeSlideId === 'string'
      ? value.activeSlideId
      : null,
    debug: parseSlideEditSlideClipboardDebug(value.debug, value.sourceSlideId),
    metadata,
    operation: value.operation,
    selectedSlideIds,
    slides: value.slides,
    sourceSlideId: value.sourceSlideId,
    type: 'slide-clipboard',
    version: 1,
  }
}

export function resolveSlideEditSlideClipboardPastePlacement<
  TSlideId extends SlideEditSlideClipboardSlideId,
>({
  slideOrder,
  target,
}: {
  slideOrder: readonly TSlideId[]
  target: SlideEditSlideClipboardPasteTarget<TSlideId>
}): SlideEditSlideClipboardPastePlacement<TSlideId> {
  if (slideOrder.length === 0) {
    return {
      afterSlideId: null,
      insertIndex: 0,
      reason: 'empty-deck',
    }
  }

  const targetSlideId = getSlideEditSlideClipboardTargetSlideId(target)
  const targetIndex = targetSlideId === null ? -1 : slideOrder.indexOf(targetSlideId)

  if (targetIndex >= 0) {
    return {
      afterSlideId: slideOrder[targetIndex]!,
      insertIndex: targetIndex + 1,
      reason: 'after-target',
    }
  }

  return {
    afterSlideId: slideOrder[slideOrder.length - 1]!,
    insertIndex: slideOrder.length,
    reason: 'append',
  }
}

export function createSlideEditSlideClipboardPastePlan<
  TSlideId extends SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId,
  TSlide,
>({
  payload,
  placement,
  remapPolicy,
}: {
  payload: SlideEditSlideClipboardPayload<TSlideId, TSlide>
  placement: SlideEditSlideClipboardPastePlacement<TSlideId>
  remapPolicy: SlideEditSlideClipboardRemapPolicy<TSlideId, TObjectId, TSlide>
}): SlideEditSlideClipboardPastePlan<TSlideId, TObjectId> | null {
  if (payload.slides.length === 0 || payload.selectedSlideIds.length === 0) {
    return null
  }

  const mappings = payload.slides.map((slide, index) => {
    const sourceSlideId = payload.metadata[index]?.slideId ??
      payload.selectedSlideIds[index] ??
      payload.sourceSlideId
    const targetSlideId = remapPolicy.createSlideId(sourceSlideId, index, slide)
    const objectMappings = (
      remapPolicy.getObjectIds?.(slide, index) ?? []
    ).map((sourceObjectId, objectIndex) => ({
      sourceObjectId,
      targetObjectId: remapPolicy.createObjectId?.({
        objectIndex,
        slideIndex: index,
        sourceObjectId,
        sourceSlide: slide,
        sourceSlideId,
        targetSlideId,
      }) ?? sourceObjectId,
    }))

    return {
      objectMappings,
      sourceSlideId,
      targetSlideId,
    }
  })

  return {
    afterSlideId: placement.afterSlideId,
    insertIndex: placement.insertIndex,
    mappings,
    operation: payload.operation,
    sourceSlideId: payload.sourceSlideId,
    targetSlideIds: mappings.map((mapping) => mapping.targetSlideId),
  }
}

export function createSlideEditSlideClipboardPasteCommandEffect<
  TSlideId extends SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId,
  TSlide,
>({
  payload,
  placement,
  remapPolicy,
}: {
  payload: SlideEditSlideClipboardPayload<TSlideId, TSlide>
  placement: SlideEditSlideClipboardPastePlacement<TSlideId>
  remapPolicy: SlideEditSlideClipboardRemapPolicy<TSlideId, TObjectId, TSlide>
}): SlideEditSlideClipboardPasteHostCommandEffect<
  TSlideId,
  TObjectId,
  TSlide
> | null {
  const pastePlan = createSlideEditSlideClipboardPastePlan({
    payload,
    placement,
    remapPolicy,
  })

  if (!pastePlan || pastePlan.targetSlideIds.length === 0) {
    return null
  }

  return {
    payload: {
      id: 'paste-slides',
      pastePlan,
      payload,
    },
    selection: {
      objectIds: [],
      slideId: pastePlan.targetSlideIds[0]!,
    },
    type: 'slide-command-effect',
  }
}

export function mapSlideEditSlideClipboardPasteSlides<
  TSlideId extends SlideEditSlideClipboardSlideId,
  TObjectId extends SlideEditSlideClipboardObjectId,
  TSlide,
  TResult,
>({
  pastePlan,
  payload,
  transform,
}: {
  pastePlan: SlideEditSlideClipboardPastePlan<TSlideId, TObjectId>
  payload: Pick<SlideEditSlideClipboardPayload<TSlideId, TSlide>, 'slides'>
  transform: (input: {
    index: number
    mapping: SlideEditSlideClipboardPasteSlideMapping<TSlideId, TObjectId>
    source: TSlide
  }) => TResult | null | undefined
}): TResult[] {
  const results: TResult[] = []

  pastePlan.mappings.forEach((mapping, index) => {
    const source = payload.slides[index]

    if (source === undefined) {
      return
    }

    const result = transform({ index, mapping, source })

    if (result !== null && result !== undefined) {
      results.push(result)
    }
  })

  return results
}

function normalizeSlideEditSlideClipboardSelectedSlideIds<
  TSlideId extends SlideEditSlideClipboardSlideId,
>({
  selectedSlideIds,
  slideIds,
}: {
  selectedSlideIds?: readonly unknown[] | null
  slideIds: readonly TSlideId[]
}) {
  const availableSlideIds = new Set<TSlideId>(slideIds)
  const normalized = (selectedSlideIds ?? []).flatMap((slideId) =>
    typeof slideId === 'string' && availableSlideIds.has(slideId as TSlideId)
      ? [slideId as TSlideId]
      : []
  )

  return normalized.length > 0 ? normalized : [...slideIds]
}

function normalizeSlideEditSlideClipboardSourceSlideId<
  TSlideId extends SlideEditSlideClipboardSlideId,
>({
  selectedSlideIds,
  slideIds,
  sourceSlideId,
}: {
  selectedSlideIds: readonly TSlideId[]
  slideIds: readonly TSlideId[]
  sourceSlideId?: TSlideId | null
}) {
  if (sourceSlideId && slideIds.includes(sourceSlideId)) {
    return sourceSlideId
  }

  return selectedSlideIds[0] ?? slideIds[0]!
}

function normalizeSlideEditSlideClipboardObjectCount(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
}

function getSlideEditSlideClipboardTargetSlideId<
  TSlideId extends SlideEditSlideClipboardSlideId,
>(target: SlideEditSlideClipboardPasteTarget<TSlideId>) {
  switch (target.kind) {
    case 'active-slide':
      return target.activeSlideId
    case 'after-slide':
      return target.slideId
    case 'focused-rail-slide':
      return target.focusedSlideId
  }
}

function parseSlideEditSlideClipboardMetadata(value: unknown) {
  if (!isRecord(value) || typeof value.slideId !== 'string') {
    return null
  }

  return {
    index: typeof value.index === 'number' ? value.index : 0,
    objectCount: typeof value.objectCount === 'number'
      ? normalizeSlideEditSlideClipboardObjectCount(value.objectCount)
      : 0,
    slideId: value.slideId,
    ...(typeof value.title === 'string' ? { title: value.title } : {}),
  }
}

function parseSlideEditSlideClipboardDebug(
  value: unknown,
  sourceSlideId: string,
): SlideEditSlideClipboardDebugMetadata<string> {
  if (!isRecord(value)) {
    return {
      objectCount: 0,
      slideCount: 0,
      sourceSlideId,
    }
  }

  return {
    objectCount: typeof value.objectCount === 'number'
      ? normalizeSlideEditSlideClipboardObjectCount(value.objectCount)
      : 0,
    slideCount: typeof value.slideCount === 'number'
      ? normalizeSlideEditSlideClipboardObjectCount(value.slideCount)
      : 0,
    sourceSlideId: typeof value.sourceSlideId === 'string'
      ? value.sourceSlideId
      : sourceSlideId,
  }
}

function isSlideEditSlideClipboardOperation(
  value: unknown,
): value is SlideEditSlideClipboardOperation {
  return value === 'copy' || value === 'cut'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
