import type { Bounds } from '../../../src/canvas/core'
import {
  CANVAS_SELECTION_LIST_KEYBOARD_MODEL,
  createCanvasSelectionListDescriptor,
} from '../../../src/canvas/app/affordances/controls/selection-list/CanvasSelectionListDescriptor'

export type SlideEditRailSlideId = string

export type SlideEditRailThumbnailDescriptor<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> = {
  bounds: Bounds
  hitTarget: Bounds
  index: number
  isActive: boolean
  slideId: TSlideId
}

export type SlideEditRailListboxOptionDescriptor<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> = {
  id: string
  index: number
  isActive: boolean
  isFocusable: boolean
  isSelected: boolean
  slideId: TSlideId
  tabIndex: -1 | 0
}

export type SlideEditRailListboxDescriptor<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> = {
  activeOptionId: string | null
  focusableOptionId: string | null
  keyboardModel: 'aria-listbox-roving-focus'
  options: readonly SlideEditRailListboxOptionDescriptor<TSlideId>[]
  role: 'listbox'
  selectionMode: 'single'
}

export type SlideEditRailDescriptor<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> = {
  activeSlideId: TSlideId | null
  listbox: SlideEditRailListboxDescriptor<TSlideId>
  slideOrder: readonly TSlideId[]
  thumbnails: readonly SlideEditRailThumbnailDescriptor<TSlideId>[]
}

export type SlideEditRailCommandId =
  | 'add-slide'
  | 'delete-slide'
  | 'duplicate-slide'
  | 'reorder-slide'
  | 'select-active-slide'

export type SlideEditRailCommandDescriptor = {
  id: SlideEditRailCommandId
  requiredAdapterSlot: 'command-effect'
}

export const SLIDE_EDIT_RAIL_COMMANDS = Object.freeze([
  { id: 'add-slide', requiredAdapterSlot: 'command-effect' },
  { id: 'duplicate-slide', requiredAdapterSlot: 'command-effect' },
  { id: 'delete-slide', requiredAdapterSlot: 'command-effect' },
  { id: 'reorder-slide', requiredAdapterSlot: 'command-effect' },
  { id: 'select-active-slide', requiredAdapterSlot: 'command-effect' },
] as const satisfies readonly SlideEditRailCommandDescriptor[])

export const SLIDE_EDIT_RAIL_KEYBOARD_KEYS =
  'ArrowUp ArrowDown Home End Enter Space'

export type SlideEditRailCommand<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> =
  | {
    afterSlideId?: TSlideId | null
    id: 'add-slide'
  }
  | {
    id: 'duplicate-slide'
    slideId: TSlideId
  }
  | {
    id: 'delete-slide'
    slideId: TSlideId
  }
  | {
    fromIndex: number
    id: 'reorder-slide'
    slideId: TSlideId
    toIndex: number
  }
  | {
    id: 'select-active-slide'
    slideId: TSlideId
  }

export type SlideEditRailHostCommandEffect<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> = {
  payload: SlideEditRailCommand<TSlideId>
  selection?: {
    objectIds: readonly string[]
    slideId: TSlideId
  }
  type: 'slide-command-effect'
}

export type SlideEditRailKeyboardIntent<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> =
  | {
    activeSlideId: TSlideId | null
    slideOrder: readonly TSlideId[]
    type: 'add-after-active'
  }
  | {
    activeSlideId: TSlideId | null
    type: 'delete-active'
  }
  | {
    activeSlideId: TSlideId | null
    type: 'duplicate-active'
  }
  | {
    slideId: TSlideId | null
    type: 'activate-focused-option'
  }
  | {
    activeSlideId: TSlideId | null
    direction: 'next' | 'previous'
    slideOrder: readonly TSlideId[]
    type: 'move-active'
  }
  | {
    boundary: 'first' | 'last'
    slideOrder: readonly TSlideId[]
    type: 'select-boundary'
  }
  | {
    activeSlideId: TSlideId | null
    direction: 'next' | 'previous'
    slideOrder: readonly TSlideId[]
    type: 'select-relative'
  }

export type SlideEditRailListboxKeyboardKey =
  | ' '
  | 'ArrowDown'
  | 'ArrowUp'
  | 'End'
  | 'Enter'
  | 'Home'

export type SlideEditRailPointerIntent<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> =
  | {
    afterSlideId?: TSlideId | null
    type: 'add-button-press'
  }
  | {
    slideId: TSlideId
    type: 'delete-button-press'
  }
  | {
    slideId: TSlideId
    type: 'duplicate-button-press'
  }
  | {
    slideId: TSlideId
    slideOrder: readonly TSlideId[]
    toIndex: number
    type: 'thumbnail-drop'
  }
  | {
    slideId: TSlideId
    type: 'thumbnail-press'
  }

export function createSlideEditRailDescriptor<
  TSlideId extends SlideEditRailSlideId,
>({
  activeSlideId,
  getThumbnailBounds,
  hitTargetPadding = 0,
  slideOrder,
}: {
  activeSlideId: TSlideId | null
  getThumbnailBounds: (slideId: TSlideId, index: number) => Bounds
  hitTargetPadding?: number
  slideOrder: readonly TSlideId[]
}): SlideEditRailDescriptor<TSlideId> {
  return {
    activeSlideId,
    listbox: createSlideEditRailListboxDescriptor({
      activeSlideId,
      slideOrder,
    }),
    slideOrder,
    thumbnails: slideOrder.map((slideId, index) => {
      const bounds = getThumbnailBounds(slideId, index)

      return {
        bounds,
        hitTarget: expandSlideEditRailHitTarget(bounds, hitTargetPadding),
        index,
        isActive: activeSlideId === slideId,
        slideId,
      }
    }),
  }
}

export function createSlideEditRailListboxDescriptor<
  TSlideId extends SlideEditRailSlideId,
>({
  activeSlideId,
  getOptionId = getDefaultSlideEditRailOptionId,
  slideOrder,
}: {
  activeSlideId: TSlideId | null
  getOptionId?: (slideId: TSlideId, index: number) => string
  slideOrder: readonly TSlideId[]
}): SlideEditRailListboxDescriptor<TSlideId> {
  const descriptor = createCanvasSelectionListDescriptor({
    focusedId: activeSlideId,
    getOptionId,
    items: slideOrder.map((slideId) => ({ id: slideId })),
    selectedIds: activeSlideId ? [activeSlideId] : [],
    selectionMode: 'single',
  })
  const options = descriptor.options.map((option) => ({
    id: option.optionId,
    index: option.index,
    isActive: option.isSelected,
    isFocusable: option.isFocusable,
    isSelected: option.isSelected,
    slideId: option.id,
    tabIndex: option.attributes.tabIndex === 0 ? 0 : -1,
  }))

  return {
    activeOptionId: descriptor.selectedOptionIds[0] ?? null,
    focusableOptionId: descriptor.focusableOptionId,
    keyboardModel: CANVAS_SELECTION_LIST_KEYBOARD_MODEL,
    options,
    role: descriptor.rootAttributes.role,
    selectionMode: 'single',
  }
}

export function getSlideEditRailListboxKeyboardIntent<
  TSlideId extends SlideEditRailSlideId,
>({
  activeSlideId,
  key,
  slideOrder,
}: {
  activeSlideId: TSlideId | null
  key: SlideEditRailListboxKeyboardKey | string
  slideOrder: readonly TSlideId[]
}): SlideEditRailKeyboardIntent<TSlideId> | null {
  if (key === 'ArrowDown') {
    return {
      activeSlideId,
      direction: 'next',
      slideOrder,
      type: 'select-relative',
    }
  }

  if (key === 'ArrowUp') {
    return {
      activeSlideId,
      direction: 'previous',
      slideOrder,
      type: 'select-relative',
    }
  }

  if (key === 'Home') {
    return {
      boundary: 'first',
      slideOrder,
      type: 'select-boundary',
    }
  }

  if (key === 'End') {
    return {
      boundary: 'last',
      slideOrder,
      type: 'select-boundary',
    }
  }

  if (key === 'Enter' || key === ' ') {
    return {
      slideId: activeSlideId ?? slideOrder[0] ?? null,
      type: 'activate-focused-option',
    }
  }

  return null
}

export function getSlideEditRailKeyboardCommandEffect<
  TSlideId extends SlideEditRailSlideId,
>(
  intent: SlideEditRailKeyboardIntent<TSlideId>,
): SlideEditRailHostCommandEffect<TSlideId> | null {
  switch (intent.type) {
    case 'add-after-active':
      return toSlideEditRailHostCommandEffect({
        afterSlideId: intent.activeSlideId,
        id: 'add-slide',
      })
    case 'delete-active':
      return intent.activeSlideId
        ? toSlideEditRailHostCommandEffect({
            id: 'delete-slide',
            slideId: intent.activeSlideId,
          })
        : null
    case 'duplicate-active':
      return intent.activeSlideId
        ? toSlideEditRailHostCommandEffect({
            id: 'duplicate-slide',
            slideId: intent.activeSlideId,
          })
        : null
    case 'activate-focused-option':
      return intent.slideId
        ? toSlideEditRailHostCommandEffect({
            id: 'select-active-slide',
            slideId: intent.slideId,
          })
        : null
    case 'move-active':
      return getSlideEditRailMoveActiveEffect(intent)
    case 'select-boundary':
      return getSlideEditRailSelectBoundaryEffect(intent)
    case 'select-relative':
      return getSlideEditRailSelectRelativeEffect(intent)
  }
}

export function getSlideEditRailPointerCommandEffect<
  TSlideId extends SlideEditRailSlideId,
>(
  intent: SlideEditRailPointerIntent<TSlideId>,
): SlideEditRailHostCommandEffect<TSlideId> | null {
  switch (intent.type) {
    case 'add-button-press':
      return toSlideEditRailHostCommandEffect({
        afterSlideId: intent.afterSlideId ?? null,
        id: 'add-slide',
      })
    case 'delete-button-press':
      return toSlideEditRailHostCommandEffect({
        id: 'delete-slide',
        slideId: intent.slideId,
      })
    case 'duplicate-button-press':
      return toSlideEditRailHostCommandEffect({
        id: 'duplicate-slide',
        slideId: intent.slideId,
      })
    case 'thumbnail-drop':
      return getSlideEditRailReorderEffect({
        slideId: intent.slideId,
        slideOrder: intent.slideOrder,
        toIndex: intent.toIndex,
      })
    case 'thumbnail-press':
      return toSlideEditRailHostCommandEffect({
        id: 'select-active-slide',
        slideId: intent.slideId,
      })
  }
}

export function toSlideEditRailHostCommandEffect<
  TSlideId extends SlideEditRailSlideId,
>(
  command: SlideEditRailCommand<TSlideId>,
): SlideEditRailHostCommandEffect<TSlideId> {
  return {
    payload: command,
    selection: 'slideId' in command
      ? {
          objectIds: [],
          slideId: command.slideId,
        }
      : undefined,
    type: 'slide-command-effect',
  }
}

function getSlideEditRailMoveActiveEffect<
  TSlideId extends SlideEditRailSlideId,
>({
  activeSlideId,
  direction,
  slideOrder,
}: Extract<SlideEditRailKeyboardIntent<TSlideId>, { type: 'move-active' }>) {
  if (!activeSlideId) {
    return null
  }

  const fromIndex = slideOrder.indexOf(activeSlideId)

  if (fromIndex < 0) {
    return null
  }

  return getSlideEditRailReorderEffect({
    slideId: activeSlideId,
    slideOrder,
    toIndex: direction === 'next' ? fromIndex + 1 : fromIndex - 1,
  })
}

function getSlideEditRailSelectRelativeEffect<
  TSlideId extends SlideEditRailSlideId,
>({
  activeSlideId,
  direction,
  slideOrder,
}: Extract<
  SlideEditRailKeyboardIntent<TSlideId>,
  { type: 'select-relative' }
>) {
  if (!activeSlideId) {
    return null
  }

  const activeIndex = slideOrder.indexOf(activeSlideId)

  if (activeIndex < 0) {
    return null
  }

  const nextIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1
  const slideId = slideOrder[nextIndex]

  return slideId
    ? toSlideEditRailHostCommandEffect({
        id: 'select-active-slide',
        slideId,
      })
    : null
}

function getSlideEditRailSelectBoundaryEffect<
  TSlideId extends SlideEditRailSlideId,
>({
  boundary,
  slideOrder,
}: Extract<
  SlideEditRailKeyboardIntent<TSlideId>,
  { type: 'select-boundary' }
>) {
  const slideId = boundary === 'first'
    ? slideOrder[0]
    : slideOrder[slideOrder.length - 1]

  return slideId
    ? toSlideEditRailHostCommandEffect({
        id: 'select-active-slide',
        slideId,
      })
    : null
}

function getSlideEditRailReorderEffect<
  TSlideId extends SlideEditRailSlideId,
>({
  slideId,
  slideOrder,
  toIndex,
}: {
  slideId: TSlideId
  slideOrder: readonly TSlideId[]
  toIndex: number
}) {
  const fromIndex = slideOrder.indexOf(slideId)
  const normalizedToIndex = normalizeSlideEditRailIndex(toIndex, slideOrder)

  if (fromIndex < 0 || fromIndex === normalizedToIndex) {
    return null
  }

  return toSlideEditRailHostCommandEffect({
    fromIndex,
    id: 'reorder-slide',
    slideId,
    toIndex: normalizedToIndex,
  })
}

function normalizeSlideEditRailIndex<TSlideId extends SlideEditRailSlideId>(
  index: number,
  slideOrder: readonly TSlideId[],
) {
  if (!Number.isFinite(index)) {
    return 0
  }

  return Math.max(0, Math.min(slideOrder.length - 1, Math.round(index)))
}

function expandSlideEditRailHitTarget(bounds: Bounds, padding: number) {
  const normalizedPadding = Number.isFinite(padding) ? Math.max(0, padding) : 0

  return {
    h: bounds.h + normalizedPadding * 2,
    w: bounds.w + normalizedPadding * 2,
    x: bounds.x - normalizedPadding,
    y: bounds.y - normalizedPadding,
  }
}

function getDefaultSlideEditRailOptionId(
  _slideId: SlideEditRailSlideId,
  index: number,
) {
  return `slide-rail-option-${index}`
}
