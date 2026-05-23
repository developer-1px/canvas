import type {
  CanvasCustomItem,
  Point,
  Tool,
} from '../../entities'
import { isCanvasCustomToolId } from '../../core'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasPointerGesture,
  type CanvasSnapGuides,
} from '../../engine'
import { getCanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationToolRuntime'
import type { CanvasAppCustomCreationTool } from '../tools/CanvasAppCustomCreationTools'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

export const CANVAS_POINTER_CUSTOM_CREATION_KINDS = Object.freeze([
  'create-custom',
] as const satisfies readonly CanvasPointerGesture[])

export type CanvasPointerCustomCreationKind =
  (typeof CANVAS_POINTER_CUSTOM_CREATION_KINDS)[number]

export type CanvasPointerCustomCreationInteraction = Extract<
  Interaction,
  { kind: CanvasPointerCustomCreationKind }
>

export type CanvasPointerCustomCreationStartResult =
  | { kind: 'none' }
  | {
      capturePointer: true
      gesture: CanvasPointerCustomCreationKind
      interaction: CanvasPointerCustomCreationInteraction
      kind: 'interaction'
    }

export type CanvasPointerCustomCreationPreviewResult =
  | { kind: 'none' }
  | {
      interaction: CanvasPointerCustomCreationInteraction
      kind: 'preview'
      snapGuides: CanvasSnapGuides
    }

export type CanvasPointerCustomCreationCommitInput = {
  commitItemsChange: CommitCanvasItemsChange
  createId: (prefix: string) => string
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  interaction: CanvasPointerCustomCreationInteraction
  selection: string[]
}

export function isCanvasPointerCustomCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerCustomCreationKind {
  return hasCanvasPointerCustomCreationKind(gesture)
}

export function isCanvasPointerCustomCreationInteraction(
  interaction: Interaction,
): interaction is CanvasPointerCustomCreationInteraction {
  return hasCanvasPointerCustomCreationKind(interaction.kind)
}

export function startCanvasPointerCustomCreation({
  config,
  customCreationTools,
  input,
  pointerGesture,
  startScreen,
  startWorld,
  tool,
}: {
  config: CanvasAffordanceConfig
  customCreationTools: readonly CanvasAppCustomCreationTool[]
  input: CanvasAppPointerInput
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
  tool: Tool
}): CanvasPointerCustomCreationStartResult | null {
  if (
    !isCanvasPointerCustomCreationGesture(pointerGesture) ||
    !isCanvasCustomToolId(tool)
  ) {
    return null
  }

  if (!getCanvasAppCustomCreationTool(customCreationTools, tool)) {
    return { kind: 'none' }
  }

  const snappedStartWorld = snapCanvasPointToGrid({
    config,
    point: startWorld,
  })

  return {
    capturePointer: true,
    gesture: 'create-custom',
    interaction: {
      currentWorld: snappedStartWorld,
      kind: 'create-custom',
      moved: false,
      pointerId: input.pointerId,
      startScreen,
      startWorld: snappedStartWorld,
      tool,
    },
    kind: 'interaction',
  }
}

export function previewCanvasPointerCustomCreation({
  config,
  currentScreen,
  currentWorld,
  interaction,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  interaction: Interaction
}): CanvasPointerCustomCreationPreviewResult | null {
  if (!isCanvasPointerCustomCreationInteraction(interaction)) {
    return null
  }

  if (!config.gestures.createCustom) {
    return { kind: 'none' }
  }

  const moved = hasCanvasInteractionMoved({
    currentScreen,
    interaction,
  })
  const snappedCurrentWorld = snapCanvasPointToGrid({
    config,
    point: currentWorld,
  })

  return {
    interaction: {
      ...interaction,
      currentWorld: snappedCurrentWorld,
      moved,
    },
    kind: 'preview',
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

export function commitCanvasPointerCustomCreation({
  commitItemsChange,
  createId,
  customCreationTools,
  interaction,
  selection,
}: CanvasPointerCustomCreationCommitInput) {
  const customTool = getCanvasAppCustomCreationTool(
    customCreationTools,
    interaction.tool,
  )

  if (!customTool) {
    return false
  }

  try {
    const nextItem = customTool.createItem({
      createId,
      currentWorld: interaction.currentWorld,
      moved: interaction.moved,
      startWorld: interaction.startWorld,
    })

    return nextItem && isCanvasCustomCreationItem(nextItem)
      ? commitCanvasCustomItem({
          commitItemsChange,
          item: nextItem,
          selection,
        })
      : false
  } catch {
    // External creation tools must not strand the pointer lifecycle.
    return false
  }
}

function commitCanvasCustomItem({
  commitItemsChange,
  item,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  item: CanvasCustomItem
  selection: string[]
}) {
  return commitItemsChange({ type: 'add', items: [item] }, {
    before: selection,
    after: [item.id],
  })
}

function isCanvasCustomCreationItem(item: unknown): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom'
  )
}

function hasCanvasPointerCustomCreationKind(
  kind: string,
): kind is CanvasPointerCustomCreationKind {
  return CANVAS_POINTER_CUSTOM_CREATION_KINDS.includes(
    kind as CanvasPointerCustomCreationKind,
  )
}
