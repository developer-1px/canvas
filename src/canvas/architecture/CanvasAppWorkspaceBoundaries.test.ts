import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas App workspace boundaries', () => {
  it('keeps app workflow hooks from recreating the workspace read model', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.startsWith('src/canvas/app/workspace/document/') &&
        file.path !== 'src/canvas/app/workflow/useCanvasWorkspaceModel.ts' &&
        file.path !==
          'src/canvas/app/workflow/CanvasWorkspaceRuntimeModel.ts',
      )
      .flatMap((file) =>
        file.source.includes('createCanvasItemReadModel') ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })


  it('keeps app workspace document fields behind consumer contexts', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const workspaceModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasWorkspaceModel.ts',
    )
    const workspaceConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasWorkspaceConsumerModel.ts',
    )
    const workspaceConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasWorkspaceConsumerContracts.ts',
    )
    const workspaceRuntimeModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasWorkspaceRuntimeModel.ts',
    )
    const rawWorkspaceTerms =
      /\b(canRedo|canUndo|commitSelection|commitItemsChange|copyItemsToClipboard|getClipboardItems|findDocumentText|itemReadModel|redo|replaceDocumentText|selectedBounds|setClipboardItems|setLiveItems|setSelection|setViewport|undo)\b/

    expect(appModelFile.source).toContain(
      "from './useCanvasWorkspaceModel'",
    )
    expect(appModelFile.source).not.toMatch(rawWorkspaceTerms)
    expect(workspaceModelFile.source).toContain(
      "from './CanvasWorkspaceConsumerModel'",
    )
    expect(workspaceConsumerModelFile.source).toContain(
      "from './CanvasWorkspaceConsumerContracts'",
    )
    expect(workspaceConsumerModelFile.source).toContain(
      '): CanvasWorkspaceConsumerModel',
    )
    expect(workspaceConsumerModelFile.source).not.toContain(
      'export type CanvasWorkspaceConsumerModelInput',
    )
    expect(workspaceConsumerModelFile.source).not.toContain(
      'CanvasDocumentClipboard',
    )
    expect(workspaceConsumerContractsFile.source).toContain(
      'export type CanvasWorkspaceConsumerModelInput',
    )
    expect(workspaceConsumerContractsFile.source).toContain(
      'export type CanvasWorkspaceConsumerModel',
    )
    expect(workspaceConsumerContractsFile.source).toContain(
      'CanvasDocumentClipboard',
    )
    expect(workspaceModelFile.source).toContain(
      "from './CanvasWorkspaceRuntimeModel'",
    )
    expect(workspaceModelFile.source).toContain('storageProvider()')
    expect(workspaceModelFile.source).toContain('storageProvider,')
    expect(workspaceRuntimeModelFile.source).not.toContain(
      'CanvasWorkspaceStorage',
    )
    expect(workspaceRuntimeModelFile.source).not.toContain(
      'component-sticky',
    )
    expect(workspaceRuntimeModelFile.source).not.toContain(
      'component-card',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )

    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_INITIAL_SELECTION',
    )
    for (const runtimeImplementationDetail of [
      'INITIAL_VIEWPORT',
      'getCanvasItemIdSeed',
      'createCanvasItemReadModel',
      'new Set<string>',
      'scene.getBounds',
    ]) {
      expect(workspaceModelFile.source).not.toContain(
        runtimeImplementationDetail,
      )
      expect(workspaceRuntimeModelFile.source).toContain(
        runtimeImplementationDetail,
      )
    }
    for (const consumerContext of [
      'command: {',
      'component: {',
      'control: {',
      'extension: {',
      'image: {',
      'inspector: {',
      'interaction: {',
      'itemLayer: {',
      'keyboard: {',
      'linkPreview: {',
      'pointer: {',
      'stage: {',
      'text: {',
      'table: {',
      'textPaste: {',
      'viewport: {',
    ]) {
      expect(workspaceModelFile.source).not.toContain(consumerContext)
    }
    for (const consumerContext of [
      'command: {',
      'component: {',
      'control: {',
      'extension: {',
      'image: {',
      'inspector: {',
      'interaction: {',
      'itemLayer: {',
      'keyboard: {',
      'linkPreview: {',
      'pointer: {',
      'stage: {',
      'text: {',
      'table: {',
      'textPaste: {',
      'viewport: {',
    ]) {
      expect(workspaceConsumerModelFile.source).toContain(consumerContext)
    }
  })


  it('keeps App workspace snapshot contracts behind a named module', () => {
    const persistenceFile = getSourceFile(
      'src/canvas/app/workspace/document/CanvasWorkspacePersistence.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/workspace/document/CanvasWorkspaceSnapshot.ts',
    )

    expect(persistenceFile.source).toContain(
      "from './CanvasWorkspaceSnapshot'",
    )
    expect(persistenceFile.source).not.toContain('normalizeCanvasItems')
    expect(persistenceFile.source).not.toContain(
      'createCanvasItemReadModel',
    )
    expect(persistenceFile.source).not.toContain('getCanvasItemIdSeed')
    expect(persistenceFile.source).not.toContain(
      'CANVAS_WORKSPACE_VERSION',
    )
    expect(persistenceFile.source).not.toContain('normalizeCanvasViewport')
    expect(persistenceFile.source).toContain(
      'export type CanvasWorkspaceStorage',
    )
    expect(persistenceFile.source).toContain(
      'export type CanvasWorkspaceStorageProvider',
    )
    expect(persistenceFile.source).toContain(
      'DEFAULT_CANVAS_WORKSPACE_STORAGE_PROVIDER',
    )
    expect(persistenceFile.source).not.toContain('Pick<Storage')
    expect(persistenceFile.source).not.toContain('Partial<Pick')
    expect(snapshotFile.source).toContain(
      'export function parseCanvasWorkspaceSnapshot',
    )
    expect(snapshotFile.source).toContain(
      'export function createCanvasWorkspaceSnapshot',
    )
    expect(snapshotFile.source).toContain(
      'export function getCanvasItemIdSeed',
    )
    expect(snapshotFile.source).toContain('normalizeCanvasItems')
    expect(snapshotFile.source).toContain('createCanvasItemReadModel')
    expect(snapshotFile.source).toContain('CANVAS_WORKSPACE_VERSION')
  })

})
