import type { CanvasPointerGesture } from '../../../../engine'
import type { Interaction } from './CanvasInteractionState'

export const CANVAS_POINTER_CUSTOM_CREATION_KINDS = Object.freeze([
  'create-custom',
] as const satisfies readonly CanvasPointerGesture[])

export type CanvasPointerCustomCreationKind =
  (typeof CANVAS_POINTER_CUSTOM_CREATION_KINDS)[number]

export const CANVAS_POINTER_COMMENT_CREATION_KINDS = Object.freeze([
  'create-comment',
] as const satisfies readonly CanvasPointerGesture[])

export type CanvasPointerCommentCreationKind =
  (typeof CANVAS_POINTER_COMMENT_CREATION_KINDS)[number]

export const CANVAS_POINTER_COMPONENT_CREATION_KINDS = Object.freeze([
  'create-section',
] as const satisfies readonly CanvasPointerGesture[])

export const CANVAS_POINTER_FOUNDATION_EXTENSION_CREATION_KINDS = Object.freeze([
  'create-sticky',
] as const satisfies readonly CanvasPointerGesture[])

export type CanvasPointerComponentCreationKind =
  (typeof CANVAS_POINTER_COMPONENT_CREATION_KINDS)[number]

export const CANVAS_POINTER_DRAWING_CREATION_KINDS = Object.freeze([
  'draw-highlight',
  'draw-marker',
  'draw-path',
] as const satisfies readonly CanvasPointerGesture[])

export type CanvasPointerDrawingCreationKind =
  (typeof CANVAS_POINTER_DRAWING_CREATION_KINDS)[number]

export const CANVAS_POINTER_SHAPE_CREATION_KINDS = Object.freeze([
  'create-arrow',
  'create-shape',
] as const satisfies readonly CanvasPointerGesture[])

export type CanvasPointerShapeCreationKind =
  (typeof CANVAS_POINTER_SHAPE_CREATION_KINDS)[number]

export const CANVAS_POINTER_TEXT_CREATION_KINDS = Object.freeze([
  'create-text',
] as const satisfies readonly CanvasPointerGesture[])

export type CanvasPointerTextCreationKind =
  (typeof CANVAS_POINTER_TEXT_CREATION_KINDS)[number]

const CANVAS_POINTER_CREATION_GESTURES = [
  ...CANVAS_POINTER_COMMENT_CREATION_KINDS,
  ...CANVAS_POINTER_COMPONENT_CREATION_KINDS,
  ...CANVAS_POINTER_FOUNDATION_EXTENSION_CREATION_KINDS,
  ...CANVAS_POINTER_CUSTOM_CREATION_KINDS,
  ...CANVAS_POINTER_DRAWING_CREATION_KINDS,
  ...CANVAS_POINTER_SHAPE_CREATION_KINDS,
  ...CANVAS_POINTER_TEXT_CREATION_KINDS,
] as const satisfies readonly CanvasPointerGesture[]

const CANVAS_POINTER_CREATION_INTERACTION_KINDS = [
  'create-section',
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
