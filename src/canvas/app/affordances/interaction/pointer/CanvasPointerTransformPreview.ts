import type {
  CanvasArrowEndpoint,
  ArrowItem,
  CanvasItem,
  Point,
  Viewport,
} from '../../../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  getCanvasMoveSnap,
  moveCanvasSelection,
  resizeCanvasSelection,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
  type CanvasTransformAdapter,
} from '../../../../engine'
import {
  isCanvasArrowDrawingItem,
  syncCanvasDrawingItemBounds,
} from '../../../../host'
import {
  getCanvasPointerTransformModifierState,
  type CanvasAppPointerInput,
} from './CanvasAppPointerInput'
import {
  getCanvasAxisLockedDragDelta,
} from './CanvasPointerDragModifiers'
import {
  findCanvasSceneTargetAtPoint,
  resolveCanvasArrowEndpoints,
} from './CanvasPointerArrowAnchors'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'
import type { CanvasPointerTransformInteraction } from './CanvasPointerTransformInteraction'

type CanvasPointerTransformPreviewInput = {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  input: CanvasAppPointerInput
  interaction: CanvasPointerTransformInteraction
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  scene: CanvasSceneAdapter
  transformAdapter: CanvasTransformAdapter<CanvasItem>
  viewport: Viewport
}

export type CanvasPointerTransformPreviewResult =
  | { kind: 'none' }
  | {
      interaction: CanvasPointerTransformInteraction
      kind: 'preview'
      liveItems: CanvasItem[]
      selection?: string[]
      snapGuides: CanvasSnapGuides
    }

export function previewCanvasPointerTransform({
  config,
  currentScreen,
  currentWorld,
  input,
  interaction,
  cloneItems,
  scene,
  transformAdapter,
  viewport,
}: CanvasPointerTransformPreviewInput): CanvasPointerTransformPreviewResult {
  if (interaction.kind === 'arrow-endpoint') {
    if (!config.gestures.resize) {
      return { kind: 'none' }
    }

    const moved = hasCanvasInteractionMoved({
      currentScreen,
      interaction,
    })

    if (!moved) {
      return { kind: 'none' }
    }

    const snappedCurrentWorld = snapCanvasPointToGrid({
      config,
      point: currentWorld,
    })
    const nextItems = updateCanvasArrowEndpointItems({
      arrowId: interaction.arrowId,
      endpoint: interaction.endpoint,
      items: interaction.startItems,
      point: snappedCurrentWorld,
      scene,
    })

    return {
      interaction: {
        ...interaction,
        currentItems: nextItems,
        currentWorld: snappedCurrentWorld,
        moved: true,
      },
      kind: 'preview',
      liveItems: nextItems,
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
  }

  if (interaction.kind === 'move') {
    if (!config.gestures.move) {
      return { kind: 'none' }
    }

    const moved = hasCanvasInteractionMoved({
      currentScreen,
      interaction,
    })

    if (!moved) {
      return { kind: 'none' }
    }

    const moveInteraction = startCanvasPointerMoveDragPreview({
      cloneItems,
      interaction,
    })
    const rawDelta = {
      dx: currentWorld.x - moveInteraction.startWorld.x,
      dy: currentWorld.y - moveInteraction.startWorld.y,
    }
    const delta = input.shiftKey
      ? getCanvasAxisLockedDragDelta(rawDelta)
      : rawDelta
    const snap = moveInteraction.bounds
      ? getCanvasMoveSnap({
          bounds: moveInteraction.bounds,
          config,
          dx: delta.dx,
          dy: delta.dy,
          scene,
          selection: moveInteraction.ids,
          viewport,
        })
      : {
          ...EMPTY_CANVAS_SNAP_GUIDES,
          dx: delta.dx,
          dy: delta.dy,
        }
    const nextItems = moveCanvasSelection({
      adapter: transformAdapter,
      dx: snap.dx,
      dy: snap.dy,
      items: moveInteraction.startItems,
      selection: moveInteraction.ids,
    })
    const { selection: previewSelection, ...nextInteraction } =
      moveInteraction

    return {
      interaction: {
        ...nextInteraction,
        currentItems: nextItems,
        duplicateOnDrag: false,
        moved: true,
      },
      kind: 'preview',
      liveItems: nextItems,
      selection: previewSelection,
      snapGuides: {
        alignmentGuides: snap.alignmentGuides,
        spacingGuides: snap.spacingGuides,
      },
    }
  }

  if (!config.gestures.resize) {
    return { kind: 'none' }
  }

  const moved = hasCanvasInteractionMoved({
    currentScreen,
    interaction,
  })

  if (!moved) {
    return { kind: 'none' }
  }

  const snappedCurrentWorld = snapCanvasPointToGrid({
    config,
    point: currentWorld,
  })
  const modifierState = getCanvasPointerTransformModifierState(input)
  const nextItems = resizeCanvasSelection({
    adapter: transformAdapter,
    bounds: interaction.bounds,
    handle: interaction.handle,
    items: interaction.startItems,
    point: snappedCurrentWorld,
    preserveAspectRatio: modifierState.preserveAspectRatio,
    resizeFromCenter: modifierState.resizeFromCenter,
    selection: interaction.ids,
  })

  return {
    interaction: {
      ...interaction,
      currentItems: nextItems,
      moved: true,
    },
    kind: 'preview',
    liveItems: nextItems,
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

function startCanvasPointerMoveDragPreview({
  cloneItems,
  interaction,
}: {
  cloneItems: (ids: string[], offset: Point) => CanvasItem[]
  interaction: Extract<CanvasPointerTransformInteraction, { kind: 'move' }>
}): Extract<CanvasPointerTransformInteraction, { kind: 'move' }> & {
  selection?: string[]
} {
  if (!interaction.duplicateOnDrag) {
    return interaction
  }

  const clones = cloneItems(interaction.ids, { x: 0, y: 0 })

  if (clones.length === 0) {
    return {
      ...interaction,
      duplicateOnDrag: false,
    }
  }

  const selection = clones.map((item) => item.id)
  const startItems = [...interaction.startItems, ...clones]

  return {
    ...interaction,
    clickSelection: undefined,
    currentItems: startItems,
    duplicateOnDrag: false,
    ids: selection,
    selection,
    startItems,
  }
}

function updateCanvasArrowEndpointItems({
  arrowId,
  endpoint,
  items,
  point,
  scene,
}: {
  arrowId: string
  endpoint: CanvasArrowEndpoint
  items: CanvasItem[]
  point: Point
  scene: CanvasSceneAdapter
}) {
  return items.map((item) =>
    item.id === arrowId && isCanvasArrowDrawingItem(item)
      ? updateCanvasArrowEndpoint({
          endpoint,
          item,
          point,
          scene,
        })
      : item,
  )
}

function updateCanvasArrowEndpoint({
  endpoint,
  item,
  point,
  scene,
}: {
  endpoint: CanvasArrowEndpoint
  item: ArrowItem
  point: Point
  scene: CanvasSceneAdapter
}) {
  const otherAttachedTo = endpoint === 'start'
    ? item.endAttachedTo
    : item.startAttachedTo
  const attachedTo = findCanvasSceneTargetAtPoint({
    excludeIds: [
      item.id,
      ...(otherAttachedTo ? [otherAttachedTo] : []),
    ],
    point,
    scene,
  })
  const resolved = resolveCanvasArrowEndpoints({
    end: endpoint === 'end' ? point : item.end,
    endAttachedTo: endpoint === 'end' ? attachedTo : item.endAttachedTo,
    scene,
    start: endpoint === 'start' ? point : item.start,
    startAttachedTo: endpoint === 'start'
      ? attachedTo
      : item.startAttachedTo,
  })

  return syncCanvasDrawingItemBounds({
    ...item,
    end: resolved.end,
    endAttachedTo: resolved.endAttachedTo,
    start: resolved.start,
    startAttachedTo: resolved.startAttachedTo,
  })
}
