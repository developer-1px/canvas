import { describe, expect, it } from 'vitest'

type SourceFile = {
  path: string
  source: string
}

type ImportReference = {
  from: string
  specifier: string
  target: string
}

const modules = import.meta.glob('../**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const demoModules = import.meta.glob('../../demo/**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const appEntryModules = import.meta.glob('../../main.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const sourceFiles = [
  ...Object.entries(modules).map(([path, source]) => ({
    path: path.replace(/^\.\.\//, 'src/canvas/'),
    source,
  })),
  ...Object.entries(demoModules).map(([path, source]) => ({
    path: path.replace(/^\.\.\/\.\.\/demo\//, 'src/demo/'),
    source,
  })),
  ...Object.entries(appEntryModules).map(([path, source]) => ({
    path: path.replace(/^\.\.\/\.\.\//, 'src/'),
    source,
  })),
]

describe('Canvas module boundaries', () => {
  it('keeps stable entities independent from implementation layers', () => {
    const violations = getImportsFrom('src/canvas/entities/')
      .filter((reference) =>
        targetsAnyLayer(reference, ['app', 'engine', 'host', 'renderer', 'ui']),
      )

    expect(violations).toEqual([])
  })

  it('keeps stable entities as type-only public contracts', () => {
    const entitiesEntry = getSourceFile('src/canvas/entities/index.ts')
    const runtimeExports = entitiesEntry.source.match(/^export\s+\{/gm) ?? []
    const internalEntityImports = getImportsFromOutside('src/canvas/entities/')
      .filter((reference) =>
        reference.target.startsWith('src/canvas/entities/') &&
        reference.target !== 'src/canvas/entities',
      )

    expect(runtimeExports).toEqual([])
    expect(entitiesEntry.source).not.toContain('isCanvasCustomToolId')
    expect(internalEntityImports).toEqual([])
    expect(getSourceFile('src/canvas/index.ts').source).not.toContain(
      'CanvasEntities',
    )
  })

  it('keeps the engine independent from host, app, renderer, and ui modules', () => {
    const violations = getImportsFrom('src/canvas/engine/')
      .filter((reference) =>
        targetsAnyLayer(reference, ['app', 'host', 'renderer', 'ui']),
      )

    expect(violations).toEqual([])
  })

  it('keeps host access behind the host public facade outside the host layer', () => {
    const violations = getImportsFromOutside('src/canvas/host/')
      .filter((reference) => reference.target.startsWith('src/canvas/host/'))

    expect(violations).toEqual([])
  })

  it('keeps ui controls independent from app workflow and the demo host', () => {
    const violations = getImportsFrom('src/canvas/ui/')
      .filter((reference) =>
        reference.target === 'src/canvas/host' ||
        reference.target === 'src/canvas/app' ||
        reference.target.startsWith('src/canvas/app/'),
      )

    expect(violations).toEqual([])
  })

  it('keeps the app shell behind the workflow public entry', () => {
    const violations = getImportsFrom('src/canvas/app/shell/')
      .filter((reference) =>
        reference.target.startsWith('src/canvas/app/') &&
        !reference.target.startsWith('src/canvas/app/shell') &&
        reference.target !== 'src/canvas/app/workflow',
      )

    expect(violations).toEqual([])
  })

  it('keeps renderer component presentation resolution out of the renderer', () => {
    const violations = sourceFiles
      .filter((file) => file.path.startsWith('src/canvas/renderer/'))
      .flatMap((file) =>
        file.source.includes('CANVAS_COMPONENT_LIBRARY') ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps demo app assembly details at the workflow assembly seam', () => {
    const assemblyTerms =
      /\b(CANVAS_COMPONENT_LIBRARY|CANVAS_ITEM_ENGINE_ADAPTERS|INITIAL_ITEMS)\b/
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx') &&
        file.path !== 'src/canvas/app/index.ts' &&
        file.path !==
          'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
      )
      .flatMap((file) =>
        assemblyTerms.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps Canvas App Assembly input explicit instead of mirroring output', () => {
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )

    expect(typeContractFile.source).toContain(
      'export type CanvasAppAssemblyInput =',
    )
    expect(typeContractFile.source).toContain(
      'CanvasAppExtensionAssemblyInput &',
    )
    expect(typeContractFile.source).not.toContain('Partial<CanvasAppAssembly>')
  })

  it('keeps App Assembly type contracts behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblySnapshot.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const modelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModel.ts',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )

    expect(assemblyFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(assemblyFile.source).not.toContain(
      'export type CanvasAppAssembly = {',
    )
    expect(assemblyFile.source).not.toContain(
      'export type CanvasAppAssemblyInput = {',
    )
    expect(typeContractFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(typeContractFile.source).toContain(
      'export type CanvasAppAssembly = CanvasAppExtensionBundle & {',
    )
    expect(typeContractFile.source).toContain(
      "from './CanvasAppExtensionAssemblyTypes'",
    )
    expect(typeContractFile.source).toContain(
      "from './CanvasAppAssemblyInputTypes'",
    )
    expect(typeContractFile.source).toContain(
      'export type CanvasAppAssemblyInput =',
    )
    for (const assemblyInputContract of [
      'CanvasAppExtensionAssemblyInput &',
      'CanvasAppAffordanceAssemblyInput &',
      'CanvasAppComponentAssemblyInput &',
      'CanvasAppAdapterAssemblyInput &',
      'CanvasAppWorkspaceAssemblyInput',
    ]) {
      expect(typeContractFile.source).toContain(assemblyInputContract)
    }
    expect(typeContractFile.source).not.toContain(
      'affordanceConfig?: CanvasAffordanceConfigInput',
    )
    expect(typeContractFile.source).not.toContain(
      'componentLibrary?: CanvasComponentLibrary',
    )
    expect(typeContractFile.source).not.toContain(
      'customCreationTools: readonly',
    )
    expect(typeContractFile.source).not.toContain(
      'customItemRenderers: CanvasAppCustomItemRenderers',
    )
    expect(typeContractFile.source).not.toContain(
      'customItemValidators: CanvasCustomItemValidators',
    )
    expect(typeContractFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(typeContractFile.source).not.toContain(
      'DEFAULT_CANVAS_APP_ASSEMBLY',
    )
    expect(typeContractFile.source).not.toContain('snapshotCanvasAppAssembly')
    expect(snapshotFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(contractsFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(modelFile.source).toContain("from './CanvasAppAssemblyTypes'")
    expect(defaultAssemblyFile.source).toContain(
      "from './CanvasAppAssemblyTypes'",
    )
    expect(getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssembly.ts',
    ).source).toContain("from './CanvasAppExtensionAssemblyTypes'")
  })

  it('keeps App component composition behind a named Assembly module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const componentAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppComponentAssembly'",
    )
    expect(assemblyFile.source).not.toContain(
      'createCanvasAppComponentPresentationRenderers',
    )
    expect(assemblyFile.source).not.toContain('input.componentLibrary ??')
    expect(componentAssemblyFile.source).toContain(
      'export function createCanvasAppComponentAssembly',
    )
    expect(componentAssemblyFile.source).toContain(
      'createCanvasAppComponentPresentationRenderers',
    )
    expect(componentAssemblyFile.source).toContain(
      'input.componentLibrary ?? defaults.componentLibrary',
    )
    expect(componentAssemblyFile.source).not.toContain('Pick<')
    expect(componentAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(componentAssemblyFile.source).toContain(
      'CanvasAppComponentAssemblyContract',
    )
  })

  it('keeps App extension composition behind a named Assembly module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const extensionAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppExtensionAssembly'",
    )
    expect(assemblyFile.source).not.toContain(
      'createCanvasAppCustomItemModuleAssembly',
    )
    expect(assemblyFile.source).not.toContain(
      'appendUniqueCanvasAppExtensionEntries',
    )
    expect(assemblyFile.source).not.toContain(
      'mergeUniqueCanvasAppExtensionRecord',
    )
    expect(extensionAssemblyFile.source).toContain(
      'export function createCanvasAppExtensionAssembly',
    )
    expect(extensionAssemblyFile.source).toContain(
      'createCanvasAppCustomItemModuleAssembly',
    )
    expect(extensionAssemblyFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(extensionAssemblyFile.source).toContain(
      'mergeCanvasAppExtensionBundle',
    )
    expect(extensionAssemblyFile.source).toContain(
      'createCanvasAppExtensionBundle',
    )
    expect(extensionAssemblyFile.source).toContain(
      "owner: 'app assembly'",
    )
    expect(extensionAssemblyFile.source).not.toContain(
      'appendUniqueCanvasAppExtensionEntries',
    )
    expect(extensionAssemblyFile.source).not.toContain(
      'mergeUniqueCanvasAppExtensionRecord',
    )
    expect(assemblyFile.source).toContain('...extensionAssembly')
    expect(assemblyFile.source).not.toContain(
      'customCommands: extensionAssembly.customCommands',
    )
    expect(assemblyFile.source).not.toContain(
      'customCreationTools: extensionAssembly.customCreationTools',
    )
    expect(assemblyFile.source).not.toContain(
      'inspectorPanels: extensionAssembly.inspectorPanels',
    )
  })

  it('keeps App extension bundle slot merging behind a named module', () => {
    const extensionAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssembly.ts',
    )
    const customItemModuleFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModules.ts',
    )
    const customItemModuleAssemblyFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleAssembly.ts',
    )
    const customItemModuleRuntimeFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleRuntime.ts',
    )
    const extensionBundleFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionBundle.ts',
    )

    expect(extensionAssemblyFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(customItemModuleAssemblyFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(customItemModuleFile.source).not.toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(customItemModuleRuntimeFile.source).toContain(
      'getCanvasAppCustomItemModuleExtensionBundle',
    )
    expect(customItemModuleRuntimeFile.source).toContain(
      'createCanvasAppExtensionBundle',
    )
    for (const consumerFile of [
      extensionAssemblyFile,
      customItemModuleAssemblyFile,
    ]) {
      expect(consumerFile.source).not.toContain(
        'appendUniqueCanvasAppExtensionEntries',
      )
      expect(consumerFile.source).not.toContain(
        'mergeUniqueCanvasAppExtensionRecord',
      )
      expect(consumerFile.source).not.toContain("label: 'custom command'")
      expect(consumerFile.source).not.toContain(
        "label: 'custom item renderer'",
      )
    }
    expect(extensionBundleFile.source).toContain(
      'export type CanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'export function createEmptyCanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'export function mergeCanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'export function snapshotCanvasAppExtensionBundle',
    )
    expect(extensionBundleFile.source).toContain(
      'CanvasAppExtensionBundleInput',
    )
    expect(extensionBundleFile.source).toContain(
      'appendUniqueCanvasAppExtensionEntries',
    )
    expect(extensionBundleFile.source).toContain(
      'mergeUniqueCanvasAppExtensionRecord',
    )
    expect(extensionBundleFile.source).toContain("label: 'custom command'")
    expect(extensionBundleFile.source).toContain(
      "label: 'custom item renderer'",
    )
  })

  it('keeps App Model from distributing Assembly output fields directly', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const assemblyModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModel.ts',
    )
    const assemblyModelContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModelContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './CanvasAppAssemblyModel'",
    )
    expect(assemblyModelFile.source).toContain(
      "from './CanvasAppAssemblyModelContracts'",
    )
    expect(assemblyModelFile.source).toContain('): CanvasAppAssemblyModel')
    expect(assemblyModelFile.source).not.toContain(
      'export type CanvasAppAssemblyModel',
    )
    expect(assemblyModelContractsFile.source).toContain(
      'export type CanvasAppAssemblyModel',
    )
    expect(assemblyModelContractsFile.source).not.toContain(
      "from './CanvasAppAssemblyTypes'",
    )
    expect(assemblyModelContractsFile.source).not.toContain(
      'CanvasAppAssembly[',
    )
    for (const assemblyModelContract of [
      'CanvasAppAssemblyAffordanceModel',
      'CanvasAppAssemblyCommandModel',
      'CanvasAppAssemblyComponentModel',
      'CanvasAppAssemblyControlModel',
      'CanvasAppAssemblyExtensionModel',
      'CanvasAppAssemblyInspectorModel',
      'CanvasAppAssemblyPointerModel',
      'CanvasAppAssemblyRenderingModel',
      'CanvasAppAssemblyWorkspaceModel',
    ]) {
      expect(assemblyModelContractsFile.source).toContain(
        `export type ${assemblyModelContract}`,
      )
    }
    for (const assemblyOutputField of [
      'affordanceConfig',
      'componentLibrary',
      'componentPresentationRenderers',
      'customCommands',
      'customCreationTools',
      'customItemRenderers',
      'customItemValidators',
      'inspectorPanels',
      'initialItems',
      'initialSelection',
      'itemAdapters',
      'itemLayerAdapter',
      'stageAdapter',
      'workspaceStorageProvider',
    ]) {
      expect(appModelFile.source).not.toContain(assemblyOutputField)
    }
    for (const consumerContext of [
      'affordance: {',
      'command: {',
      'component: {',
      'control: {',
      'extension: {',
      'inspector: {',
      'pointer: {',
      'rendering: {',
      'workspace: {',
    ]) {
      expect(assemblyModelFile.source).toContain(consumerContext)
    }
  })

  it('keeps App Model from distributing affordance config directly', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const affordanceModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceModel.ts',
    )
    const affordanceModelContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceModelContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './CanvasAppAffordanceModel'",
    )
    expect(appModelFile.source).toContain(
      'getCanvasAppAffordanceModel(appAssembly.affordance.config)',
    )
    expect(appModelFile.source).not.toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(appModelFile.source).not.toContain('canvasAffordanceConfig')
    expect(appModelFile.source).not.toContain('config.overlays')
    expect(affordanceModelFile.source).toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(affordanceModelFile.source).toContain(
      "from './CanvasAppAffordanceModelContracts'",
    )
    expect(affordanceModelFile.source).toContain('): CanvasAppAffordanceModel')
    expect(affordanceModelFile.source).not.toContain(
      'export type CanvasAppAffordanceModel',
    )
    expect(affordanceModelContractsFile.source).toContain(
      'export type CanvasAppAffordanceModel',
    )
    expect(affordanceModelContractsFile.source).toContain(
      'export type CanvasAppAffordanceConfigContext',
    )
    expect(affordanceModelContractsFile.source).not.toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    for (const affordanceModelContract of [
      'CanvasAppAffordanceCommandModel',
      'CanvasAppAffordanceControlModel',
      'CanvasAppAffordanceInteractionModel',
      'CanvasAppAffordanceInspectorModel',
      'CanvasAppAffordanceKeyboardModel',
      'CanvasAppAffordancePointerModel',
      'CanvasAppAffordanceTextModel',
      'CanvasAppAffordanceViewportModel',
    ]) {
      expect(affordanceModelContractsFile.source).toContain(
        `export type ${affordanceModelContract}`,
      )
    }
    for (const consumerContext of [
      'command: {',
      'control: {',
      'interaction: {',
      'inspector: {',
      'keyboard: {',
      'pointer: {',
      'text: {',
      'viewport: {',
    ]) {
      expect(affordanceModelFile.source).toContain(consumerContext)
    }
  })

  it('keeps custom item registries as Assembly output, not input', () => {
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )
    const inputContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyInputTypes.ts',
    )
    const extensionInputFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionAssemblyTypes.ts',
    )

    expect(typeContractFile.source).toContain(
      'CanvasAppExtensionAssemblyInput',
    )
    expect(extensionInputFile.source).toContain(
      'customItemModules?: readonly CanvasAppCustomItemModule[]',
    )
    expect(inputContractFile.source).toContain(
      'affordanceConfig?: CanvasAffordanceConfigInput',
    )
    expect(typeContractFile.source).not.toMatch(
      /\b(customCreationTools|customItemRenderers|customItemValidators)\?:/,
    )
    expect(extensionInputFile.source).not.toMatch(
      /\b(customCreationTools|customItemRenderers|customItemValidators)\?:/,
    )
  })

  it('keeps App Assembly child input contracts behind a named type module', () => {
    const typeContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyTypes.ts',
    )
    const inputContractFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyInputTypes.ts',
    )
    const componentAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentAssembly.ts',
    )
    const adapterAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterAssembly.ts',
    )
    const workspaceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppWorkspaceAssembly.ts',
    )
    const affordanceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceAssembly.ts',
    )

    expect(typeContractFile.source).toContain(
      "from './CanvasAppAssemblyInputTypes'",
    )
    for (const inputContract of [
      'export type CanvasAppAffordanceAssemblyInput',
      'export type CanvasAppComponentAssemblyInput',
      'export type CanvasAppAdapterAssemblyInput',
      'export type CanvasAppWorkspaceAssemblyInput',
    ]) {
      expect(inputContractFile.source).toContain(inputContract)
    }
    for (const assemblyFile of [
      componentAssemblyFile,
      adapterAssemblyFile,
      workspaceAssemblyFile,
      affordanceAssemblyFile,
    ]) {
      expect(assemblyFile.source).toContain(
        "from './CanvasAppAssemblyInputTypes'",
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppComponentAssemblyInput = {',
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppAdapterAssemblyInput = {',
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppWorkspaceAssemblyInput = {',
      )
      expect(assemblyFile.source).not.toContain(
        'export type CanvasAppAffordanceAssemblyInput = {',
      )
    }
  })

  it('keeps product-specific custom item ids outside canvas implementation', () => {
    const productCustomTerms =
      /\b(risk|risk-node|custom:risk|demo-risk-text)\b|kind:\s*['"]risk['"]/
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/') &&
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx'),
      )
      .flatMap((file) =>
        productCustomTerms.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

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

  it('keeps Core bounds resize rules behind a named module', () => {
    const primitivesFile = getSourceFile(
      'src/canvas/core/CanvasCorePrimitives.ts',
    )
    const boundsResizeFile = getSourceFile(
      'src/canvas/core/CanvasBoundsResize.ts',
    )

    expect(primitivesFile.source).toContain("from './CanvasBoundsResize'")
    expect(primitivesFile.source).not.toContain('resizeBoundsFromAnchor')
    expect(primitivesFile.source).not.toContain('preserveResizeAspectRatio')
    expect(boundsResizeFile.source).toContain(
      'export function resizeBounds',
    )
    expect(boundsResizeFile.source).toContain('resizeBoundsFromAnchor')
    expect(boundsResizeFile.source).toContain('preserveResizeAspectRatio')
  })

  it('keeps renderer stage orchestration independent from demo canvas items', () => {
    const demoItemTerms =
      /\b(CanvasItem|RectItem|TextItem|GroupItem|CanvasComponentItem|getCanvasItemBounds|getCanvasItemsBounds|CANVAS_COMPONENT_LIBRARY)\b/
    const violations = sourceFiles
      .filter((file) => file.path.startsWith('src/canvas/renderer/'))
      .flatMap((file) => demoItemTerms.test(file.source) ? [file.path] : [])

    expect(violations).toEqual([])
  })

  it('keeps app and ui imports behind the renderer public facade', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') ||
        file.path.startsWith('src/canvas/ui/'),
      )
      .flatMap(getImportReferences)
      .filter((reference) =>
        reference.target.startsWith('src/canvas/renderer/') &&
        reference.target !== 'src/canvas/renderer',
      )

    expect(violations).toEqual([])
  })

  it('keeps toolbar item grammar behind a named module', () => {
    const toolbarFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbar.tsx',
    )
    const itemRendererFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarItemRenderer.tsx',
    )
    const itemRenderDispatchFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarItemRenderDispatch.tsx',
    )
    const itemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarItems.ts',
    )
    const commandItemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandItems.ts',
    )
    const commandCatalogFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandCatalog.ts',
    )
    const commandContractsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandContracts.ts',
    )
    const commandDispatchFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandDispatch.ts',
    )
    const toolItemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarToolItems.ts',
    )

    expect(toolbarFile.source).toContain("from './CanvasToolbarItems'")
    expect(toolbarFile.source).toContain("from './CanvasToolbarItemRenderer'")
    expect(toolbarFile.source).not.toContain(
      "from './CanvasToolbarCommandDispatch'",
    )
    expect(toolbarFile.source).not.toContain('config.commands.')
    expect(toolbarFile.source).not.toContain('config.tools.')
    expect(toolbarFile.source).not.toContain('customCommands.map')
    expect(toolbarFile.source).not.toContain('customTools.map')
    expect(toolbarFile.source).not.toContain('CANVAS_TOOL_AFFORDANCES.select')
    expect(toolbarFile.source).not.toContain('CANVAS_TOOLBAR_TOOL_ICONS')
    expect(toolbarFile.source).not.toContain('CANVAS_TOOLBAR_COMMAND_ICONS')
    expect(toolbarFile.source).not.toContain("item.kind === 'builtin-tool'")
    expect(toolbarFile.source).not.toContain('switch (action.kind)')
    expect(toolbarFile.source).not.toContain('onAlign:')
    expect(itemRendererFile.source).toContain(
      'export function renderCanvasToolbarItem',
    )
    expect(itemRendererFile.source).toContain(
      "from './CanvasToolbarItemRenderDispatch'",
    )
    expect(itemRendererFile.source).not.toContain('CANVAS_TOOLBAR_TOOL_ICONS')
    expect(itemRendererFile.source).not.toContain(
      'CANVAS_TOOLBAR_COMMAND_ICONS',
    )
    expect(itemRendererFile.source).not.toContain("item.kind === '")
    expect(itemRenderDispatchFile.source).toContain(
      'CANVAS_TOOLBAR_ITEM_RENDER_STRATEGIES',
    )
    expect(itemRenderDispatchFile.source).toContain('CANVAS_TOOLBAR_TOOL_ICONS')
    expect(itemRenderDispatchFile.source).toContain(
      'CANVAS_TOOLBAR_COMMAND_ICONS',
    )
    expect(itemRenderDispatchFile.source).toContain(
      'renderCanvasToolbarBuiltinToolItem',
    )
    expect(itemRenderDispatchFile.source).toContain(
      'runCanvasToolbarCommandAction',
    )
    expect(itemRenderDispatchFile.source).toContain(
      "from './CanvasToolbarCommandContracts'",
    )
    expect(itemsFile.source).toContain(
      'export function getCanvasToolbarGroups',
    )
    expect(itemsFile.source).toContain("from './CanvasToolbarToolItems'")
    expect(itemsFile.source).toContain("from './CanvasToolbarCommandItems'")
    expect(itemsFile.source).not.toContain('getCanvasToolbarAlignItem')
    expect(itemsFile.source).not.toContain('getCanvasToolbarDistributeItem')
    expect(itemsFile.source).not.toContain('config.tools[builtinTool]')
    expect(itemsFile.source).not.toContain('CANVAS_TOOLBAR_BUILTIN_TOOLS')
    expect(itemsFile.source).toContain('customCommands.map')
    expect(itemsFile.source).not.toContain('customTools.map')
    expect(commandItemsFile.source).toContain(
      'export function getCanvasToolbarCommandGroups',
    )
    expect(commandItemsFile.source).toContain(
      "from './CanvasToolbarCommandCatalog'",
    )
    expect(commandItemsFile.source).not.toContain("command: 'alignLeft'")
    expect(commandItemsFile.source).not.toContain(
      "command: 'distributeHorizontal'",
    )
    expect(commandItemsFile.source).not.toContain(
      'getCanvasToolbarAlignItem',
    )
    expect(commandItemsFile.source).not.toContain(
      'getCanvasToolbarDistributeItem',
    )
    expect(commandCatalogFile.source).toContain(
      'CANVAS_TOOLBAR_COMMAND_GROUPS',
    )
    expect(commandCatalogFile.source).toContain("command: 'alignLeft'")
    expect(commandCatalogFile.source).toContain(
      "command: 'distributeHorizontal'",
    )
    expect(commandCatalogFile.source).not.toContain('config.commands')
    expect(commandCatalogFile.source).not.toContain('availability')
    expect(commandDispatchFile.source).toContain(
      'export function runCanvasToolbarCommandAction',
    )
    expect(commandContractsFile.source).toContain(
      'export type CanvasToolbarCommandHandlers',
    )
    expect(commandContractsFile.source).toContain('onAlign:')
    expect(commandContractsFile.source).not.toContain(
      'runCanvasToolbarCommandAction',
    )
    expect(commandContractsFile.source).not.toContain(
      'CANVAS_TOOLBAR_COMMAND_ACTION_RUNNERS',
    )
    expect(commandDispatchFile.source).toContain(
      "from './CanvasToolbarCommandContracts'",
    )
    expect(commandDispatchFile.source).not.toContain(
      'export type CanvasToolbarCommandHandlers',
    )
    expect(commandDispatchFile.source).toContain(
      'CANVAS_TOOLBAR_COMMAND_ACTION_RUNNERS',
    )
    expect(commandDispatchFile.source).not.toContain('switch (action.kind)')
    expect(commandDispatchFile.source).not.toContain(
      'assertUnhandledCanvasToolbarCommandAction',
    )
    expect(toolItemsFile.source).toContain(
      'export function getCanvasToolbarToolItems',
    )
    expect(toolItemsFile.source).toContain('CANVAS_TOOL_AFFORDANCE_ORDER')
    expect(toolItemsFile.source).not.toContain('CANVAS_TOOLBAR_BUILTIN_TOOLS')
    expect(toolItemsFile.source).toContain('config.tools[builtinTool]')
    expect(toolItemsFile.source).toContain('customTools.map')
  })

  it('keeps the app shell independent from concrete renderer stage modules', () => {
    const violations = getImportsFrom('src/canvas/app/shell/')
      .filter((reference) => reference.target.startsWith('src/canvas/renderer'))

    expect(violations).toEqual([])
  })

  it('keeps raw stage DOM operations inside the app stage element module', () => {
    const rawStageDomTerms =
      /\b(svgRef|RefObject<SVGSVGElement|stageElement\.current|getBoundingClientRect|hasPointerCapture|setPointerCapture|releasePointerCapture)\b|\b(?:addEventListener|removeEventListener)\(['"]wheel['"]/
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.startsWith('src/canvas/app/stage/') &&
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx'),
      )
      .flatMap((file) =>
        rawStageDomTerms.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps app stage element fan-out behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const stageElementModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppStageElementModel.ts',
    )
    const stageElementConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppStageElementConsumerModel.ts',
    )
    const stageElementConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppStageElementModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../stage/CanvasAppStageElement'",
    )
    expect(appModelFile.source).not.toContain('stageElement.mount')
    expect(stageElementModelFile.source).toContain(
      "from '../stage/CanvasAppStageElement'",
    )
    expect(stageElementModelFile.source).toContain(
      "from './CanvasAppStageElementConsumerModel'",
    )
    expect(stageElementConsumerModelFile.source).toContain(
      "from './CanvasAppConsumerContracts'",
    )
    expect(stageElementConsumerModelFile.source).toContain(
      '): CanvasAppStageElementConsumerModel',
    )
    expect(stageElementConsumerModelFile.source).not.toContain(
      'CanvasAppStageElementController',
    )
    expect(stageElementConsumerContractsFile.source).toContain(
      'export type CanvasAppStageElementConsumerModelInput',
    )
    expect(stageElementConsumerContractsFile.source).toContain(
      'export type CanvasAppStageElementConsumerModel',
    )
    expect(stageElementConsumerContractsFile.source).toContain(
      "CanvasAppStageElementController['mount']",
    )
    for (const consumerContext of [
      'command: {',
      'component: {',
      'pointer: {',
      'stage: {',
      'viewport: {',
    ]) {
      expect(stageElementModelFile.source).not.toContain(consumerContext)
      expect(stageElementConsumerModelFile.source).toContain(consumerContext)
    }
    expect(stageElementConsumerModelFile.source).toContain(
      'export function getCanvasAppStageElementConsumerModel',
    )
    expect(stageElementConsumerModelFile.source).toContain(
      'stageElement: stageElement.mount',
    )
  })

  it('keeps app stage render input on the stage mount interface', () => {
    const stageAdapterFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppStageAdapter.tsx',
    )
    const stageMount =
      stageAdapterFile.source.match(
        /export type CanvasAppStageMount = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''
    const stageAdapter =
      stageAdapterFile.source.match(
        /export type CanvasAppStageAdapter = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''
    const renderInput =
      stageAdapterFile.source.match(
        /export type CanvasAppStageRenderInput = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''

    expect(stageMount).toContain('ref: RefCallback<Element>')
    expect(stageMount).not.toContain('SVGSVGElement')
    expect(stageAdapter).toContain('renderStage')
    expect(stageAdapter).not.toMatch(/\n\s+Stage:/)
    expect(stageAdapter).not.toContain('ComponentType')
    expect(renderInput).toContain('stageElement: CanvasAppStageMount')
    expect(renderInput).not.toContain('onStageElement')
    expect(renderInput).not.toContain('RefCallback<SVGSVGElement>')
    expect(renderInput).not.toContain('PointerEvent<')
    expect(renderInput).not.toContain('SVGSVGElement')
  })

  it('keeps app shell independent from stage adapter props', () => {
    const shellFile = getSourceFile('src/canvas/app/shell/CanvasAppView.tsx')

    expect(shellFile.source).not.toContain('CanvasAppStageRenderInput')
    expect(shellFile.source).not.toContain('ComponentType')
    expect(shellFile.source).not.toContain('createElement(stage.')
    expect(shellFile.source).toContain('showComponentPalette')
    expect(shellFile.source).toContain('showInspector')
    expect(shellFile.source).toContain('showTextEditor')
  })

  it('keeps app shell open to assembly input without exposing assembly construction to consumers', () => {
    const shellFile = getSourceFile('src/canvas/app/shell/CanvasApp.tsx')
    const assemblySourceFile = getSourceFile(
      'src/canvas/app/shell/CanvasAppAssemblySource.ts',
    )
    const appFacadeFile = getSourceFile('src/canvas/app/index.ts')
    const packageFacadeFile = getSourceFile('src/canvas/index.ts')
    const mainFile = getSourceFile('src/main.tsx')

    expect(shellFile.source).toContain('resolveCanvasAppAssemblySource')
    expect(assemblySourceFile.source).toContain(
      'assemblyInput?: CanvasAppAssemblyInput',
    )
    expect(assemblySourceFile.source).toContain(
      'createCanvasAppAssembly(assemblyInput)',
    )
    expect(appFacadeFile.source).toContain('CanvasAppAssemblySource')
    expect(packageFacadeFile.source).toContain('CanvasAppAssemblySource')
    expect(mainFile.source).toContain('assemblyInput=')
    expect(mainFile.source).not.toContain('createCanvasAppAssembly')
  })

  it('keeps App authoring contracts behind a named public facade', () => {
    const appFacadeFile = getSourceFile('src/canvas/app/index.ts')
    const authoringFacadeFile = getSourceFile(
      'src/canvas/app/authoring/index.ts',
    )

    expect(appFacadeFile.source).toContain("from './authoring'")
    for (const authoringContract of [
      'createCanvasAppAssembly',
      'defineCanvasAppCustomItemModule',
      'createCanvasAppComponentPresentationRenderers',
      'createCanvasAppCustomItemRenderers',
      'CanvasAppCustomCommand',
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

  it('keeps app stage rendering containment behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const stageModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppStageModel.tsx',
    )
    const stageConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
    )
    const pointerConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain("from './CanvasAppStageModel'")
    expect(appModelFile.source).not.toContain('adapter.renderStage(input)')
    expect(appModelFile.source).not.toContain('adapter.renderItems(input)')
    expect(appModelFile.source).not.toContain('itemLayerInput')
    expect(appModelFile.source).not.toContain('stageInput')
    expect(appModelFile.source).not.toContain('outlineIds')
    expect(appModelFile.source).not.toContain('onCanvasPointerDown')
    expect(appModelFile.source).not.toContain('onPointerCancel')
    expect(appModelFile.source).not.toContain('onPointerMove')
    expect(appModelFile.source).not.toContain('onPointerUp')
    expect(appModelFile.source).not.toContain('onResizePointerDown')
    expect(appModelFile.source).not.toContain('onContextMenu')
    expect(stageModelFile.source).toContain(
      'export function renderCanvasAppStageModel',
    )
    expect(stageModelFile.source).toContain(
      "from './CanvasAppConsumerContracts'",
    )
    expect(stageModelFile.source).not.toContain('Pick<')
    expect(stageModelFile.source).not.toContain(
      "'onItemPointerDown' | 'onTextDoubleClick'",
    )
    expect(stageModelFile.source).not.toContain(
      "| 'onCanvasPointerDown'",
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageModelInput',
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageItemLayerContext',
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageRenderingContext',
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppStageContext',
    )
    expect(stageConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerConsumerModel',
    )
    expect(stageConsumerContractsFile.source).not.toContain(
      'CanvasAppItemLayerRenderInput',
    )
    expect(stageConsumerContractsFile.source).not.toContain(
      'CanvasAppStageRenderInput',
    )
    expect(stageConsumerContractsFile.source).not.toContain(
      'renderCanvasAppStageModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerItemLayerHandlers',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerStageHandlers',
    )
    expect(pointerConsumerContractsFile.source).not.toContain(
      'getCanvasAppPointerConsumerModel',
    )
    expect(stageModelFile.source).toContain('adapter.renderStage(input)')
    expect(stageModelFile.source).toContain('adapter.renderItems(input)')
    expect(stageModelFile.source).toContain(
      'outlineIds: stage.overlays.itemOutlineIds',
    )
    expect(stageModelFile.source).toContain(
      'pointer.stageHandlers.onCanvasPointerDown',
    )
    expect(stageModelFile.source).toContain('blurTextEditor()')
    expect(stageModelFile.source).toContain('catch')
  })

  it('keeps app control props behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const controlModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppControlModel.ts',
    )
    const controlCommandContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppControlCommandContracts.ts',
    )

    expect(appModelFile.source).toContain("from './CanvasAppControlModel'")
    expect(appModelFile.source).not.toContain(
      'getCanvasCommandAvailability',
    )
    expect(appModelFile.source).not.toContain(
      'CANVAS_GESTURE_STATUS_LABELS',
    )
    expect(appModelFile.source).not.toContain('CANVAS_TOOL_AFFORDANCES')
    expect(appModelFile.source).not.toContain('selection.length > 1')
    expect(appModelFile.source).not.toContain('selection.length > 2')
    expect(controlModelFile.source).not.toContain('selection.length > 1')
    expect(controlModelFile.source).not.toContain('selection.length > 2')
    expect(controlModelFile.source).toContain(
      'export function getCanvasAppControlModel',
    )
    expect(controlModelFile.source).toContain(
      "from './CanvasAppControlCommandContracts'",
    )
    expect(controlModelFile.source).not.toContain(
      'type CanvasAppControlCommandHandlers',
    )
    expect(controlCommandContractsFile.source).toContain(
      'export type CanvasAppControlCommandHandlers',
    )
    expect(controlCommandContractsFile.source).toContain('onAlign:')
    expect(controlCommandContractsFile.source).not.toContain(
      'getCanvasAppControlModel',
    )
    expect(controlModelFile.source).toContain(
      'getCanvasCommandAvailability',
    )
    expect(controlModelFile.source).toContain('commandAvailability')
    expect(controlModelFile.source).not.toContain(
      'getCanvasCommandSelectionState',
    )
    expect(controlModelFile.source).toContain(
      'CANVAS_GESTURE_STATUS_LABELS',
    )
    expect(controlModelFile.source).toContain('CANVAS_TOOL_AFFORDANCES')
  })

  it('passes command availability through toolbar command grammar as one contract', () => {
    const toolbarFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbar.tsx',
    )
    const toolbarItemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarItems.ts',
    )
    const toolbarCommandItemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandItems.ts',
    )
    const toolbarCommandCatalogFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandCatalog.ts',
    )

    for (const file of [
      toolbarFile,
      toolbarItemsFile,
      toolbarCommandItemsFile,
      toolbarCommandCatalogFile,
    ]) {
      expect(file.source).not.toContain('canAlign: boolean')
      expect(file.source).not.toContain('canDistribute: boolean')
      expect(file.source).not.toContain('canDuplicate: boolean')
      expect(file.source).not.toContain('canGroup: boolean')
    }

    expect(toolbarFile.source).toContain(
      'commandAvailability: CanvasCommandAvailability',
    )
    expect(toolbarItemsFile.source).toContain(
      'commandAvailability: CanvasCommandAvailability',
    )
    expect(toolbarCommandItemsFile.source).toContain(
      'availability: CanvasCommandAvailability',
    )
    expect(toolbarCommandCatalogFile.source).toContain(
      'keyof CanvasCommandAvailability & CanvasCommandId',
    )
    expect(toolbarCommandItemsFile.source).toContain(
      "from './CanvasToolbarCommandCatalog'",
    )
    expect(toolbarCommandItemsFile.source).toContain(
      'disabled: !availability[descriptor.command]',
    )
  })

  it('keeps built-in command selection thresholds in Engine command selection rules', () => {
    const actionFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandActions.ts',
    )
    const availabilityFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandAvailability.ts',
    )
    const availabilityRulesFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandAvailabilityRules.ts',
    )
    const rulesFile = getSourceFile(
      'src/canvas/engine/command/CanvasCommandSelectionRules.ts',
    )

    expect(actionFile.source).toContain(
      "from './CanvasCommandAvailabilityRules'",
    )
    expect(actionFile.source).toContain('canUseCanvasCommand')
    expect(actionFile.source).not.toContain('selection.length < 2')
    expect(actionFile.source).not.toContain('selection.length < 3')
    expect(availabilityFile.source).toContain(
      "from './CanvasCommandAvailabilityRules'",
    )
    expect(availabilityRulesFile.source).toContain(
      'CANVAS_COMMAND_AVAILABILITY_RULES',
    )
    expect(availabilityRulesFile.source).toContain(
      'type CanvasCommandAvailabilityRuleStateInput',
    )
    expect(availabilityRulesFile.source).toContain(
      'export function canUseCanvasCommand',
    )
    expect(availabilityRulesFile.source).toContain(
      'getCanvasCommandSelectionState',
    )
    expect(availabilityRulesFile.source).not.toContain(
      'selection.length > 1',
    )
    expect(availabilityRulesFile.source).not.toContain(
      'selection.length > 2',
    )
    expect(availabilityRulesFile.source).not.toContain('Omit<')
    expect(rulesFile.source).toContain(
      'CANVAS_COMMAND_SELECTION_MINIMUMS',
    )
    expect(rulesFile.source).toContain('align: 2')
    expect(rulesFile.source).toContain('distribute: 3')
  })

  it('keeps app command handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const commandModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppCommandModel.ts',
    )
    const commandConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppCommandConsumerModel.ts',
    )
    const commandConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
    )
    const commandHookFile = getSourceFile(
      'src/canvas/app/commands/useCanvasCommands.ts',
    )
    const standardCommandHandlersFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandHandlers.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppCommandModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../commands/useCanvasCommands'",
    )
    expect(appModelFile.source).not.toContain('useCanvasCommands({')
    expect(commandModelFile.source).toContain(
      "from '../commands/useCanvasCommands'",
    )
    expect(commandModelFile.source).toContain(
      "from './CanvasAppCommandConsumerModel'",
    )
    expect(commandModelFile.source).toContain(
      'export function useCanvasAppCommandModel',
    )
    expect(commandModelFile.source).toContain(
      'commitItemsChange: document.commitItemsChange',
    )
    expect(commandModelFile.source).toContain(
      'setSelection: workspace.setSelection',
    )
    expect(commandModelFile.source).not.toContain('control: {')
    expect(commandModelFile.source).not.toContain('keyboard: {')
    expect(commandModelFile.source).not.toContain('pointer: {')
    expect(commandConsumerModelFile.source).toContain(
      'export function getCanvasAppCommandConsumerModel',
    )
    expect(commandConsumerModelFile.source).toContain(
      "from './CanvasAppControlCommandContracts'",
    )
    expect(commandConsumerModelFile.source).toContain(
      "from './CanvasAppConsumerContracts'",
    )
    expect(commandConsumerModelFile.source).toContain(
      '): CanvasAppCommandConsumerModel',
    )
    expect(commandConsumerModelFile.source).toContain(
      'satisfies CanvasAppControlCommandHandlers',
    )
    expect(commandConsumerModelFile.source).not.toContain(
      'type CanvasAppCommandControlHandlers',
    )
    expect(commandConsumerModelFile.source).not.toContain(
      'type CanvasAppCommandRuntime',
    )
    expect(commandConsumerContractsFile.source).toContain(
      'export type CanvasAppCommandRuntime',
    )
    expect(commandConsumerContractsFile.source).toContain(
      'export type CanvasAppCommandConsumerModel',
    )
    for (const commandConsumerContract of [
      'CanvasAppCommandControlContext',
      'CanvasAppCommandKeyboardContext',
      'CanvasAppCommandPointerContext',
    ]) {
      expect(commandConsumerContractsFile.source).toContain(
        `export type ${commandConsumerContract}`,
      )
    }
    expect(commandConsumerModelFile.source).toContain('control: {')
    expect(commandConsumerModelFile.source).toContain('keyboard: {')
    expect(commandConsumerModelFile.source).toContain('pointer: {')
    expect(appModelFile.source).not.toMatch(/commands\.\w+Selection/)
    expect(appModelFile.source).not.toContain('commands.cloneItems')
    expect(commandHookFile.source).toContain(
      "from './CanvasStandardCommandHandlers'",
    )
    expect(commandHookFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(standardCommandHandlersFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(standardCommandHandlersFile.source).not.toContain(
      "from './CanvasStandardCommandExecution'",
    )
    for (const standardCommandHandlerDetail of [
      "kind: 'align'",
      "kind: 'delete'",
      "kind: 'distribute'",
      "kind: 'group'",
      "kind: 'lock'",
      "kind: 'nudge'",
      "kind: 'redo'",
      "kind: 'reorder'",
      "kind: 'select-all'",
      "kind: 'undo'",
      "kind: 'ungroup'",
      "kind: 'unlock-all'",
    ]) {
      expect(commandHookFile.source).not.toContain(
        standardCommandHandlerDetail,
      )
      expect(standardCommandHandlersFile.source).toContain(
        standardCommandHandlerDetail,
      )
    }
    expect(standardCommandHandlersFile.source).toContain(
      'export function getCanvasStandardCommandHandlers',
    )
  })

  it('keeps app component insertion wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const componentModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppComponentModel.ts',
    )
    const componentHookFile = getSourceFile(
      'src/canvas/app/components/useCanvasComponentInsertion.ts',
    )
    const componentExecutionFile = getSourceFile(
      'src/canvas/app/components/CanvasComponentInsertionExecution.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppComponentModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../components/useCanvasComponentInsertion'",
    )
    expect(appModelFile.source).not.toContain('useCanvasComponentInsertion')
    expect(componentModelFile.source).toContain(
      "from '../components/useCanvasComponentInsertion'",
    )
    expect(componentModelFile.source).toContain(
      'export function useCanvasAppComponentModel',
    )
    expect(componentModelFile.source).toContain('componentLibrary')
    expect(componentModelFile.source).toContain('selection: workspace.selection')
    expect(componentModelFile.source).toContain('control: {')
    expect(componentModelFile.source).toContain(
      'onInsertComponent: insertComponent',
    )
    expect(componentHookFile.source).toContain(
      "from './CanvasComponentInsertionExecution'",
    )
    expect(componentHookFile.source).toContain('insertCanvasComponent({')
    expect(componentHookFile.source).not.toContain('x: 120')
    expect(componentHookFile.source).not.toContain("type: 'add'")
    expect(componentHookFile.source).not.toContain("setTool('select')")
    expect(componentExecutionFile.source).toContain(
      'export function insertCanvasComponent',
    )
    expect(componentExecutionFile.source).toContain('x: 120')
    expect(componentExecutionFile.source).toContain("type: 'add'")
    expect(componentExecutionFile.source).toContain("setTool('select')")
    expect(appModelFile.source).not.toContain('components.insertComponent')
  })

  it('keeps app inspector wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const inspectorModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppInspectorModel.ts',
    )
    const objectInspectorHookFile = getSourceFile(
      'src/canvas/app/inspector/useCanvasObjectInspector.ts',
    )
    const objectInspectorModelFile = getSourceFile(
      'src/canvas/app/inspector/CanvasObjectInspectorModel.ts',
    )
    const objectInspectorLabelFile = getSourceFile(
      'src/canvas/app/inspector/CanvasObjectInspectorLabel.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppInspectorModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../inspector/useCanvasObjectInspector'",
    )
    expect(appModelFile.source).not.toContain('useCanvasObjectInspector')
    expect(inspectorModelFile.source).toContain(
      "from '../inspector/useCanvasObjectInspector'",
    )
    expect(inspectorModelFile.source).toContain(
      'export function useCanvasAppInspectorModel',
    )
    expect(inspectorModelFile.source).toContain('inspectorPanels')
    expect(inspectorModelFile.source).toContain('itemReadModel')
    expect(objectInspectorHookFile.source).toContain(
      "from './CanvasObjectInspectorModel'",
    )
    expect(objectInspectorHookFile.source).not.toContain('resize-selection')
    expect(objectInspectorHookFile.source).not.toContain('item.locked')
    expect(objectInspectorHookFile.source).not.toContain('capitalize(')
    expect(objectInspectorModelFile.source).toContain(
      'export function getCanvasObjectInspectorModel',
    )
    expect(objectInspectorModelFile.source).toContain(
      "from './CanvasObjectInspectorLabel'",
    )
    expect(objectInspectorModelFile.source).toContain('resize-selection')
    expect(objectInspectorModelFile.source).toContain('item.locked')
    expect(objectInspectorModelFile.source).not.toContain('capitalize(')
    expect(objectInspectorModelFile.source).not.toContain(
      "item.type === 'component'",
    )
    expect(objectInspectorLabelFile.source).toContain(
      'export function getCanvasObjectInspectorLabel',
    )
    expect(objectInspectorLabelFile.source).toContain("'title' in item")
    expect(objectInspectorLabelFile.source).toContain('item.type')
  })

  it('keeps app pointer handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const pointerModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppPointerModel.ts',
    )
    const pointerConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppPointerConsumerModel.ts',
    )
    const pointerConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppPointerModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../pointer/useCanvasPointerDownHandlers'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../pointer/useCanvasPointerDragHandlers'",
    )
    expect(appModelFile.source).not.toContain('useCanvasPointerDownHandlers')
    expect(appModelFile.source).not.toContain('useCanvasPointerDragHandlers')
    expect(pointerModelFile.source).toContain(
      "from '../pointer/useCanvasPointerDownHandlers'",
    )
    expect(pointerModelFile.source).toContain(
      "from '../pointer/useCanvasPointerDragHandlers'",
    )
    expect(pointerModelFile.source).toContain(
      "from './CanvasAppPointerConsumerModel'",
    )
    expect(pointerModelFile.source).not.toContain('itemLayerHandlers')
    expect(pointerModelFile.source).not.toContain('stageHandlers')
    expect(pointerConsumerModelFile.source).toContain(
      'export function getCanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerModelFile.source).toContain(
      "from './CanvasAppConsumerContracts'",
    )
    expect(pointerConsumerModelFile.source).toContain(
      '): CanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'export type CanvasAppPointerConsumerModel',
    )
    expect(pointerConsumerContractsFile.source).toContain(
      'onCanvasPointerDown',
    )
    expect(pointerConsumerContractsFile.source).not.toContain(
      'downHandlers.handleCanvasPointerDown',
    )
    expect(pointerConsumerModelFile.source).toContain('itemLayerHandlers')
    expect(pointerConsumerModelFile.source).toContain('stageHandlers')
    expect(pointerConsumerModelFile.source).toContain(
      'onCanvasPointerDown: downHandlers.handleCanvasPointerDown',
    )
  })

  it('keeps pointer drag effect application behind a named module', () => {
    const dragHookFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDragHandlers.ts',
    )
    const dragEffectsFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionDragEffects.ts',
    )
    const dragSessionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerDragSession.ts',
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
    expect(dragSessionFile.source).not.toContain('Pick<')
    expect(dragSessionFile.source).toContain('CanvasAppPointerIdInput')
    expect(dragSessionFile.source).toContain('CanvasAppPointerScreenInput')
    expect(dragEffectsFile.source).not.toContain('Pick<')
    expect(dragEffectsFile.source).toContain('CanvasAppPointerIdInput')
  })

  it('keeps pointer click memory rules behind a named module', () => {
    const pointerDownHookFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const clickMemoryFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerClickMemory.ts',
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

  it('keeps app keyboard handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const keyboardModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppKeyboardModel.ts',
    )
    const keyboardConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppKeyboardModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../keyboard/useCanvasKeyboardShortcuts'",
    )
    expect(appModelFile.source).not.toContain('useCanvasKeyboardShortcuts')
    expect(keyboardModelFile.source).toContain(
      "from '../keyboard/useCanvasKeyboardShortcuts'",
    )
    expect(keyboardModelFile.source).toContain(
      "from './CanvasAppConsumerContracts'",
    )
    expect(keyboardModelFile.source).toContain(
      'export function useCanvasAppKeyboardModel',
    )
    expect(keyboardModelFile.source).not.toContain(
      'CanvasKeyboardShortcutHandlers',
    )
    expect(keyboardModelFile.source).not.toContain('Pick<')
    expect(keyboardModelFile.source).toContain('command.copySelection')
    expect(keyboardModelFile.source).toContain('interaction.setSpaceDown')
    expect(keyboardModelFile.source).toContain('viewport.zoomBy')
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardModelInput',
    )
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardCommandContext',
    )
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardInteractionContext',
    )
    expect(keyboardConsumerContractsFile.source).toContain(
      'export type CanvasAppKeyboardViewportContext',
    )
    expect(keyboardConsumerContractsFile.source).not.toContain(
      'useCanvasKeyboardShortcuts',
    )
  })

  it('keeps app viewport handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const viewportModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppViewportModel.ts',
    )
    const viewportConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppViewportConsumerModel.ts',
    )
    const viewportControlsHookFile = getSourceFile(
      'src/canvas/app/viewport/useCanvasViewportControls.ts',
    )
    const viewportControlExecutionFile = getSourceFile(
      'src/canvas/app/viewport/CanvasViewportControlExecution.ts',
    )
    const wheelViewportHookFile = getSourceFile(
      'src/canvas/app/viewport/useCanvasWheelViewport.ts',
    )
    const wheelViewportExecutionFile = getSourceFile(
      'src/canvas/app/viewport/CanvasWheelViewportExecution.ts',
    )

    expect(appModelFile.source).toContain(
      "from './useCanvasAppViewportModel'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../viewport/useCanvasWheelViewport'",
    )
    expect(appModelFile.source).not.toContain(
      "from '../viewport/useCanvasViewportControls'",
    )
    expect(appModelFile.source).not.toContain('useCanvasWheelViewport')
    expect(appModelFile.source).not.toContain('useCanvasViewportControls')
    expect(viewportModelFile.source).toContain(
      "from '../viewport/useCanvasWheelViewport'",
    )
    expect(viewportModelFile.source).toContain(
      "from '../viewport/useCanvasViewportControls'",
    )
    expect(viewportModelFile.source).toContain(
      "from './CanvasAppViewportConsumerModel'",
    )
    expect(viewportModelFile.source).toContain(
      'export function useCanvasAppViewportModel',
    )
    expect(viewportModelFile.source).toContain('useCanvasWheelViewport')
    expect(viewportModelFile.source).toContain('useCanvasViewportControls')
    expect(viewportModelFile.source).not.toContain('control: {')
    expect(viewportModelFile.source).not.toContain('keyboard: {')
    expect(viewportConsumerModelFile.source).toContain(
      'export function getCanvasAppViewportConsumerModel',
    )
    expect(viewportConsumerModelFile.source).toContain('control: {')
    expect(viewportConsumerModelFile.source).toContain('keyboard: {')
    expect(appModelFile.source).not.toContain('viewportControls.fitToItems')
    expect(appModelFile.source).not.toContain('viewportControls.resetViewport')
    expect(appModelFile.source).not.toContain('viewportControls.zoomBy')
    expect(viewportControlsHookFile.source).toContain(
      "from './CanvasViewportControlExecution'",
    )
    for (const hookImplementationDetail of [
      'getAllIds',
      'fitBoundsIntoViewport',
      'INITIAL_VIEWPORT',
      'zoomViewport',
      'rect.width / 2',
    ]) {
      expect(viewportControlsHookFile.source).not.toContain(
        hookImplementationDetail,
      )
      expect(viewportControlExecutionFile.source).toContain(
        hookImplementationDetail,
      )
    }
    expect(viewportControlExecutionFile.source).toContain(
      'export function fitCanvasViewportToItems',
    )
    expect(viewportControlExecutionFile.source).toContain(
      'export function resetCanvasViewport',
    )
    expect(viewportControlExecutionFile.source).toContain(
      'export function zoomCanvasViewportBy',
    )
    expect(wheelViewportHookFile.source).toContain(
      "from './CanvasWheelViewportExecution'",
    )
    for (const wheelHookImplementationDetail of [
      'shouldHandleCanvasWheelViewport',
      'getCanvasWheelViewport',
      'type CanvasWheelInput',
      'preventDefault',
      'clientX - rect.left',
    ]) {
      expect(wheelViewportHookFile.source).not.toContain(
        wheelHookImplementationDetail,
      )
      expect(wheelViewportExecutionFile.source).toContain(
        wheelHookImplementationDetail,
      )
    }
    expect(wheelViewportExecutionFile.source).toContain(
      'export function runCanvasWheelViewport',
    )
  })

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
      'src/canvas/app/text/useCanvasTextEditing.ts',
    )
    const textEditingModelFile = getSourceFile(
      'src/canvas/app/text/CanvasTextEditingModel.ts',
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
      'useRef<HTMLTextAreaElement | null>',
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
    expect(textEditingHookFile.source).toContain(
      "from './CanvasTextEditingModel'",
    )
    expect(textEditingHookFile.source).toContain('commitCanvasTextEditing({')
    expect(textEditingHookFile.source).toContain('getCanvasTextEditorStyle({')
    expect(textEditingHookFile.source).not.toContain("'Text'")
    expect(textEditingHookFile.source).not.toContain("type: 'set-text'")
    expect(textEditingHookFile.source).not.toContain('fontSize: 16')
    expect(textEditorModelFile.source).toContain(
      "from '../text/CanvasTextEditingModel'",
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
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
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
      "from './CanvasAppConsumerContracts'",
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

  it('keeps app item layer render input on the app pointer input interface', () => {
    const itemLayerAdapterFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppItemLayerAdapter.tsx',
    )
    const renderInput =
      itemLayerAdapterFile.source.match(
        /export type CanvasAppItemLayerRenderInput = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''

    expect(renderInput).toContain('CanvasAppPointerInput')
    expect(renderInput).not.toContain('PointerEvent<')
    expect(renderInput).not.toContain('SVGGElement')
  })

  it('keeps app pointer input sources explicit instead of React event picks', () => {
    const pointerInputFile = getSourceFile(
      'src/canvas/app/pointer/CanvasAppPointerInput.ts',
    )

    expect(pointerInputFile.source).toContain(
      'export type CanvasAppScreenPointInput',
    )
    expect(pointerInputFile.source).toContain(
      'export type CanvasAppPointerIdInput',
    )
    expect(pointerInputFile.source).toContain(
      'export type CanvasAppPointerSource',
    )
    expect(pointerInputFile.source).not.toContain('Pick<')
    expect(pointerInputFile.source).not.toContain('PointerEvent<')
    expect(pointerInputFile.source).not.toContain('MouseEvent<')
  })

  it('keeps pointer interaction commit and cancel lifecycle behind a named module', () => {
    const dragHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDragHandlers.ts',
    )
    const lifecycleFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionLifecycle.ts',
    )
    const creationCommitFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationCommit.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCustomCreation.ts',
    )
    const marqueeInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerMarqueeInteraction.ts',
    )
    const transformInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerTransformInteraction.ts',
    )
    const interactionRoutingFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionRouting.ts',
    )

    expect(dragHandlersFile.source).toContain(
      "from './CanvasPointerInteractionLifecycle'",
    )
    expect(dragHandlersFile.source).not.toContain('createCanvasRect({')
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
    expect(lifecycleFile.source).not.toContain('createCanvasRect({')
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
      'src/canvas/app/pointer/CanvasPointerShapeCreation.ts',
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
    expect(creationCommitFile.source).not.toContain('createCanvasRect({')
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
    expect(shapeCreationFile.source).toContain('createCanvasRect({')
    expect(shapeCreationFile.source).toContain('createCanvasArrow({')
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

  it('keeps pointer creation kind routing behind a named grammar module', () => {
    const lifecycleFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionLifecycle.ts',
    )
    const interactionPreviewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionPreview.ts',
    )
    const creationStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationStart.ts',
    )
    const creationPreviewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationPreview.ts',
    )
    const creationCommitFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationCommit.ts',
    )
    const creationGrammarFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationGrammar.ts',
    )
    const interactionRoutingFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionRouting.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCustomCreation.ts',
    )
    const shapeCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerShapeCreation.ts',
    )
    const textCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerTextCreation.ts',
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
    expect(shapeCreationFile.source).toContain(
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
      "interaction.kind === 'create-rect'",
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
      "interaction.kind === 'create-rect'",
      "pointerGesture === 'create-arrow'",
      "pointerGesture === 'create-rect'",
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

  it('keeps pointer interaction preview rules behind a named module', () => {
    const dragHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDragHandlers.ts',
    )
    const previewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionPreview.ts',
    )
    const interactionRoutingFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionRouting.ts',
    )
    const creationPreviewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationPreview.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCustomCreation.ts',
    )
    const shapeCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerShapeCreation.ts',
    )
    const marqueeInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerMarqueeInteraction.ts',
    )
    const panInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerPanInteraction.ts',
    )
    const transformPreviewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerTransformPreview.ts',
    )
    const movementFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionMovement.ts',
    )

    expect(dragHandlersFile.source).toContain(
      "from './CanvasPointerInteractionPreview'",
    )
    expect(dragHandlersFile.source).not.toContain('getCanvasMoveSnap')
    expect(dragHandlersFile.source).not.toContain('resizeCanvasSelection')
    expect(dragHandlersFile.source).not.toContain('getCanvasMarqueeSelection')
    expect(dragHandlersFile.source).not.toContain('getNextCanvasDrawingPoints')
    expect(dragHandlersFile.source).not.toContain('DRAG_THRESHOLD')
    expect(previewFile.source).toContain(
      "from './CanvasPointerCreationPreview'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerTransformPreview'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerMarqueeInteraction'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerPanInteraction'",
    )
    expect(previewFile.source).toContain(
      "from './CanvasPointerInteractionRouting'",
    )
    expect(previewFile.source).toContain(
      'export function previewCanvasPointerInteraction',
    )
    expect(previewFile.source).not.toContain("interaction.kind === 'pan'")
    expect(previewFile.source).not.toContain("interaction.kind === 'move'")
    expect(previewFile.source).not.toContain("interaction.kind === 'resize'")
    expect(previewFile.source).not.toContain(
      "interaction.kind === 'marquee'",
    )
    expect(interactionRoutingFile.source).toContain(
      'export function routeCanvasPointerInteraction',
    )
    expect(interactionRoutingFile.source).toContain(
      "interaction.kind === 'pan'",
    )
    expect(interactionRoutingFile.source).toContain(
      "interaction.kind === 'move' || interaction.kind === 'resize'",
    )
    expect(interactionRoutingFile.source).toContain(
      "interaction.kind === 'marquee'",
    )
    expect(previewFile.source).not.toContain('EMPTY_CANVAS_SNAP_GUIDES')
    expect(previewFile.source).not.toContain('config.gestures.pan')
    expect(previewFile.source).not.toContain('interaction.origin.x + dx')
    expect(previewFile.source).not.toContain('getCanvasMoveSnap')
    expect(previewFile.source).not.toContain('resizeCanvasSelection')
    expect(previewFile.source).not.toContain('moveCanvasSelection')
    expect(previewFile.source).not.toContain('getCanvasMarqueeSelection')
    expect(previewFile.source).not.toContain('getNextCanvasDrawingPoints')
    expect(previewFile.source).not.toContain('createCanvasDraftStroke')
    expect(previewFile.source).not.toContain('DRAG_THRESHOLD')
    expect(creationPreviewFile.source).toContain(
      'export function previewCanvasPointerCreation',
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
    expect(creationPreviewFile.source).not.toContain(
      'getNextCanvasDrawingPoints',
    )
    expect(creationPreviewFile.source).not.toContain(
      'createCanvasDraftStroke',
    )
    expect(drawingCreationFile.source).toContain(
      'getNextCanvasDrawingPoints',
    )
    expect(drawingCreationFile.source).toContain('createCanvasDraftStroke')
    expect(shapeCreationFile.source).toContain('normalizeBounds')
    expect(shapeCreationFile.source).toContain('snapCanvasPointToGrid')
    expect(customCreationFile.source).toContain('snapCanvasPointToGrid')
    expect(customCreationFile.source).toContain('hasCanvasInteractionMoved')
    expect(marqueeInteractionFile.source).toContain(
      'export function previewCanvasPointerMarqueeInteraction',
    )
    expect(marqueeInteractionFile.source).toContain('getCanvasMarqueeSelection')
    expect(marqueeInteractionFile.source).toContain('normalizeBounds')
    expect(marqueeInteractionFile.source).toContain(
      'hasCanvasInteractionMoved',
    )
    expect(panInteractionFile.source).toContain(
      'export function previewCanvasPointerPanInteraction',
    )
    expect(panInteractionFile.source).toContain('EMPTY_CANVAS_SNAP_GUIDES')
    expect(panInteractionFile.source).toContain('config.gestures.pan')
    expect(panInteractionFile.source).toContain('interaction.origin.x + dx')
    expect(transformPreviewFile.source).toContain(
      'export function previewCanvasPointerTransform',
    )
    expect(transformPreviewFile.source).toContain('getCanvasMoveSnap')
    expect(transformPreviewFile.source).toContain('moveCanvasSelection')
    expect(transformPreviewFile.source).toContain('resizeCanvasSelection')
    expect(transformPreviewFile.source).toContain('snapCanvasPointToGrid')
    expect(movementFile.source).toContain(
      'export function hasCanvasInteractionMoved',
    )
    expect(movementFile.source).toContain('DRAG_THRESHOLD')
  })

  it('keeps pointer interaction start rules behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const startSessionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerStartSession.ts',
    )
    const gestureEngineFile = getSourceFile(
      'src/canvas/engine/gesture/CanvasGestureEngine.ts',
    )
    const toolGestureRoutingFile = getSourceFile(
      'src/canvas/engine/gesture/CanvasToolGestureRouting.ts',
    )
    const startFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionStart.ts',
    )
    const creationStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationStart.ts',
    )
    const drawingCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerDrawingCreation.ts',
    )
    const customCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCustomCreation.ts',
    )
    const shapeCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerShapeCreation.ts',
    )
    const textCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerTextCreation.ts',
    )
    const marqueeInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerMarqueeInteraction.ts',
    )
    const panInteractionFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerPanInteraction.ts',
    )

    expect(downHandlersFile.source).toContain(
      "from './CanvasPointerInteractionStart'",
    )
    expect(downHandlersFile.source).not.toContain('getCanvasPointerGesture')
    expect(downHandlersFile.source).not.toContain('isAdditivePointerInput')
    expect(downHandlersFile.source).not.toContain('createCanvasText')
    expect(downHandlersFile.source).not.toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(downHandlersFile.source).not.toContain(
      'createCanvasDraftStroke',
    )
    expect(downHandlersFile.source).not.toContain('screenPoint(')
    expect(downHandlersFile.source).not.toContain('screenToWorld(')
    expect(downHandlersFile.source).toContain(
      "from './CanvasPointerStartSession'",
    )
    expect(startSessionFile.source).toContain(
      'export function getCanvasPointerStartProjection',
    )
    expect(startSessionFile.source).not.toContain('Pick<')
    expect(startSessionFile.source).toContain('CanvasAppScreenPointInput')
    expect(startSessionFile.source).toContain('screenPoint(')
    expect(startSessionFile.source).toContain('screenToWorld(')
    expect(startFile.source).toContain(
      'export function startCanvasPointerInteraction',
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerCreationStart'",
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerMarqueeInteraction'",
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerPanInteraction'",
    )
    expect(startFile.source).toContain('getCanvasPointerGesture')
    expect(startFile.source).not.toContain('isAdditivePointerInput')
    expect(startFile.source).not.toContain('origin: viewport')
    expect(startFile.source).not.toContain('createCanvasText')
    expect(startFile.source).not.toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(startFile.source).not.toContain('createCanvasDraftStroke')
    expect(gestureEngineFile.source).toContain(
      "from './CanvasToolGestureRouting'",
    )
    expect(gestureEngineFile.source).not.toContain("tool === 'rect'")
    expect(gestureEngineFile.source).not.toContain("tool === 'marker'")
    expect(gestureEngineFile.source).not.toContain("tool === 'highlight'")
    expect(gestureEngineFile.source).not.toContain("tool === 'arrow'")
    expect(gestureEngineFile.source).not.toContain("tool === 'text'")
    expect(gestureEngineFile.source).not.toContain("tool === 'pan'")
    expect(toolGestureRoutingFile.source).toContain(
      'CANVAS_TOOL_GESTURE_ROUTES',
    )
    expect(toolGestureRoutingFile.source).toContain(
      'type CanvasToolGestureRouteInput',
    )
    expect(toolGestureRoutingFile.source).not.toContain('Omit<')
    expect(toolGestureRoutingFile.source).toContain("gesture: 'draw-marker'")
    expect(toolGestureRoutingFile.source).toContain(
      "gesture: 'draw-highlight'",
    )
    expect(toolGestureRoutingFile.source).toContain(
      'routeItemPointerToCanvasGesture',
    )
    expect(creationStartFile.source).toContain(
      'export function startCanvasPointerCreation',
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
    expect(creationStartFile.source).not.toContain('createCanvasText')
    expect(creationStartFile.source).not.toContain('createCanvasDraftStroke')
    expect(drawingCreationFile.source).toContain('createCanvasDraftStroke')
    expect(creationStartFile.source).not.toContain('normalizeBounds')
    expect(creationStartFile.source).not.toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(customCreationFile.source).toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(shapeCreationFile.source).toContain('normalizeBounds')
    expect(textCreationFile.source).toContain('createCanvasText')
    expect(marqueeInteractionFile.source).toContain(
      'export function startCanvasPointerMarqueeInteraction',
    )
    expect(marqueeInteractionFile.source).toContain('isAdditivePointerInput')
    expect(panInteractionFile.source).toContain(
      'export function startCanvasPointerPanInteraction',
    )
    expect(panInteractionFile.source).toContain('origin: viewport')
  })

  it('keeps pointer interaction start effects behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionStartEffects.ts',
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
      'export function applyCanvasItemPointerInteractionStartEffect',
    )
    expect(effectsFile.source).toContain('capturePointer(')
    expect(effectsFile.source).toContain("commitItemsChange({ type: 'add'")
    expect(effectsFile.source).toContain("setTool('select')")
    expect(effectsFile.source).toContain(
      'export type CanvasTextEditInteractionStartEffectContext',
    )
    expect(effectsFile.source).not.toContain('Pick<')
  })

  it('keeps item pointer interaction start rules behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const itemStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasItemPointerInteractionStart.ts',
    )

    expect(downHandlersFile.source).toContain(
      "from './CanvasItemPointerInteractionStart'",
    )
    expect(downHandlersFile.source).not.toContain(
      'getCanvasItemPointerIntent',
    )
    expect(downHandlersFile.source).not.toContain(
      'getCanvasItemPointerSelection',
    )
    expect(downHandlersFile.source).not.toContain('findEditableTextItem')
    expect(downHandlersFile.source).not.toContain('altDragDuplicate')
    expect(downHandlersFile.source).not.toContain('historySelection')
    expect(downHandlersFile.source).not.toContain('config.gestures.textEdit')
    expect(downHandlersFile.source).not.toContain("item.type === 'rect'")
    expect(downHandlersFile.source).not.toContain('commitSelection([item.id])')
    expect(itemStartFile.source).toContain(
      'export function startCanvasItemPointerInteraction',
    )
    expect(itemStartFile.source).toContain(
      'export function startCanvasTextEditInteraction',
    )
    expect(itemStartFile.source).toContain('getCanvasItemPointerIntent')
    expect(itemStartFile.source).toContain('getCanvasItemPointerSelection')
    expect(itemStartFile.source).toContain('findEditableTextItem')
    expect(itemStartFile.source).toContain('altDragDuplicate')
    expect(itemStartFile.source).toContain('historySelection')
    expect(itemStartFile.source).toContain('config.gestures.textEdit')
    expect(itemStartFile.source).toContain('getCanvasEditableTextValue')
    expect(itemStartFile.source).toContain('selection: [item.id]')
  })

  it('keeps resize pointer interaction start rules behind a named module', () => {
    const downHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDownHandlers.ts',
    )
    const resizeStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasResizePointerInteractionStart.ts',
    )

    expect(downHandlersFile.source).toContain(
      "from './CanvasResizePointerInteractionStart'",
    )
    expect(downHandlersFile.source).not.toContain('config.gestures.resize')
    expect(downHandlersFile.source).not.toContain("kind: 'resize'")
    expect(downHandlersFile.source).not.toContain('currentItems: items')
    expect(downHandlersFile.source).not.toContain('historyItems: items')
    expect(resizeStartFile.source).toContain(
      'export function startCanvasResizePointerInteraction',
    )
    expect(resizeStartFile.source).toContain('config.gestures.resize')
    expect(resizeStartFile.source).toContain("kind: 'resize'")
    expect(resizeStartFile.source).toContain('currentItems: items')
    expect(resizeStartFile.source).toContain('historyItems: items')
  })

  it('keeps app rendering authoring contracts independent from Demo SVG registry names', () => {
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRenderingContracts.ts',
    )
    const registriesFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistries.ts',
    )
    const itemLayerAdapterFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppItemLayerAdapter.tsx',
    )
    const authoringFacadeFile = getSourceFile(
      'src/canvas/app/authoring/index.ts',
    )
    const workflowFacadeFile = getSourceFile(
      'src/canvas/app/workflow/index.ts',
    )
    const renderingFacadeFile = getSourceFile(
      'src/canvas/app/rendering/index.ts',
    )

    expect(contractsFile.source).toContain(
      'CanvasAppComponentRendererStrategy',
    )
    expect(contractsFile.source).toContain(
      'CanvasAppCustomItemRendererStrategy',
    )
    expect(contractsFile.source).not.toContain('CanvasDemoSvg')
    expect(registriesFile.source).toContain(
      'export function createCanvasAppComponentPresentationRenderers',
    )
    expect(registriesFile.source).toContain(
      'export function createCanvasAppCustomItemRenderers',
    )
    expect(registriesFile.source).toContain(
      "from './CanvasDemoSvgComponentPresentationRegistry'",
    )
    expect(registriesFile.source).toContain(
      "from './CanvasDemoSvgCustomItemRendererRegistry'",
    )
    expect(registriesFile.source).not.toContain('Parameters<typeof')
    expect(registriesFile.source).not.toContain('export type {')
    expect(authoringFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRendererRegistries'",
    )
    expect(authoringFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRenderingContracts'",
    )
    expect(workflowFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRendererRegistries'",
    )
    expect(workflowFacadeFile.source).toContain(
      "from '../rendering/CanvasAppRenderingContracts'",
    )
    expect(renderingFacadeFile.source).toContain(
      "from './CanvasAppRendererRegistries'",
    )
    expect(renderingFacadeFile.source).toContain(
      "from './CanvasAppRenderingContracts'",
    )
    expect(authoringFacadeFile.source).not.toContain("from '../rendering'")
    expect(itemLayerAdapterFile.source).not.toMatch(
      /CanvasDemoSvg(?:Component|Custom).*Renderer/,
    )
  })

  it('keeps app modules from depending on the broad rendering barrel', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.startsWith('src/canvas/app/rendering/'),
      )
      .flatMap((file) =>
        /from ['"]\.\.\/rendering['"]/.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps built-in drawing geometry in the host drawing module', () => {
    const drawingGeometryModule = getSourceFile(
      'src/canvas/host/drawing/CanvasDrawingItemGeometry.ts',
    )
    const hostEntryFile = getSourceFile('src/canvas/host/index.ts')
    const treeBoundsFile = getSourceFile(
      'src/canvas/host/tree/CanvasTreeBounds.ts',
    )
    const cloneOperationsFile = getSourceFile(
      'src/canvas/host/operations/CanvasItemCloneOperations.ts',
    )
    const transformOperationsFile = getSourceFile(
      'src/canvas/host/operations/CanvasItemTransformOperations.ts',
    )
    const drawingRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderer.tsx',
    )

    expect(drawingGeometryModule.source).toContain(
      'export function isCanvasDrawingItem',
    )
    expect(drawingGeometryModule.source).toContain(
      'export function getCanvasDrawingItemBounds',
    )
    expect(drawingGeometryModule.source).toContain(
      'export function translateCanvasDrawingItem',
    )
    expect(drawingGeometryModule.source).toContain(
      'export function scaleCanvasDrawingItem',
    )
    expect(hostEntryFile.source).toContain(
      "from './drawing/CanvasDrawingItemGeometry'",
    )
    for (const hostConsumer of [
      treeBoundsFile,
      cloneOperationsFile,
      transformOperationsFile,
    ]) {
      expect(hostConsumer.source).toContain(
        "from '../drawing/CanvasDrawingItemGeometry'",
      )
      expect(hostConsumer.source).not.toContain(
        "item.type === 'marker' || item.type === 'highlight'",
      )
      expect(hostConsumer.source).not.toContain("item.type === 'arrow'")
    }
    expect(treeBoundsFile.source).not.toContain('CANVAS_ARROW_BOUNDS_PAD')
    expect(cloneOperationsFile.source).not.toContain('points: item.points.map')
    expect(transformOperationsFile.source).not.toContain('scalePointsToBounds')
    expect(drawingRendererFile.source).toContain(
      "from '../../host'",
    )
    expect(drawingRendererFile.source).toContain('isCanvasDrawingItem(item)')
    expect(drawingRendererFile.source).not.toContain(
      "item.type === 'marker' ||",
    )
  })

  it('keeps built-in drawing style defaults in the host drawing module', () => {
    const drawingStyleModule = getSourceFile(
      'src/canvas/host/drawing/CanvasDrawingItemStyles.ts',
    )
    const drawingStyleConsumers = [
      getSourceFile('src/canvas/app/pointer/CanvasPointerDrawing.ts'),
      getSourceFile('src/canvas/host/adapters/CanvasItemCreationAdapter.ts'),
    ].map((file) => file.source).join('\n')

    expect(drawingStyleModule.source).toContain('CANVAS_MARKER_STYLE')
    expect(drawingStyleModule.source).toContain('CANVAS_HIGHLIGHT_STYLE')
    expect(drawingStyleModule.source).toContain('CANVAS_ARROW_STYLE')
    expect(drawingStyleModule.source).toContain(
      'export type CanvasDrawingStrokeStyle',
    )
    expect(drawingStyleModule.source).toContain(
      'export type CanvasArrowStyle',
    )
    expect(drawingStyleModule.source).not.toContain('Pick<')
    expect(drawingStyleModule.source).not.toContain("from '../model'")
    expect(drawingStyleConsumers).not.toContain('#475569')
    expect(drawingStyleConsumers).not.toContain('#fde047')
    expect(drawingStyleConsumers).not.toContain('#334155')
  })

  it('keeps built-in drawing item validation in the host drawing module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const drawingValidationFile = getSourceFile(
      'src/canvas/host/drawing/CanvasDrawingItemValidation.ts',
    )

    expect(itemSchemaFile.source).toContain(
      "from '../drawing/CanvasDrawingItemValidation'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasDrawingItemStorageShape(value)',
    )
    expect(itemSchemaFile.source).not.toContain('function isOpacity')
    expect(itemSchemaFile.source).not.toContain('function isDrawingPointArray')
    expect(itemSchemaFile.source).not.toContain('function isSamePoint')
    expect(itemSchemaFile.source).not.toContain(
      "value.type === 'marker' || value.type === 'highlight'",
    )
    expect(itemSchemaFile.source).not.toContain("value.type === 'arrow'")
    expect(drawingValidationFile.source).toContain(
      'export function isCanvasDrawingItemStorageShape',
    )
    expect(drawingValidationFile.source).toContain('function isOpacity')
    expect(drawingValidationFile.source).toContain(
      'function isDrawingPointArray',
    )
    expect(drawingValidationFile.source).toContain('function isSamePoint')
  })

  it('keeps component item validation in the host component module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const componentValidationFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentItemValidation.ts',
    )

    expect(itemSchemaFile.source).toContain(
      "from '../component/CanvasComponentItemValidation'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasComponentItemStorageShape(value)',
    )
    expect(itemSchemaFile.source).not.toContain('isCanvasStableId')
    expect(itemSchemaFile.source).not.toContain('function isStringArray')
    expect(itemSchemaFile.source).not.toContain("value.type === 'component'")
    expect(componentValidationFile.source).toContain(
      'export function isCanvasComponentItemStorageShape',
    )
    expect(componentValidationFile.source).toContain('isCanvasStableId')
    expect(componentValidationFile.source).toContain('function isStringArray')
  })

  it('keeps editable text item rules in the host text module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const treeTraversalFile = getSourceFile(
      'src/canvas/host/tree/CanvasTreeTraversal.ts',
    )
    const documentPatchesFile = getSourceFile(
      'src/canvas/host/document/CanvasDocumentPatches.ts',
    )
    const editableTextFile = getSourceFile(
      'src/canvas/host/text/CanvasEditableTextItem.ts',
    )
    const itemStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasItemPointerInteractionStart.ts',
    )
    const textEditingModelFile = getSourceFile(
      'src/canvas/app/text/CanvasTextEditingModel.ts',
    )

    expect(itemSchemaFile.source).toContain(
      "from '../text/CanvasEditableTextItem'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasEditableTextItemStorageShape(value)',
    )
    expect(itemSchemaFile.source).not.toContain("value.type === 'rect'")
    expect(itemSchemaFile.source).not.toContain("value.type === 'text'")
    expect(treeTraversalFile.source).toContain('isCanvasTextItem(item)')
    expect(treeTraversalFile.source).toContain(
      'isCanvasEditableTextItem(item)',
    )
    expect(treeTraversalFile.source).not.toContain(
      "item?.type === 'rect' || item?.type === 'text'",
    )
    expect(documentPatchesFile.source).toContain(
      'isCanvasEditableTextItem(entry.item)',
    )
    expect(documentPatchesFile.source).toContain(
      'getCanvasEditableTextPatchOperation(entry.item)',
    )
    expect(documentPatchesFile.source).not.toContain(
      "entry.item.type !== 'rect'",
    )
    expect(documentPatchesFile.source).not.toContain(
      "entry.item.type === 'rect' && entry.item.text === undefined",
    )
    expect(itemStartFile.source).toContain('getCanvasEditableTextValue(item)')
    expect(itemStartFile.source).not.toContain(
      "item.type === 'rect' ? item.text ?? '' : item.text",
    )
    expect(textEditingModelFile.source).toContain(
      'getCommittedCanvasEditableTextValue',
    )
    expect(textEditingModelFile.source).not.toContain(
      "editingItem.type === 'text'",
    )
    expect(editableTextFile.source).toContain(
      'export type CanvasEditableTextItem',
    )
    expect(editableTextFile.source).toContain(
      'export function isCanvasEditableTextItem',
    )
    expect(editableTextFile.source).toContain(
      'export function getCanvasEditableTextValue',
    )
    expect(editableTextFile.source).toContain(
      'export function getCommittedCanvasEditableTextValue',
    )
    expect(editableTextFile.source).toContain(
      'export function getCanvasEditableTextPatchOperation',
    )
  })

  it('keeps group item structure rules in the host tree module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const groupItemFile = getSourceFile(
      'src/canvas/host/tree/CanvasGroupItem.ts',
    )
    const hostEntryFile = getSourceFile('src/canvas/host/index.ts')
    const groupPredicateConsumers = [
      'src/canvas/host/adapters/CanvasItemSceneAdapter.ts',
      'src/canvas/host/document/CanvasCustomItemValidation.ts',
      'src/canvas/host/document/CanvasDocumentPatchTreeDiff.ts',
      'src/canvas/host/document/CanvasDocumentPatches.ts',
      'src/canvas/host/document/CanvasDocumentReorderPatch.ts',
      'src/canvas/host/operations/CanvasItemAlignmentOperations.ts',
      'src/canvas/host/operations/CanvasItemCloneOperations.ts',
      'src/canvas/host/operations/CanvasItemGroupOperations.ts',
      'src/canvas/host/operations/CanvasItemLockOperations.ts',
      'src/canvas/host/operations/CanvasItemOperationTree.ts',
      'src/canvas/host/operations/CanvasItemRemovalOperations.ts',
      'src/canvas/host/operations/CanvasItemTransformOperations.ts',
      'src/canvas/host/operations/CanvasItemZOrderOperations.ts',
      'src/canvas/host/tree/CanvasTreeBounds.ts',
      'src/canvas/host/tree/CanvasTreeSelection.ts',
      'src/canvas/host/tree/CanvasTreeTraversal.ts',
    ].map((path) => getSourceFile(path).source).join('\n')

    expect(itemSchemaFile.source).toContain(
      "from '../tree/CanvasGroupItem'",
    )
    expect(itemSchemaFile.source).toContain(
      'isCanvasGroupItemStorageShape(value, isCanvasItem)',
    )
    expect(itemSchemaFile.source).not.toContain("value.type === 'group'")
    expect(groupPredicateConsumers).toContain('isCanvasGroupItem(')
    expect(groupPredicateConsumers).not.toContain("item.type === 'group'")
    expect(groupPredicateConsumers).not.toContain("item.type !== 'group'")
    expect(groupPredicateConsumers).not.toContain(
      "entry.item.type === 'group'",
    )
    expect(groupPredicateConsumers).not.toContain(
      "candidate.item.type === 'group'",
    )
    expect(groupItemFile.source).toContain(
      'export function isCanvasGroupItem',
    )
    expect(groupItemFile.source).toContain(
      'export function isCanvasGroupItemStorageShape',
    )
    expect(hostEntryFile.source).toContain('isCanvasGroupItem')
  })

  it('keeps Host custom item validation behind a named module', () => {
    const itemSchemaFile = getSourceFile(
      'src/canvas/host/document/CanvasItemSchema.ts',
    )
    const customValidationFile = getSourceFile(
      'src/canvas/host/document/CanvasCustomItemValidation.ts',
    )
    const hostEntryFile = getSourceFile('src/canvas/host/index.ts')

    expect(itemSchemaFile.source).toContain(
      "from './CanvasCustomItemValidation'",
    )
    expect(itemSchemaFile.source).not.toContain('function isJsonRecord')
    expect(itemSchemaFile.source).not.toContain('function isJsonValue')
    expect(itemSchemaFile.source).not.toContain(
      'Invalid custom canvas item',
    )
    expect(customValidationFile.source).toContain(
      'export function isCanvasCustomItemStorageEnvelope',
    )
    expect(customValidationFile.source).toContain(
      'export function assertCustomCanvasItems',
    )
    expect(customValidationFile.source).toContain('function isJsonRecord')
    expect(customValidationFile.source).toContain(
      'Invalid custom canvas item',
    )
    expect(hostEntryFile.source).toContain(
      "from './document/CanvasCustomItemValidation'",
    )
  })

  it('keeps Host Component Library contracts behind a named module', () => {
    const libraryFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentLibrary.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentLibraryContracts.ts',
    )

    expect(libraryFile.source).toContain(
      "from './CanvasComponentLibraryContracts'",
    )
    expect(libraryFile.source).not.toContain(
      'function assertCanvasComponentTemplateContracts',
    )
    expect(libraryFile.source).not.toContain(
      'Canvas component template descriptor must be an object',
    )
    expect(libraryFile.source).not.toContain(
      'Duplicate canvas component template',
    )
    expect(libraryFile.source).not.toContain('requires positive')
    expect(contractsFile.source).toContain(
      'export function assertCanvasComponentTemplateContracts',
    )
    expect(contractsFile.source).toContain(
      'Canvas component template descriptor must be an object',
    )
    expect(contractsFile.source).toContain(
      'Duplicate canvas component template',
    )
    expect(contractsFile.source).toContain('requires positive')
  })

  it('keeps built-in component templates in a host catalogue module', () => {
    const libraryFile = getSourceFile(
      'src/canvas/host/component/CanvasComponentLibrary.ts',
    )
    const catalogueFile = getSourceFile(
      'src/canvas/host/component/CanvasBuiltInComponentTemplates.ts',
    )

    expect(libraryFile.source).toContain(
      "from './CanvasBuiltInComponentTemplates'",
    )
    expect(libraryFile.source).not.toContain("id: 'sticky'")
    expect(libraryFile.source).not.toContain("presentation: 'note-card'")
    expect(catalogueFile.source).toContain(
      'DEFAULT_CANVAS_COMPONENT_TEMPLATES',
    )
    expect(catalogueFile.source).toContain("id: 'sticky'")
    expect(catalogueFile.source).toContain("presentation: 'note-card'")
  })

  it('keeps shared svg drawing primitives in the renderer module', () => {
    const primitiveFile =
      getSourceFile('src/canvas/renderer/svg/CanvasSvgDrawingPrimitives.ts')
    const hardcodedSvgDrawingTerms =
      /\bcreateSvgPathData\b|canvas-arrow-head|canvas-draft-arrow-head|url\(#canvas-/
    const violations = sourceFiles
      .filter((file) =>
        !file.path.endsWith('.test.ts') &&
        !file.path.endsWith('.test.tsx') &&
        file.path !== primitiveFile.path,
      )
      .flatMap((file) =>
        hardcodedSvgDrawingTerms.test(file.source) ? [file.path] : [],
      )

    expect(primitiveFile.source).toContain('createCanvasSvgPathData')
    expect(primitiveFile.source).toContain('CANVAS_SVG_ARROW_MARKER_IRI')
    expect(primitiveFile.source).toContain('CANVAS_SVG_DRAFT_ARROW_MARKER_IRI')
    expect(violations).toEqual([])
  })

  it('keeps Demo SVG item frame concerns out of item rendering branches', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const itemRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderRouting.tsx',
    )
    const itemFrameFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemFrame.tsx',
    )

    expect(itemLayerFile.source).toContain(
      "from './CanvasDemoSvgItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('CanvasDemoSvgItemFrame')
    expect(itemLayerFile.source).not.toContain("item.type === '")
    expect(itemRendererFile.source).toContain('CanvasDemoSvgItemFrame')
    expect(itemRendererFile.source).toContain(
      'export function renderCanvasDemoSvgItem',
    )
    expect(itemRendererFile.source).toContain(
      "from './CanvasDemoSvgItemRenderRouting'",
    )
    expect(itemRendererFile.source).not.toContain("item.type === '")
    expect(itemRenderRoutingFile.source).toContain(
      'CANVAS_DEMO_SVG_ITEM_RENDER_STRATEGIES',
    )
    expect(itemRenderRoutingFile.source).toContain(
      'export function getCanvasDemoSvgItemRenderRoute',
    )
    expect(itemLayerFile.source).not.toContain('data-locked')
    expect(itemLayerFile.source).not.toContain('data-selected')
    expect(itemLayerFile.source).not.toContain('pointerEvents')
    expect(itemLayerFile.source).not.toContain('item-outline')
    expect(itemFrameFile.source).toContain('data-locked')
    expect(itemFrameFile.source).toContain('data-selected')
    expect(itemFrameFile.source).toContain('pointerEvents')
    expect(itemFrameFile.source).toContain('item-outline')
  })

  it('keeps Demo SVG drawing item rendering behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderRouting.tsx',
    )
    const drawingRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderer.tsx',
    )
    const drawingRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderRouting.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasDemoSvgDrawingItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasDemoSvgDrawingItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('createCanvasSvgPathData')
    expect(itemLayerFile.source).not.toContain('CANVAS_SVG_ARROW_MARKER_IRI')
    expect(itemLayerFile.source).not.toContain('className="arrow-item"')
    expect(drawingRendererFile.source).toContain(
      'export function renderCanvasDemoSvgDrawingItem',
    )
    expect(drawingRendererFile.source).toContain(
      'export function isCanvasDemoSvgDrawingItem',
    )
    expect(drawingRendererFile.source).toContain(
      "from './CanvasDemoSvgDrawingItemRenderRouting'",
    )
    expect(drawingRendererFile.source).not.toContain("item.type === 'arrow'")
    expect(drawingRendererFile.source).not.toContain('createCanvasSvgPathData')
    expect(drawingRendererFile.source).not.toContain(
      'CANVAS_SVG_ARROW_MARKER_IRI',
    )
    expect(drawingRoutingFile.source).toContain(
      'CANVAS_DEMO_SVG_DRAWING_ITEM_RENDER_STRATEGIES',
    )
    expect(drawingRoutingFile.source).toContain(
      'export function renderCanvasDemoSvgDrawingItemByRoute',
    )
    expect(drawingRoutingFile.source).toContain('createCanvasSvgPathData')
    expect(drawingRoutingFile.source).toContain('CANVAS_SVG_ARROW_MARKER_IRI')
  })

  it('keeps Demo SVG rect and text item rendering behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderRouting.tsx',
    )
    const rectTextRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgRectTextItemRenderer.tsx',
    )
    const rectTextRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgRectTextItemRenderRouting.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasDemoSvgRectTextItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasDemoSvgRectTextItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('className="rect-item"')
    expect(itemLayerFile.source).not.toContain('canvas-rect-text')
    expect(itemLayerFile.source).not.toContain('<foreignObject')
    expect(rectTextRendererFile.source).toContain(
      'export function renderCanvasDemoSvgRectTextItem',
    )
    expect(rectTextRendererFile.source).toContain(
      "from './CanvasDemoSvgRectTextItemRenderRouting'",
    )
    expect(rectTextRendererFile.source).not.toContain("item.type === 'rect'")
    expect(rectTextRendererFile.source).not.toContain('className="rect-item"')
    expect(rectTextRendererFile.source).not.toContain('canvas-rect-text')
    expect(rectTextRendererFile.source).not.toContain('<foreignObject')
    expect(rectTextRoutingFile.source).toContain(
      'CANVAS_DEMO_SVG_RECT_TEXT_ITEM_RENDER_STRATEGIES',
    )
    expect(rectTextRoutingFile.source).toContain(
      'export function renderCanvasDemoSvgRectTextItemByRoute',
    )
    expect(rectTextRoutingFile.source).toContain('isCanvasTextItem')
    expect(rectTextRoutingFile.source).toContain('className="rect-item"')
    expect(rectTextRoutingFile.source).toContain('canvas-rect-text')
    expect(rectTextRoutingFile.source).toContain('<foreignObject')
  })

  it('keeps Demo SVG component render fallback behind a named module', () => {
    const componentRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRenderer.tsx',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRendererExecution.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRenderFallback.tsx',
    )

    expect(componentRendererFile.source).toContain(
      "from './CanvasDemoSvgComponentRendererExecution'",
    )
    expect(componentRendererFile.source).not.toContain(
      'getCanvasDemoSvgComponentPresentationRenderer',
    )
    expect(componentRendererFile.source).not.toContain(
      'renderCanvasDemoSvgComponentFallback',
    )
    expect(executionFile.source).toContain(
      'export function renderCanvasDemoSvgComponentPresentation',
    )
    expect(executionFile.source).toContain(
      'getCanvasDemoSvgComponentPresentationRenderer',
    )
    expect(executionFile.source).toContain(
      'renderCanvasDemoSvgComponentFallback',
    )
    expect(componentRendererFile.source).not.toMatch(
      /DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS\[['"]/,
    )
    expect(componentRendererFile.source).not.toContain(
      'CanvasDemoSvgCardComponent',
    )
    expect(fallbackFile.source).toContain(
      'CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION',
    )
    expect(fallbackFile.source).toContain('CanvasDemoSvgCardComponent')
  })

  it('keeps Demo SVG component presentation defaults and contracts behind named modules', () => {
    const registryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistry.ts',
    )
    const defaultsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgBuiltInComponentPresentationRenderers.tsx',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentPresentationRegistryContracts.ts',
    )
    const rendererRegistryContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistryContracts.ts',
    )

    expect(registryFile.source).toContain(
      "from './CanvasDemoSvgBuiltInComponentPresentationRenderers'",
    )
    expect(registryFile.source).toContain(
      "from './CanvasDemoSvgComponentPresentationRegistryContracts'",
    )
    expect(registryFile.source).not.toContain(
      'CanvasDemoSvgChecklistComponent',
    )
    expect(registryFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(defaultsFile.source).toContain(
      'DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS',
    )
    expect(defaultsFile.source).toContain('CanvasDemoSvgChecklistComponent')
    expect(defaultsFile.source).toContain("'note-card'")
    expect(contractsFile.source).toContain(
      'export function assertCanvasDemoSvgComponentPresentationRenderers',
    )
    expect(contractsFile.source).toContain(
      'assertCanvasAppRendererRegistry',
    )
    expect(contractsFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(contractsFile.source).not.toContain('render strategy')
    expect(rendererRegistryContractsFile.source).toContain(
      'export function assertCanvasAppRendererRegistry',
    )
    expect(rendererRegistryContractsFile.source).toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(rendererRegistryContractsFile.source).toContain('render strategy')
  })

  it('keeps Demo SVG custom item render fallback behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const itemRenderRoutingFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemRenderRouting.tsx',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererExecution.tsx',
    )
    const customRegistryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRenderFallback.tsx',
    )

    expect(itemRenderRoutingFile.source).toContain(
      "from './CanvasDemoSvgCustomItemRendererExecution'",
    )
    expect(itemLayerFile.source).not.toContain(
      "from './CanvasDemoSvgCustomItemRendererExecution'",
    )
    expect(itemLayerFile.source).not.toContain(
      'getCanvasDemoSvgCustomItemRenderer',
    )
    expect(itemLayerFile.source).not.toContain(
      'renderCanvasDemoSvgCustomItemFallback',
    )
    expect(executionFile.source).toContain(
      'export function renderCanvasDemoSvgCustomItem',
    )
    expect(executionFile.source).toContain('getCanvasDemoSvgCustomItemRenderer')
    expect(executionFile.source).toContain(
      'renderCanvasDemoSvgCustomItemFallback',
    )
    expect(customRegistryFile.source).toContain(
      'getCanvasDemoSvgCustomItemFallbackRenderer',
    )
    expect(itemLayerFile.source).not.toContain('CanvasDemoSvgUnknownCustomItem')
    expect(customRegistryFile.source).not.toContain(
      'CanvasDemoSvgUnknownCustomItem',
    )
    expect(fallbackFile.source).toContain('CanvasDemoSvgUnknownCustomItem')
  })

  it('keeps Demo SVG custom item renderer contracts behind a named module', () => {
    const registryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistryContracts.ts',
    )
    const rendererRegistryContractsFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppRendererRegistryContracts.ts',
    )

    expect(registryFile.source).toContain(
      "from './CanvasDemoSvgCustomItemRendererRegistryContracts'",
    )
    expect(registryFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(registryFile.source).not.toContain('render strategy')
    expect(contractsFile.source).toContain(
      'export function assertCanvasDemoSvgCustomItemRenderers',
    )
    expect(contractsFile.source).toContain(
      'assertCanvasAppRendererRegistry',
    )
    expect(contractsFile.source).not.toContain(
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(contractsFile.source).not.toContain('render strategy')
    expect(rendererRegistryContractsFile.source).toContain(
      'export function assertCanvasAppRendererRegistry',
    )
  })

  it('keeps App inspector panel execution behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/inspector/CanvasAppInspectorPanels.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/inspector/CanvasAppInspectorPanelExecution.ts',
    )
    const objectInspectorHook = getSourceFile(
      'src/canvas/app/inspector/useCanvasObjectInspector.ts',
    )
    const objectInspectorModel = getSourceFile(
      'src/canvas/app/inspector/CanvasObjectInspectorModel.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
    expect(descriptorFile.source).not.toContain('CanvasWorkflowContract')
    expect(descriptorFile.source).toContain(
      'export type CanvasAppInspectorPanelCommitItemsChange',
    )
    expect(descriptorFile.source).not.toContain('panel.render(')
    expect(descriptorFile.source).not.toContain('panel.isVisible(')
    expect(descriptorFile.source).not.toContain('try {')
    expect(executionFile.source).toContain('panel.render(context)')
    expect(executionFile.source).toContain('panel.isVisible(context)')
    expect(executionFile.source).toContain('catch')
    expect(objectInspectorHook.source).not.toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
    expect(objectInspectorModel.source).toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
  })

  it('keeps App inspector panel contracts behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/inspector/CanvasAppInspectorPanels.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/inspector/CanvasAppInspectorPanelContracts.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppInspectorPanelContracts'",
    )
    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
    expect(descriptorFile.source).not.toContain(
      'function assertCanvasAppInspectorPanels',
    )
    expect(descriptorFile.source).not.toContain("field: 'render'")
    expect(descriptorFile.source).not.toContain("field: 'isVisible'")
    expect(descriptorFile.source).not.toContain(
      'assertCanvasAppExtensionEntries',
    )
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppInspectorPanels',
    )
    expect(contractsFile.source).toContain("field: 'render'")
    expect(contractsFile.source).toContain("field: 'isVisible'")
    expect(contractsFile.source).toContain(
      'assertCanvasAppExtensionEntries',
    )
  })

  it('keeps App custom command execution behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/commands/CanvasAppCustomCommands.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasAppCustomCommandExecution.ts',
    )
    const extensionStateContractsFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionStateContracts.ts',
    )
    const extensionModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppExtensionModel.ts',
    )
    const extensionConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionConsumerModel.ts',
    )
    const extensionConsumerContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppConsumerContracts.ts',
    )
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCommandExecution'",
    )
    expect(descriptorFile.source).not.toContain('CanvasWorkflowContract')
    expect(descriptorFile.source).toContain(
      'export type CanvasAppCustomCommandCommitItemsChange',
    )
    expect(descriptorFile.source).toContain(
      'export type CanvasAppCustomCommandCommitSelection',
    )
    expect(descriptorFile.source).not.toContain('command.run(')
    expect(descriptorFile.source).not.toContain('command.isEnabled(')
    expect(descriptorFile.source).not.toContain('try {')
    expect(executionFile.source).toContain('command.run(context)')
    expect(executionFile.source).toContain('command.isEnabled(context)')
    expect(executionFile.source).toContain('catch')
    expect(executionFile.source).not.toContain(
      'export type CanvasAppCustomCommandState',
    )
    expect(executionFile.source).toContain(
      "from '../extensions/CanvasAppExtensionStateContracts'",
    )
    expect(extensionStateContractsFile.source).toContain(
      'export type CanvasAppCustomCommandState',
    )
    expect(extensionModelFile.source).toContain(
      "from '../commands/CanvasAppCustomCommandExecution'",
    )
    expect(extensionModelFile.source).toContain(
      "from './CanvasAppExtensionConsumerModel'",
    )
    expect(extensionModelFile.source).toContain(
      "from './CanvasAppConsumerContracts'",
    )
    expect(extensionModelFile.source).not.toContain('control: {')
    expect(extensionModelFile.source).not.toContain('keyboard: {')
    expect(extensionModelFile.source).not.toContain('pointer: {')
    expect(extensionConsumerModelFile.source).toContain(
      "from './CanvasAppConsumerContracts'",
    )
    expect(extensionConsumerModelFile.source).toContain(
      'export function getCanvasAppExtensionConsumerModel',
    )
    expect(extensionConsumerModelFile.source).not.toContain(
      'export type CanvasAppExtensionModel',
    )
    expect(extensionConsumerModelFile.source).toContain(
      '): CanvasAppExtensionModel',
    )
    expect(extensionConsumerModelFile.source).not.toContain('ReturnType<')
    expect(extensionConsumerContractsFile.source).toContain(
      'export type CanvasAppExtensionRuntime',
    )
    expect(extensionConsumerContractsFile.source).toContain(
      "from '../extensions/CanvasAppExtensionStateContracts'",
    )
    expect(extensionConsumerContractsFile.source).not.toContain(
      'CanvasAppCustomCommandExecution',
    )
    expect(extensionConsumerContractsFile.source).toContain(
      'export type CanvasAppExtensionModel',
    )
    for (const extensionConsumerContract of [
      'CanvasAppExtensionControlContext',
      'CanvasAppExtensionKeyboardContext',
      'CanvasAppExtensionPointerContext',
    ]) {
      expect(extensionConsumerContractsFile.source).toContain(
        `export type ${extensionConsumerContract}`,
      )
    }
    expect(extensionConsumerModelFile.source).toContain('control: {')
    expect(extensionConsumerModelFile.source).toContain('keyboard: {')
    expect(extensionConsumerModelFile.source).toContain('pointer: {')
    expect(appModelFile.source).toContain(
      "from './useCanvasAppExtensionModel'",
    )
    expect(appModelFile.source).not.toContain(
      'CanvasAppCustomCommandExecution',
    )
    expect(appModelFile.source).not.toContain('customCommandStates')
    expect(appModelFile.source).not.toContain('customCreationToolStates')
    expect(appModelFile.source).not.toContain('runCustomCommand')
  })

  it('keeps App standard command execution behind a named module', () => {
    const commandHookFile = getSourceFile(
      'src/canvas/app/commands/useCanvasCommands.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandExecution.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandContracts.ts',
    )
    const effectPlanFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandEffectPlan.ts',
    )
    const resultEffectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandResultEffects.ts',
    )

    expect(commandHookFile.source).toContain(
      "from './CanvasStandardCommandExecution'",
    )
    expect(commandHookFile.source).not.toContain('alignCanvasCommand')
    expect(commandHookFile.source).not.toContain('deleteCanvasCommand')
    expect(commandHookFile.source).not.toContain('groupCanvasCommand')
    expect(commandHookFile.source).not.toContain('nudgeCanvasCommand')
    expect(commandHookFile.source).not.toContain('selectAllCanvasCommand')
    expect(commandHookFile.source).not.toContain("type: 'remove-selection'")
    expect(commandHookFile.source).not.toContain("type: 'group-selection'")
    expect(executionFile.source).toContain(
      'export function executeCanvasStandardCommand',
    )
    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandEffectPlan'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(executionFile.source).not.toContain(
      'export type { CanvasStandardCommand',
    )
    expect(executionFile.source).toContain(
      'applyCanvasStandardDocumentEffect',
    )
    expect(executionFile.source).not.toContain('alignCanvasCommand')
    expect(executionFile.source).not.toContain('deleteCanvasCommand')
    expect(executionFile.source).not.toContain('groupCanvasCommand')
    expect(executionFile.source).not.toContain('nudgeCanvasCommand')
    expect(executionFile.source).not.toContain('selectAllCanvasCommand')
    expect(executionFile.source).not.toContain("type: 'remove-selection'")
    expect(executionFile.source).not.toContain("type: 'group-selection'")
    expect(contractsFile.source).toContain(
      'export type CanvasStandardCommand',
    )
    expect(contractsFile.source).toContain("kind: 'align'")
    expect(contractsFile.source).toContain("kind: 'select-all'")
    expect(contractsFile.source).not.toContain('alignCanvasCommand')
    expect(contractsFile.source).not.toContain(
      'createCanvasStandardCommandEffectPlan',
    )
    expect(contractsFile.source).not.toContain(
      'applyCanvasStandardDocumentEffect',
    )
    expect(effectPlanFile.source).toContain(
      'export function createCanvasStandardCommandEffectPlan',
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasStandardCommandContracts'",
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffectContracts'",
    )
    expect(effectPlanFile.source).not.toContain(
      'export type CanvasStandardCommand =',
    )
    expect(effectPlanFile.source).toContain(
      'CANVAS_STANDARD_COMMAND_EFFECT_PLANNERS',
    )
    expect(effectPlanFile.source).not.toContain('switch (command.kind)')
    expect(effectPlanFile.source).not.toContain(
      'assertUnhandledCanvasStandardCommand',
    )
    expect(effectPlanFile.source).toContain('alignCanvasCommand')
    expect(effectPlanFile.source).toContain('deleteCanvasCommand')
    expect(effectPlanFile.source).toContain('groupCanvasCommand')
    expect(effectPlanFile.source).toContain('nudgeCanvasCommand')
    expect(effectPlanFile.source).toContain('selectAllCanvasCommand')
    expect(effectPlanFile.source).toContain(
      "from './CanvasStandardCommandResultEffects'",
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasStandardRemoveSelectionResultEffect',
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasStandardGroupSelectionResultEffect',
    )
    expect(effectPlanFile.source).not.toContain(
      'createCanvasStandardRemoveSelectionEffect',
    )
    expect(effectPlanFile.source).not.toContain(
      'createCanvasStandardGroupSelectionEffect',
    )
    expect(effectPlanFile.source).not.toContain(
      'createCanvasStandardUngroupSelectionEffect',
    )
    expect(effectPlanFile.source).not.toContain("type: 'remove-selection'")
    expect(effectPlanFile.source).not.toContain("type: 'group-selection'")
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasStandardRemoveSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasStandardGroupSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasStandardUngroupSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export type CanvasStandardSelectionResult',
    )
    expect(resultEffectsFile.source).not.toContain('Pick<')
    expect(resultEffectsFile.source).toContain(
      'createCanvasStandardRemoveSelectionEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'createCanvasStandardGroupSelectionEffect',
    )
    expect(resultEffectsFile.source).not.toContain('alignCanvasCommand')
    expect(resultEffectsFile.source).not.toContain('deleteCanvasCommand')
  })

  it('keeps App standard command document effects behind a named module', () => {
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandExecution.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandDocumentEffects.ts',
    )
    const effectContractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandDocumentEffectContracts.ts',
    )

    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffects'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffectContracts'",
    )
    expect(effectsFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffectContracts'",
    )
    expect(effectsFile.source).not.toContain('Parameters<')
    expect(effectsFile.source).not.toContain('export type {')
    expect(effectContractsFile.source).toContain(
      'export type CanvasStandardCommandDocumentEffect',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasStandardCommandItemsChange',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasStandardCommandDocumentEffectContext',
    )
    expect(effectContractsFile.source).not.toContain(
      'applyCanvasStandardDocumentEffect',
    )
    expect(effectContractsFile.source).not.toContain('Parameters<')
    expect(effectsFile.source).toContain(
      'export function applyCanvasStandardDocumentEffect',
    )
    expect(effectsFile.source).toContain(
      'CANVAS_STANDARD_DOCUMENT_EFFECT_APPLIERS',
    )
    expect(effectsFile.source).not.toContain('switch (effect.kind)')
    expect(effectsFile.source).not.toContain(
      'assertUnhandledCanvasStandardDocumentEffect',
    )
    expect(effectsFile.source).toContain(
      'export function createCanvasStandardReplaceChangedEffect',
    )
    expect(effectsFile.source).toContain(
      'export function createCanvasStandardGroupSelectionEffect',
    )
    expect(executionFile.source).not.toContain('context.commitItemsChange(')
    expect(executionFile.source).not.toContain('context.commitSelection(')
    expect(executionFile.source).not.toContain('context.setEditing(null)')
    expect(effectsFile.source).toContain(
      'export function applyCanvasStandardItemsChangeEffect',
    )
    expect(effectsFile.source).toContain(
      'export function applyCanvasStandardHistoryEffect',
    )
    expect(effectsFile.source).toContain('context.commitItemsChange(')
    expect(effectsFile.source).toContain('context.commitSelection(')
    expect(effectsFile.source).toContain('context.setEditing(null)')
    expect(effectsFile.source).toContain('clearEditingIds.includes')
    expect(effectsFile.source).toContain("type: 'remove-selection'")
    expect(effectsFile.source).toContain("type: 'group-selection'")
  })

  it('keeps App clipboard command execution behind a named module', () => {
    const clipboardHookFile = getSourceFile(
      'src/canvas/app/commands/useCanvasClipboardCommands.ts',
    )
    const clipboardHandlersFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandHandlers.ts',
    )
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandExecution.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandContracts.ts',
    )
    const effectPlanFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffectPlan.ts',
    )
    const effectContractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffectContracts.ts',
    )
    const resultEffectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandResultEffects.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffects.ts',
    )

    expect(clipboardHookFile.source).toContain(
      "from './CanvasClipboardCommandExecution'",
    )
    expect(clipboardHookFile.source).toContain(
      "from './CanvasClipboardCommandHandlers'",
    )
    for (const clipboardHandlerDetail of [
      "kind: 'clone'",
      "kind: 'copy'",
      "kind: 'cut'",
      "kind: 'duplicate'",
      "kind: 'paste'",
      'sourceIds: sourceIds ?? selection',
      'pasteIndex,',
    ]) {
      expect(clipboardHookFile.source).not.toContain(clipboardHandlerDetail)
      expect(clipboardHandlersFile.source).toContain(clipboardHandlerDetail)
    }
    expect(clipboardHookFile.source).not.toContain('getPasteIndex')
    expect(clipboardHandlersFile.source).toContain(
      'export function cloneCanvasClipboardItems',
    )
    expect(clipboardHandlersFile.source).toContain(
      'export function copyCanvasClipboardSelection',
    )
    expect(clipboardHandlersFile.source).toContain(
      'export function duplicateCanvasClipboardSelection',
    )
    expect(clipboardHookFile.source).not.toContain(
      'cloneCanvasCommandItems',
    )
    expect(clipboardHookFile.source).not.toContain(
      'duplicateCanvasCommand',
    )
    expect(clipboardHookFile.source).not.toContain('deleteCanvasCommand')
    expect(clipboardHookFile.source).not.toContain('getCanvasPasteOffset')
    expect(clipboardHookFile.source).not.toContain('copyItemsToClipboard(')
    expect(clipboardHookFile.source).not.toContain("type: 'remove-selection'")
    expect(executionFile.source).toContain(
      'export function executeCanvasClipboardCommand',
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandEffectPlan'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandContracts'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandEffects'",
    )
    expect(executionFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(executionFile.source).not.toContain(
      'export type { CanvasClipboardCommand',
    )
    expect(executionFile.source).toContain('applyCanvasClipboardCommandEffect')
    expect(executionFile.source).not.toContain('cloneCanvasCommandItems')
    expect(executionFile.source).not.toContain('duplicateCanvasCommand')
    expect(executionFile.source).not.toContain('deleteCanvasCommand')
    expect(executionFile.source).not.toContain('getCanvasPasteOffset')
    expect(executionFile.source).not.toContain('copyItemsToClipboard(')
    expect(executionFile.source).not.toContain("type: 'remove-selection'")
    expect(contractsFile.source).toContain(
      'export type CanvasClipboardCommand',
    )
    expect(contractsFile.source).toContain("kind: 'clone'")
    expect(contractsFile.source).toContain("kind: 'paste'")
    expect(contractsFile.source).not.toContain('cloneCanvasCommandItems')
    expect(contractsFile.source).not.toContain(
      'createCanvasClipboardCommandEffectPlan',
    )
    expect(contractsFile.source).not.toContain(
      'applyCanvasClipboardCommandEffect',
    )
    expect(effectPlanFile.source).toContain(
      'export function createCanvasClipboardCommandEffectPlan',
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasClipboardCommandContracts'",
    )
    expect(effectPlanFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(effectPlanFile.source).not.toContain(
      'export type CanvasClipboardCommand =',
    )
    expect(effectPlanFile.source).toContain(
      'CANVAS_CLIPBOARD_COMMAND_EFFECT_PLANNERS',
    )
    expect(effectPlanFile.source).not.toContain('switch (command.kind)')
    expect(effectPlanFile.source).not.toContain(
      'assertUnhandledCanvasClipboardCommand',
    )
    expect(effectPlanFile.source).toContain('cloneCanvasCommandItems')
    expect(effectPlanFile.source).toContain('duplicateCanvasCommand')
    expect(effectPlanFile.source).toContain('deleteCanvasCommand')
    expect(effectPlanFile.source).toContain('getCanvasPasteOffset')
    expect(effectPlanFile.source).toContain(
      "from './CanvasClipboardCommandResultEffects'",
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasClipboardCopySelectionEffect',
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasClipboardDuplicateResultEffect',
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasClipboardCutSelectionResultEffect',
    )
    expect(effectPlanFile.source).not.toContain("kind: 'clone-result'")
    expect(effectPlanFile.source).not.toContain("kind: 'copy-selection'")
    expect(effectPlanFile.source).not.toContain("kind: 'add-items'")
    expect(effectPlanFile.source).not.toContain("kind: 'cut-selection'")
    expect(effectPlanFile.source).not.toContain("kind: 'cut-copy-only'")
    expect(effectPlanFile.source).not.toContain('copyItemsToClipboard(')
    expect(effectPlanFile.source).not.toContain("type: 'remove-selection'")
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasClipboardCopySelectionEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasClipboardDuplicateResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      'export function createCanvasClipboardCutSelectionResultEffect',
    )
    expect(resultEffectsFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(resultEffectsFile.source).toContain("kind: 'clone-result'")
    expect(resultEffectsFile.source).toContain("kind: 'copy-selection'")
    expect(resultEffectsFile.source).toContain("kind: 'add-items'")
    expect(resultEffectsFile.source).toContain("kind: 'cut-selection'")
    expect(resultEffectsFile.source).toContain("kind: 'cut-copy-only'")
    expect(resultEffectsFile.source).not.toContain('duplicateCanvasCommand')
    expect(resultEffectsFile.source).not.toContain('deleteCanvasCommand')
    expect(resultEffectsFile.source).not.toContain('getCanvasPasteOffset')
    expect(effectContractsFile.source).toContain(
      'export type CanvasClipboardCommandEffect',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasClipboardCommandExecutionResult',
    )
    expect(effectContractsFile.source).toContain(
      'export type CanvasClipboardCommandEffectContext',
    )
    expect(effectContractsFile.source).not.toContain(
      'applyCanvasClipboardCommandEffect',
    )
    expect(effectContractsFile.source).not.toContain(
      'createCanvasClipboardCommandEffectPlan',
    )
    expect(effectsFile.source).toContain(
      'export function applyCanvasClipboardCommandEffect',
    )
    expect(effectsFile.source).toContain(
      "from './CanvasClipboardCommandEffectContracts'",
    )
    expect(effectsFile.source).not.toContain('export type {')
    expect(effectsFile.source).toContain(
      'CANVAS_CLIPBOARD_COMMAND_EFFECT_APPLIERS',
    )
    expect(effectsFile.source).not.toContain('switch (effect.kind)')
    expect(effectsFile.source).not.toContain(
      'assertUnhandledCanvasClipboardCommandEffect',
    )
    expect(effectsFile.source).toContain('copyItemsToClipboard(')
    expect(effectsFile.source).toContain('context.commitItemsChange(')
    expect(effectsFile.source).toContain('context.commitSelection(')
    expect(effectsFile.source).toContain("type: 'remove-selection'")
    expect(effectsFile.source).toContain('clearEditingIds.includes')
  })

  it('keeps App custom command contracts behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/commands/CanvasAppCustomCommands.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/commands/CanvasAppCustomCommandContracts.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCommandContracts'",
    )
    expect(descriptorFile.source).not.toContain(
      'function assertCanvasAppCustomCommands',
    )
    expect(descriptorFile.source).not.toContain("field: 'label'")
    expect(descriptorFile.source).not.toContain("field: 'run'")
    expect(descriptorFile.source).not.toContain(
      'assertCanvasAppExtensionEntries',
    )
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppCustomCommands',
    )
    expect(contractsFile.source).toContain("field: 'label'")
    expect(contractsFile.source).toContain("field: 'run'")
    expect(contractsFile.source).toContain(
      'assertCanvasAppExtensionEntries',
    )
  })

  it('keeps App custom creation tool runtime behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/tools/CanvasAppCustomCreationTools.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/tools/CanvasAppCustomCreationToolContracts.ts',
    )
    const runtimeFile = getSourceFile(
      'src/canvas/app/tools/CanvasAppCustomCreationToolRuntime.ts',
    )
    const extensionStateContractsFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionStateContracts.ts',
    )
    const extensionModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppExtensionModel.ts',
    )
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const keyboardRouterFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutRouter.ts',
    )
    const keyboardIntentFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutIntent.ts',
    )
    const keyboardToolIntentFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcutIntent.ts',
    )
    const pointerCustomCreationFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCustomCreation.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCreationToolRuntime'",
    )
    expect(contractsFile.source).not.toContain(
      "from './CanvasAppCustomCreationToolRuntime'",
    )
    expect(contractsFile.source).toContain(
      "from '../keyboard/CanvasKeyboardShortcutChords'",
    )
    expect(descriptorFile.source).not.toContain(
      'export function getCanvasAppCustomCreationToolStates',
    )
    expect(descriptorFile.source).not.toContain(
      'export function getCanvasAppCustomCreationTool(',
    )
    expect(descriptorFile.source).not.toContain(
      'export function matchesCanvasAppCustomToolShortcut',
    )
    expect(runtimeFile.source).toContain(
      'export function getCanvasAppCustomCreationToolStates',
    )
    expect(runtimeFile.source).not.toContain(
      'export type CanvasAppCustomCreationToolState',
    )
    expect(runtimeFile.source).toContain(
      "from '../extensions/CanvasAppExtensionStateContracts'",
    )
    expect(extensionStateContractsFile.source).toContain(
      'export type CanvasAppCustomCreationToolState',
    )
    expect(runtimeFile.source).toContain(
      'export function getCanvasAppCustomCreationTool(',
    )
    expect(runtimeFile.source).toContain(
      'export function matchesCanvasAppCustomToolShortcut',
    )
    expect(keyboardRouterFile.source).toContain(
      "from './CanvasKeyboardShortcutIntent'",
    )
    for (const file of [
      extensionModelFile,
      keyboardToolIntentFile,
      pointerCustomCreationFile,
    ]) {
      expect(file.source).toContain(
        'CanvasAppCustomCreationToolRuntime',
      )
    }
    expect(keyboardRouterFile.source).not.toContain(
      'CanvasAppCustomCreationToolRuntime',
    )
    expect(keyboardIntentFile.source).not.toContain(
      'CanvasAppCustomCreationToolRuntime',
    )
    expect(appModelFile.source).toContain(
      "from './useCanvasAppExtensionModel'",
    )
    expect(appModelFile.source).not.toContain(
      'CanvasAppCustomCreationToolRuntime',
    )
  })

  it('keeps keyboard shortcut intent rules behind a named module', () => {
    const routerFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutRouter.ts',
    )
    const hookFile = getSourceFile(
      'src/canvas/app/keyboard/useCanvasKeyboardShortcuts.ts',
    )
    const listenerFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutListeners.ts',
    )
    const intentFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutIntent.ts',
    )
    const commandIntentFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandShortcutIntent.ts',
    )
    const commandShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandShortcuts.ts',
    )
    const commandShortcutCatalogFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandShortcutCatalog.ts',
    )
    const commandDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandDispatch.ts',
    )
    const shortcutDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutDispatch.ts',
    )
    const intentDispatchTableFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardIntentDispatchTable.ts',
    )
    const nudgeShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardNudgeShortcuts.ts',
    )
    const nudgeShortcutCatalogFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardNudgeShortcutCatalog.ts',
    )
    const viewportShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportShortcuts.ts',
    )
    const viewportShortcutCatalogFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportShortcutCatalog.ts',
    )
    const systemShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemShortcuts.ts',
    )
    const systemShortcutCatalogFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemShortcutCatalog.ts',
    )
    const systemDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemDispatch.ts',
    )
    const viewportDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportDispatch.ts',
    )
    const toolDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolDispatch.ts',
    )
    const toolIntentFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcutIntent.ts',
    )
    const toolShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcuts.ts',
    )
    const toolShortcutCatalogFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcutCatalog.ts',
    )
    const reservedShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardReservedShortcuts.ts',
    )

    expect(routerFile.source).toContain(
      "from './CanvasKeyboardShortcutIntent'",
    )
    expect(routerFile.source).toContain(
      "from './CanvasKeyboardShortcutDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardCommandDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardSystemDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardViewportDispatch'",
    )
    expect(routerFile.source).not.toContain(
      "from './CanvasKeyboardToolDispatch'",
    )
    expect(routerFile.source).toContain('runCanvasKeyboardShortcutIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardCommandIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardSystemIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardViewportIntent')
    expect(routerFile.source).not.toContain('isCanvasKeyboardToolIntent')
    expect(routerFile.source).not.toContain("intent.kind === 'none'")
    expect(routerFile.source).not.toContain('config.shortcuts.temporaryPan')
    expect(routerFile.source).not.toContain(
      'matchesCanvasAppCustomToolShortcut',
    )
    expect(routerFile.source).not.toContain('handlers.deleteSelection()')
    expect(routerFile.source).not.toContain('handlers.moveSelection(')
    expect(routerFile.source).not.toContain(
      'handlers.reorderSelection(',
    )
    expect(routerFile.source).not.toContain('handlers.openFindReplace()')
    expect(routerFile.source).not.toContain('handlers.setSpaceDown(true)')
    expect(routerFile.source).not.toContain('handlers.commitSelection([])')
    expect(routerFile.source).not.toContain('handlers.zoomBy(')
    expect(routerFile.source).not.toContain('handlers.resetViewport()')
    expect(routerFile.source).not.toContain('handlers.fitToItems(')
    expect(routerFile.source).not.toContain('handlers.setTool(')
    expect(routerFile.source).not.toContain('switch (intent.kind)')
    expect(routerFile.source).not.toContain("event.key.startsWith('Arrow')")
    expect(routerFile.source).not.toContain("key === 'z'")
    expect(hookFile.source).toContain(
      "from './CanvasKeyboardShortcutListeners'",
    )
    expect(hookFile.source).not.toContain(
      "from './CanvasKeyboardSystemShortcuts'",
    )
    expect(hookFile.source).not.toContain(
      "from './CanvasKeyboardSystemDispatch'",
    )
    expect(hookFile.source).not.toContain(
      'shouldReleaseCanvasKeyboardTemporaryPan',
    )
    expect(hookFile.source).not.toContain('setSpaceDown(false)')
    expect(hookFile.source).not.toContain('addEventListener')
    expect(hookFile.source).not.toContain('removeEventListener')
    expect(hookFile.source).not.toContain('handleCanvasKeyboardShortcut(')
    expect(hookFile.source).not.toContain(
      'runCanvasKeyboardSystemKeyUp',
    )
    expect(hookFile.source).not.toContain(
      'runCanvasKeyboardSystemWindowBlur',
    )
    expect(listenerFile.source).toContain(
      'export function bindCanvasKeyboardShortcutListeners',
    )
    expect(listenerFile.source).toContain('handleCanvasKeyboardShortcut(')
    expect(listenerFile.source).toContain('runCanvasKeyboardSystemKeyUp')
    expect(listenerFile.source).toContain(
      'runCanvasKeyboardSystemWindowBlur',
    )
    expect(listenerFile.source).toContain("addEventListener('keydown'")
    expect(listenerFile.source).toContain("removeEventListener('keydown'")
    expect(intentFile.source).toContain(
      'export function getCanvasKeyboardShortcutIntent',
    )
    expect(intentFile.source).toContain(
      "from './CanvasKeyboardToolShortcutIntent'",
    )
    expect(intentFile.source).toContain(
      "from './CanvasKeyboardCommandShortcutIntent'",
    )
    expect(intentFile.source).toContain(
      "from './CanvasKeyboardSystemShortcuts'",
    )
    expect(intentFile.source).not.toContain('config.shortcuts.temporaryPan')
    expect(intentFile.source).not.toContain("key === 'f'")
    expect(intentFile.source).not.toContain("event.code === 'Space'")
    expect(intentFile.source).not.toContain("event.key === 'Escape'")
    expect(intentFile.source).not.toContain(
      'matchesCanvasAppCustomToolShortcut',
    )
    expect(intentFile.source).not.toContain("event.key.startsWith('Arrow')")
    expect(intentFile.source).not.toContain("key === 'z'")
    expect(commandIntentFile.source).toContain(
      'export function getCanvasKeyboardCommandShortcutIntent',
    )
    expect(commandIntentFile.source).toContain(
      "from './CanvasKeyboardCommandShortcuts'",
    )
    expect(commandIntentFile.source).toContain(
      "from './CanvasKeyboardViewportShortcuts'",
    )
    expect(commandIntentFile.source).toContain(
      "from './CanvasKeyboardNudgeShortcuts'",
    )
    expect(commandIntentFile.source).not.toContain(
      "event.key.startsWith('Arrow')",
    )
    expect(commandIntentFile.source).not.toContain("key === 'z'")
    expect(commandShortcutFile.source).toContain(
      'export function getCanvasKeyboardBuiltinCommandShortcutIntent',
    )
    expect(commandShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedCommandShortcuts',
    )
    expect(commandShortcutFile.source).toContain(
      "from './CanvasKeyboardCommandShortcutCatalog'",
    )
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'undo'")
    expect(commandShortcutFile.source).not.toContain(
      "kind: 'reorder-selection'",
    )
    expect(commandShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_COMMAND_SHORTCUTS',
    )
    expect(commandShortcutCatalogFile.source).toContain("shortcutId: 'undo'")
    expect(commandShortcutCatalogFile.source).toContain(
      "kind: 'reorder-selection'",
    )
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'fitAll'")
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'zoomIn'")
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'nudge'")
    expect(commandShortcutFile.source).not.toContain("'large nudge left'")
    expect(commandShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'fitAll'",
    )
    expect(commandShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'zoomIn'",
    )
    expect(commandShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'nudge'",
    )
    expect(commandShortcutCatalogFile.source).not.toContain(
      "'large nudge left'",
    )
    expect(commandDispatchFile.source).toContain(
      'export function runCanvasKeyboardCommandIntent',
    )
    expect(commandDispatchFile.source).toContain(
      'export function isCanvasKeyboardCommandIntent',
    )
    expect(commandDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(commandDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH',
    )
    expect(commandDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_COMMAND_INTENT_DISPATCH.run',
    )
    expect(commandDispatchFile.source).toContain(
      'handlers.moveSelection(intent.dx, intent.dy)',
    )
    expect(commandDispatchFile.source).not.toContain(
      'CANVAS_KEYBOARD_COMMAND_INTENT_KINDS',
    )
    expect(commandDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(commandDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardCommandIntentRunners',
    )
    expect(commandDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardCommandIntentRunner',
    )
    expect(commandDispatchFile.source).not.toContain(
      'function getCanvasKeyboardCommandIntentRunner',
    )
    expect(shortcutDispatchFile.source).toContain(
      'export function runCanvasKeyboardShortcutIntent',
    )
    expect(shortcutDispatchFile.source).toContain(
      'export type CanvasKeyboardShortcutDispatchHandlers',
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardCommandDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardSystemDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardViewportDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      "from './CanvasKeyboardToolDispatch'",
    )
    expect(shortcutDispatchFile.source).toContain(
      'isCanvasKeyboardCommandIntent(intent)',
    )
    expect(shortcutDispatchFile.source).toContain("intent.kind === 'none'")
    expect(shortcutDispatchFile.source).not.toContain('event.preventDefault')
    expect(shortcutDispatchFile.source).not.toContain(
      'getCanvasKeyboardShortcutIntent',
    )
    expect(nudgeShortcutFile.source).toContain(
      'export function getCanvasKeyboardNudgeShortcutIntent',
    )
    expect(nudgeShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedNudgeShortcuts',
    )
    expect(nudgeShortcutFile.source).toContain(
      "from './CanvasKeyboardNudgeShortcutCatalog'",
    )
    expect(nudgeShortcutFile.source).not.toContain("'large nudge left'")
    expect(nudgeShortcutFile.source).toContain("kind: 'nudge-selection'")
    expect(nudgeShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_NUDGE_SHORTCUTS',
    )
    expect(nudgeShortcutCatalogFile.source).toContain("'large nudge left'")
    expect(nudgeShortcutCatalogFile.source).not.toContain(
      "kind: 'nudge-selection'",
    )
    expect(viewportShortcutFile.source).toContain(
      'export function getCanvasKeyboardViewportShortcutIntent',
    )
    expect(viewportShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedViewportShortcuts',
    )
    expect(viewportShortcutFile.source).toContain(
      "from './CanvasKeyboardViewportShortcutCatalog'",
    )
    expect(viewportShortcutFile.source).not.toContain("shortcutId: 'fitAll'")
    expect(viewportShortcutFile.source).not.toContain("shortcutId: 'zoomIn'")
    expect(viewportShortcutFile.source).not.toContain("kind: 'fit-selection'")
    expect(viewportShortcutFile.source).not.toContain("kind: 'zoom-by'")
    expect(viewportShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_VIEWPORT_SHORTCUTS',
    )
    expect(viewportShortcutCatalogFile.source).toContain(
      "shortcutId: 'fitAll'",
    )
    expect(viewportShortcutCatalogFile.source).toContain(
      "shortcutId: 'zoomIn'",
    )
    expect(viewportShortcutCatalogFile.source).toContain(
      "kind: 'fit-selection'",
    )
    expect(viewportShortcutCatalogFile.source).toContain("kind: 'zoom-by'")
    expect(viewportShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'nudge'",
    )
    expect(viewportShortcutCatalogFile.source).not.toContain(
      "'large nudge left'",
    )
    expect(systemShortcutFile.source).toContain(
      'export function getCanvasKeyboardSystemShortcutIntent',
    )
    expect(systemShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedSystemShortcuts',
    )
    expect(systemShortcutFile.source).toContain(
      "from './CanvasKeyboardSystemShortcutCatalog'",
    )
    expect(systemShortcutFile.source).not.toContain("shortcutId: 'findReplace'")
    expect(systemShortcutFile.source).not.toContain(
      "shortcutId: 'temporaryPan'",
    )
    expect(systemShortcutFile.source).not.toContain("shortcutId: 'escape'")
    expect(systemShortcutCatalogFile.source).toContain(
      'CANVAS_KEYBOARD_SYSTEM_SHORTCUTS',
    )
    expect(systemShortcutCatalogFile.source).toContain(
      "shortcutId: 'findReplace'",
    )
    expect(systemShortcutCatalogFile.source).toContain(
      "shortcutId: 'temporaryPan'",
    )
    expect(systemShortcutCatalogFile.source).toContain("shortcutId: 'escape'")
    expect(systemShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'fitAll'",
    )
    expect(systemShortcutCatalogFile.source).not.toContain(
      "'large nudge left'",
    )
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemIntent',
    )
    expect(systemDispatchFile.source).toContain(
      'export function isCanvasKeyboardSystemIntent',
    )
    expect(systemDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(systemDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH',
    )
    expect(systemDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_SYSTEM_INTENT_DISPATCH.run',
    )
    expect(systemDispatchFile.source).toContain('commitSelection([])')
    expect(systemDispatchFile.source).not.toContain(
      'CANVAS_KEYBOARD_SYSTEM_INTENT_KINDS',
    )
    expect(systemDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(systemDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardSystemIntentRunners',
    )
    expect(systemDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardSystemIntentRunner',
    )
    expect(systemDispatchFile.source).not.toContain(
      'function getCanvasKeyboardSystemIntentRunner',
    )
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemKeyUp',
    )
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemWindowBlur',
    )
    expect(systemDispatchFile.source).toContain(
      'export type CanvasKeyboardSystemReleaseHandlers',
    )
    expect(systemDispatchFile.source).toContain(
      'shouldReleaseCanvasKeyboardTemporaryPan',
    )
    expect(systemDispatchFile.source).toContain('setSpaceDown(false)')
    expect(systemDispatchFile.source).not.toContain('Pick<')
    expect(viewportDispatchFile.source).toContain(
      'export function runCanvasKeyboardViewportIntent',
    )
    expect(viewportDispatchFile.source).toContain(
      'export function isCanvasKeyboardViewportIntent',
    )
    expect(viewportDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(viewportDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH',
    )
    expect(viewportDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_VIEWPORT_INTENT_DISPATCH.run',
    )
    expect(viewportDispatchFile.source).toContain('fitToItems(intent.ids)')
    expect(viewportDispatchFile.source).not.toContain(
      'CANVAS_KEYBOARD_VIEWPORT_INTENT_KINDS',
    )
    expect(viewportDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(viewportDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardViewportIntentRunners',
    )
    expect(viewportDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardViewportIntentRunner',
    )
    expect(viewportDispatchFile.source).not.toContain(
      'function getCanvasKeyboardViewportIntentRunner',
    )
    expect(toolDispatchFile.source).toContain(
      'export function runCanvasKeyboardToolIntent',
    )
    expect(toolDispatchFile.source).toContain(
      'export function isCanvasKeyboardToolIntent',
    )
    expect(toolDispatchFile.source).toContain(
      "from './CanvasKeyboardIntentDispatchTable'",
    )
    expect(toolDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH',
    )
    expect(toolDispatchFile.source).toContain(
      'CANVAS_KEYBOARD_TOOL_INTENT_DISPATCH.run',
    )
    expect(toolDispatchFile.source).toContain('handlers.setTool(intent.tool)')
    expect(toolDispatchFile.source).not.toContain('switch (intent.kind)')
    expect(toolDispatchFile.source).not.toContain(
      'function defineCanvasKeyboardToolIntentRunners',
    )
    expect(toolDispatchFile.source).not.toContain(
      'function hasCanvasKeyboardToolIntentRunner',
    )
    expect(toolDispatchFile.source).not.toContain(
      'function getCanvasKeyboardToolIntentRunner',
    )
    expect(intentDispatchTableFile.source).toContain(
      'export function createCanvasKeyboardIntentDispatchTable',
    )
    expect(intentDispatchTableFile.source).toContain('hasKind(kind: string)')
    expect(intentDispatchTableFile.source).toContain('run({')
    expect(toolIntentFile.source).toContain(
      'export function getCanvasKeyboardToolShortcutIntent',
    )
    expect(toolIntentFile.source).toContain(
      "from './CanvasKeyboardToolShortcuts'",
    )
    expect(toolIntentFile.source).toContain(
      'matchesCanvasAppCustomToolShortcut',
    )
    expect(toolIntentFile.source).not.toContain("key === 'v'")
    expect(toolIntentFile.source).not.toContain("key === 'm'")
    expect(toolShortcutFile.source).toContain(
      'export function getCanvasKeyboardBuiltinToolShortcut',
    )
    expect(toolShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedToolShortcuts',
    )
    expect(toolShortcutFile.source).toContain(
      "from './CanvasKeyboardToolShortcutCatalog'",
    )
    expect(toolShortcutFile.source).not.toContain('CANVAS_TOOL_AFFORDANCES')
    expect(toolShortcutFile.source).not.toContain('CANVAS_TOOL_AFFORDANCE_ORDER')
    expect(toolShortcutFile.source).not.toContain("shortcutId: 'selectTool'")
    expect(toolShortcutFile.source).not.toContain("shortcutId: 'markerTool'")
    expect(toolShortcutFile.source).not.toContain("tool: 'select'")
    expect(toolShortcutFile.source).not.toContain("key: 'v'")
    expect(toolShortcutFile.source).not.toContain("key: 'm'")
    expect(toolShortcutCatalogFile.source).toContain(
      'CANVAS_TOOL_AFFORDANCES',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'CANVAS_TOOL_AFFORDANCE_ORDER',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'CANVAS_TOOL_AFFORDANCE_ORDER.map',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'keyboardShortcut.shortcutId',
    )
    expect(toolShortcutCatalogFile.source).toContain(
      'affordance.ariaLabel.toLowerCase()',
    )
    expect(toolShortcutCatalogFile.source).not.toContain(
      "shortcutId: 'selectTool'",
    )
    expect(toolShortcutCatalogFile.source).not.toContain("tool: 'select'")
    expect(toolShortcutCatalogFile.source).not.toContain("key: 'v'")
    expect(toolShortcutCatalogFile.source).not.toContain(
      "kind: 'set-tool'",
    )
    expect(reservedShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedToolShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedCommandShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedViewportShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedNudgeShortcuts',
    )
    expect(reservedShortcutFile.source).toContain(
      'getCanvasKeyboardReservedSystemShortcuts',
    )
    expect(reservedShortcutFile.source).not.toContain("'fit all'")
    expect(reservedShortcutFile.source).not.toContain("'temporary pan'")
    expect(reservedShortcutFile.source).not.toContain("'large nudge left'")
  })

  it('keeps App custom creation tool contracts behind a named module', () => {
    const descriptorFile = getSourceFile(
      'src/canvas/app/tools/CanvasAppCustomCreationTools.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/tools/CanvasAppCustomCreationToolContracts.ts',
    )

    expect(descriptorFile.source).not.toContain(
      "from './CanvasAppCustomCreationToolContracts'",
    )
    expect(descriptorFile.source).not.toContain(
      'function assertCanvasAppCustomCreationTools',
    )
    expect(descriptorFile.source).not.toContain(
      'RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS',
    )
    expect(descriptorFile.source).not.toContain(
      'shortcut conflicts with',
    )
    expect(descriptorFile.source).not.toContain(
      'Duplicate canvas app custom creation tool shortcut',
    )
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppCustomCreationTools',
    )
    expect(contractsFile.source).toContain(
      'RESERVED_CANVAS_APP_CUSTOM_TOOL_SHORTCUTS',
    )
    expect(contractsFile.source).toContain(
      'getCanvasKeyboardReservedShortcuts',
    )
    expect(contractsFile.source).not.toContain("label: 'select tool'")
    expect(contractsFile.source).not.toContain("label: 'marker tool'")
    expect(contractsFile.source).not.toContain("'temporary pan'")
    expect(contractsFile.source).not.toContain("'large nudge left'")
    expect(contractsFile.source).toContain('shortcut conflicts with')
    expect(contractsFile.source).toContain(
      'Duplicate canvas app custom creation tool shortcut',
    )
  })

  it('keeps App custom item module runtime behind a named module', () => {
    const moduleFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModules.ts',
    )
    const assemblyFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleAssembly.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleContracts.ts',
    )
    const runtimeFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleRuntime.ts',
    )

    expect(moduleFile.source).not.toContain(
      "from './CanvasAppCustomItemModuleRuntime'",
    )
    expect(contractsFile.source).not.toContain(
      "from './CanvasAppCustomItemModuleRuntime'",
    )
    expect(assemblyFile.source).toContain(
      "from './CanvasAppCustomItemModuleRuntime'",
    )
    expect(moduleFile.source).not.toContain('Omit<')
    expect(moduleFile.source).not.toContain('normalizeCanvasItems')
    expect(moduleFile.source).not.toContain('createModuleItem(context)')
    expect(moduleFile.source).not.toContain('validateItem(item)')
    expect(runtimeFile.source).toContain('normalizeCanvasItems')
    expect(runtimeFile.source).toContain('createModuleItem(context)')
    expect(runtimeFile.source).toContain('validateItem(item)')
    expect(runtimeFile.source).toContain(
      'type CanvasAppCustomItemModuleValidatorContext',
    )
    expect(runtimeFile.source).not.toContain('Pick<')
    expect(runtimeFile.source).not.toContain('Parameters<')
    expect(runtimeFile.source).toContain('catch')
  })

  it('keeps App custom item module contracts behind a named module', () => {
    const moduleFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModules.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleContracts.ts',
    )

    expect(moduleFile.source).toContain(
      "from './CanvasAppCustomItemModuleContracts'",
    )
    expect(moduleFile.source).not.toContain(
      'function assertCanvasAppCustomItemModule',
    )
    expect(moduleFile.source).not.toContain(
      'Duplicate canvas custom item module',
    )
    expect(moduleFile.source).not.toContain(
      'Unknown disabled canvas custom item module',
    )
    expect(moduleFile.source).not.toContain("label: 'renderer'")
    expect(moduleFile.source).not.toContain("label: 'validator'")
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppCustomItemModule',
    )
    expect(contractsFile.source).toContain(
      'Duplicate canvas custom item module',
    )
    expect(contractsFile.source).toContain(
      'Unknown disabled canvas custom item module',
    )
    expect(contractsFile.source).toContain("label: 'renderer'")
    expect(contractsFile.source).toContain("label: 'validator'")
    expect(contractsFile.source).toContain('requires ${label}')
  })

  it('keeps App custom item module snapshot behavior behind a named module', () => {
    const moduleFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModules.ts',
    )
    const assemblyFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleAssembly.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleSnapshot.ts',
    )
    const descriptorSnapshotFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppDescriptorSnapshot.ts',
    )
    const extensionBundleFile = getSourceFile(
      'src/canvas/app/extensions/CanvasAppExtensionBundle.ts',
    )

    expect(moduleFile.source).toContain(
      "from './CanvasAppCustomItemModuleSnapshot'",
    )
    expect(assemblyFile.source).toContain(
      "from './CanvasAppCustomItemModuleSnapshot'",
    )
    expect(moduleFile.source).not.toContain(
      'function snapshotCanvasAppCustomItemModuleAssembly',
    )
    expect(moduleFile.source).not.toContain(
      'function snapshotCanvasAppCustomItemModule(',
    )
    expect(moduleFile.source).not.toContain('function freezeCanvasAppRecord')
    expect(moduleFile.source).not.toContain('function freezeCanvasAppArray')
    expect(snapshotFile.source).toContain(
      'export function snapshotCanvasAppCustomItemModuleAssembly',
    )
    expect(snapshotFile.source).toContain(
      'export function snapshotCanvasAppCustomItemModule(',
    )
    expect(snapshotFile.source).toContain(
      "from '../extensions/CanvasAppDescriptorSnapshot'",
    )
    expect(snapshotFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(snapshotFile.source).toContain('snapshotCanvasAppExtensionBundle')
    expect(snapshotFile.source).not.toContain(
      'customCommands: snapshotCanvasAppDescriptorArray(assembly.customCommands)',
    )
    expect(snapshotFile.source).not.toContain(
      'customItemRenderers: snapshotCanvasAppRecord(assembly.customItemRenderers)',
    )
    expect(snapshotFile.source).not.toContain('function freezeCanvasAppRecord')
    expect(snapshotFile.source).not.toContain('function freezeCanvasAppArray')
    expect(descriptorSnapshotFile.source).toContain(
      'export function snapshotCanvasAppDescriptorArray',
    )
    expect(descriptorSnapshotFile.source).toContain(
      'export function snapshotCanvasAppShortcutDescriptorArray',
    )
    expect(descriptorSnapshotFile.source).toContain(
      'export function snapshotCanvasAppRecord',
    )
    expect(extensionBundleFile.source).toContain(
      'export function snapshotCanvasAppExtensionBundle',
    )
  })

  it('keeps App custom item validator contracts behind a named module', () => {
    const assemblyContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const validatorContractsFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemValidatorContracts.ts',
    )

    expect(assemblyContractsFile.source).toContain(
      "from '../modules/CanvasAppCustomItemValidatorContracts'",
    )
    expect(assemblyContractsFile.source).not.toContain(
      'custom item validator ${kind}',
    )
    expect(assemblyContractsFile.source).not.toContain('validate strategy')
    expect(validatorContractsFile.source).toContain(
      'export function assertCanvasAppCustomItemValidators',
    )
    expect(validatorContractsFile.source).toContain(
      'custom item validator ${kind}',
    )
    expect(validatorContractsFile.source).toContain('validate strategy')
  })

  it('keeps App Assembly snapshot behavior behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblySnapshot.ts',
    )
    const adapterSnapshotFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterSnapshot.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAssemblySnapshot'",
    )
    expect(assemblyFile.source).not.toContain('structuredClone')
    expect(assemblyFile.source).not.toContain('deepFreezeCanvasAppValue')
    expect(assemblyFile.source).not.toContain('snapshotCanvasAppRecord')
    expect(assemblyFile.source).not.toContain('snapshotCanvasAppArray')
    expect(snapshotFile.source).toContain('structuredClone')
    expect(snapshotFile.source).toContain('deepFreezeCanvasAppValue')
    expect(snapshotFile.source).toContain(
      "from '../extensions/CanvasAppDescriptorSnapshot'",
    )
    expect(snapshotFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(snapshotFile.source).toContain('snapshotCanvasAppExtensionBundle')
    expect(snapshotFile.source).toContain('snapshotCanvasAppRecord')
    expect(snapshotFile.source).toContain('snapshotCanvasAppArray')
    expect(snapshotFile.source).not.toContain(
      'customCommands: snapshotCanvasAppDescriptorArray',
    )
    expect(snapshotFile.source).not.toContain(
      'customCreationTools: snapshotCanvasAppShortcutDescriptorArray',
    )
    expect(snapshotFile.source).not.toContain(
      'inspectorPanels: snapshotCanvasAppDescriptorArray',
    )
    expect(snapshotFile.source).toContain(
      "from './CanvasAppAdapterSnapshot'",
    )
    expect(snapshotFile.source).not.toContain(
      'function snapshotCanvasAppItemAdapters',
    )
    expect(snapshotFile.source).not.toContain(
      'itemLayerAdapter: Object.freeze',
    )
    expect(snapshotFile.source).not.toContain(
      'stageAdapter: Object.freeze',
    )
    expect(adapterSnapshotFile.source).toContain(
      'export function snapshotCanvasAppAssemblyAdapters',
    )
    expect(adapterSnapshotFile.source).toContain(
      'function snapshotCanvasAppItemAdapters',
    )
    expect(adapterSnapshotFile.source).toContain(
      'itemLayerAdapter: Object.freeze',
    )
    expect(adapterSnapshotFile.source).toContain(
      'stageAdapter: Object.freeze',
    )
    expect(adapterSnapshotFile.source).not.toContain('Pick<')
    expect(adapterSnapshotFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(adapterSnapshotFile.source).toContain(
      'CanvasAppAssemblyAdapters',
    )
  })

  it('keeps App adapter assembly creation behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const adapterAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAdapterAssembly'",
    )
    expect(assemblyFile.source).toContain(
      'createCanvasAppAdapterAssembly',
    )
    expect(assemblyFile.source).not.toContain(
      'input.itemAdapters ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemAdapters',
    )
    expect(assemblyFile.source).not.toContain(
      'input.itemLayerAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.itemLayerAdapter',
    )
    expect(assemblyFile.source).not.toContain(
      'input.stageAdapter ?? DEFAULT_CANVAS_APP_ASSEMBLY.stageAdapter',
    )
    expect(adapterAssemblyFile.source).toContain(
      'export function createCanvasAppAdapterAssembly',
    )
    expect(adapterAssemblyFile.source).toContain(
      "from './CanvasAppAssemblyInputTypes'",
    )
    expect(adapterAssemblyFile.source).toContain(
      'export type { CanvasAppAdapterAssemblyInput }',
    )
    expect(adapterAssemblyFile.source).not.toContain(
      'export type CanvasAppAdapterAssemblyInput = {',
    )
    expect(adapterAssemblyFile.source).not.toContain('Pick<')
    expect(adapterAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(adapterAssemblyFile.source).toContain(
      'itemAdapters: input.itemAdapters ?? defaults.itemAdapters',
    )
    expect(adapterAssemblyFile.source).toContain(
      'itemLayerAdapter: input.itemLayerAdapter ?? defaults.itemLayerAdapter',
    )
    expect(adapterAssemblyFile.source).toContain(
      'stageAdapter: input.stageAdapter ?? defaults.stageAdapter',
    )
  })

  it('keeps the default App assembly baseline behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppDefaultAssembly'",
    )
    expect(assemblyFile.source).not.toContain(
      'DEFAULT_CANVAS_APP_INITIAL_SELECTION',
    )
    expect(assemblyFile.source).not.toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(assemblyFile.source).not.toContain('CANVAS_COMPONENT_LIBRARY')
    expect(assemblyFile.source).not.toContain('CANVAS_ITEM_ENGINE_ADAPTERS')
    expect(assemblyFile.source).not.toContain('INITIAL_ITEMS')
    expect(defaultAssemblyFile.source).toContain(
      'export const DEFAULT_CANVAS_APP_ASSEMBLY',
    )
    expect(defaultAssemblyFile.source).toContain(
      "from '../extensions/CanvasAppExtensionBundle'",
    )
    expect(defaultAssemblyFile.source).toContain(
      'createCanvasAppExtensionBundle',
    )
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_INITIAL_SELECTION',
    )
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_AFFORDANCE_CONFIG',
    )
    expect(defaultAssemblyFile.source).toContain('CANVAS_COMPONENT_LIBRARY')
    expect(defaultAssemblyFile.source).toContain('CANVAS_ITEM_ENGINE_ADAPTERS')
    expect(defaultAssemblyFile.source).toContain('INITIAL_ITEMS')
    expect(defaultAssemblyFile.source).toContain('snapshotCanvasAppAssembly')
    expect(defaultAssemblyFile.source).not.toContain('customCommands: []')
    expect(defaultAssemblyFile.source).not.toContain(
      'customCreationTools: []',
    )
    expect(defaultAssemblyFile.source).not.toContain('inspectorPanels: []')
  })

  it('keeps App Assembly output contracts behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const componentContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppComponentAssemblyContracts.ts',
    )
    const adapterContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAdapterContracts.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAssemblyContracts'",
    )
    expect(assemblyFile.source).not.toContain(
      'function assertCanvasAppAssembly',
    )
    expect(assemblyFile.source).not.toContain(
      'function assertCanvasAppComponentLibrary',
    )
    expect(assemblyFile.source).not.toContain(
      'function assertCanvasAppItemAdapters',
    )
    expect(assemblyFile.source).not.toContain(
      'getPresentation mismatch',
    )
    expect(assemblyFile.source).not.toContain('getTemplate mismatch')
    expect(assemblyFile.source).not.toContain('validate strategy')
    expect(assemblyFile.source).not.toContain('command adapter')
    expect(contractsFile.source).toContain(
      'export function assertCanvasAppAssembly',
    )
    expect(contractsFile.source).toContain(
      'assertCanvasAppComponentAssembly',
    )
    expect(contractsFile.source).not.toContain(
      'function assertCanvasAppComponentLibrary',
    )
    expect(contractsFile.source).toContain(
      'assertCanvasAppAssemblyAdapters',
    )
    expect(contractsFile.source).not.toContain(
      'function assertCanvasAppItemAdapters',
    )
    expect(contractsFile.source).not.toContain('getPresentation mismatch')
    expect(contractsFile.source).not.toContain('getTemplate mismatch')
    expect(contractsFile.source).not.toContain('validate strategy')
    expect(contractsFile.source).not.toContain('command adapter')
    expect(componentContractsFile.source).toContain(
      'export function assertCanvasAppComponentAssembly',
    )
    expect(componentContractsFile.source).toContain(
      'export type CanvasAppComponentAssemblyContract',
    )
    expect(componentContractsFile.source).not.toContain('Pick<')
    expect(componentContractsFile.source).not.toContain('CanvasAppAssembly')
    expect(componentContractsFile.source).toContain(
      'function assertCanvasAppComponentLibrary',
    )
    expect(componentContractsFile.source).toContain(
      'function assertCanvasComponentPresentationRendererCoverage',
    )
    expect(componentContractsFile.source).toContain('getPresentation mismatch')
    expect(componentContractsFile.source).toContain('getTemplate mismatch')
    expect(componentContractsFile.source).toContain(
      'Missing canvas app component presentation renderer',
    )
    expect(adapterContractsFile.source).toContain(
      'export function assertCanvasAppAssemblyAdapters',
    )
    expect(adapterContractsFile.source).toContain(
      'export type CanvasAppAssemblyAdapters',
    )
    expect(adapterContractsFile.source).toContain(
      'export type CanvasAppItemAdapters',
    )
    expect(adapterContractsFile.source).not.toContain('Pick<')
    expect(adapterContractsFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(adapterContractsFile.source).toContain(
      'function assertCanvasAppItemAdapters',
    )
    expect(adapterContractsFile.source).toContain('command adapter')
    expect(adapterContractsFile.source).toContain('item layer adapter')
    expect(adapterContractsFile.source).toContain('stage adapter')
  })

  it('keeps App workspace assembly contracts behind a named module', () => {
    const assemblyContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const workspaceContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppWorkspaceAssemblyContracts.ts',
    )

    expect(assemblyContractsFile.source).toContain(
      "from './CanvasAppWorkspaceAssemblyContracts'",
    )
    expect(assemblyContractsFile.source).toContain(
      'assertCanvasAppWorkspaceAssembly',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'normalizeCanvasItems',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'createCanvasItemReadModel',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'workspaceStorageProvider',
    )
    expect(assemblyContractsFile.source).not.toContain('initialSelection')
    expect(workspaceContractsFile.source).toContain(
      'export function assertCanvasAppWorkspaceAssembly',
    )
    expect(workspaceContractsFile.source).toContain(
      'export type CanvasAppWorkspaceAssemblyContract',
    )
    expect(workspaceContractsFile.source).not.toContain('Pick<')
    expect(workspaceContractsFile.source).not.toContain('CanvasAppAssembly')
    expect(workspaceContractsFile.source).toContain('normalizeCanvasItems')
    expect(workspaceContractsFile.source).toContain('getCanvasItemIds')
    expect(workspaceContractsFile.source).toContain(
      'getCanvasValidSelection',
    )
    expect(workspaceContractsFile.source).toContain(
      'workspaceStorageProvider',
    )
    expect(workspaceContractsFile.source).toContain('initialSelection')
    expect(workspaceContractsFile.source).toContain(
      'Invalid assembly initial selection',
    )
  })

  it('keeps App workspace assembly creation behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const workspaceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppWorkspaceAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppWorkspaceAssembly'",
    )
    expect(assemblyFile.source).toContain(
      'createCanvasAppWorkspaceAssembly',
    )
    expect(assemblyFile.source).not.toContain('normalizeCanvasItems')
    expect(assemblyFile.source).not.toContain(
      'input.initialItems ?? DEFAULT_CANVAS_APP_ASSEMBLY.initialItems',
    )
    expect(assemblyFile.source).not.toContain(
      'input.initialItems === undefined',
    )
    expect(workspaceAssemblyFile.source).toContain(
      'export function createCanvasAppWorkspaceAssembly',
    )
    expect(workspaceAssemblyFile.source).toContain(
      'export type CanvasAppWorkspaceAssembly',
    )
    expect(workspaceAssemblyFile.source).not.toContain('Pick<')
    expect(workspaceAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(workspaceAssemblyFile.source).toContain('normalizeCanvasItems')
    expect(workspaceAssemblyFile.source).toContain(
      'input.initialItems === undefined',
    )
    expect(workspaceAssemblyFile.source).toContain(
      'workspaceStorageProvider',
    )
  })

  it('keeps App affordance assembly creation behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const affordanceAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAffordanceAssembly.ts',
    )

    expect(assemblyFile.source).toContain(
      "from './CanvasAppAffordanceAssembly'",
    )
    expect(assemblyFile.source).toContain(
      'createCanvasAppAffordanceAssembly',
    )
    expect(assemblyFile.source).not.toContain('createCanvasAffordanceConfig')
    expect(assemblyFile.source).not.toContain(
      'input.affordanceConfig === undefined',
    )
    expect(affordanceAssemblyFile.source).toContain(
      'export function createCanvasAppAffordanceAssembly',
    )
    expect(affordanceAssemblyFile.source).toContain(
      'export type CanvasAppAffordanceAssembly',
    )
    expect(affordanceAssemblyFile.source).not.toContain('Pick<')
    expect(affordanceAssemblyFile.source).not.toContain(
      "from './CanvasAppAssembly'",
    )
    expect(affordanceAssemblyFile.source).toContain(
      'createCanvasAffordanceConfig',
    )
    expect(affordanceAssemblyFile.source).toContain(
      'input.affordanceConfig === undefined',
    )
  })

  it('keeps affordance config contracts in the Engine affordance module', () => {
    const assemblyContractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
    )
    const affordanceCatalogFile = getSourceFile(
      'src/canvas/engine/affordance/CanvasAffordanceCatalog.ts',
    )
    const affordanceConfigFile = getSourceFile(
      'src/canvas/engine/affordance/CanvasAffordanceConfig.ts',
    )
    const affordanceMetadataFile = getSourceFile(
      'src/canvas/engine/affordance/CanvasAffordanceMetadata.ts',
    )
    const affordanceTypesFile = getSourceFile(
      'src/canvas/engine/affordance/CanvasAffordanceTypes.ts',
    )

    expect(assemblyContractsFile.source).toContain(
      'assertCanvasAffordanceConfig',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'Canvas affordance config',
    )
    expect(assemblyContractsFile.source).not.toContain(
      'Unknown canvas affordance config',
    )
    expect(affordanceCatalogFile.source).toContain(
      'CANVAS_AFFORDANCE_CONFIG_DEFAULTS',
    )
    expect(affordanceCatalogFile.source).toContain('alignBottom: true')
    expect(affordanceTypesFile.source).toContain(
      'typeof CANVAS_AFFORDANCE_CONFIG_DEFAULTS',
    )
    expect(affordanceConfigFile.source).toContain(
      "from './CanvasAffordanceCatalog'",
    )
    expect(affordanceConfigFile.source).toContain(
      'for (const group of CANVAS_AFFORDANCE_CONFIG_GROUPS)',
    )
    expect(affordanceConfigFile.source).not.toContain('alignBottom: true')
    expect(affordanceConfigFile.source).not.toContain('config.commands')
    expect(affordanceConfigFile.source).not.toContain('config.gestures')
    expect(affordanceConfigFile.source).not.toContain('config.overlays')
    expect(affordanceConfigFile.source).not.toContain('config.shortcuts')
    expect(affordanceConfigFile.source).not.toContain('config.tools')
    expect(affordanceConfigFile.source).toContain(
      'export function assertCanvasAffordanceConfig',
    )
    expect(affordanceConfigFile.source).toContain(
      'Unknown canvas affordance config',
    )
    expect(affordanceConfigFile.source).toContain(
      'snapshotCanvasAffordanceConfig',
    )
    expect(affordanceMetadataFile.source).toContain(
      'function createCanvasToolAffordance',
    )
    expect(affordanceMetadataFile.source).toContain(
      'formatCanvasToolKeyboardShortcut',
    )
    expect(affordanceMetadataFile.source).not.toContain("shortcut: 'V'")
    expect(affordanceMetadataFile.source).not.toContain("title: 'Select (")
  })

  it('keeps app workflow hooks from recreating the workspace read model', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        !file.path.startsWith('src/canvas/app/document/') &&
        file.path !== 'src/canvas/app/workflow/useCanvasWorkspaceModel.ts' &&
        file.path !==
          'src/canvas/app/workflow/CanvasWorkspaceRuntimeModel.ts',
      )
      .flatMap((file) =>
        file.source.includes('createCanvasItemReadModel') ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps Host item read model scene on the Engine scene adapter contract', () => {
    const readModelFile = getSourceFile(
      'src/canvas/host/read/CanvasItemReadModel.ts',
    )

    expect(readModelFile.source).toContain('CanvasSceneAdapter')
    expect(readModelFile.source).toContain(
      'scene: CanvasSceneAdapter',
    )
    expect(readModelFile.source).toContain(
      'export function getCanvasItemIds',
    )
    expect(readModelFile.source).toContain(
      'export function getCanvasValidSelection',
    )
    expect(readModelFile.source).not.toContain('ReturnType<')
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
      'inspector: {',
      'interaction: {',
      'itemLayer: {',
      'keyboard: {',
      'pointer: {',
      'stage: {',
      'text: {',
      'viewport: {',
    ]) {
      expect(workspaceModelFile.source).not.toContain(consumerContext)
    }
    for (const consumerContext of [
      'command: {',
      'component: {',
      'control: {',
      'extension: {',
      'inspector: {',
      'interaction: {',
      'itemLayer: {',
      'keyboard: {',
      'pointer: {',
      'stage: {',
      'text: {',
      'viewport: {',
    ]) {
      expect(workspaceConsumerModelFile.source).toContain(consumerContext)
    }
  })

  it('keeps App workspace snapshot contracts behind a named module', () => {
    const persistenceFile = getSourceFile(
      'src/canvas/app/document/CanvasWorkspacePersistence.ts',
    )
    const snapshotFile = getSourceFile(
      'src/canvas/app/document/CanvasWorkspaceSnapshot.ts',
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

  it('keeps browser workspace storage behind the persistence provider seam', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path.startsWith('src/canvas/app/') &&
        file.path !== 'src/canvas/app/document/CanvasWorkspacePersistence.ts' &&
        file.path !== 'src/canvas/app/document/CanvasWorkspacePersistence.test.ts',
      )
      .flatMap((file) =>
        /window\.localStorage|CANVAS_WORKSPACE_STORAGE_KEY/.test(file.source)
          ? [file.path]
          : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps Demo SVG renderer names out of app authoring seams', () => {
    const publicAuthoringFiles = new Set([
      'src/canvas/index.ts',
      'src/canvas/app/index.ts',
      'src/canvas/app/workflow/index.ts',
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
      'src/canvas/app/workflow/useCanvasAppModel.ts',
      'src/canvas/app/modules/CanvasAppCustomItemModules.ts',
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

  it('keeps zod-crud document internals inside the host document layer', () => {
    const violations = sourceFiles
      .filter((file) => !file.path.startsWith('src/canvas/host/document/'))
      .flatMap((file) =>
        file.source.includes('zod-crud') ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

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
    expect(documentRuntimeContractsFile.source).toContain(
      'export type CanvasDocumentCommittedState',
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

function getImportsFrom(pathPrefix: string) {
  return sourceFiles
    .filter((file) => file.path.startsWith(pathPrefix))
    .flatMap(getImportReferences)
}

function getImportsFromOutside(pathPrefix: string) {
  return sourceFiles
    .filter((file) => !file.path.startsWith(pathPrefix))
    .flatMap(getImportReferences)
}

function getSourceFile(path: string) {
  const sourceFile = sourceFiles.find((file) => file.path === path)

  if (!sourceFile) {
    throw new Error(`Missing source file: ${path}`)
  }

  return sourceFile
}

function getImportReferences(file: SourceFile): ImportReference[] {
  return [...file.source.matchAll(IMPORT_PATTERN)]
    .map((match) => match[1] ?? match[2])
    .filter((specifier): specifier is string => specifier !== undefined)
    .map((specifier) => ({
      from: file.path,
      specifier,
      target: resolveImportTarget(file.path, specifier),
    }))
}

function targetsAnyLayer(
  reference: ImportReference,
  layers: readonly string[],
) {
  return layers.some((layer) =>
    reference.target === `src/canvas/${layer}` ||
    reference.target.startsWith(`src/canvas/${layer}/`),
  )
}

function resolveImportTarget(from: string, specifier: string) {
  if (!specifier.startsWith('.')) {
    return specifier
  }

  const segments = from.split('/').slice(0, -1)

  for (const segment of specifier.split('/')) {
    if (segment === '.' || segment === '') {
      continue
    }

    if (segment === '..') {
      segments.pop()
      continue
    }

    segments.push(segment)
  }

  return segments.join('/').replace(/\.(ts|tsx)$/, '')
}

const IMPORT_PATTERN =
  /import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]|export\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g
