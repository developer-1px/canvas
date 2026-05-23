import type { CanvasPointerGesture } from '../../engine'
import type { Interaction } from './CanvasInteractionState'
import {
  CANVAS_POINTER_DRAWING_CREATION_KINDS,
} from './CanvasPointerDrawingCreation'
import {
  CANVAS_POINTER_CUSTOM_CREATION_KINDS,
} from './CanvasPointerCustomCreation'
import {
  CANVAS_POINTER_SHAPE_CREATION_KINDS,
} from './CanvasPointerShapeCreation'
import {
  CANVAS_POINTER_TEXT_CREATION_KINDS,
} from './CanvasPointerTextCreation'

const CANVAS_POINTER_CREATION_GESTURES = [
  ...CANVAS_POINTER_CUSTOM_CREATION_KINDS,
  ...CANVAS_POINTER_DRAWING_CREATION_KINDS,
  ...CANVAS_POINTER_SHAPE_CREATION_KINDS,
  ...CANVAS_POINTER_TEXT_CREATION_KINDS,
] as const satisfies readonly CanvasPointerGesture[]

const CANVAS_POINTER_CREATION_INTERACTION_KINDS = [
  ...CANVAS_POINTER_CUSTOM_CREATION_KINDS,
  ...CANVAS_POINTER_DRAWING_CREATION_KINDS,
  ...CANVAS_POINTER_SHAPE_CREATION_KINDS,
] as const satisfies readonly Interaction['kind'][]

export type CanvasPointerCreationGesture =
  (typeof CANVAS_POINTER_CREATION_GESTURES)[number]

export type CanvasPointerCreationInteraction = Extract<
  Interaction,
  { kind: (typeof CANVAS_POINTER_CREATION_INTERACTION_KINDS)[number] }
>

export function isCanvasPointerCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerCreationGesture {
  return includesCanvasPointerCreationValue(
    CANVAS_POINTER_CREATION_GESTURES,
    gesture,
  )
}

export function isCanvasPointerCreationInteraction(
  interaction: Interaction,
): interaction is CanvasPointerCreationInteraction {
  return includesCanvasPointerCreationValue(
    CANVAS_POINTER_CREATION_INTERACTION_KINDS,
    interaction.kind,
  )
}

function includesCanvasPointerCreationValue<TValue extends string>(
  values: readonly TValue[],
  value: string,
): value is TValue {
  return values.includes(value as TValue)
}
