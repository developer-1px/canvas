export type SlideEditDeckNavigationSlideId = string

export type SlideEditDeckNavigationKeyboardDirection = -1 | 1

export type SlideEditDeckNavigationKeyboardIntent<
  TSlideId extends SlideEditDeckNavigationSlideId =
    SlideEditDeckNavigationSlideId,
> = {
  activeSlideId: TSlideId
  direction: SlideEditDeckNavigationKeyboardDirection
  preventDefault: true
  targetSlideId: TSlideId
  type: 'select-relative-slide'
}

export type SlideEditDeckNavigationKeyboardIntentInput<
  TSlideId extends SlideEditDeckNavigationSlideId =
    SlideEditDeckNavigationSlideId,
> = {
  activeSlideId: TSlideId | null
  altKey?: boolean
  ctrlKey?: boolean
  key: string
  metaKey?: boolean
  shiftKey?: boolean
  slideOrder: readonly TSlideId[]
}

export function getSlideEditDeckNavigationKeyboardIntent<
  TSlideId extends SlideEditDeckNavigationSlideId,
>({
  activeSlideId,
  altKey = false,
  ctrlKey = false,
  key,
  metaKey = false,
  shiftKey = false,
  slideOrder,
}: SlideEditDeckNavigationKeyboardIntentInput<TSlideId>):
  SlideEditDeckNavigationKeyboardIntent<TSlideId> | null {
  if (!activeSlideId || altKey || ctrlKey || metaKey || shiftKey) {
    return null
  }

  const direction = getSlideEditDeckNavigationKeyboardDirection(key)

  if (direction === null) {
    return null
  }

  const activeIndex = slideOrder.indexOf(activeSlideId)

  if (activeIndex < 0) {
    return null
  }

  const targetSlideId = slideOrder[activeIndex + direction]

  if (!targetSlideId) {
    return null
  }

  return {
    activeSlideId,
    direction,
    preventDefault: true,
    targetSlideId,
    type: 'select-relative-slide',
  }
}

function getSlideEditDeckNavigationKeyboardDirection(
  key: string,
): SlideEditDeckNavigationKeyboardDirection | null {
  if (key === 'PageUp') {
    return -1
  }

  if (key === 'PageDown') {
    return 1
  }

  return null
}
