import type {
  CanvasItem,
  EditingText,
  Point,
} from '../../../../entities'
import {
  createCanvasText,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasPointerGesture,
} from '../../../../engine'
import {
  CANVAS_POINTER_TEXT_CREATION_KINDS,
  type CanvasPointerTextCreationKind,
} from './CanvasPointerCreationGrammar'

export type CanvasPointerTextCreationStartResult =
  | { kind: 'none' }
  | {
      capturePointer: false
      edit: EditingText
      item: CanvasItem
      kind: 'created-text'
    }

export function isCanvasPointerTextCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerTextCreationKind {
  return CANVAS_POINTER_TEXT_CREATION_KINDS.includes(
    gesture as CanvasPointerTextCreationKind,
  )
}

export function startCanvasPointerTextCreation({
  config,
  creationAdapter,
  createId,
  pointerGesture,
  startWorld,
}: {
  config: CanvasAffordanceConfig
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  pointerGesture: CanvasPointerGesture
  startWorld: Point
}): CanvasPointerTextCreationStartResult | null {
  if (!isCanvasPointerTextCreationGesture(pointerGesture)) {
    return null
  }

  if (!config.gestures.createText) {
    return { kind: 'none' }
  }

  const created = createCanvasText({
    adapter: creationAdapter,
    createId,
    point: startWorld,
  })

  return {
    capturePointer: false,
    edit: { id: created.item.id, value: created.editValue },
    item: created.item,
    kind: 'created-text',
  }
}
