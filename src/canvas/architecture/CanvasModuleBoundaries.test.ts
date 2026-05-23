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
        file.path !== 'src/canvas/app/workflow/CanvasAppAssembly.ts',
      )
      .flatMap((file) =>
        assemblyTerms.test(file.source) ? [file.path] : [],
      )

    expect(violations).toEqual([])
  })

  it('keeps Canvas App Assembly input explicit instead of mirroring output', () => {
    const violations = sourceFiles
      .filter((file) =>
        file.path === 'src/canvas/app/workflow/CanvasAppAssembly.ts',
      )
      .flatMap((file) =>
        file.source.includes('Partial<CanvasAppAssembly>')
          ? [file.path]
          : [],
      )

    expect(violations).toEqual([])
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
      'appendUniqueCanvasAppExtensionEntries',
    )
    expect(extensionAssemblyFile.source).toContain(
      'mergeUniqueCanvasAppExtensionRecord',
    )
    expect(extensionAssemblyFile.source).toContain("owner: 'app assembly'")
  })

  it('keeps App Model from distributing Assembly output fields directly', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const assemblyModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyModel.ts',
    )

    expect(appModelFile.source).toContain(
      "from './CanvasAppAssemblyModel'",
    )
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
      'itemAdapters',
      'itemLayerAdapter',
      'stageAdapter',
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
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const inputContract =
      assemblyFile.source.match(
        /export type CanvasAppAssemblyInput = \{[\s\S]*?\n\}/,
      )?.[0] ?? ''

    expect(inputContract).toContain(
      'customItemModules?: readonly CanvasAppCustomItemModule[]',
    )
    expect(inputContract).toContain(
      'affordanceConfig?: CanvasAffordanceConfigInput',
    )
    expect(inputContract).not.toMatch(
      /\b(customCreationTools|customItemRenderers|customItemValidators)\?:/,
    )
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
          'src/canvas/core',
          'src/canvas/engine',
          'src/canvas/entities',
          'src/canvas/host',
          'src/canvas/renderer',
        ].includes(reference.target),
      )

    expect(privateTargets).toEqual([])
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
    const itemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarItems.ts',
    )
    const commandItemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandItems.ts',
    )
    const commandDispatchFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarCommandDispatch.ts',
    )
    const toolItemsFile = getSourceFile(
      'src/canvas/ui/toolbar/CanvasToolbarToolItems.ts',
    )

    expect(toolbarFile.source).toContain("from './CanvasToolbarItems'")
    expect(toolbarFile.source).toContain(
      "from './CanvasToolbarCommandDispatch'",
    )
    expect(toolbarFile.source).not.toContain('config.commands.')
    expect(toolbarFile.source).not.toContain('config.tools.')
    expect(toolbarFile.source).not.toContain('customCommands.map')
    expect(toolbarFile.source).not.toContain('customTools.map')
    expect(toolbarFile.source).not.toContain('CANVAS_TOOL_AFFORDANCES.select')
    expect(toolbarFile.source).not.toContain('switch (action.kind)')
    expect(toolbarFile.source).not.toContain('onAlign:')
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
      'CANVAS_TOOLBAR_COMMAND_GROUPS',
    )
    expect(commandItemsFile.source).toContain("command: 'alignLeft'")
    expect(commandItemsFile.source).toContain(
      "command: 'distributeHorizontal'",
    )
    expect(commandItemsFile.source).not.toContain(
      'getCanvasToolbarAlignItem',
    )
    expect(commandItemsFile.source).not.toContain(
      'getCanvasToolbarDistributeItem',
    )
    expect(commandDispatchFile.source).toContain(
      'export function runCanvasToolbarCommandAction',
    )
    expect(commandDispatchFile.source).toContain(
      'CanvasToolbarCommandHandlers',
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
    for (const consumerContext of [
      'command: {',
      'component: {',
      'pointer: {',
      'stage: {',
      'viewport: {',
    ]) {
      expect(stageElementModelFile.source).toContain(consumerContext)
    }
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

  it('keeps app stage rendering containment behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const stageModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppStageModel.tsx',
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

    for (const file of [
      toolbarFile,
      toolbarItemsFile,
      toolbarCommandItemsFile,
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
    expect(toolbarCommandItemsFile.source).toContain(
      'keyof CanvasCommandAvailability & CanvasCommandId',
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
    expect(commandConsumerModelFile.source).toContain('control: {')
    expect(commandConsumerModelFile.source).toContain('keyboard: {')
    expect(commandConsumerModelFile.source).toContain('pointer: {')
    expect(appModelFile.source).not.toMatch(/commands\.\w+Selection/)
    expect(appModelFile.source).not.toContain('commands.cloneItems')
  })

  it('keeps app component insertion wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const componentModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppComponentModel.ts',
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
    expect(appModelFile.source).not.toContain('components.insertComponent')
  })

  it('keeps app inspector wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const inspectorModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppInspectorModel.ts',
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
  })

  it('keeps app pointer handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const pointerModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppPointerModel.ts',
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
    expect(pointerModelFile.source).toContain('itemLayerHandlers')
    expect(pointerModelFile.source).toContain('stageHandlers')
  })

  it('keeps app keyboard handler wiring behind a named workflow module', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const keyboardModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppKeyboardModel.ts',
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
      'export function useCanvasAppKeyboardModel',
    )
    expect(keyboardModelFile.source).toContain('command.copySelection')
    expect(keyboardModelFile.source).toContain('interaction.setSpaceDown')
    expect(keyboardModelFile.source).toContain('viewport.zoomBy')
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
  })

  it('keeps app interaction state routing behind the interaction model', () => {
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const interactionModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasInteractionModel.ts',
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
      expect(interactionModelFile.source).toContain(consumerContext)
    }
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

    expect(dragHandlersFile.source).toContain(
      "from './CanvasPointerInteractionLifecycle'",
    )
    expect(dragHandlersFile.source).not.toContain('createCanvasRect({')
    expect(dragHandlersFile.source).not.toContain('createCanvasMarker({')
    expect(dragHandlersFile.source).not.toContain('createCanvasArrow({')
    expect(dragHandlersFile.source).not.toContain('commitCanvasCustomCreation')
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
    expect(lifecycleFile.source).not.toContain('createCanvasRect({')
    expect(lifecycleFile.source).not.toContain('createCanvasMarker({')
    expect(lifecycleFile.source).not.toContain('createCanvasArrow({')
    expect(lifecycleFile.source).not.toContain('commitCanvasCustomCreation')
    expect(lifecycleFile.source).toContain("type: 'transform'")
    expect(lifecycleFile.source).toContain('setEditing(interaction.edit)')
    expect(creationCommitFile.source).toContain(
      'export function commitCanvasPointerCreation',
    )
    expect(creationCommitFile.source).toContain('createCanvasRect({')
    expect(creationCommitFile.source).toContain('createCanvasMarker({')
    expect(creationCommitFile.source).toContain('createCanvasHighlight({')
    expect(creationCommitFile.source).toContain('createCanvasArrow({')
    expect(creationCommitFile.source).toContain('commitCanvasCustomCreation')
  })

  it('keeps pointer interaction preview rules behind a named module', () => {
    const dragHandlersFile = getSourceFile(
      'src/canvas/app/pointer/useCanvasPointerDragHandlers.ts',
    )
    const previewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionPreview.ts',
    )
    const creationPreviewFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationPreview.ts',
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
      'export function previewCanvasPointerInteraction',
    )
    expect(previewFile.source).not.toContain('getCanvasMoveSnap')
    expect(previewFile.source).not.toContain('resizeCanvasSelection')
    expect(previewFile.source).not.toContain('moveCanvasSelection')
    expect(previewFile.source).toContain('getCanvasMarqueeSelection')
    expect(previewFile.source).not.toContain('getNextCanvasDrawingPoints')
    expect(previewFile.source).not.toContain('createCanvasDraftStroke')
    expect(previewFile.source).not.toContain('DRAG_THRESHOLD')
    expect(creationPreviewFile.source).toContain(
      'export function previewCanvasPointerCreation',
    )
    expect(creationPreviewFile.source).toContain('getNextCanvasDrawingPoints')
    expect(creationPreviewFile.source).toContain('createCanvasDraftStroke')
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
    const startFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerInteractionStart.ts',
    )
    const creationStartFile = getSourceFile(
      'src/canvas/app/pointer/CanvasPointerCreationStart.ts',
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
    expect(startFile.source).toContain(
      'export function startCanvasPointerInteraction',
    )
    expect(startFile.source).toContain(
      "from './CanvasPointerCreationStart'",
    )
    expect(startFile.source).toContain('getCanvasPointerGesture')
    expect(startFile.source).toContain('isAdditivePointerInput')
    expect(startFile.source).not.toContain('createCanvasText')
    expect(startFile.source).not.toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(startFile.source).not.toContain('createCanvasDraftStroke')
    expect(creationStartFile.source).toContain(
      'export function startCanvasPointerCreation',
    )
    expect(creationStartFile.source).toContain('createCanvasText')
    expect(creationStartFile.source).toContain(
      'getCanvasAppCustomCreationTool',
    )
    expect(creationStartFile.source).toContain('createCanvasDraftStroke')
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
    expect(itemStartFile.source).toContain("item.type === 'rect'")
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
    const itemLayerAdapterFile = getSourceFile(
      'src/canvas/app/rendering/CanvasAppItemLayerAdapter.tsx',
    )

    expect(contractsFile.source).toContain(
      'CanvasAppComponentRendererStrategy',
    )
    expect(contractsFile.source).toContain(
      'CanvasAppCustomItemRendererStrategy',
    )
    expect(contractsFile.source).not.toContain('CanvasDemoSvg')
    expect(itemLayerAdapterFile.source).not.toMatch(
      /CanvasDemoSvg(?:Component|Custom).*Renderer/,
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
    expect(drawingStyleConsumers).not.toContain('#475569')
    expect(drawingStyleConsumers).not.toContain('#fde047')
    expect(drawingStyleConsumers).not.toContain('#334155')
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
    const itemFrameFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemFrame.tsx',
    )

    expect(itemLayerFile.source).toContain('CanvasDemoSvgItemFrame')
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
    const drawingRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgDrawingItemRenderer.tsx',
    )

    expect(itemLayerFile.source).toContain(
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
    expect(drawingRendererFile.source).toContain('createCanvasSvgPathData')
    expect(drawingRendererFile.source).toContain('CANVAS_SVG_ARROW_MARKER_IRI')
  })

  it('keeps Demo SVG rect and text item rendering behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const rectTextRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgRectTextItemRenderer.tsx',
    )

    expect(itemLayerFile.source).toContain(
      "from './CanvasDemoSvgRectTextItemRenderer'",
    )
    expect(itemLayerFile.source).not.toContain('className="rect-item"')
    expect(itemLayerFile.source).not.toContain('canvas-rect-text')
    expect(itemLayerFile.source).not.toContain('<foreignObject')
    expect(rectTextRendererFile.source).toContain(
      'export function renderCanvasDemoSvgRectTextItem',
    )
    expect(rectTextRendererFile.source).toContain('className="rect-item"')
    expect(rectTextRendererFile.source).toContain('canvas-rect-text')
    expect(rectTextRendererFile.source).toContain('<foreignObject')
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
    const executionFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererExecution.tsx',
    )
    const customRegistryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRenderFallback.tsx',
    )

    expect(itemLayerFile.source).toContain(
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

    expect(descriptorFile.source).toContain(
      "from './CanvasAppInspectorPanelExecution'",
    )
    expect(descriptorFile.source).not.toContain('panel.render(')
    expect(descriptorFile.source).not.toContain('panel.isVisible(')
    expect(descriptorFile.source).not.toContain('try {')
    expect(executionFile.source).toContain('panel.render(context)')
    expect(executionFile.source).toContain('panel.isVisible(context)')
    expect(executionFile.source).toContain('catch')
    expect(objectInspectorHook.source).toContain(
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

    expect(descriptorFile.source).toContain(
      "from './CanvasAppInspectorPanelContracts'",
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
    const extensionModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppExtensionModel.ts',
    )
    const extensionConsumerModelFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppExtensionConsumerModel.ts',
    )
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )

    expect(descriptorFile.source).toContain(
      "from './CanvasAppCustomCommandExecution'",
    )
    expect(descriptorFile.source).not.toContain('command.run(')
    expect(descriptorFile.source).not.toContain('command.isEnabled(')
    expect(descriptorFile.source).not.toContain('try {')
    expect(executionFile.source).toContain('command.run(context)')
    expect(executionFile.source).toContain('command.isEnabled(context)')
    expect(executionFile.source).toContain('catch')
    expect(extensionModelFile.source).toContain(
      "from '../commands/CanvasAppCustomCommandExecution'",
    )
    expect(extensionModelFile.source).toContain(
      "from './CanvasAppExtensionConsumerModel'",
    )
    expect(extensionModelFile.source).not.toContain('control: {')
    expect(extensionModelFile.source).not.toContain('keyboard: {')
    expect(extensionModelFile.source).not.toContain('pointer: {')
    expect(extensionConsumerModelFile.source).toContain(
      'export function getCanvasAppExtensionConsumerModel',
    )
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
    const effectPlanFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandEffectPlan.ts',
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
      'applyCanvasStandardDocumentEffect',
    )
    expect(executionFile.source).not.toContain('alignCanvasCommand')
    expect(executionFile.source).not.toContain('deleteCanvasCommand')
    expect(executionFile.source).not.toContain('groupCanvasCommand')
    expect(executionFile.source).not.toContain('nudgeCanvasCommand')
    expect(executionFile.source).not.toContain('selectAllCanvasCommand')
    expect(executionFile.source).not.toContain("type: 'remove-selection'")
    expect(executionFile.source).not.toContain("type: 'group-selection'")
    expect(effectPlanFile.source).toContain(
      'export function createCanvasStandardCommandEffectPlan',
    )
    expect(effectPlanFile.source).toContain('alignCanvasCommand')
    expect(effectPlanFile.source).toContain('deleteCanvasCommand')
    expect(effectPlanFile.source).toContain('groupCanvasCommand')
    expect(effectPlanFile.source).toContain('nudgeCanvasCommand')
    expect(effectPlanFile.source).toContain('selectAllCanvasCommand')
    expect(effectPlanFile.source).toContain(
      'createCanvasStandardRemoveSelectionEffect',
    )
    expect(effectPlanFile.source).toContain(
      'createCanvasStandardGroupSelectionEffect',
    )
    expect(effectPlanFile.source).not.toContain("type: 'remove-selection'")
    expect(effectPlanFile.source).not.toContain("type: 'group-selection'")
  })

  it('keeps App standard command document effects behind a named module', () => {
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandExecution.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasStandardCommandDocumentEffects.ts',
    )

    expect(executionFile.source).toContain(
      "from './CanvasStandardCommandDocumentEffects'",
    )
    expect(effectsFile.source).toContain(
      'export function applyCanvasStandardDocumentEffect',
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
    const executionFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandExecution.ts',
    )
    const effectPlanFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffectPlan.ts',
    )
    const effectsFile = getSourceFile(
      'src/canvas/app/commands/CanvasClipboardCommandEffects.ts',
    )

    expect(clipboardHookFile.source).toContain(
      "from './CanvasClipboardCommandExecution'",
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
      "from './CanvasClipboardCommandEffects'",
    )
    expect(executionFile.source).toContain('applyCanvasClipboardCommandEffect')
    expect(executionFile.source).not.toContain('cloneCanvasCommandItems')
    expect(executionFile.source).not.toContain('duplicateCanvasCommand')
    expect(executionFile.source).not.toContain('deleteCanvasCommand')
    expect(executionFile.source).not.toContain('getCanvasPasteOffset')
    expect(executionFile.source).not.toContain('copyItemsToClipboard(')
    expect(executionFile.source).not.toContain("type: 'remove-selection'")
    expect(effectPlanFile.source).toContain(
      'export function createCanvasClipboardCommandEffectPlan',
    )
    expect(effectPlanFile.source).toContain('cloneCanvasCommandItems')
    expect(effectPlanFile.source).toContain('duplicateCanvasCommand')
    expect(effectPlanFile.source).toContain('deleteCanvasCommand')
    expect(effectPlanFile.source).toContain('getCanvasPasteOffset')
    expect(effectPlanFile.source).not.toContain('copyItemsToClipboard(')
    expect(effectPlanFile.source).not.toContain("type: 'remove-selection'")
    expect(effectsFile.source).toContain(
      'export function applyCanvasClipboardCommandEffect',
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

    expect(descriptorFile.source).toContain(
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
    const runtimeFile = getSourceFile(
      'src/canvas/app/tools/CanvasAppCustomCreationToolRuntime.ts',
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
    const pointerCommitFile = getSourceFile(
      'src/canvas/app/pointer/CanvasCustomCreationCommit.ts',
    )

    expect(descriptorFile.source).toContain(
      "from './CanvasAppCustomCreationToolRuntime'",
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
      keyboardIntentFile,
      pointerCommitFile,
    ]) {
      expect(file.source).toContain(
        'CanvasAppCustomCreationToolRuntime',
      )
    }
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
    const commandDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardCommandDispatch.ts',
    )
    const nudgeShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardNudgeShortcuts.ts',
    )
    const viewportShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportShortcuts.ts',
    )
    const systemShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemShortcuts.ts',
    )
    const systemDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardSystemDispatch.ts',
    )
    const viewportDispatchFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardViewportDispatch.ts',
    )
    const toolIntentFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcutIntent.ts',
    )
    const toolShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardToolShortcuts.ts',
    )
    const reservedShortcutFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardReservedShortcuts.ts',
    )

    expect(routerFile.source).toContain(
      "from './CanvasKeyboardShortcutIntent'",
    )
    expect(routerFile.source).toContain(
      "from './CanvasKeyboardCommandDispatch'",
    )
    expect(routerFile.source).toContain(
      "from './CanvasKeyboardSystemDispatch'",
    )
    expect(routerFile.source).toContain(
      "from './CanvasKeyboardViewportDispatch'",
    )
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
    expect(commandShortcutFile.source).toContain("shortcutId: 'undo'")
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'fitAll'")
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'zoomIn'")
    expect(commandShortcutFile.source).not.toContain("shortcutId: 'nudge'")
    expect(commandShortcutFile.source).not.toContain("'large nudge left'")
    expect(commandShortcutFile.source).toContain("kind: 'reorder-selection'")
    expect(commandDispatchFile.source).toContain(
      'export function runCanvasKeyboardCommandIntent',
    )
    expect(commandDispatchFile.source).toContain(
      'export function isCanvasKeyboardCommandIntent',
    )
    expect(commandDispatchFile.source).toContain(
      "case 'delete-selection'",
    )
    expect(commandDispatchFile.source).toContain(
      "case 'nudge-selection'",
    )
    expect(nudgeShortcutFile.source).toContain(
      'export function getCanvasKeyboardNudgeShortcutIntent',
    )
    expect(nudgeShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedNudgeShortcuts',
    )
    expect(nudgeShortcutFile.source).toContain("'large nudge left'")
    expect(nudgeShortcutFile.source).toContain("kind: 'nudge-selection'")
    expect(viewportShortcutFile.source).toContain(
      'export function getCanvasKeyboardViewportShortcutIntent',
    )
    expect(viewportShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedViewportShortcuts',
    )
    expect(viewportShortcutFile.source).toContain("shortcutId: 'fitAll'")
    expect(viewportShortcutFile.source).toContain("shortcutId: 'zoomIn'")
    expect(viewportShortcutFile.source).toContain("kind: 'fit-selection'")
    expect(viewportShortcutFile.source).toContain("kind: 'zoom-by'")
    expect(systemShortcutFile.source).toContain(
      'export function getCanvasKeyboardSystemShortcutIntent',
    )
    expect(systemShortcutFile.source).toContain(
      'export function getCanvasKeyboardReservedSystemShortcuts',
    )
    expect(systemShortcutFile.source).toContain("shortcutId: 'findReplace'")
    expect(systemShortcutFile.source).toContain("shortcutId: 'temporaryPan'")
    expect(systemShortcutFile.source).toContain("shortcutId: 'escape'")
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemIntent',
    )
    expect(systemDispatchFile.source).toContain(
      'export function isCanvasKeyboardSystemIntent',
    )
    expect(systemDispatchFile.source).toContain(
      "case 'open-find-replace'",
    )
    expect(systemDispatchFile.source).toContain("case 'escape'")
    expect(systemDispatchFile.source).toContain('commitSelection([])')
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemKeyUp',
    )
    expect(systemDispatchFile.source).toContain(
      'export function runCanvasKeyboardSystemWindowBlur',
    )
    expect(systemDispatchFile.source).toContain(
      'shouldReleaseCanvasKeyboardTemporaryPan',
    )
    expect(systemDispatchFile.source).toContain('setSpaceDown(false)')
    expect(viewportDispatchFile.source).toContain(
      'export function runCanvasKeyboardViewportIntent',
    )
    expect(viewportDispatchFile.source).toContain(
      'export function isCanvasKeyboardViewportIntent',
    )
    expect(viewportDispatchFile.source).toContain("case 'zoom-by'")
    expect(viewportDispatchFile.source).toContain("case 'fit-selection'")
    expect(viewportDispatchFile.source).toContain('fitToItems(intent.ids)')
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
    expect(toolShortcutFile.source).toContain('CANVAS_TOOL_AFFORDANCES')
    expect(toolShortcutFile.source).toContain('CANVAS_TOOL_AFFORDANCE_ORDER')
    expect(toolShortcutFile.source).not.toContain("shortcutId: 'selectTool'")
    expect(toolShortcutFile.source).not.toContain("shortcutId: 'markerTool'")
    expect(toolShortcutFile.source).not.toContain("tool: 'select'")
    expect(toolShortcutFile.source).not.toContain("key: 'v'")
    expect(toolShortcutFile.source).not.toContain("key: 'm'")
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

    expect(descriptorFile.source).toContain(
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
    const runtimeFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleRuntime.ts',
    )

    expect(moduleFile.source).toContain(
      "from './CanvasAppCustomItemModuleRuntime'",
    )
    expect(moduleFile.source).not.toContain('normalizeCanvasItems')
    expect(moduleFile.source).not.toContain('createModuleItem(context)')
    expect(moduleFile.source).not.toContain('validateItem(item)')
    expect(runtimeFile.source).toContain('normalizeCanvasItems')
    expect(runtimeFile.source).toContain('createModuleItem(context)')
    expect(runtimeFile.source).toContain('validateItem(item)')
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
    const snapshotFile = getSourceFile(
      'src/canvas/app/modules/CanvasAppCustomItemModuleSnapshot.ts',
    )

    expect(moduleFile.source).toContain(
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
    expect(snapshotFile.source).toContain('function freezeCanvasAppRecord')
    expect(snapshotFile.source).toContain('function freezeCanvasAppArray')
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
    expect(assemblyFile.source).not.toContain('freezeCanvasAppRecord')
    expect(assemblyFile.source).not.toContain('freezeCanvasAppArray')
    expect(snapshotFile.source).toContain('structuredClone')
    expect(snapshotFile.source).toContain('deepFreezeCanvasAppValue')
    expect(snapshotFile.source).toContain('freezeCanvasAppRecord')
    expect(snapshotFile.source).toContain('freezeCanvasAppArray')
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
      'function assertCanvasAppItemAdapters',
    )
    expect(adapterContractsFile.source).toContain('command adapter')
    expect(adapterContractsFile.source).toContain('item layer adapter')
    expect(adapterContractsFile.source).toContain('stage adapter')
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
        file.path !== 'src/canvas/app/workflow/useCanvasWorkspaceModel.ts',
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
    const rawWorkspaceTerms =
      /\b(canRedo|canUndo|commitSelection|commitItemsChange|copyItemsToClipboard|getClipboardItems|findDocumentText|itemReadModel|redo|replaceDocumentText|selectedBounds|setClipboardItems|setLiveItems|setSelection|setViewport|undo)\b/

    expect(appModelFile.source).toContain(
      "from './useCanvasWorkspaceModel'",
    )
    expect(appModelFile.source).not.toMatch(rawWorkspaceTerms)
    expect(workspaceModelFile.source).toContain(
      "from './CanvasWorkspaceConsumerModel'",
    )
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
    expect(changePatchFile.source).toContain('switch (change.type)')
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
