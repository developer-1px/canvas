import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
} from './CanvasArchitectureTestSources'

describe('Canvas App text interaction workflow boundaries', () => {
  it('keeps app text editor and find replace wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const textModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppTextModel.ts',
    )
    const textConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppTextConsumerModel.ts',
    )
    const textEditorModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasTextEditorModel.ts',
    )
    const textEditingHookFile = getSourceFile(
      'src/canvas/app/affordances/editing/text-editor/useCanvasTextEditing.ts',
    )
    const textEditingModelFile = getSourceFile(
      'src/canvas/app/affordances/editing/text-editor/CanvasTextEditingModel.ts',
    )
    const findReplaceHookFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasFindReplaceModel.ts',
    )
    const findReplaceModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasFindReplaceModel.ts',
    )

    expect(appModelFile.source).toContain("from './useCanvasAppTextModel'")
    expect(appModelFile.source).not.toContain(
      "from './useCanvasTextEditorModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from './useCanvasFindReplaceModel'",
    )
    expect(appModelFile.source).not.toContain('useRef<')
    expect(appModelFile.source).not.toContain('editorRef')
    for (const flatTextTerm of [
      'text.setEditing',
      'text.openFindReplace',
      'text.blurTextEditor',
      'text.findReplace',
      'text.keyboard.openFindReplace',
      'text.textEditor',
    ]) {
      expect(appModelFile.source).not.toContain(flatTextTerm)
    }
    expect(textModelFile.source).toContain(
      "from './useCanvasTextEditorModel'",
    )
    expect(textModelFile.source).toContain(
      "from './useCanvasFindReplaceModel'",
    )
    expect(textModelFile.source).toContain(
      "from './CanvasAppTextConsumerModel'",
    )
    expect(textModelFile.source).toContain(
      "from './CanvasAppTextConsumerContracts'",
    )
    expect(textModelFile.source).toContain('CanvasAppTextModelInput')
    expect(textModelFile.source).not.toContain(
      'type CanvasAppTextDocumentModel',
    )
    expect(textModelFile.source).not.toContain(
      'type UseCanvasAppTextModelArgs',
    )
    expect(textModelFile.source).toContain(
      'useRef<HTMLElement | null>',
    )
    expect(textModelFile.source).toContain(
      'export function useCanvasAppTextModel',
    )
    for (const consumerContext of [
      'command: {',
      'component: {',
      'extension: {',
      'keyboard: {',
      'pointer: {',
      'stage: {',
      'view: {',
    ]) {
      expect(textModelFile.source).not.toContain(consumerContext)
      expect(textConsumerModelFile.source).toContain(consumerContext)
    }
    expect(textConsumerModelFile.source).toContain(
      'export function getCanvasAppTextConsumerModel',
    )
    expect(textConsumerModelFile.source).toContain(
      "from './CanvasAppTextConsumerContracts'",
    )
    expect(textConsumerModelFile.source).not.toContain(
      'type CanvasAppTextRuntime',
    )
    const textConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppTextConsumerContracts.ts',
    )
    expect(textConsumerContractsFile.source).toContain(
      'export type CanvasAppTextModelInput',
    )
    expect(textConsumerContractsFile.source).toContain(
      'export type CanvasAppTextDocumentModel',
    )
    expect(textConsumerContractsFile.source).toContain(
      'export type CanvasAppTextRuntime',
    )
    expect(textEditingHookFile.source).toContain(
      "from './CanvasTextEditingModel'",
    )
    expect(textEditingHookFile.source).toContain('commitCanvasTextEditing({')
    expect(textEditingHookFile.source).toContain('getCanvasTextEditorStyle({')
    expect(textEditingHookFile.source).not.toContain("'Text'")
    expect(textEditingHookFile.source).not.toContain("type: 'set-text'")
    expect(textEditingHookFile.source).not.toContain('fontSize: 16')
    expect(textEditorModelFile.source).toContain(
      "from '../affordances/editing/text-editor/CanvasTextEditingModel'",
    )
    expect(textEditorModelFile.source).toContain('CanvasTextEditorStyle')
    expect(textEditorModelFile.source).not.toContain('ReturnType<')
    expect(textEditingModelFile.source).toContain(
      'export function commitCanvasTextEditing',
    )
    expect(textEditingModelFile.source).toContain(
      'export function getCanvasTextEditorStyle',
    )
    expect(textEditingModelFile.source).toContain(
      'export type CanvasTextEditorStyle',
    )
    expect(textEditingModelFile.source).toContain(
      'getCommittedCanvasEditableTextValue',
    )
    expect(textEditingModelFile.source).not.toContain("'Text'")
    expect(textEditingModelFile.source).not.toContain(
      "editingItem.type === 'text'",
    )
    expect(textEditingModelFile.source).toContain("type: 'set-text'")
    expect(textEditingModelFile.source).toContain('fontSize: 16')
    expect(findReplaceHookFile.source).toContain(
      "from './CanvasFindReplaceModel'",
    )
    for (const findReplaceImplementationDetail of [
      'matches.reduce',
      'replaceDocumentText(query, replacement)',
      'enabled && open',
      'setOpen(true)',
    ]) {
      expect(findReplaceHookFile.source).not.toContain(
        findReplaceImplementationDetail,
      )
      expect(findReplaceModelFile.source).toContain(
        findReplaceImplementationDetail,
      )
    }
    expect(findReplaceModelFile.source).toContain(
      'export function getCanvasFindReplaceModel',
    )
  })


  it('keeps app interaction state routing behind the interaction model', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const interactionModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasInteractionModel.ts',
    )
    const interactionConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasInteractionConsumerModel.ts',
    )
    const interactionConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasInteractionConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasInteractionModel'",
    )
    for (const rawInteractionTerm of [
      'interactionRef',
      'setDraftArrow',
      'setDraftRect',
      'setDraftStroke',
      'setGesture',
      'setMarquee',
      'setSnapGuides',
      'setSpaceDown',
      'setTool',
      'spaceDown',
    ]) {
      expect(appModelFile.source).not.toContain(rawInteractionTerm)
    }
    for (const consumerContext of [
      'component: {',
      'control: {',
      'keyboard: {',
      'pointer: {',
      'stage: {',
    ]) {
      expect(interactionModelFile.source).not.toContain(consumerContext)
      expect(interactionConsumerModelFile.source).toContain(consumerContext)
    }
    expect(interactionModelFile.source).toContain(
      "from './CanvasInteractionConsumerModel'",
    )
    expect(interactionConsumerModelFile.source).toContain(
      "from './CanvasInteractionConsumerContracts'",
    )
    expect(interactionConsumerModelFile.source).toContain(
      '): CanvasInteractionConsumerModel',
    )
    expect(interactionConsumerModelFile.source).not.toContain(
      'export type CanvasInteractionConsumerModelInput',
    )
    expect(interactionConsumerModelFile.source).not.toContain('Dispatch')
    expect(interactionConsumerContractsFile.source).toContain(
      'export type CanvasInteractionConsumerModelInput',
    )
    expect(interactionConsumerContractsFile.source).toContain(
      'export type CanvasInteractionConsumerModel',
    )
    for (const interactionConsumerContract of [
      'CanvasInteractionComponentContext',
      'CanvasInteractionControlContext',
      'CanvasInteractionKeyboardContext',
      'CanvasInteractionPointerContext',
      'CanvasInteractionStageContext',
    ]) {
      expect(interactionConsumerContractsFile.source).toContain(
        `export type ${interactionConsumerContract}`,
      )
    }
    expect(interactionConsumerModelFile.source).toContain(
      'export function getCanvasInteractionConsumerModel',
    )
    expect(interactionModelFile.source).not.toContain(
      "spaceDown ? 'pan' : tool",
    )
    expect(interactionConsumerModelFile.source).toContain(
      "spaceDown ? 'pan' : tool",
    )
  })

})
