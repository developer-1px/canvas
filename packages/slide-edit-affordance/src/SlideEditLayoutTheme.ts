import type { Bounds } from '../../../src/canvas/core'

import {
  createSlideEditPlaceholderDescriptor,
  type SlideEditPlaceholderDescriptor,
  type SlideEditPlaceholderId,
  type SlideEditPlaceholderRole,
} from './SlideEditObjectVisibility'

export type SlideEditThemeId = string
export type SlideEditMasterId = string
export type SlideEditLayoutId = string
export type SlideEditLayoutSlideId = string
export type SlideEditLayoutObjectId = string
export type SlideEditThemeColorTokenId = string
export type SlideEditThemeFontTokenId = string
export type SlideEditThemeSpacingTokenId = string

export type SlideEditThemeColorRole =
  | 'accent'
  | 'accent-contrast'
  | 'background'
  | 'border'
  | 'custom'
  | 'surface'
  | 'text'

export type SlideEditThemeFontRole =
  | 'body'
  | 'caption'
  | 'code'
  | 'custom'
  | 'heading'

export type SlideEditThemeSpacingRole =
  | 'custom'
  | 'gutter'
  | 'object-gap'
  | 'safe-area'
  | 'slide-margin'

export type SlideEditThemeColorToken<
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
> = {
  label: string
  role: SlideEditThemeColorRole
  tokenId: TColorTokenId
  value: string
}

export type SlideEditThemeFontToken<
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
> = {
  family: string
  label: string
  lineHeight?: number
  role: SlideEditThemeFontRole
  size?: number
  tokenId: TFontTokenId
  weight?: number | string
}

export type SlideEditThemeSpacingToken<
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  label: string
  role: SlideEditThemeSpacingRole
  tokenId: TSpacingTokenId
  value: number
}

export type SlideEditStyleTokenRefs<
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  colorTokenIds?: {
    background?: TColorTokenId
    fill?: TColorTokenId
    stroke?: TColorTokenId
    text?: TColorTokenId
  }
  fontTokenIds?: {
    body?: TFontTokenId
    heading?: TFontTokenId
  }
  spacingTokenIds?: {
    gap?: TSpacingTokenId
    margin?: TSpacingTokenId
    padding?: TSpacingTokenId
  }
}

export type SlideEditThemeDescriptor<
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  colorTokens: readonly SlideEditThemeColorToken<TColorTokenId>[]
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  fontTokens: readonly SlideEditThemeFontToken<TFontTokenId>[]
  name: string
  spacingTokens: readonly SlideEditThemeSpacingToken<TSpacingTokenId>[]
  themeId: TThemeId
}

export type SlideEditMasterDescriptor<
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  layoutIds: readonly TLayoutId[]
  masterId: TMasterId
  name: string
  themeId: TThemeId
}

export type SlideEditLayoutPlaceholderDescriptor<
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  defaultBounds: Bounds
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  isLocked: boolean
  isVisible: boolean
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  title: string
}

export type SlideEditLayoutDescriptor<
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  layoutId: TLayoutId
  masterId: TMasterId
  name: string
  placeholders: readonly SlideEditLayoutPlaceholderDescriptor<
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >[]
}

export type SlideEditResolvedLayoutPlaceholder<
  TThemeId extends SlideEditThemeId = SlideEditThemeId,
  TMasterId extends SlideEditMasterId = SlideEditMasterId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId = SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId = SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId =
    SlideEditThemeSpacingTokenId,
> = {
  bounds: Bounds
  inheritedStyle: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  isLocked: boolean
  isVisible: boolean
  layoutId: TLayoutId
  masterId: TMasterId
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  styleSourceIds: {
    layoutId: TLayoutId
    masterId: TMasterId
    placeholderId: TPlaceholderId
    themeId: TThemeId
  }
  title: string
}

export type SlideEditLayoutApplyExistingObjectPolicy =
  | 'map-existing-objects-to-placeholders'
  | 'preserve-existing-objects'

export type SlideEditLayoutApplyObjectMapping<
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  boundsSource: 'current-object' | 'layout-placeholder'
  objectId: TObjectId
  placeholderId: TPlaceholderId
}

export type SlideEditLayoutApplyCommand<
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  existingObjectPolicy: SlideEditLayoutApplyExistingObjectPolicy
  id: 'apply-layout'
  layoutId: TLayoutId
  objectMappings: readonly SlideEditLayoutApplyObjectMapping<
    TObjectId,
    TPlaceholderId
  >[]
}

export type SlideEditLayoutApplyHostCommandEffect<
  TSlideId extends SlideEditLayoutSlideId = SlideEditLayoutSlideId,
  TLayoutId extends SlideEditLayoutId = SlideEditLayoutId,
  TObjectId extends SlideEditLayoutObjectId = SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId = SlideEditPlaceholderId,
> = {
  payload: SlideEditLayoutApplyCommand<TLayoutId, TObjectId, TPlaceholderId>
  selection: {
    objectIds: readonly TObjectId[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditLayoutCommandDescriptor = {
  id: 'apply-layout'
  requiredAdapterSlot: 'command-effect'
}

export const SLIDE_EDIT_LAYOUT_COMMANDS = Object.freeze([
  {
    id: 'apply-layout',
    requiredAdapterSlot: 'command-effect',
  },
] as const satisfies readonly SlideEditLayoutCommandDescriptor[])

export function createSlideEditThemeDescriptor<
  TThemeId extends SlideEditThemeId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>(
  descriptor: SlideEditThemeDescriptor<
    TThemeId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >,
) {
  return descriptor
}

export function createSlideEditLayoutPlaceholderDescriptor<
  TPlaceholderId extends SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>({
  defaultBounds,
  defaultStyle,
  isLocked = false,
  isVisible = true,
  placeholderId,
  role,
  title,
}: {
  defaultBounds: Bounds
  defaultStyle?: SlideEditStyleTokenRefs<
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  isLocked?: boolean
  isVisible?: boolean
  placeholderId: TPlaceholderId
  role: SlideEditPlaceholderRole
  title: string
}): SlideEditLayoutPlaceholderDescriptor<
  TPlaceholderId,
  TColorTokenId,
  TFontTokenId,
  TSpacingTokenId
> {
  return {
    defaultBounds,
    defaultStyle,
    isLocked,
    isVisible,
    placeholderId,
    role,
    title,
  }
}

export function getSlideEditResolvedLayoutPlaceholder<
  TThemeId extends SlideEditThemeId,
  TMasterId extends SlideEditMasterId,
  TLayoutId extends SlideEditLayoutId,
  TPlaceholderId extends SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>({
  layout,
  master,
  placeholder,
  theme,
}: {
  layout: SlideEditLayoutDescriptor<
    TLayoutId,
    TMasterId,
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  master: SlideEditMasterDescriptor<
    TMasterId,
    TThemeId,
    TLayoutId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  placeholder: SlideEditLayoutPlaceholderDescriptor<
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  theme: SlideEditThemeDescriptor<
    TThemeId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
}): SlideEditResolvedLayoutPlaceholder<
  TThemeId,
  TMasterId,
  TLayoutId,
  TPlaceholderId,
  TColorTokenId,
  TFontTokenId,
  TSpacingTokenId
> {
  return {
    bounds: placeholder.defaultBounds,
    inheritedStyle: mergeSlideEditStyleTokenRefs(
      theme.defaultStyle,
      master.defaultStyle,
      layout.defaultStyle,
      placeholder.defaultStyle,
    ),
    isLocked: placeholder.isLocked,
    isVisible: placeholder.isVisible,
    layoutId: layout.layoutId,
    masterId: master.masterId,
    placeholderId: placeholder.placeholderId,
    role: placeholder.role,
    styleSourceIds: {
      layoutId: layout.layoutId,
      masterId: master.masterId,
      placeholderId: placeholder.placeholderId,
      themeId: theme.themeId,
    },
    title: placeholder.title,
  }
}

export function getSlideEditLayoutPlaceholderVisibilityDescriptor<
  TSlideId extends SlideEditLayoutSlideId,
  TPlaceholderId extends SlideEditPlaceholderId,
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>({
  placeholder,
  slideId,
}: {
  placeholder: SlideEditLayoutPlaceholderDescriptor<
    TPlaceholderId,
    TColorTokenId,
    TFontTokenId,
    TSpacingTokenId
  >
  slideId: TSlideId
}): SlideEditPlaceholderDescriptor<TSlideId, TPlaceholderId> {
  return createSlideEditPlaceholderDescriptor({
    bounds: placeholder.defaultBounds,
    isLocked: placeholder.isLocked,
    isVisible: placeholder.isVisible,
    placeholderId: placeholder.placeholderId,
    role: placeholder.role,
    slideId,
    title: placeholder.title,
  })
}

export function getSlideEditLayoutApplyCommandEffect<
  TSlideId extends SlideEditLayoutSlideId,
  TLayoutId extends SlideEditLayoutId,
  TObjectId extends SlideEditLayoutObjectId,
  TPlaceholderId extends SlideEditPlaceholderId,
>({
  existingObjectPolicy,
  layoutId,
  objectMappings = [],
  selectedObjectIds = [],
  slideId,
}: {
  existingObjectPolicy: SlideEditLayoutApplyExistingObjectPolicy
  layoutId: TLayoutId
  objectMappings?: readonly SlideEditLayoutApplyObjectMapping<
    TObjectId,
    TPlaceholderId
  >[]
  selectedObjectIds?: readonly TObjectId[]
  slideId: TSlideId
}): SlideEditLayoutApplyHostCommandEffect<
  TSlideId,
  TLayoutId,
  TObjectId,
  TPlaceholderId
> {
  return {
    payload: {
      existingObjectPolicy,
      id: 'apply-layout',
      layoutId,
      objectMappings,
    },
    selection: {
      objectIds: selectedObjectIds,
      slideId,
    },
    type: 'slide-command-effect',
  }
}

function mergeSlideEditStyleTokenRefs<
  TColorTokenId extends SlideEditThemeColorTokenId,
  TFontTokenId extends SlideEditThemeFontTokenId,
  TSpacingTokenId extends SlideEditThemeSpacingTokenId,
>(
  ...styles: Array<
    SlideEditStyleTokenRefs<
      TColorTokenId,
      TFontTokenId,
      TSpacingTokenId
    > | undefined
  >
): SlideEditStyleTokenRefs<TColorTokenId, TFontTokenId, TSpacingTokenId> {
  return styles.reduce<
    SlideEditStyleTokenRefs<TColorTokenId, TFontTokenId, TSpacingTokenId>
  >((merged, style) => ({
    colorTokenIds: {
      ...merged.colorTokenIds,
      ...style?.colorTokenIds,
    },
    fontTokenIds: {
      ...merged.fontTokenIds,
      ...style?.fontTokenIds,
    },
    spacingTokenIds: {
      ...merged.spacingTokenIds,
      ...style?.spacingTokenIds,
    },
  }), {})
}
