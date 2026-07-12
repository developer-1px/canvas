import type {
  Bounds,
  Point,
} from '../../../../entities'
import { normalizeBounds } from '../../../../core'
import {
  EMPTY_CANVAS_SNAP_GUIDES,
  getCanvasMarqueeSelection,
  isAdditivePointerInput,
  type CanvasAffordanceConfig,
  type CanvasSceneAdapter,
  type CanvasSnapGuides,
} from '../../../../engine'
import type { CanvasAppPointerInput } from './CanvasAppPointerInput'
import type { Interaction } from './CanvasInteractionState'
import { hasCanvasInteractionMoved } from './CanvasPointerInteractionMovement'
import type { CommitCanvasSelection } from '../../../workflow/CanvasWorkflowContract'

export type CanvasPointerMarqueeInteraction = Extract<
  Interaction,
  { kind: 'marquee' }
>

export type CanvasPointerMarqueeStartResult = {
  capturePointer: true
  clearSelection: boolean
  gesture: 'marquee'
  interaction: CanvasPointerMarqueeInteraction
}

export type CanvasPointerMarqueePreviewResult =
  | { kind: 'none' }
  | {
      interaction: CanvasPointerMarqueeInteraction
      kind: 'preview'
      marquee?: Bounds
      selection?: string[]
      snapGuides: CanvasSnapGuides
    }

export function startCanvasPointerMarqueeInteraction({
  input,
  selection,
  startScreen,
  startWorld,
}: {
  input: CanvasAppPointerInput
  selection: string[]
  startScreen: Point
  startWorld: Point
}): CanvasPointerMarqueeStartResult {
  const additive = isAdditivePointerInput(input)

  return {
    capturePointer: true,
    clearSelection: !additive,
    gesture: 'marquee',
    interaction: {
      additive,
      baseSelection: selection,
      currentWorld: startWorld,
      kind: 'marquee',
      moved: false,
      pointerId: input.pointerId,
      startScreen,
      startWorld,
    },
  }
}

export function previewCanvasPointerMarqueeInteraction({
  config,
  currentScreen,
  currentWorld,
  interaction,
  scene,
}: {
  config: CanvasAffordanceConfig
  currentScreen: Point
  currentWorld: Point
  interaction: CanvasPointerMarqueeInteraction
  scene: CanvasSceneAdapter
}): CanvasPointerMarqueePreviewResult {
  if (!config.gestures.marquee) {
    return { kind: 'none' }
  }

  const moved = hasCanvasInteractionMoved({
    currentScreen,
    interaction,
  })
  const bounds = normalizeBounds(interaction.startWorld, currentWorld)
  const nextInteraction: CanvasPointerMarqueeInteraction = {
    ...interaction,
    currentWorld,
    moved,
  }

  if (!moved) {
    return {
      interaction: nextInteraction,
      kind: 'preview',
      snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
    }
  }

  return {
    interaction: nextInteraction,
    kind: 'preview',
    marquee: bounds,
    selection: getCanvasMarqueeSelection({
      additive: interaction.additive,
      baseSelection: interaction.baseSelection,
      bounds,
      scene,
    }),
    snapGuides: EMPTY_CANVAS_SNAP_GUIDES,
  }
}

export function commitCanvasPointerMarqueeInteraction({
  commitSelection,
  interaction,
  scene,
  setSelection,
}: {
  commitSelection: CommitCanvasSelection
  interaction: CanvasPointerMarqueeInteraction
  scene: CanvasSceneAdapter
  setSelection: (selection: string[]) => void
}) {
  if (interaction.moved) {
    const nextSelection = getCanvasMarqueeSelection({
      additive: interaction.additive,
      baseSelection: interaction.baseSelection,
      bounds: normalizeBounds(interaction.startWorld, interaction.currentWorld),
      scene,
    })

    setSelection(interaction.baseSelection)
    return commitSelection(nextSelection)
  }

  if (!interaction.additive) {
    setSelection(interaction.baseSelection)
    return commitSelection([])
  }

  return true
}

export function cancelCanvasPointerMarqueeInteraction({
  interaction,
  setSelection,
}: {
  interaction: CanvasPointerMarqueeInteraction
  setSelection: (selection: string[]) => void
}) {
  setSelection(interaction.baseSelection)
}
