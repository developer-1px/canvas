import { describe, expect, it } from 'vitest'

import {
  getImportReferences,
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas package facade boundaries', () => {
  it('keeps demo app code behind canvas package public facades', () => {
    const publicCanvasFacades = new Set([
      'src/canvas',
      'src/canvas/app',
      'src/canvas/app/authoring',
    ])
    const violations = sourceFiles
      .filter((file) =>
        /^src\/[^/]+\.(ts|tsx)$/.test(file.path) ||
        file.path.startsWith('src/demo/'),
      )
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target.startsWith('src/canvas/') &&
        !publicCanvasFacades.has(reference.target),
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
          'src/canvas/core',
          'src/canvas/foundation',
          'src/canvas/engine',
          'src/canvas/entities',
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

    expect(packageFacadeFile.source).toContain("from './app'")
    expect(packageFacadeFile.source).toContain('CanvasAppAssemblySource')
    expect(packageFacadeFile.source).not.toContain("from './app/authoring'")
    expect(packageFacadeFile.source).not.toContain('createCanvasAppAssembly')
    expect(packageFacadeFile.source).not.toContain(
      'defineCanvasAppCustomItemModule',
    )
    expect(packageFacadeFile.source).not.toContain('defineCanvasAppFeaturePack')
    expect(packageFacadeFile.source).not.toContain(
      'DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS',
    )
    expect(authoringFacadeFile.source).toContain('createCanvasAppAssembly')
    expect(authoringFacadeFile.source).toContain(
      'defineCanvasAppCustomItemModule',
    )
    expect(authoringFacadeFile.source).toContain('defineCanvasAppFeaturePack')
    expect(authoringFacadeFile.source).toContain(
      'getCanvasAppFeaturePackCatalog',
    )
    expect(authoringFacadeFile.source).toContain('resolveCanvasAppFeaturePacks')
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
      'defineCanvasAppFeaturePack',
      'defineCanvasAppCustomItemModule',
      'getCanvasAppFeaturePackCatalog',
      'getCanvasAppInstalledFeaturePacks',
      'resolveCanvasAppFeaturePacks',
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


  it('keeps Whiteboard SVG renderer names out of app authoring seams', () => {
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
        /CanvasWhiteboardSvg|createCanvasWhiteboardSvg/.test(file.source)
          ? [file.path]
          : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps extracted canvas packages on public canvas package imports and away from demo source', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('packages/canvas-pack-') ||
        file.path.startsWith('packages/canvas-devtools-affordance/'),
      )
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target.startsWith('src/canvas/') ||
        reference.target.startsWith('src/demo/'),
      )

    expect(violations).toEqual([])
  })

  it('keeps canvas runtime source independent from extracted canvas packs', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/') &&
        !file.path.includes('.test.') &&
        !file.path.startsWith('src/canvas/architecture/'),
      )
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.specifier.startsWith('@interactive-os/canvas-pack-') ||
        reference.specifier.startsWith(
          '@interactive-os/canvas-devtools-affordance',
        ),
      )

    expect(violations).toEqual([])
  })
})
