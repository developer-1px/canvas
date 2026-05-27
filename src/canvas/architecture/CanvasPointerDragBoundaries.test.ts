import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas pointer drag boundaries', () => {
  it('keeps pointer drag effect application behind a named module', () => {
    const dragHookFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/useCanvasPointerDragHandlers.ts',
    )
    const dragEffectsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionDragEffects.ts',
    )
    const effectContractsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionEffectContracts.ts',
    )
    const resultContractsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionResultContracts.ts',
    )
    const dragSessionFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerDragSession.ts',
    )

    expect(dragHookFile.source).toContain(
      "from './CanvasPointerInteractionDragEffects'",
    )
    expect(dragHookFile.source).toContain(
      "from './CanvasPointerDragSession'",
    )
    expect(dragHookFile.source).not.toContain("interaction.kind === 'none'")
    expect(dragHookFile.source).not.toContain(
      'interaction.pointerId !== event.pointerId',
    )
    expect(dragHookFile.source).not.toContain('screenPoint(')
    expect(dragHookFile.source).not.toContain('screenToWorld(')
    expect(dragSessionFile.source).toContain(
      'export function getCanvasPointerDragSession',
    )
    expect(dragSessionFile.source).toContain(
      'export function getCanvasPointerDragProjection',
    )
    expect(dragSessionFile.source).toContain("interaction.kind === 'none'")
    expect(dragSessionFile.source).toContain(
      'interaction.pointerId !== event.pointerId',
    )
    expect(dragSessionFile.source).toContain('screenPoint(')
    expect(dragSessionFile.source).toContain('screenToWorld(')
    for (const dragEffectDetail of [
      'setSnapGuides(preview.snapGuides)',
      'setViewport(preview.viewport)',
      'setLiveItems(preview.liveItems)',
      'setMarquee(preview.marquee)',
      'setSelection(preview.selection)',
      'setDraftRect(preview.draftRect)',
      'setDraftStroke(preview.draftStroke)',
      'setDraftArrow(preview.draftArrow)',
      "interactionRef.current = { kind: 'none' }",
      'setMarquee(null)',
      'setDraftArrow(null)',
      'setDraftRect(null)',
      'setDraftStroke(null)',
      'EMPTY_CANVAS_SNAP_GUIDES',
    ]) {
      expect(dragHookFile.source).not.toContain(dragEffectDetail)
      expect(dragEffectsFile.source).toContain(dragEffectDetail)
    }
    expect(dragEffectsFile.source).toContain(
      'export function applyCanvasPointerInteractionPreviewEffect',
    )
    expect(dragEffectsFile.source).toContain(
      'export function applyCanvasPointerInteractionEndEffect',
    )
    expect(dragEffectsFile.source).toContain(
      'export function applyCanvasPointerInteractionCancelEffect',
    )
    expect(dragEffectsFile.source).toContain(
      "from './CanvasPointerInteractionResultContracts'",
    )
    expect(dragEffectsFile.source).toContain(
      "from './CanvasPointerInteractionEffectContracts'",
    )
    expect(dragEffectsFile.source).not.toContain(
      "from './CanvasPointerInteractionPreview'",
    )
    expect(dragEffectsFile.source).not.toContain(
      'export type CanvasPointerInteractionDragEffectContext',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasPointerInteractionDragEffectContext',
    )
    expect(resultContractsFile.source).toContain(
      'export type CanvasPointerInteractionPreviewResult',
    )
    expect(dragSessionFile.source).not.toContain('Pick<')
    expect(dragSessionFile.source).toContain('CanvasAppPointerIdInput')
    expect(dragSessionFile.source).toContain('CanvasAppPointerScreenInput')
    expect(dragEffectsFile.source).not.toContain('Pick<')
    expect(dragEffectsFile.source).toContain('CanvasAppPointerIdInput')
  })


  it('keeps pointer click memory rules behind a named module', () => {
    const pointerDownHookFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/useCanvasPointerDownHandlers.ts',
    )
    const clickMemoryFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerClickMemory.ts',
    )

    expect(pointerDownHookFile.source).toContain(
      "from './CanvasPointerClickMemory'",
    )
    for (const clickMemoryDetail of [
      'pointDistance',
      'CANVAS_POINTER_DOUBLE_CLICK_MAX_DELAY_MS',
      'CANVAS_POINTER_DOUBLE_CLICK_MAX_DISTANCE',
      'lastClick?.id === itemId',
      'time - lastClick.time',
    ]) {
      expect(pointerDownHookFile.source).not.toContain(clickMemoryDetail)
      expect(clickMemoryFile.source).toContain(clickMemoryDetail)
    }
    expect(clickMemoryFile.source).toContain(
      'export function recordCanvasItemPointerClick',
    )
  })


  it('keeps pointer interaction commit and cancel lifecycle behind a named module', () => {
    const dragHandlersFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/useCanvasPointerDragHandlers.ts',
    )
    const lifecycleFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionLifecycle.ts',
    )
    const creationCommitFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCreationCommit.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCustomCreation.ts',
    )
    const marqueeInteractionFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerMarqueeInteraction.ts',
    )
    const transformInteractionFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerTransformInteraction.ts',
    )
    const interactionRoutingFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionRouting.ts',
    )

    expect(dragHandlersFile.source).toContain(
      "from './CanvasPointerInteractionLifecycle'",
    )
    expect(dragHandlersFile.source).not.toContain('createCanvasShape({')
    expect(dragHandlersFile.source).not.toContain('createCanvasMarker({')
    expect(dragHandlersFile.source).not.toContain('createCanvasArrow({')
    expect(dragHandlersFile.source).not.toContain(
      'commitCanvasPointerCustomCreation',
    )
    expect(dragHandlersFile.source).not.toContain("type: 'transform'")
    expect(dragHandlersFile.source).not.toContain('setEditing(interaction.edit)')
    expect(lifecycleFile.source).toContain(
      'export function commitCanvasPointerInteraction',
    )
    expect(lifecycleFile.source).toContain(
      'export function cancelCanvasPointerInteraction',
    )
    expect(lifecycleFile.source).toContain(
      "from './CanvasPointerCreationCommit'",
    )
    expect(lifecycleFile.source).toContain(
      "from './CanvasPointerMarqueeInteraction'",
    )
    expect(lifecycleFile.source).toContain(
      "from './CanvasPointerTransformInteraction'",
    )
    expect(lifecycleFile.source).toContain(
      "from './CanvasPointerInteractionRouting'",
    )
    expect(lifecycleFile.source).not.toContain('createCanvasShape({')
    expect(lifecycleFile.source).not.toContain('createCanvasMarker({')
    expect(lifecycleFile.source).not.toContain('createCanvasArrow({')
    expect(lifecycleFile.source).not.toContain(
      'commitCanvasPointerCustomCreation',
    )
    expect(lifecycleFile.source).not.toContain('getCanvasMarqueeSelection')
    expect(lifecycleFile.source).not.toContain('normalizeBounds')
    expect(lifecycleFile.source).not.toContain("type: 'transform'")
    expect(lifecycleFile.source).not.toContain('setEditing(interaction.edit)')
    expect(lifecycleFile.source).not.toContain(
      'setLiveItems(interaction.historyItems)',
    )
    expect(lifecycleFile.source).not.toContain(
      "interaction.kind === 'move'",
    )
    expect(lifecycleFile.source).not.toContain(
      "interaction.kind === 'resize'",
    )
    expect(lifecycleFile.source).not.toContain(
      "interaction.kind === 'marquee'",
    )
    expect(interactionRoutingFile.source).toContain(
      'export function routeCanvasPointerInteraction',
    )
    expect(interactionRoutingFile.source).toContain(
      "interaction.kind === 'move' || interaction.kind === 'resize'",
    )
    const shapeCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerShapeCreation.ts',
    )
    const shapeCreationDescriptorsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerShapeCreationDescriptors.ts',
    )

    expect(creationCommitFile.source).toContain(
      'export function commitCanvasPointerCreation',
    )
    expect(creationCommitFile.source).toContain(
      "from './CanvasPointerDrawingCreation'",
    )
    expect(creationCommitFile.source).toContain(
      "from './CanvasPointerCustomCreation'",
    )
    expect(creationCommitFile.source).toContain(
      "from './CanvasPointerShapeCreation'",
    )
    expect(creationCommitFile.source).not.toContain('createCanvasShape({')
    expect(creationCommitFile.source).not.toContain('createCanvasArrow({')
    expect(creationCommitFile.source).not.toContain('createCanvasMarker({')
    expect(creationCommitFile.source).not.toContain('createCanvasHighlight({')
    expect(creationCommitFile.source).not.toContain('commitCanvasCustomCreation')
    expect(creationCommitFile.source).toContain(
      'commitCanvasPointerCustomCreation',
    )
    expect(customCreationFile.source).toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(customCreationFile.source).toContain(
      'export function commitCanvasPointerCustomCreation',
    )
    expect(shapeCreationFile.source).not.toContain('createCanvasShape({')
    expect(shapeCreationFile.source).not.toContain('createCanvasArrow({')
    expect(shapeCreationDescriptorsFile.source).toContain('createCanvasShape({')
    expect(shapeCreationDescriptorsFile.source).toContain('createCanvasArrow({')
    expect(drawingCreationFile.source).toContain('createCanvasMarker({')
    expect(drawingCreationFile.source).toContain('createCanvasHighlight({')
    expect(marqueeInteractionFile.source).toContain(
      'export function commitCanvasPointerMarqueeInteraction',
    )
    expect(marqueeInteractionFile.source).toContain(
      'export function cancelCanvasPointerMarqueeInteraction',
    )
    expect(marqueeInteractionFile.source).toContain('getCanvasMarqueeSelection')
    expect(marqueeInteractionFile.source).toContain('normalizeBounds')
    expect(transformInteractionFile.source).toContain(
      'export function commitCanvasPointerTransformInteraction',
    )
    expect(transformInteractionFile.source).toContain(
      'export function cancelCanvasPointerTransformInteraction',
    )
    expect(transformInteractionFile.source).toContain("type: 'transform'")
    expect(transformInteractionFile.source).toContain(
      'setEditing(interaction.edit)',
    )
    expect(transformInteractionFile.source).toContain(
      'setLiveItems(interaction.historyItems)',
    )
  })

})
