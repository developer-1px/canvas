export type CanvasCommandPaletteKeyboardItem = {
  disabled?: boolean
}

export type CanvasCommandPaletteKeyboardIntentInput = {
  activeIndex: number
  itemCount: number
  items?: readonly CanvasCommandPaletteKeyboardItem[]
  key: string
}

export type CanvasCommandPaletteKeyboardIntent =
  | {
      kind: 'move-active'
      activeIndex: number
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'run-active'
      activeIndex: number
      preventDefault: true
      stopPropagation: true
    }
  | {
      kind: 'none'
      preventDefault: false
      stopPropagation: false
    }

export function getCanvasCommandPaletteKeyboardIntent({
  activeIndex,
  itemCount,
  items,
  key,
}: CanvasCommandPaletteKeyboardIntentInput): CanvasCommandPaletteKeyboardIntent {
  const resolvedItemCount = getCanvasCommandPaletteKeyboardItemCount({
    itemCount,
    items,
  })
  const clampedActiveIndex = clampCanvasCommandPaletteActiveIndex(
    activeIndex,
    resolvedItemCount,
  )
  const enabledActiveIndex = getCanvasCommandPaletteEnabledActiveIndex({
    activeIndex: clampedActiveIndex,
    itemCount: resolvedItemCount,
    items,
  })

  if (key === 'ArrowDown') {
    return {
      activeIndex: getCanvasCommandPaletteNextEnabledIndex({
        direction: 'next',
        fallbackIndex: clampedActiveIndex,
        itemCount: resolvedItemCount,
        items,
        startIndex: enabledActiveIndex ?? clampedActiveIndex,
      }),
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'ArrowUp') {
    return {
      activeIndex: getCanvasCommandPaletteNextEnabledIndex({
        direction: 'previous',
        fallbackIndex: clampedActiveIndex,
        itemCount: resolvedItemCount,
        items,
        startIndex: enabledActiveIndex ?? clampedActiveIndex,
      }),
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'Enter' && enabledActiveIndex !== null) {
    return {
      activeIndex: enabledActiveIndex,
      kind: 'run-active',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  return {
    kind: 'none',
    preventDefault: false,
    stopPropagation: false,
  }
}

export function getCanvasCommandPaletteEnabledActiveIndex({
  activeIndex,
  itemCount,
  items,
}: {
  activeIndex: number
  itemCount: number
  items?: readonly CanvasCommandPaletteKeyboardItem[]
}) {
  const resolvedItemCount = getCanvasCommandPaletteKeyboardItemCount({
    itemCount,
    items,
  })

  if (resolvedItemCount <= 0) {
    return null
  }

  const clampedActiveIndex = clampCanvasCommandPaletteActiveIndex(
    activeIndex,
    resolvedItemCount,
  )

  if (!items) {
    return clampedActiveIndex
  }

  if (!items[clampedActiveIndex]?.disabled) {
    return clampedActiveIndex
  }

  for (let index = clampedActiveIndex + 1; index < resolvedItemCount; index += 1) {
    if (!items[index]?.disabled) {
      return index
    }
  }

  for (let index = clampedActiveIndex - 1; index >= 0; index -= 1) {
    if (!items[index]?.disabled) {
      return index
    }
  }

  return null
}

function getCanvasCommandPaletteNextEnabledIndex({
  direction,
  fallbackIndex,
  itemCount,
  items,
  startIndex,
}: {
  direction: 'next' | 'previous'
  fallbackIndex: number
  itemCount: number
  items?: readonly CanvasCommandPaletteKeyboardItem[]
  startIndex: number
}) {
  const resolvedItemCount = getCanvasCommandPaletteKeyboardItemCount({
    itemCount,
    items,
  })
  const offset = direction === 'next' ? 1 : -1

  if (!items) {
    return clampCanvasCommandPaletteActiveIndex(
      startIndex + offset,
      resolvedItemCount,
    )
  }

  for (
    let index = startIndex + offset;
    index >= 0 && index < resolvedItemCount;
    index += offset
  ) {
    if (!items[index]?.disabled) {
      return index
    }
  }

  return fallbackIndex
}

function getCanvasCommandPaletteKeyboardItemCount({
  itemCount,
  items,
}: {
  itemCount: number
  items?: readonly CanvasCommandPaletteKeyboardItem[]
}) {
  return items?.length ?? itemCount
}

function clampCanvasCommandPaletteActiveIndex(
  activeIndex: number,
  itemCount: number,
) {
  const maxActiveIndex = Math.max(0, itemCount - 1)

  return Math.max(0, Math.min(activeIndex, maxActiveIndex))
}
