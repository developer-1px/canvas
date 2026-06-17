export type CanvasClientViewportSize = {
  height: number
  width: number
}

export type CanvasClientViewportSource = {
  innerHeight?: number
  innerWidth?: number
}

export function getCanvasClientViewportSize(
  source: CanvasClientViewportSource | null | undefined =
    getCanvasClientViewportSource(),
): CanvasClientViewportSize | null {
  const height = source?.innerHeight
  const width = source?.innerWidth

  if (
    typeof height !== 'number' ||
    typeof width !== 'number' ||
    !Number.isFinite(height) ||
    !Number.isFinite(width)
  ) {
    return null
  }

  return {
    height: Math.max(0, height),
    width: Math.max(0, width),
  }
}

function getCanvasClientViewportSource(): CanvasClientViewportSource | null {
  return typeof window === 'undefined' ? null : window
}
