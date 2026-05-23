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
    expect(lifecycleFile.source).toContain('createCanvasRect({')
    expect(lifecycleFile.source).toContain('commitCanvasCustomCreation')
    expect(lifecycleFile.source).toContain("type: 'transform'")
    expect(lifecycleFile.source).toContain('setEditing(interaction.edit)')
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

  it('keeps Demo SVG component render fallback behind a named module', () => {
    const componentRendererFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRenderer.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgComponentRenderFallback.tsx',
    )

    expect(componentRendererFile.source).toContain(
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
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(contractsFile.source).toContain('render strategy')
  })

  it('keeps Demo SVG custom item render fallback behind a named module', () => {
    const itemLayerFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgItemLayer.tsx',
    )
    const customRegistryFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRendererRegistry.tsx',
    )
    const fallbackFile = getSourceFile(
      'src/canvas/app/rendering/CanvasDemoSvgCustomItemRenderFallback.tsx',
    )

    expect(itemLayerFile.source).toContain(
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
      'assertCanvasAppExtensionRecordKeys',
    )
    expect(contractsFile.source).toContain('render strategy')
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
    expect(appModelFile.source).toContain(
      "from '../commands/CanvasAppCustomCommandExecution'",
    )
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
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const keyboardRouterFile = getSourceFile(
      'src/canvas/app/keyboard/CanvasKeyboardShortcutRouter.ts',
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
    for (const file of [appModelFile, keyboardRouterFile, pointerCommitFile]) {
      expect(file.source).toContain(
        'CanvasAppCustomCreationToolRuntime',
      )
    }
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
  })

  it('keeps App Assembly output contracts behind a named module', () => {
    const assemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssembly.ts',
    )
    const contractsFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppAssemblyContracts.ts',
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
      'function assertCanvasAppComponentLibrary',
    )
    expect(contractsFile.source).toContain(
      'function assertCanvasAppItemAdapters',
    )
    expect(contractsFile.source).toContain('getPresentation mismatch')
    expect(contractsFile.source).toContain('getTemplate mismatch')
    expect(contractsFile.source).not.toContain('validate strategy')
    expect(contractsFile.source).toContain('command adapter')
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
