import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas pointer creation boundaries', () => {
  it('keeps pointer creation kind routing behind a named grammar module', () => {
    const lifecycleFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionLifecycle.ts',
    )
    const interactionPreviewFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionPreview.ts',
    )
    const creationStartFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCreationStart.ts',
    )
    const creationPreviewFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCreationPreview.ts',
    )
    const creationCommitFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCreationCommit.ts',
    )
    const creationGrammarFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCreationGrammar.ts',
    )
    const interactionRoutingFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionRouting.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerCustomCreation.ts',
    )
    const shapeCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerShapeCreation.ts',
    )
    const shapeCreationDescriptorsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerShapeCreationDescriptors.ts',
    )
    const textCreationFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerTextCreation.ts',
    )

    expect(creationGrammarFile.source).toContain(
      'export function isCanvasPointerCreationGesture',
    )
    expect(creationGrammarFile.source).toContain(
      'export function isCanvasPointerCreationInteraction',
    )
    expect(creationGrammarFile.source).toContain(
      'CANVAS_POINTER_DRAWING_CREATION_KINDS',
    )
    expect(creationGrammarFile.source).toContain(
      'CANVAS_POINTER_CUSTOM_CREATION_KINDS',
    )
    expect(creationGrammarFile.source).toContain(
      'CANVAS_POINTER_SHAPE_CREATION_KINDS',
    )
    expect(creationGrammarFile.source).toContain(
      'CANVAS_POINTER_TEXT_CREATION_KINDS',
    )
    for (const creationRuntimeImport of [
      "from './CanvasPointerDrawingCreation'",
      "from './CanvasPointerCustomCreation'",
      "from './CanvasPointerShapeCreation'",
      "from './CanvasPointerTextCreation'",
    ]) {
      expect(creationGrammarFile.source).not.toContain(creationRuntimeImport)
    }
    for (const creationRuntimeFile of [
      drawingCreationFile,
      customCreationFile,
      shapeCreationFile,
      shapeCreationDescriptorsFile,
      textCreationFile,
    ]) {
      expect(creationRuntimeFile.source).toContain(
        "from './CanvasPointerCreationGrammar'",
      )
    }
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerCreationGrammar'",
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerDrawingCreation'",
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerCustomCreation'",
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerShapeCreation'",
    )
    expect(creationStartFile.source).toContain(
      "from './CanvasPointerTextCreation'",
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerCreationGrammar'",
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerDrawingCreation'",
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerCustomCreation'",
    )
    expect(creationPreviewFile.source).toContain(
      "from './CanvasPointerShapeCreation'",
    )
    expect(creationCommitFile.source).toContain(
      "from './CanvasPointerCreationGrammar'",
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
    expect(drawingCreationFile.source).toContain(
      'CANVAS_POINTER_DRAWING_CREATION_DESCRIPTORS',
    )
    expect(customCreationFile.source).toContain(
      'CANVAS_POINTER_CUSTOM_CREATION_KINDS',
    )
    expect(shapeCreationDescriptorsFile.source).toContain(
      'CANVAS_POINTER_SHAPE_CREATION_DESCRIPTORS',
    )
    expect(textCreationFile.source).toContain(
      'CANVAS_POINTER_TEXT_CREATION_KINDS',
    )
    expect(interactionRoutingFile.source).toContain(
      'export function routeCanvasPointerInteraction',
    )
    expect(interactionRoutingFile.source).toContain(
      'isCanvasPointerCreationInteraction(interaction)',
    )
    for (const creationKindCheck of [
      "interaction.kind === 'create-arrow'",
      "interaction.kind === 'create-custom'",
      "interaction.kind === 'create-shape'",
      "interaction.kind === 'draw-highlight'",
      "interaction.kind === 'draw-marker'",
    ]) {
      expect(interactionPreviewFile.source).not.toContain(creationKindCheck)
      expect(lifecycleFile.source).not.toContain(creationKindCheck)
      expect(interactionRoutingFile.source).not.toContain(creationKindCheck)
    }
    for (const drawingKindCheck of [
      "interaction.kind === 'draw-highlight'",
      "interaction.kind === 'draw-marker'",
      "pointerGesture === 'draw-highlight'",
      "pointerGesture === 'draw-marker'",
    ]) {
      expect(creationStartFile.source).not.toContain(drawingKindCheck)
      expect(creationPreviewFile.source).not.toContain(drawingKindCheck)
      expect(creationCommitFile.source).not.toContain(drawingKindCheck)
    }
    for (const shapeKindCheck of [
      "interaction.kind === 'create-arrow'",
      "interaction.kind === 'create-shape'",
      "pointerGesture === 'create-arrow'",
      "pointerGesture === 'create-shape'",
    ]) {
      expect(creationStartFile.source).not.toContain(shapeKindCheck)
      expect(creationPreviewFile.source).not.toContain(shapeKindCheck)
      expect(creationCommitFile.source).not.toContain(shapeKindCheck)
    }
    for (const customKindCheck of [
      "interaction.kind === 'create-custom'",
      "pointerGesture === 'create-custom'",
    ]) {
      expect(creationStartFile.source).not.toContain(customKindCheck)
      expect(creationPreviewFile.source).not.toContain(customKindCheck)
      expect(creationCommitFile.source).not.toContain(customKindCheck)
    }
    expect(creationStartFile.source).not.toContain(
      "pointerGesture === 'create-text'",
    )
  })


  it('keeps pointer interaction start effects behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/useCanvasPointerDownHandlers.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionStartEffects.ts',
    )
    const effectContractsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionEffectContracts.ts',
    )
    const resultContractsFile = getSourceFile(
      'src/canvas/app/affordances/interaction/pointer/CanvasPointerInteractionResultContracts.ts',
    )

    expect(downHandlersFile.source).toContain(
      "from './CanvasPointerInteractionStartEffects'",
    )
    expect(downHandlersFile.source).not.toContain('capturePointer(')
    expect(downHandlersFile.source).not.toContain(
      "commitItemsChange({ type: 'add'",
    )
    expect(downHandlersFile.source).not.toContain("setTool('select')")
    expect(effectsFile.source).toContain(
      'export function applyCanvasPointerInteractionStartEffect',
    )
    expect(effectsFile.source).toContain(
      "from './CanvasPointerInteractionResultContracts'",
    )
    expect(effectsFile.source).toContain(
      "from './CanvasPointerInteractionEffectContracts'",
    )
    expect(effectsFile.source).not.toContain(
      "from './CanvasPointerInteractionStart'",
    )
    expect(effectsFile.source).not.toContain(
      'export type CanvasPointerInteractionStartEffectContext',
    )
    expect(resultContractsFile.source).toContain(
      'export type CanvasPointerInteractionStartResult',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasPointerInteractionStartEffectContext',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasTextEditInteractionStartEffectContext',
    )
    expect(effectsFile.source).toContain(
      'export function applyCanvasItemPointerInteractionStartEffect',
    )
    expect(effectsFile.source).toContain('capturePointer(')
    expect(effectsFile.source).toContain("commitItemsChange({ type: 'add'")
    expect(effectsFile.source).toContain("setTool('select')")
    expect(effectsFile.source).not.toContain('Pick<')
  })

})
