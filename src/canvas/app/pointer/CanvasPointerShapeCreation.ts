import type {
  Bounds,
  CanvasItem,
  Point,
  Tool,
} from '../../entities'
import {
  normalizeBounds,
} from '../../core'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  type CanvasSceneAdapter,
  createCanvasArrow,
  createCanvasRect,
  snapCanvasPointToGrid,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasCreationItem,
  type CanvasDraftArrowOverlay,
  type CanvasPointerGesture,
  type CanvasSnapGuides,
} from '../../engine'
import type { CommitCanvasItemsChange } from '../workflow/CanvasWorkflowContract'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import type {
  CanvasPointerShapeCreationKind,
} from './CanvasPointerCreationGrammar'
import {
  findCanvasSceneTargetAtPoint,
  resolveCanvasArrowEndpoints,
} from './CanvasPointerArrowAnchors'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'

export type CanvasPointerShapeCreationInteraction = Extract<
  Interaction,
  { kind: CanvasPointerShapeCreationKind }
>

type CanvasPointerShapeCreationDraft = Readonly<{
  draftArrow?: CanvasDraftArrowOverlay
  draftRect?: Bounds
}>

type CanvasPointerShapeCreationDescriptor = Readonly<{
  createDraft: (input: {
    currentWorld: Point
    startWorld: Point
  }) => CanvasPointerShapeCreationDraft
  createItem: <TItem extends CanvasCreationItem>(input: {
    adapter: CanvasCreationAdapter<TItem>
    createId: (prefix: string) => string
    interaction: CanvasPointerShapeCreationInteraction
  }) => TItem
  isEnabled: (config: CanvasAffordanceConfig) => boolean
  selectAfterCommit: boolean
}>

const CANVAS_POINTER_SHAPE_CREATION_DESCRIPTORS = Object.freeze({
  'create-arrow': Object.freeze({
    createDraft: ({ currentWorld, startWorld }) => ({
      draftArrow: {
        end: currentWorld,
        start: startWorld,
      },
    }),
    createItem: <TItem extends CanvasCreationItem>({
      adapter,
      createId,
      interaction,
    }: {
      adapter: CanvasCreationAdapter<TItem>
      createId: (prefix: string) => string
      interaction: CanvasPointerShapeCreationInteraction
    }) => {
      const arrowInteraction =
        interaction.kind === 'create-arrow' ? interaction : null

      return createCanvasArrow({
        adapter,
        createId,
        currentWorld: interaction.currentWorld,
        endAttachedTo: arrowInteraction?.endAttachedTo,
        startAttachedTo: arrowInteraction?.startAttachedTo,
        startWorld: interaction.startWorld,
      })
    },
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.createArrow,
    selectAfterCommit: false,
  }),
  'create-rect': Object.freeze({
    createDraft: ({ currentWorld, startWorld }) => ({
      draftRect: normalizeBounds(startWorld, currentWorld),
    }),
    createItem: <TItem extends CanvasCreationItem>({
      adapter,
      createId,
      interaction,
    }: {
      adapter: CanvasCreationAdapter<TItem>
      createId: (prefix: string) => string
      interaction: CanvasPointerShapeCreationInteraction
    }) =>
      createCanvasRect({
        adapter,
        createId,
        currentWorld: interaction.currentWorld,
        startWorld: interaction.startWorld,
      }),
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.createRect,
    selectAfterCommit: true,
  }),
} satisfies Readonly<
  Record<CanvasPointerShapeCreationKind, CanvasPointerShapeCreationDescriptor>
>)

export type CanvasPointerShapeCreationStartResult = {
  capturePointer: true
  draftArrow?: CanvasDraftArrowOverlay
  draftRect?: Bounds
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
}: {
  config: CanvasAffordanceConfig
  input: CanvasAppPointerInput
  pointerGesture: CanvasPointerGesture
  startScreen: Point
  startWorld: Point
  targetItemId?: string
}): CanvasPointerShapeCreationStartResult | null {
  if (!isCanvasPointerShapeCreationGesture(pointerGesture)) {
    return null
  }

  const descriptor = getCanvasPointerShapeCreationDescriptor(pointerGesture)
  const snappedStartWorld = snapCanvasPointToGrid({
    config,
    point: startWorld,
  })
  const interaction = {
    currentWorld: snappedStartWorld,
    kind: pointerGesture,
    moved: false,
    pointerId: input.pointerId,
    startAttachedTo: pointerGesture === 'create-arrow'
      ? targetItemId
      : undefined,
    startScreen,
    startWorld: snappedStartWorld,
  } satisfies CanvasPointerShapeCreationInteraction

  return {
    ...descriptor.createDraft({
      currentWorld: snappedStartWorld,
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

function getCanvasPointerShapeCreationDescriptor(
  kind: CanvasPointerShapeCreationKind,
) {
  return CANVAS_POINTER_SHAPE_CREATION_DESCRIPTORS[kind]
}

function hasCanvasPointerShapeCreationKind(
  kind: string,
): kind is CanvasPointerShapeCreationKind {
  return Object.prototype.hasOwnProperty.call(
    CANVAS_POINTER_SHAPE_CREATION_DESCRIPTORS,
    kind,
  )
}
