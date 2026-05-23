import type {
  Bounds,
  CanvasItem,
  EditingText,
  Point,
  Tool,
  Viewport,
} from '../../entities'
import {
  isCanvasCustomToolId,
  normalizeBounds,
} from '../../core'
import {
  createCanvasText,
  getCanvasPointerGesture,
  isAdditivePointerInput,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftStrokeOverlay,
} from '../../engine'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import { getCanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationToolRuntime'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { createCanvasDraftStroke } from './CanvasPointerDrawing'

export type CanvasPointerInteractionStartResult =
  | { kind: 'none' }
  | {
      kind: 'interaction'
      capturePointer: true
      clearSelection?: boolean
      draftArrow?: CanvasDraftArrowOverlay
      draftRect?: Bounds
      draftStroke?: CanvasDraftStrokeOverlay
      gesture: Interaction['kind']
      interaction: Interaction
    }
  | {
      kind: 'created-text'
      capturePointer: false
      edit: EditingText
      item: CanvasItem
    }

export type CanvasPointerInteractionStartInput = {
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  input: CanvasAppPointerInput
  selection: string[]
  spaceDown: boolean
  startScreen: Point
  startWorld: Point
  tool: Tool
  viewport: Viewport
}

export function startCanvasPointerInteraction({
  config,
  creationAdapter,
  createId,
  customCreationTools,
  input,
  selection,
  spaceDown,
  startScreen,
  startWorld,
  tool,
  viewport,
}: CanvasPointerInteractionStartInput): CanvasPointerInteractionStartResult {
  const pointerGesture = getCanvasPointerGesture({
    config,
    input,
    spaceDown,
    tool,
  })

  if (pointerGesture === 'none') {
    return { kind: 'none' }
  }

  if (pointerGesture === 'pan') {
    return {
      kind: 'interaction',
      capturePointer: true,
      gesture: 'pan',
      interaction: {
        kind: 'pan',
        pointerId: input.pointerId,
        startScreen,
        origin: viewport,
      },
    }
  }

  if (pointerGesture === 'create-rect') {
    const snappedStartWorld = snapCanvasPointToGrid({
      config,
      point: startWorld,
    })

    return {
      kind: 'interaction',
      capturePointer: true,
      draftRect: normalizeBounds(snappedStartWorld, snappedStartWorld),
      gesture: 'create-rect',
      interaction: {
        kind: 'create-rect',
        pointerId: input.pointerId,
        startScreen,
        startWorld: snappedStartWorld,
        currentWorld: snappedStartWorld,
        moved: false,
      },
    }
  }

  if (pointerGesture === 'draw-marker' || pointerGesture === 'draw-highlight') {
    const kind = pointerGesture === 'draw-marker' ? 'marker' : 'highlight'

    return {
      kind: 'interaction',
      capturePointer: true,
      draftStroke: createCanvasDraftStroke(kind, [startWorld]),
      gesture: pointerGesture,
      interaction: {
        kind: pointerGesture,
        pointerId: input.pointerId,
        startScreen,
        startWorld,
        currentWorld: startWorld,
        points: [startWorld],
        moved: false,
      },
    }
  }

  if (pointerGesture === 'create-arrow') {
    const snappedStartWorld = snapCanvasPointToGrid({
      config,
      point: startWorld,
    })

    return {
      kind: 'interaction',
      capturePointer: true,
      draftArrow: {
        end: snappedStartWorld,
        start: snappedStartWorld,
      },
      gesture: 'create-arrow',
      interaction: {
        kind: 'create-arrow',
        pointerId: input.pointerId,
        startScreen,
        startWorld: snappedStartWorld,
        currentWorld: snappedStartWorld,
        moved: false,
      },
    }
  }

  if (pointerGesture === 'create-custom' && isCanvasCustomToolId(tool)) {
    if (!getCanvasAppCustomCreationTool(customCreationTools, tool)) {
      return { kind: 'none' }
    }

    const snappedStartWorld = snapCanvasPointToGrid({
      config,
      point: startWorld,
    })

    return {
      kind: 'interaction',
      capturePointer: true,
      gesture: 'create-custom',
      interaction: {
        kind: 'create-custom',
        pointerId: input.pointerId,
        startScreen,
        startWorld: snappedStartWorld,
        currentWorld: snappedStartWorld,
        tool,
        moved: false,
      },
    }
  }

  if (pointerGesture === 'create-text') {
    if (!config.gestures.createText) {
      return { kind: 'none' }
    }

    const created = createCanvasText({
      adapter: creationAdapter,
      createId,
      point: startWorld,
    })

    return {
      kind: 'created-text',
      capturePointer: false,
      edit: { id: created.item.id, value: created.editValue },
      item: created.item,
    }
  }

  const additive = isAdditivePointerInput(input)

  return {
    kind: 'interaction',
    capturePointer: true,
    clearSelection: !additive,
    gesture: 'marquee',
    interaction: {
      kind: 'marquee',
      pointerId: input.pointerId,
      startScreen,
      startWorld,
      currentWorld: startWorld,
      additive,
      baseSelection: selection,
      moved: false,
    },
  }
}
