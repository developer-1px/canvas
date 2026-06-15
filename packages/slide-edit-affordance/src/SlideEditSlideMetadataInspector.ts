import type {
  SlideEditRailDescriptor,
  SlideEditRailSlideId,
} from './SlideEditRailInteractions'

export type SlideEditSlideMetadataSlideId = SlideEditRailSlideId
export type SlideEditSlideOrientation = 'landscape' | 'portrait'

export type SlideEditSlideBackgroundDescriptor =
  | {
    kind: 'none'
  }
  | {
    color: string
    kind: 'solid-color'
    tokenId?: string
  }
  | {
    assetId: string
    fitting: 'contain' | 'cover' | 'stretch' | 'tile'
    kind: 'image'
  }

export type SlideEditSlideSizeDescriptor = {
  h: number
  w: number
}

export type SlideEditSlideMetadataReadModel<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> = {
  background: SlideEditSlideBackgroundDescriptor
  name: string
  notes: string
  orientation?: SlideEditSlideOrientation
  size?: SlideEditSlideSizeDescriptor
  slideId: TSlideId
}

export type SlideEditSlideMetadataFieldId =
  | 'background'
  | 'name'
  | 'notes'
  | 'orientation'
  | 'size'

export type SlideEditSlideMetadataOptionalFieldId = Extract<
  SlideEditSlideMetadataFieldId,
  'orientation' | 'size'
>

export type SlideEditSlideMetadataCommandId =
  | 'update-slide-background'
  | 'update-slide-name'
  | 'update-slide-notes'
  | 'update-slide-orientation'
  | 'update-slide-size'

export type SlideEditSlideMetadataFieldControl =
  | 'background-control'
  | 'multiline-text'
  | 'orientation-control'
  | 'size-control'
  | 'text'

export type SlideEditSlideMetadataFieldDescriptor = {
  commandId: SlideEditSlideMetadataCommandId
  control: SlideEditSlideMetadataFieldControl
  id: SlideEditSlideMetadataFieldId
  isEditable: boolean
  isOptional: boolean
  requiredAdapterSlot: 'command-effect'
}

export const SLIDE_EDIT_SLIDE_METADATA_FIELDS = Object.freeze([
  {
    commandId: 'update-slide-name',
    control: 'text',
    id: 'name',
    isEditable: true,
    isOptional: false,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-background',
    control: 'background-control',
    id: 'background',
    isEditable: true,
    isOptional: false,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-notes',
    control: 'multiline-text',
    id: 'notes',
    isEditable: true,
    isOptional: false,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-size',
    control: 'size-control',
    id: 'size',
    isEditable: true,
    isOptional: true,
    requiredAdapterSlot: 'command-effect',
  },
  {
    commandId: 'update-slide-orientation',
    control: 'orientation-control',
    id: 'orientation',
    isEditable: true,
    isOptional: true,
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditSlideMetadataFieldDescriptor[])

export type SlideEditInspectorSurfaceId =
  | 'none'
  | 'object-selection-inspector'
  | 'slide-metadata-inspector'

export type SlideEditInspectorDisplayPriority = {
  rank: number
  surface: Exclude<SlideEditInspectorSurfaceId, 'none'>
  when: 'active-slide-without-object-selection' | 'selected-object-ids-present'
}

export const SLIDE_EDIT_INSPECTOR_DISPLAY_PRIORITY = Object.freeze([
  {
    rank: 0,
    surface: 'object-selection-inspector',
    when: 'selected-object-ids-present',
  },
  {
    rank: 1,
    surface: 'slide-metadata-inspector',
    when: 'active-slide-without-object-selection',
  },
] as const satisfies readonly SlideEditInspectorDisplayPriority[])

export type SlideEditSlideMetadataInspectorDescriptor<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> = {
  activeSlide: {
    index: number | null
    slideCount: number
    slideId: TSlideId
  }
  fields: readonly SlideEditSlideMetadataFieldDescriptor[]
  metadata: SlideEditSlideMetadataReadModel<TSlideId>
  surface: 'slide-metadata-inspector'
}

export type SlideEditSlideMetadataUpdateCommand<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> =
  | {
    fieldId: 'background'
    id: 'update-slide-background'
    slideId: TSlideId
    value: SlideEditSlideBackgroundDescriptor
  }
  | {
    fieldId: 'name'
    id: 'update-slide-name'
    slideId: TSlideId
    value: string
  }
  | {
    fieldId: 'notes'
    id: 'update-slide-notes'
    slideId: TSlideId
    value: string
  }
  | {
    fieldId: 'orientation'
    id: 'update-slide-orientation'
    slideId: TSlideId
    value: SlideEditSlideOrientation
  }
  | {
    fieldId: 'size'
    id: 'update-slide-size'
    slideId: TSlideId
    value: SlideEditSlideSizeDescriptor
  }

export type SlideEditSlideMetadataHostCommandEffect<
  TSlideId extends SlideEditSlideMetadataSlideId = SlideEditSlideMetadataSlideId,
> = {
  payload: SlideEditSlideMetadataUpdateCommand<TSlideId>
  selection: {
    objectIds: readonly never[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export function createSlideEditSlideMetadataInspectorDescriptor<
  TSlideId extends SlideEditSlideMetadataSlideId,
>({
  includeOptionalFields = ['size', 'orientation'],
  rail,
  readSlideMetadata,
}: {
  includeOptionalFields?: readonly SlideEditSlideMetadataOptionalFieldId[]
  rail: Pick<SlideEditRailDescriptor<TSlideId>, 'activeSlideId' | 'slideOrder'>
  readSlideMetadata: (
    slideId: TSlideId,
  ) => SlideEditSlideMetadataReadModel<TSlideId> | null
}): SlideEditSlideMetadataInspectorDescriptor<TSlideId> | null {
  if (!rail.activeSlideId) {
    return null
  }

  const metadata = readSlideMetadata(rail.activeSlideId)

  if (!metadata) {
    return null
  }

  const activeSlideIndex = rail.slideOrder.indexOf(rail.activeSlideId)

  return {
    activeSlide: {
      index: activeSlideIndex >= 0 ? activeSlideIndex : null,
      slideCount: rail.slideOrder.length,
      slideId: rail.activeSlideId,
    },
    fields: getSlideEditSlideMetadataFieldDescriptors({
      includeOptionalFields,
    }),
    metadata,
    surface: 'slide-metadata-inspector',
  }
}

export function getSlideEditSlideMetadataFieldDescriptors({
  includeOptionalFields = ['size', 'orientation'],
}: {
  includeOptionalFields?: readonly SlideEditSlideMetadataOptionalFieldId[]
} = {}): readonly SlideEditSlideMetadataFieldDescriptor[] {
  return SLIDE_EDIT_SLIDE_METADATA_FIELDS.filter((field) =>
    !field.isOptional
    || includeOptionalFields.includes(
      field.id as SlideEditSlideMetadataOptionalFieldId,
    )
  )
}

export function getSlideEditInspectorSurface({
  activeSlideId,
  selectedObjectIds,
}: {
  activeSlideId: SlideEditSlideMetadataSlideId | null
  selectedObjectIds: readonly string[]
}): SlideEditInspectorSurfaceId {
  if (selectedObjectIds.length > 0) {
    return 'object-selection-inspector'
  }

  return activeSlideId ? 'slide-metadata-inspector' : 'none'
}

export function toSlideEditSlideMetadataHostCommandEffect<
  TSlideId extends SlideEditSlideMetadataSlideId,
>(
  command: SlideEditSlideMetadataUpdateCommand<TSlideId>,
): SlideEditSlideMetadataHostCommandEffect<TSlideId> {
  return {
    payload: command,
    selection: {
      objectIds: [],
      slideId: command.slideId,
    },
    type: 'slide-command-effect',
  }
}
