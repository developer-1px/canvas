export type SlideEditStyleClipboardSlideId = string
export type SlideEditStyleClipboardObjectId = string
export type SlideEditStyleClipboardSourceKind = string

export type SlideEditStyleClipboardBuiltInCategoryId =
  | 'line-style'
  | 'object-effect'
  | 'shape-fill'
  | 'shape-stroke'
  | 'text-style'

export type SlideEditStyleClipboardCategoryId = string

export type SlideEditStyleClipboardDisabledReason =
  | 'empty-clipboard'
  | 'no-compatible-categories'
  | 'no-target-selection'

export type SlideEditStyleClipboardCategoryDescriptor<
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
> = {
  id: TCategoryId
  label: string
}

export type SlideEditStyleClipboardSource<
  TSlideId extends SlideEditStyleClipboardSlideId =
    SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind =
    SlideEditStyleClipboardSourceKind,
> = {
  kind: TSourceKind
  objectId: TObjectId
  slideId: TSlideId
}

export type SlideEditStyleClipboardStylePayload<
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
> = {
  categoryId: TCategoryId
  value: TStyle
}

export type SlideEditStyleClipboardDescriptor<
  TSlideId extends SlideEditStyleClipboardSlideId =
    SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind =
    SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
> = {
  categories: readonly SlideEditStyleClipboardCategoryDescriptor<TCategoryId>[]
  source: SlideEditStyleClipboardSource<TSlideId, TObjectId, TSourceKind>
  styles: readonly SlideEditStyleClipboardStylePayload<TCategoryId, TStyle>[]
  type: 'slide-style-clipboard'
}

export type SlideEditStyleClipboardTargetInput<
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
> = {
  objectId: TObjectId
  supportedCategoryIds: readonly TCategoryId[]
}

export type SlideEditStyleClipboardTargetDescriptor<
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
> = {
  applicableCategoryIds: readonly TCategoryId[]
  disabledReason?: SlideEditStyleClipboardDisabledReason
  ignoredCategoryIds: readonly TCategoryId[]
  isSupported: boolean
  objectId: TObjectId
}

export type SlideEditStyleClipboardPasteAvailability<
  TSlideId extends SlideEditStyleClipboardSlideId =
    SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind =
    SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
> = {
  canPaste: boolean
  disabledReason?: SlideEditStyleClipboardDisabledReason
  source: SlideEditStyleClipboardSource<TSlideId, TObjectId, TSourceKind>
  targetObjectIds: readonly TObjectId[]
  targets: readonly SlideEditStyleClipboardTargetDescriptor<
    TObjectId,
    TCategoryId
  >[]
}

export type SlideEditStyleClipboardCopyFormattingCommand<
  TSlideId extends SlideEditStyleClipboardSlideId =
    SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind =
    SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
> = {
  clipboard: SlideEditStyleClipboardDescriptor<
    TSlideId,
    TObjectId,
    TSourceKind,
    TCategoryId,
    TStyle
  >
  id: 'copy-object-formatting'
}

export type SlideEditStyleClipboardCategoryApplication<
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
> = {
  appliedCategoryIds: readonly TCategoryId[]
  ignoredCategoryIds: readonly TCategoryId[]
  objectId: TObjectId
}

export type SlideEditStyleClipboardPasteFormattingCommand<
  TSlideId extends SlideEditStyleClipboardSlideId =
    SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind =
    SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
> = {
  categoryApplications: readonly SlideEditStyleClipboardCategoryApplication<
    TObjectId,
    TCategoryId
  >[]
  clipboard: SlideEditStyleClipboardDescriptor<
    TSlideId,
    TObjectId,
    TSourceKind,
    TCategoryId,
    TStyle
  >
  id: 'paste-object-formatting'
  targetObjectIds: readonly TObjectId[]
  targetSlideId: TSlideId
}

export type SlideEditStyleClipboardHostCommandEffect<
  TSlideId extends SlideEditStyleClipboardSlideId =
    SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId =
    SlideEditStyleClipboardObjectId,
  TCommandPayload = unknown,
> = {
  payload: TCommandPayload
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export const SLIDE_EDIT_STYLE_CLIPBOARD_BUILT_IN_CATEGORIES = Object.freeze([
  {
    id: 'shape-fill',
    label: 'Shape Fill',
  },
  {
    id: 'shape-stroke',
    label: 'Shape Stroke',
  },
  {
    id: 'line-style',
    label: 'Line Style',
  },
  {
    id: 'text-style',
    label: 'Text Style',
  },
  {
    id: 'object-effect',
    label: 'Object Effect',
  },
] as const satisfies readonly SlideEditStyleClipboardCategoryDescriptor<
  SlideEditStyleClipboardBuiltInCategoryId
>[])

export function createSlideEditStyleClipboardDescriptor<
  TSlideId extends SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
>({
  categories,
  source,
  styles = [],
}: {
  categories: readonly SlideEditStyleClipboardCategoryDescriptor<TCategoryId>[]
  source: SlideEditStyleClipboardSource<TSlideId, TObjectId, TSourceKind>
  styles?: readonly SlideEditStyleClipboardStylePayload<TCategoryId, TStyle>[]
}): SlideEditStyleClipboardDescriptor<
  TSlideId,
  TObjectId,
  TSourceKind,
  TCategoryId,
  TStyle
> {
  const normalizedCategories = normalizeSlideEditStyleClipboardCategories(
    categories,
  )
  const categoryIds = new Set(normalizedCategories.map((category) =>
    category.id
  ))

  return {
    categories: normalizedCategories,
    source,
    styles: styles.filter((style) => categoryIds.has(style.categoryId)),
    type: 'slide-style-clipboard',
  }
}

export function getSlideEditStyleClipboardCategoryIds<
  TCategoryId extends SlideEditStyleClipboardCategoryId,
>(
  clipboard: Pick<
    SlideEditStyleClipboardDescriptor<
      SlideEditStyleClipboardSlideId,
      SlideEditStyleClipboardObjectId,
      SlideEditStyleClipboardSourceKind,
      TCategoryId
    >,
    'categories'
  >,
) {
  return clipboard.categories.map((category) => category.id)
}

export function getSlideEditStyleClipboardCategoryDescriptors<
  TCategoryId extends SlideEditStyleClipboardCategoryId =
    SlideEditStyleClipboardBuiltInCategoryId,
>({
  categoryIds,
  registry,
}: {
  categoryIds: readonly TCategoryId[]
  registry?: readonly SlideEditStyleClipboardCategoryDescriptor<TCategoryId>[]
}): SlideEditStyleClipboardCategoryDescriptor<TCategoryId>[] {
  const descriptorRegistry = registry ??
    (SLIDE_EDIT_STYLE_CLIPBOARD_BUILT_IN_CATEGORIES as unknown as readonly SlideEditStyleClipboardCategoryDescriptor<
      TCategoryId
    >[])
  const selectedCategoryIds = new Set<TCategoryId>(categoryIds)
  const emittedCategoryIds = new Set<TCategoryId>()
  const descriptors: SlideEditStyleClipboardCategoryDescriptor<TCategoryId>[] =
    []

  for (const descriptor of descriptorRegistry) {
    if (
      !selectedCategoryIds.has(descriptor.id) ||
      emittedCategoryIds.has(descriptor.id)
    ) {
      continue
    }

    emittedCategoryIds.add(descriptor.id)
    descriptors.push(descriptor)
  }

  return descriptors
}

export function getSlideEditStyleClipboardCopyCommandEffect<
  TSlideId extends SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
>(
  clipboard: SlideEditStyleClipboardDescriptor<
    TSlideId,
    TObjectId,
    TSourceKind,
    TCategoryId,
    TStyle
  >,
): SlideEditStyleClipboardHostCommandEffect<
  TSlideId,
  TObjectId,
  SlideEditStyleClipboardCopyFormattingCommand<
    TSlideId,
    TObjectId,
    TSourceKind,
    TCategoryId,
    TStyle
  >
> {
  return {
    payload: {
      clipboard,
      id: 'copy-object-formatting',
    },
    selection: {
      objectIds: [clipboard.source.objectId],
      slideId: clipboard.source.slideId,
    },
    type: 'slide-command-effect',
  }
}

export function getSlideEditStyleClipboardPasteAvailability<
  TSlideId extends SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
>({
  clipboard,
  targets,
}: {
  clipboard: SlideEditStyleClipboardDescriptor<
    TSlideId,
    TObjectId,
    TSourceKind,
    TCategoryId,
    TStyle
  >
  targets: readonly SlideEditStyleClipboardTargetInput<TObjectId, TCategoryId>[]
}): SlideEditStyleClipboardPasteAvailability<
  TSlideId,
  TObjectId,
  TSourceKind,
  TCategoryId
> {
  const copiedCategoryIds = getSlideEditStyleClipboardCategoryIds(clipboard)
  const targetObjectIds = targets.map((target) => target.objectId)
  const targetDescriptors = targets.map((target) =>
    getSlideEditStyleClipboardTargetDescriptor({
      copiedCategoryIds,
      target,
    })
  )

  if (targetObjectIds.length === 0) {
    return {
      canPaste: false,
      disabledReason: 'no-target-selection',
      source: clipboard.source,
      targetObjectIds,
      targets: targetDescriptors,
    }
  }

  if (copiedCategoryIds.length === 0) {
    return {
      canPaste: false,
      disabledReason: 'empty-clipboard',
      source: clipboard.source,
      targetObjectIds,
      targets: targetDescriptors,
    }
  }

  const canPaste = targetDescriptors.some((target) => target.isSupported)

  return {
    canPaste,
    disabledReason: canPaste ? undefined : 'no-compatible-categories',
    source: clipboard.source,
    targetObjectIds,
    targets: targetDescriptors,
  }
}

export function createSlideEditStyleClipboardPasteCommandEffect<
  TSlideId extends SlideEditStyleClipboardSlideId,
  TObjectId extends SlideEditStyleClipboardObjectId,
  TSourceKind extends SlideEditStyleClipboardSourceKind,
  TCategoryId extends SlideEditStyleClipboardCategoryId,
  TStyle = unknown,
>({
  clipboard,
  targetSlideId,
  targets,
}: {
  clipboard: SlideEditStyleClipboardDescriptor<
    TSlideId,
    TObjectId,
    TSourceKind,
    TCategoryId,
    TStyle
  >
  targetSlideId: TSlideId
  targets: readonly SlideEditStyleClipboardTargetInput<TObjectId, TCategoryId>[]
}): SlideEditStyleClipboardHostCommandEffect<
  TSlideId,
  TObjectId,
  SlideEditStyleClipboardPasteFormattingCommand<
    TSlideId,
    TObjectId,
    TSourceKind,
    TCategoryId,
    TStyle
  >
> | null {
  const availability = getSlideEditStyleClipboardPasteAvailability({
    clipboard,
    targets,
  })

  if (!availability.canPaste) {
    return null
  }

  const categoryApplications = availability.targets
    .filter((target) => target.isSupported)
    .map((target) => ({
      appliedCategoryIds: target.applicableCategoryIds,
      ignoredCategoryIds: target.ignoredCategoryIds,
      objectId: target.objectId,
    }))

  return {
    payload: {
      categoryApplications,
      clipboard,
      id: 'paste-object-formatting',
      targetObjectIds: availability.targetObjectIds,
      targetSlideId,
    },
    selection: {
      objectIds: categoryApplications.map((application) =>
        application.objectId
      ),
      slideId: targetSlideId,
    },
    type: 'slide-command-effect',
  }
}

function normalizeSlideEditStyleClipboardCategories<
  TCategoryId extends SlideEditStyleClipboardCategoryId,
>(
  categories: readonly SlideEditStyleClipboardCategoryDescriptor<TCategoryId>[],
) {
  const seenCategoryIds = new Set<TCategoryId>()
  const normalizedCategories: SlideEditStyleClipboardCategoryDescriptor<
    TCategoryId
  >[] = []

  for (const category of categories) {
    if (seenCategoryIds.has(category.id)) {
      continue
    }

    seenCategoryIds.add(category.id)
    normalizedCategories.push(category)
  }

  return normalizedCategories
}

function getSlideEditStyleClipboardTargetDescriptor<
  TObjectId extends SlideEditStyleClipboardObjectId,
  TCategoryId extends SlideEditStyleClipboardCategoryId,
>({
  copiedCategoryIds,
  target,
}: {
  copiedCategoryIds: readonly TCategoryId[]
  target: SlideEditStyleClipboardTargetInput<TObjectId, TCategoryId>
}): SlideEditStyleClipboardTargetDescriptor<TObjectId, TCategoryId> {
  const supportedCategoryIds = new Set(target.supportedCategoryIds)
  const applicableCategoryIds = copiedCategoryIds.filter((categoryId) =>
    supportedCategoryIds.has(categoryId)
  )
  const ignoredCategoryIds = copiedCategoryIds.filter((categoryId) =>
    !supportedCategoryIds.has(categoryId)
  )
  const isSupported = applicableCategoryIds.length > 0

  return {
    applicableCategoryIds,
    disabledReason: isSupported
      ? undefined
      : getSlideEditStyleClipboardDisabledReason(copiedCategoryIds),
    ignoredCategoryIds,
    isSupported,
    objectId: target.objectId,
  }
}

function getSlideEditStyleClipboardDisabledReason(
  copiedCategoryIds: readonly SlideEditStyleClipboardCategoryId[],
): SlideEditStyleClipboardDisabledReason {
  return copiedCategoryIds.length === 0
    ? 'empty-clipboard'
    : 'no-compatible-categories'
}
