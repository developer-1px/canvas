import type {
  CanvasItem,
  Point,
} from '../../../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  createCanvasHighlight,
  createCanvasMarker,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasCreationItem,
  type CanvasDraftStrokeOverlay,
  type CanvasPointerGesture,
  type CanvasSnapGuides,
} from '../../../../engine'
import type {
  CanvasDrawingStrokeKind,
  CanvasDrawingStrokeStyle,
  CanvasDrawingStrokeStyleSet,
} from '../../../../host'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import type {
  CanvasPointerDrawingCreationKind,
} from './CanvasPointerCreationGrammar'
import {
  createCanvasDraftStroke,
  getNextCanvasDrawingPoints,
} from './CanvasPointerDrawing'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

export type CanvasPointerDrawingCreationInteraction = Extract<
  Interaction,
  { kind: CanvasPointerDrawingCreationKind }
>

type CanvasPointerDrawingCreationDescriptor = Readonly<{
  createItem: <TItem extends CanvasCreationItem>(input: {
    adapter: CanvasCreationAdapter<TItem>
    createId: (prefix: string) => string
    interaction: CanvasPointerDrawingCreationInteraction
    style: CanvasDrawingStrokeStyle
  }) => TItem
  isEnabled: (config: CanvasAffordanceConfig) => boolean
  strokeKind: CanvasDrawingStrokeKind
}>

const CANVAS_POINTER_DRAWING_CREATION_DESCRIPTORS = Object.freeze({
  'draw-highlight': Object.freeze({
    createItem: <TItem extends CanvasCreationItem>({
      adapter,
      createId,
      interaction,
      style,
    }: {
      adapter: CanvasCreationAdapter<TItem>
      createId: (prefix: string) => string
      interaction: CanvasPointerDrawingCreationInteraction
      style: CanvasDrawingStrokeStyle
    }) =>
      createCanvasHighlight({
        adapter,
        createId,
        points: interaction.points,
        startWorld: interaction.startWorld,
        style,
      }),
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.drawHighlight,
    strokeKind: 'highlight',
  }),
  'draw-marker': Object.freeze({
    createItem: <TItem extends CanvasCreationItem>({
      adapter,
      createId,
      interaction,
      style,
    }: {
      adapter: CanvasCreationAdapter<TItem>
      createId: (prefix: string) => string
      interaction: CanvasPointerDrawingCreationInteraction
      style: CanvasDrawingStrokeStyle
    }) =>
      createCanvasMarker({
        adapter,
        createId,
        points: interaction.points,
        startWorld: interaction.startWorld,
        style,
      }),
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.drawMarker,
    strokeKind: 'marker',
  }),
} satisfies Readonly<
  Record<CanvasPointerDrawingCreationKind, CanvasPointerDrawingCreationDescriptor>
>)

export type CanvasPointerDrawingCreationStartResult = {
  capturePointer: true
  draftStroke: CanvasDraftStrokeOverlay
  gesture: CanvasPointerDrawingCreationKind
  interaction: CanvasPointerDrawingCreationInteraction
  kind: 'interaction'
}

export type CanvasPointerDrawingCreationPreviewResult =
  | { kind: 'none' }
  | {
      draftStroke: CanvasDraftStrokeOverlay
      interaction: CanvasPointerDrawingCreationInteraction
      kind: 'preview'
      snapGuides: CanvasSnapGuides
    }

export function isCanvasPointerDrawingCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerDrawingCreationKind {
  return hasCanvasPointerDrawingCreationKind(gesture)
}

export function isCanvasPointerDrawingCreationInteraction(
  interaction: Interaction,
): interaction is CanvasPointerDrawingCreationInteraction {
  return hasCanvasPointerDrawingCreationKind(interaction.kind)
}

export function startCanvasPointerDrawingCreation({
  input,
  drawingStyles,
  pointerGesture,
  startScreen,
  startWorld,
}: {
  input: CanvasAppPointerInput
  drawingStyles: CanvasDrawingStrokeStyleSet
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
}): CanvasPointerDrawingCreationStartResult | null {
  if (!isCanvasPointerDrawingCreationGesture(pointerGesture)) {
    return null
  }

  const descriptor = getCanvasPointerDrawingCreationDescriptor(pointerGesture)
  const style = drawingStyles[descriptor.strokeKind]
  const interaction = {
    currentWorld: startWorld,
    kind: pointerGesture,
    moved: false,
    pointerId: input.pointerId,
    points: [startWorld],
    startScreen,
    startWorld,
    style,
  } satisfies CanvasPointerDrawingCreationInteraction

  return {
    capturePointer: true,
    draftStroke: createCanvasDraftStroke(
      descriptor.strokeKind,
      [startWorld],
      style,
    ),
    gesture: pointerGesture,
    interaction,
    kind: 'interaction',
  }
}

export function previewCanvasPointerDrawingCreation({
  config,
  currentScreen,
  currentWorld,
  input,
  interaction,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  input: CanvasAppPointerInput
  interaction: Interaction
}): CanvasPointerDrawingCreationPreviewResult | null {
  if (!isCanvasPointerDrawingCreationInteraction(interaction)) {
    return null
  }

  const descriptor = getCanvasPointerDrawingCreationDescriptor(
    interaction.kind,
  )

  if (!descriptor.isEnabled(config)) {
    return { kind: 'none' }
  }

  const moved = hasCanvasInteractionMoved({
    currentScreen,
    interaction,
  })
  const points = getNextCanvasDrawingPoints({
    currentWorld,
    points: interaction.points,
    shiftKey: input.shiftKey,
    startWorld: interaction.startWorld,
  })

  return {
    draftStroke: createCanvasDraftStroke(
      descriptor.strokeKind,
      points,
      interaction.style,
    ),
    interaction: {
      ...interaction,
      currentWorld,
      moved,
      points,
    },
    kind: 'preview',
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

export function commitCanvasPointerDrawingCreation({
  commitItemsChange,
  creationAdapter,
  createId,
  interaction,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  interaction: CanvasPointerDrawingCreationInteraction
  selection: string[]
}) {
  const descriptor = getCanvasPointerDrawingCreationDescriptor(
    interaction.kind,
  )
  const item = descriptor.createItem({
    adapter: creationAdapter,
    createId,
    interaction,
    style: interaction.style,
  })

  commitItemsChange({ type: 'add', items: [item] }, {
    before: selection,
    after: selection,
  })
}

function getCanvasPointerDrawingCreationDescriptor(
  kind: CanvasPointerDrawingCreationKind,
) {
  return CANVAS_POINTER_DRAWING_CREATION_DESCRIPTORS[kind]
}

function hasCanvasPointerDrawingCreationKind(
  kind: string,
): kind is CanvasPointerDrawingCreationKind {
  return Object.prototype.hasOwnProperty.call(
    CANVAS_POINTER_DRAWING_CREATION_DESCRIPTORS,
    kind,
  )
}
