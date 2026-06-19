export type CanvasCommandPaletteKeyboardIntentInput = {
  activeIndex: number
  itemCount: number
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
  key,
}: CanvasCommandPaletteKeyboardIntentInput): CanvasCommandPaletteKeyboardIntent {
  const clampedActiveIndex = clampCanvasCommandPaletteActiveIndex(
    activeIndex,
    itemCount,
  )

  if (key === 'ArrowDown') {
    return {
      activeIndex: clampCanvasCommandPaletteActiveIndex(
        clampedActiveIndex + 1,
        itemCount,
      ),
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'ArrowUp') {
    return {
      activeIndex: clampCanvasCommandPaletteActiveIndex(
        clampedActiveIndex - 1,
        itemCount,
      ),
      kind: 'move-active',
      preventDefault: true,
      stopPropagation: true,
    }
  }

  if (key === 'Enter' && itemCount > 0) {
    return {
      activeIndex: clampedActiveIndex,
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

function clampCanvasCommandPaletteActiveIndex(
  activeIndex: number,
  itemCount: number,
) {
  const maxActiveIndex = Math.max(0, itemCount - 1)

  return Math.max(0, Math.min(activeIndex, maxActiveIndex))
}
