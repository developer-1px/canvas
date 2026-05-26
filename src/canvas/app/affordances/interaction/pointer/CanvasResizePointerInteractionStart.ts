import type {
  Bounds,
  CanvasItem,
  Point,
  ResizeHandle,
} from '../../../../entities'
import type { CanvasAffordanceConfig } from '../../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'

export type CanvasResizePointerInteractionStartInput = {
  config: CanvasAffordanceConfig
  handle: ResizeHandle
  input: CanvasAppPointerInput
  items: CanvasItem[]
  selectedBounds: Bounds | null
  selection: string[]
  startScreen: Point
  startWorld: Point
}

export type CanvasResizePointerInteractionStartResult =
  | { capturePointer: false; kind: 'none' }
  | {
      capturePointer: true
      gesture: 'resize'
      interaction: Extract<Interaction, { kind: 'resize' }>
      kind: 'resize'
    }

export function startCanvasResizePointerInteraction({
  config,
  handle,
  input,
  items,
  selectedBounds,
  selection,
  startScreen,
  startWorld,
}: CanvasResizePointerInteractionStartInput): CanvasResizePointerInteractionStartResult {
  if (input.button !== 0 || !selectedBounds || !config.gestures.resize) {
    return { capturePointer: false, kind: 'none' }
  }

  return {
    capturePointer: true,
    gesture: 'resize',
    interaction: {
      kind: 'resize',
      pointerId: input.pointerId,
      handle,
      startScreen,
      startWorld,
      ids: selection,
      bounds: selectedBounds,
      startItems: items,
      currentItems: items,
      historyItems: items,
      moved: false,
    },
    kind: 'resize',
  }
}
