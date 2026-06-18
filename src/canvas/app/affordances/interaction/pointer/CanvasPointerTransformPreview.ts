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
      snapGuides: CanvasSnapGuides
    }

export function previewCanvasPointerTransform({
  config,
  currentScreen,
  currentWorld,
  input,
  interaction,
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

    const dx = currentWorld.x - interaction.startWorld.x
    const dy = currentWorld.y - interaction.startWorld.y
    const snap = interaction.bounds
      ? getCanvasMoveSnap({
          bounds: interaction.bounds,
          config,
          dx,
          dy,
          scene,
          selection: interaction.ids,
          viewport,
        })
      : {
          ...EMPTY_CANVAS_SNAP_GUIDES,
          dx,
          dy,
        }
    const nextItems = moveCanvasSelection({
      adapter: transformAdapter,
      dx: snap.dx,
      dy: snap.dy,
      items: interaction.startItems,
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
