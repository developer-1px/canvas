import type {
  CanvasItem,
  Point,
  Tool,
} from '../../../entities'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasSceneAdapter,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasDraftArrowOverlay,
  type CanvasDraftShapeOverlay,
  type CanvasPointerGesture,
  type CanvasSnapGuides,
} from '../../../engine'
import { getCanvasToolShapeKind } from '../../../host'
import type { CommitCanvasItemsChange } from '../../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import type {
  CanvasPointerShapeCreationKind,
} from './CanvasPointerCreationGrammar'
import {
  findCanvasSceneTargetAtPoint,
  resolveCanvasArrowEndpoints,
} from './CanvasPointerArrowAnchors'
import {
  getCanvasPointerShapeCreationDescriptor,
  hasCanvasPointerShapeCreationKind,
  type CanvasPointerShapeCreationDraft,
} from './CanvasPointerShapeCreationDescriptors'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

export type CanvasPointerShapeCreationInteraction = Extract<
  Interaction,
  { kind: CanvasPointerShapeCreationKind }
>

export type CanvasPointerShapeCreationStartResult = {
  capturePointer: true
  draftArrow?: CanvasDraftArrowOverlay
  draftRect?: CanvasDraftShapeOverlay
  gesture: CanvasPointerShapeCreationKind
  interaction: CanvasPointerShapeCreationInteraction
  kind: 'interaction'
}

export type CanvasPointerShapeCreationPreviewResult =
  | { kind: 'none' }
  | ({
      interaction: CanvasPointerShapeCreationInteraction
      kind: 'preview'
      snapGuides: CanvasSnapGuides
    } & CanvasPointerShapeCreationDraft)

export function isCanvasPointerShapeCreationGesture(
  gesture: CanvasPointerGesture,
): gesture is CanvasPointerShapeCreationKind {
  return hasCanvasPointerShapeCreationKind(gesture)
}

export function isCanvasPointerShapeCreationInteraction(
  interaction: Interaction,
): interaction is CanvasPointerShapeCreationInteraction {
  return hasCanvasPointerShapeCreationKind(interaction.kind)
}

export function startCanvasPointerShapeCreation({
  config,
  input,
  pointerGesture,
  startScreen,
  startWorld,
  targetItemId,
  tool,
}: {
  config: CanvasAffordanceConfig
  input: CanvasAppPointerInput
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
  targetItemId?: string
  tool: Tool
}): CanvasPointerShapeCreationStartResult | null {
  if (!isCanvasPointerShapeCreationGesture(pointerGesture)) {
    return null
  }

  const descriptor = getCanvasPointerShapeCreationDescriptor(pointerGesture)
  const snappedStartWorld = snapCanvasPointToGrid({
    config,
    point: startWorld,
  })
  let interaction: CanvasPointerShapeCreationInteraction

  if (pointerGesture === 'create-arrow') {
    interaction = {
      currentWorld: snappedStartWorld,
      kind: 'create-arrow',
      moved: false,
      pointerId: input.pointerId,
      startAttachedTo: targetItemId,
      startScreen,
      startWorld: snappedStartWorld,
    }
  } else {
    const shape = getCanvasToolShapeKind(tool)

    if (!shape) {
      return null
    }

    interaction = {
      currentWorld: snappedStartWorld,
      kind: 'create-shape',
      moved: false,
      pointerId: input.pointerId,
      shape,
      startScreen,
      startWorld: snappedStartWorld,
    }
  }

  return {
    ...descriptor.createDraft({
      currentWorld: snappedStartWorld,
      interaction,
      startWorld: snappedStartWorld,
    }),
    capturePointer: true,
    gesture: pointerGesture,
    interaction,
    kind: 'interaction',
  }
}

export function previewCanvasPointerShapeCreation({
  config,
  currentScreen,
  currentWorld,
  interaction,
  scene,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  interaction: Interaction
  scene: CanvasSceneAdapter
}): CanvasPointerShapeCreationPreviewResult | null {
  if (!isCanvasPointerShapeCreationInteraction(interaction)) {
    return null
  }

  const descriptor = getCanvasPointerShapeCreationDescriptor(
    interaction.kind,
  )

  if (!descriptor.isEnabled(config)) {
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
  const nextInteraction = resolveCanvasPointerShapeCreationArrowAnchors({
    interaction: {
      ...interaction,
      currentWorld: snappedCurrentWorld,
      moved,
    },
    scene,
  })

  return {
    ...descriptor.createDraft({
      currentWorld: nextInteraction.currentWorld,
      interaction: nextInteraction,
      startWorld: nextInteraction.startWorld,
    }),
    interaction: nextInteraction,
    kind: 'preview',
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

export function commitCanvasPointerShapeCreation({
  commitItemsChange,
  creationAdapter,
  createId,
  interaction,
  scene,
  selection,
  setTool,
}: {
  commitItemsChange: CommitCanvasItemsChange
  creationAdapter: CanvasCreationAdapter<CanvasItem>
  createId: (prefix: string) => string
  interaction: CanvasPointerShapeCreationInteraction
  scene: CanvasSceneAdapter
  selection: string[]
  setTool: (tool: Tool) => void
}) {
  const descriptor = getCanvasPointerShapeCreationDescriptor(
    interaction.kind,
  )
  const resolvedInteraction = attachCanvasPointerShapeCreationEnd({
    interaction,
    scene,
  })
  const item = descriptor.createItem({
    adapter: creationAdapter,
    createId,
    interaction: resolvedInteraction,
  })

  commitItemsChange({ type: 'add', items: [item] }, {
    before: selection,
    after: [item.id],
  })

  if (descriptor.selectAfterCommit) {
    setTool('select')
  }
}

function attachCanvasPointerShapeCreationEnd({
  interaction,
  scene,
}: {
  interaction: CanvasPointerShapeCreationInteraction
  scene: CanvasSceneAdapter
}): CanvasPointerShapeCreationInteraction {
  if (interaction.kind !== 'create-arrow') {
    return interaction
  }

  return resolveCanvasPointerShapeCreationArrowAnchors({ interaction, scene })
}

function resolveCanvasPointerShapeCreationArrowAnchors({
  interaction,
  scene,
}: {
  interaction: CanvasPointerShapeCreationInteraction
  scene: CanvasSceneAdapter
}): CanvasPointerShapeCreationInteraction {
  if (interaction.kind !== 'create-arrow') {
    return interaction
  }

  const endAttachedTo = findCanvasSceneTargetAtPoint({
    excludeIds: interaction.startAttachedTo
      ? [interaction.startAttachedTo]
      : [],
    point: interaction.currentWorld,
    scene,
  })
  const resolved = resolveCanvasArrowEndpoints({
    end: interaction.currentWorld,
    endAttachedTo,
    scene,
    start: interaction.startWorld,
    startAttachedTo: interaction.startAttachedTo,
  })

  return {
    ...interaction,
    currentWorld: resolved.end,
    endAttachedTo: resolved.endAttachedTo,
    startWorld: resolved.start,
  }
}
