import type { Bounds } from '../../../src/canvas/core'

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

export type SlideEditRailDescriptor<
  TSlideId extends SlideEditRailSlideId = SlideEditRailSlideId,
> = {
  activeSlideId: TSlideId | null
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
    activeSlideId: TSlideId | null
    direction: 'next' | 'previous'
    slideOrder: readonly TSlideId[]
    type: 'move-active'
  }
  | {
    activeSlideId: TSlideId | null
    direction: 'next' | 'previous'
    slideOrder: readonly TSlideId[]
    type: 'select-relative'
  }

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
    case 'move-active':
      return getSlideEditRailMoveActiveEffect(intent)
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
