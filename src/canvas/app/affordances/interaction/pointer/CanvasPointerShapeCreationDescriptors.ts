import { normalizeBounds } from '../../../../core'
import type { Point } from '../../../../entities'
import {
  createCanvasArrow,
  createCanvasRect,
  type CanvasAffordanceConfig,
  type CanvasCreationAdapter,
  type CanvasCreationItem,
  type CanvasDraftArrowOverlay,
  type CanvasDraftShapeOverlay,
} from '../../../../engine'
import type {
  CanvasPointerShapeCreationKind,
} from './CanvasPointerCreationGrammar'
import type {
  CanvasPointerShapeCreationInteraction,
} from './CanvasPointerShapeCreation'

export type CanvasPointerShapeCreationDraft = Readonly<{
  draftArrow?: CanvasDraftArrowOverlay
  draftRect?: CanvasDraftShapeOverlay
}>

type CanvasPointerShapeCreationDescriptor = Readonly<{
  createDraft: (input: {
    currentWorld: Point
    interaction: CanvasPointerShapeCreationInteraction
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
        routing: 'elbow',
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
  'create-shape': Object.freeze({
    createDraft: ({ currentWorld, interaction, startWorld }) => ({
      draftRect: {
        ...normalizeBounds(startWorld, currentWorld),
        shape: interaction.kind === 'create-shape'
          ? interaction.shape
          : undefined,
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
    }) =>
      createCanvasRect({
        adapter,
        createId,
        currentWorld: interaction.currentWorld,
        shape: interaction.kind === 'create-shape'
          ? interaction.shape
          : undefined,
        startWorld: interaction.startWorld,
      }),
    isEnabled: (config: CanvasAffordanceConfig) =>
      config.gestures.createShape,
    selectAfterCommit: true,
  }),
} satisfies Readonly<
  Record<CanvasPointerShapeCreationKind, CanvasPointerShapeCreationDescriptor>
>)

export function getCanvasPointerShapeCreationDescriptor(
  kind: CanvasPointerShapeCreationKind,
) {
  return CANVAS_POINTER_SHAPE_CREATION_DESCRIPTORS[kind]
}

export function hasCanvasPointerShapeCreationKind(
  kind: string,
): kind is CanvasPointerShapeCreationKind {
  return Object.prototype.hasOwnProperty.call(
    CANVAS_POINTER_SHAPE_CREATION_DESCRIPTORS,
    kind,
  )
}
