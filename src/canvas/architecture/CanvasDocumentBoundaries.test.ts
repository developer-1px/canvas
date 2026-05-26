import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas document boundaries', () => {
  it('keeps Host document change patch grammar behind a named module', () => {
    const changesFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentChanges.ts',
    )
    const changePatchFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentChangePatch.ts',
    )

    expect(changesFile.source).toContain("from './CanvasDocumentChangePatch'")
    expect(changesFile.source).not.toContain('switch (change.type)')
    expect(changesFile.source).not.toContain('createRemoveCanvasItemsPatch')
    expect(changesFile.source).not.toContain('createReorderCanvasItemsPatch')
    expect(changePatchFile.source).toContain(
      'export function createCanvasItemsChangePatch',
    )
    expect(changePatchFile.source).toContain(
      'CANVAS_ITEMS_CHANGE_PATCH_BUILDERS',
    )
    expect(changePatchFile.source).not.toContain('switch (change.type)')
    expect(changePatchFile.source).toContain('createRemoveCanvasItemsPatch')
    expect(changePatchFile.source).toContain('createReorderCanvasItemsPatch')
  })


  it('keeps Host document reorder patch moves behind a named module', () => {
    const patchesFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentPatches.ts',
    )
    const reorderPatchFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentReorderPatch.ts',
    )

    expect(patchesFile.source).toContain(
      "from './CanvasDocumentReorderPatch'",
    )
    expect(patchesFile.source).not.toContain('collectCanvasSiblingArrays')
    expect(patchesFile.source).not.toContain('createReorderSiblingArrayPatch')
    expect(patchesFile.source).not.toContain('canvasArrayItemPointer')
    expect(reorderPatchFile.source).toContain(
      'export function createReorderCanvasSiblingArraysPatch',
    )
    expect(reorderPatchFile.source).toContain('collectCanvasSiblingArrays')
    expect(reorderPatchFile.source).toContain('createReorderSiblingArrayPatch')
    expect(reorderPatchFile.source).toContain('canvasArrayItemPointer')
    expect(reorderPatchFile.source).toContain("op: 'move'")
  })


  it('keeps Host document patch tree diff behind a named module', () => {
    const patchesFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentPatches.ts',
    )
    const patchTreeDiffFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentPatchTreeDiff.ts',
    )

    expect(patchesFile.source).toContain(
      "from './CanvasDocumentPatchTreeDiff'",
    )
    expect(patchesFile.source).not.toContain('flattenCanvasItems')
    expect(patchesFile.source).not.toContain('isAncestorPath')
    expect(patchTreeDiffFile.source).toContain(
      'export function createCanvasDocumentPatchTreeDiff',
    )
    expect(patchesFile.source).toContain('CanvasDocumentPatchTreeDiff')
    expect(patchesFile.source).not.toContain('ReturnType<')
    expect(patchTreeDiffFile.source).toContain('flattenCanvasItems')
    expect(patchTreeDiffFile.source).toContain('isAncestorPath')
    expect(patchTreeDiffFile.source).toContain('removalEntries')
  })


  it('keeps app document hooks behind the Host Document Controller', () => {
    const forbiddenDocumentInternals =
      /\b(createCanvasItemsDocument|commitCanvasItemsPatch|JSONPatchOperation|SelectionSnap)\b|\.history\b|\.clipboard\b/
    const violations = sourceFiles
      .filter((file) => file.path.startsWith('src/canvas/app/document/'))
      .flatMap((file) =>
        forbiddenDocumentInternals.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })


  it('keeps App document communication contracts independent from Host document aliases', () => {
    const contractsFile = getSourceFile(
      'src/canvas/app/document/CanvasAppDocumentContracts.ts',
    )

    expect(contractsFile.source).not.toContain("from '../../host'")
    expect(contractsFile.source).toContain("from '../../entities'")
    expect(contractsFile.source).toContain("from '../../core'")
    expect(contractsFile.source).toContain('export type CanvasAppItemsChange')
    expect(contractsFile.source).toContain(
      'export type CanvasAppDocumentSelectionHistory',
    )
    expect(contractsFile.source).toContain(
      'export type CanvasAppDocumentClipboard',
    )
    expect(contractsFile.source).toContain(
      'export type CanvasAppDocumentTextSearch',
    )
    expect(contractsFile.source).toContain('CanvasAppTextSearchMatch')
    expect(contractsFile.source).not.toContain('CanvasItemsChange')
    expect(contractsFile.source).not.toContain(
      'CanvasDocumentSelectionHistory',
    )
    expect(contractsFile.source).not.toContain('CanvasDocumentClipboard')
    expect(contractsFile.source).not.toContain('CanvasDocumentTextSearch')
  })


  it('keeps app document runtime rules out of the React document hook', () => {
    const documentHookFile = getSourceFile(
      'src/canvas/app/document/useCanvasDocument.ts',
    )
    const documentRuntimeFile = getSourceFile(
      'src/canvas/app/document/CanvasDocumentRuntime.ts',
    )
    const documentRuntimeContractsFile = getSourceFile(
      'src/canvas/app/document/CanvasDocumentRuntimeContracts.ts',
    )

    expect(documentHookFile.source).toContain(
      "from './CanvasDocumentRuntime'",
    )
    expect(documentRuntimeFile.source).toContain(
      "from './CanvasDocumentRuntimeContracts'",
    )
    expect(documentRuntimeFile.source).not.toContain('Parameters<')
    expect(documentRuntimeFile.source).not.toContain('ReturnType<')
    expect(documentRuntimeFile.source).not.toContain('export type {')
    expect(documentRuntimeContractsFile.source).toContain(
      'export type CanvasDocumentCommittedState',
    )
    expect(documentRuntimeContractsFile.source).not.toContain(
      "from '../../host'",
    )
    expect(documentRuntimeContractsFile.source).toContain(
      "from '../../core'",
    )
    expect(documentRuntimeContractsFile.source).toContain(
      "from '../../entities'",
    )
    expect(documentRuntimeContractsFile.source).toContain(
      'export type CanvasDocumentRuntimeController',
    )
    expect(documentRuntimeContractsFile.source).toContain(
      'export type CanvasDocumentHistoryState',
    )
    expect(documentRuntimeContractsFile.source).toContain(
      'export type CommitCanvasDocumentItemsChangeArgs',
    )
    expect(documentRuntimeContractsFile.source).toContain(
      'export type ReplaceCanvasDocumentTextArgs',
    )
    expect(documentRuntimeContractsFile.source).not.toContain(
      'Parameters<',
    )
    expect(documentRuntimeContractsFile.source).not.toContain(
      'ReturnType<',
    )
    for (const documentRuntimeDetail of [
      'document.replaceItems(',
      'document.commitItemsChange(',
      'document.restoreSelection(',
      'document.commitSelection(',
      'document.replaceText(',
      'document.undo(',
      'document.redo(',
      'resolveCanvasDocumentStateAction',
    ]) {
      expect(documentHookFile.source).not.toContain(documentRuntimeDetail)
      expect(documentRuntimeFile.source).toContain(documentRuntimeDetail)
    }
  })
})
