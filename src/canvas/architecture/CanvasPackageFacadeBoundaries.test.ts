import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas package facade boundaries', () => {
  it('keeps demo app code behind the canvas package public entry', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path === 'src/main.tsx' || file.path.startsWith('src/demo/'),
      )
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target.startsWith('src/canvas/') &&
        reference.target !== 'src/canvas',
      )

    expect(violations).toEqual([])
  })


  it('keeps the canvas package public entry on layer facades', () => {
    const publicEntry = getSourceFile('src/canvas/index.ts')
    const privateTargets = getImportReferences(publicEntry)
      .filter((reference) =>
        reference.target.startsWith('src/canvas/') &&
        ![
          'src/canvas/app',
          'src/canvas/app/authoring',
          'src/canvas/core',
          'src/canvas/foundation',
          'src/canvas/engine',
          'src/canvas/entities',
          'src/canvas/marketplace',
          'src/canvas/host',
          'src/canvas/renderer',
        ].includes(reference.target),
      )

    expect(privateTargets).toEqual([])
  })


  it('keeps the canvas package public entry on authoring contracts, not workflow hooks', () => {
    const appFacadeFile = getSourceFile('src/canvas/app/index.ts')
    const authoringFacadeFile = getSourceFile(
      'src/canvas/app/authoring/index.ts',
    )
    const packageFacadeFile = getSourceFile('src/canvas/index.ts')

    expect(packageFacadeFile.source).toContain("from './app/authoring'")
    expect(packageFacadeFile.source).toContain("from './app'")
    expect(packageFacadeFile.source).toContain('CanvasAppAssemblySource')
    expect(packageFacadeFile.source).toContain('createCanvasAppAssembly')
    expect(packageFacadeFile.source).toContain(
      'defineCanvasAppCustomItemModule',
    )
    expect(authoringFacadeFile.source).toContain('createCanvasAppAssembly')
    expect(authoringFacadeFile.source).toContain(
      'defineCanvasAppCustomItemModule',
    )
    expect(appFacadeFile.source).toContain('useCanvasAppModel')
    expect(packageFacadeFile.source).not.toContain('useCanvasAppModel')
    expect(appFacadeFile.source).toContain('DEFAULT_CANVAS_APP_ASSEMBLY')
    expect(packageFacadeFile.source).not.toContain(
      'DEFAULT_CANVAS_APP_ASSEMBLY',
    )
    expect(appFacadeFile.source).toContain('assertCanvasAppAssembly')
    expect(packageFacadeFile.source).not.toContain('assertCanvasAppAssembly')
    expect(appFacadeFile.source).toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(packageFacadeFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(appFacadeFile.source).toContain(
      'createCanvasAppCustomItemModuleAssembly',
    )
    expect(packageFacadeFile.source).not.toContain(
      'createCanvasAppCustomItemModuleAssembly',
    )
    for (const runtimeContract of [
      'CanvasAppCustomCommandState',
      'CanvasAppCustomCreationTool,',
      'CanvasAppCustomCreationToolState',
    ]) {
      expect(packageFacadeFile.source).not.toContain(runtimeContract)
      expect(authoringFacadeFile.source).not.toContain(runtimeContract)
    }
    expect(packageFacadeFile.source).not.toContain(
      'CanvasAppCustomItemModuleAssembly',
    )
    for (const flatLayerExport of [
      'CANVAS_COMPONENT_LIBRARY',
      'createCanvasComponentLibrary',
      'CANVAS_COMMAND_AFFORDANCES',
      'createCanvasAffordanceConfig',
      'assertCanvasAffordanceConfig',
      'isCanvasCustomToolId',
      'CanvasSvgStage',
    ]) {
      expect(packageFacadeFile.source).not.toContain(flatLayerExport)
    }
  })


  it('keeps App authoring contracts behind a named public facade', () => {
    const appFacadeFile = getSourceFile('src/canvas/app/index.ts')
    const authoringFacadeFile = getSourceFile(
      'src/canvas/app/authoring/index.ts',
    )

    expect(appFacadeFile.source).toContain("from './authoring'")
    for (const authoringContract of [
      'createCanvasAppAssembly',
      'createCanvasAppExtensionBundle',
      'createCanvasAppFeaturePack',
      'createCanvasAppFeaturePackExtensionBundle',
      'defineCanvasAppCustomItemModule',
      'getCanvasAppInstalledFeaturePacks',
      'createCanvasAppComponentPresentationRenderers',
      'createCanvasAppCustomItemRenderers',
      'CanvasAppCommitItemsChange',
      'CanvasAppComponentLibrary',
      'CanvasAppComponentTemplate',
      'CanvasAppCustomCommand',
      'CanvasAppFeaturePack',
      'CanvasAppItemsChange',
      'CanvasAppCustomItemModuleCreationTool',
      'CanvasAppInspectorPanel',
      'CanvasWorkspaceStorageProvider',
    ]) {
      expect(authoringFacadeFile.source).toContain(authoringContract)
      expect(appFacadeFile.source).toContain(authoringContract)
    }
    for (const runtimeContract of [
      'CanvasAppCustomCommandState',
      'CanvasAppCustomCreationTool,',
      'CanvasAppCustomCreationToolState',
    ]) {
      expect(authoringFacadeFile.source).not.toContain(runtimeContract)
      expect(appFacadeFile.source).not.toContain(runtimeContract)
    }
    for (const runtimeHow of [
      'useCanvasAppModel',
      'DEFAULT_CANVAS_APP_ASSEMBLY',
      'assertCanvasAppAssembly',
      'assertCanvasAppExtensionRecordKeys',
      'createCanvasAppCustomItemModuleAssembly',
    ]) {
      expect(authoringFacadeFile.source).not.toContain(runtimeHow)
      expect(appFacadeFile.source).toContain(runtimeHow)
    }
    for (const implementationModule of [
      '../commands/',
      '../modules/',
      '../tools/',
      '../rendering',
      '../extensions/',
    ]) {
      expect(appFacadeFile.source).not.toContain(implementationModule)
    }
  })


  it('keeps Demo SVG renderer names out of app authoring seams', () => {
    const publicAuthoringFiles = new Set([
      'src/canvas/index.ts',
      'src/canvas/app/index.ts',
      'src/canvas/app/workflow/index.ts',
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
      'src/canvas/app/workflow/useCanvasAppModel.ts',
      'src/canvas/app/extensions/custom-item-modules/CanvasAppCustomItemModules.ts',
    ])
    const violations = sourceFiles
      .filter((file) =>
        publicAuthoringFiles.has(file.path) ||
        file.path.startsWith('src/demo/custom-items/'),
      )
      .flatMap((file) =>
        /CanvasDemoSvg|createCanvasDemoSvg/.test(file.source)
          ? [file.path]
          : [],
      )

    expect(violations).toEqual([])
  })

})
