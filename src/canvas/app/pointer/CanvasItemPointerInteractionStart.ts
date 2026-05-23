import type {
  CanvasItem,
  EditingText,
  Point,
} from '../../entities'
import type { CanvasItemReadModel } from '../../host'
import {
  getCanvasItemPointerIntent,
  getCanvasItemPointerSelection,
  type CanvasAffordanceConfig,
  type CanvasSceneAdapter,
} from '../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'

export type CanvasItemPointerInteractionStartResult =
  | {
      capturePointer: false
      clearLastClick?: boolean
      commitSelection?: string[]
      kind: 'none'
      liveItems?: CanvasItem[]
      selection?: string[]
    }
  | {
      capturePointer: true
      clearLastClick?: boolean
      commitSelection?: string[]
      interaction: Extract<Interaction, { kind: 'move' }>
      kind: 'move'
      liveItems?: CanvasItem[]
      selection?: string[]
    }

export type CanvasItemPointerInteractionStartInput = {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  config: CanvasAffordanceConfig
  input: CanvasAppPointerInput
  isDoubleClick: boolean
  itemId: string
  itemReadModel: CanvasItemReadModel
  items: CanvasItem[]
  scene: CanvasSceneAdapter
  selection: string[]
  startScreen: Point
  startWorld: Point
}

export function startCanvasItemPointerInteraction({
  cloneItems,
  config,
  input,
  isDoubleClick,
  itemId,
  itemReadModel,
  items,
  scene,
  selection,
  startScreen,
  startWorld,
}: CanvasItemPointerInteractionStartInput): CanvasItemPointerInteractionStartResult {
  const itemIntent = getCanvasItemPointerIntent({
    config,
    input,
    isDoubleClick,
  })
  const editItem =
    itemIntent.textEdit
      ? itemReadModel.findEditableTextItem(itemId)
      : null
  const itemSelection = getCanvasItemPointerSelection({
    additive: itemIntent.additive,
    itemId,
    scene,
    selection,
  })
  let nextSelection = itemSelection.nextSelection
  const historySelection = nextSelection
  const moveBounds = scene.getBounds(nextSelection)
  const commitSelection =
    itemIntent.additive || nextSelection !== selection
      ? nextSelection
      : undefined
  const clearLastClick = editItem ? true : undefined

  if (itemIntent.additive && itemSelection.alreadySelected) {
    return {
      capturePointer: false,
      clearLastClick,
      commitSelection,
      kind: 'none',
    }
  }

  let startItems = items
  let liveItems: CanvasItem[] | undefined
  let liveSelection: string[] | undefined
  const historyItems = items

  if (itemIntent.altDragDuplicate) {
    const clones = cloneItems(nextSelection, { x: 0, y: 0 })

    if (clones.length > 0) {
      nextSelection = clones.map((item) => item.id)
      startItems = [...items, ...clones]
      liveItems = startItems
      liveSelection = nextSelection
    }
  }

  if (!config.gestures.move) {
    return {
      capturePointer: false,
      clearLastClick,
      commitSelection,
      kind: 'none',
      liveItems,
      selection: liveSelection,
    }
  }

  return {
    capturePointer: true,
    clearLastClick,
    commitSelection,
    interaction: {
      kind: 'move',
      pointerId: input.pointerId,
      startScreen,
      startWorld,
      ids: nextSelection,
      bounds: moveBounds,
      historySelection,
      startItems,
      currentItems: startItems,
      historyItems,
      edit: editItem ? createCanvasItemEditState(editItem) : undefined,
      moved: false,
    },
    kind: 'move',
    liveItems,
    selection: liveSelection,
  }
}

function createCanvasItemEditState(
  item: NonNullable<ReturnType<CanvasItemReadModel['findEditableTextItem']>>,
): EditingText {
  return {
    id: item.id,
    value: item.type === 'rect' ? item.text ?? '' : item.text,
  }
}
