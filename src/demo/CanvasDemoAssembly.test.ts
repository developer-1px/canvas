import { describe, expect, it } from 'vitest'
import { createCanvasAppAssembly } from '../canvas/app/authoring'
import {
  DEMO_CANVAS_AI_LABS_ASSEMBLY_INPUT,
  DEMO_CANVAS_AI_LABS_FEATURE_PACK_MANIFEST,
  DEMO_CANVAS_AI_LABS_SUMMARIZE_SELECTION_COMMAND,
  DEMO_CANVAS_APP_ASSEMBLY,
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
  DEMO_CANVAS_COMMENT_ONLY_ASSEMBLY_INPUT,
  DEMO_CANVAS_READ_ONLY_ASSEMBLY_INPUT,
} from './CanvasDemoAssembly'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

const modules = import.meta.glob('./**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('CanvasDemoAssembly', () => {
  it('keeps the top-level demo assembly focused on module composition', () => {
    expect(modules['./CanvasDemoAssembly.ts']).not.toMatch(
      /RISK|DECISION|defineCanvasAppCustomItemModule|createCanvasDemoSvgCustomItemRenderers|risk-node|decision-node|demo-risk-text|demo-decision|kind:\s*['"](risk|decision)['"]/,
    )
  })

  it('keeps the default demo free of product custom modules', () => {
    // The widget-seam example is allowed; the abandoned product modules are not.
    expect(DEMO_CUSTOM_ITEM_MODULES.map((module) => module.id)).toEqual([
      'metric-widget',
      'todo-widget',
    ])
    expect(modules['./custom-items/index.ts']).not.toMatch('import.meta.glob')
    expect(modules['./custom-items/index.ts']).not.toMatch(
      /HTML_SPECIMEN_CUSTOM_ITEM_MODULE|RiskCustomItemModule|DecisionMapCustomItemModule|risk-node|decision-node|kind:\s*['"](html-specimen|risk|decision)['"]/,
    )
  })

  it('keeps widget play mode behind the widget interaction seam', () => {
    expect(modules['./CanvasDevToolsDemoApp.tsx']).not.toMatch(
      /TodoWidget|TODO_WIDGET_KIND|toggleTodoWidgetItemDone/,
    )
    expect(modules['./CanvasDevToolsSelectionToolbar.tsx']).not.toMatch(
      /TodoWidget|TODO_WIDGET_KIND/,
    )
    expect(modules['./CanvasDevToolsWidgetPlayOverlay.tsx']).not.toMatch(
      /TodoWidget|TODO_WIDGET_KIND|TodoWidgetData|toggleTodoWidgetItemDone/,
    )
  })

  it('assembles demo custom item modules through the app seam', () => {
    expect(DEMO_CANVAS_APP_ASSEMBLY_INPUT.customItemModules).toBe(
      DEMO_CUSTOM_ITEM_MODULES,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.initialSelection).toEqual([
      'engine-shape',
    ])
    expect(DEMO_CANVAS_APP_ASSEMBLY.initialItems.map((item) => item.type))
      .toEqual([
        'component',
        'shape',
        'component',
        'component',
        'component',
        'shape',
        'shape',
        'text',
        'arrow',
        'arrow',
        'marker',
        'highlight',
        'image',
        'stamp',
        'stamp',
        'custom',
        'custom',
      ])
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.customCreationTools.map((tool) => tool.id),
    ).toEqual([])
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.customCommands.map((command) => command.id),
    ).toEqual([])
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.textPasteImporters.map((importer) => importer.id),
    ).toEqual([])
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.toolbar).toBe(
      false,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.inspector).toBe(
      true,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.move).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.resize).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.textEdit).toBe(
      true,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.pan).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createArrow)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createShape)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createSticky)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createComment)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.createSection)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.drawHighlight)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.drawPath)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.eraseDrawing)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.wheelZoom).toBe(
      true,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.snapToAlignment)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.snapToGrid)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.gestures.snapToSpacing)
      .toBe(true)
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.selectionBounds,
    ).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.alignmentGuides)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.spacingGuides)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.grid).toBe(false)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.itemOutline)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.pen).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.penTool)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.objectStyleControls)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.marquee).toBe(
      true,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.presence).toBe(
      false,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.stickyQuickCreate)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.emoteControls)
      .toBe(false)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.stampControls)
      .toBe(false)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.votingSession)
      .toBe(false)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.presentationMode)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.draftArrow)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.draftRect)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.zoomControls)
      .toBe(false)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays.minimap).toBe(
      true,
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.quickCreateSticky)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.lockSelection)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.bringForward)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.bringToFront)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.sendBackward)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.sendToBack)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.shortcuts.unlockAll)
      .toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.arrow).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.rect).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.ellipse).toBe(false)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.diamond).toBe(false)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.sticky).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.comment).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.section).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.highlight).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.tools.eraser).toBe(true)
    expect(DEMO_CANVAS_APP_ASSEMBLY.presenceProvider({
      selection: [],
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual([])
  })

  it('exposes demo capability fixtures without explanatory UI decoration', () => {
    const readOnlyAssembly = createCanvasAppAssembly(
      DEMO_CANVAS_READ_ONLY_ASSEMBLY_INPUT,
    )
    const commentOnlyAssembly = createCanvasAppAssembly(
      DEMO_CANVAS_COMMENT_ONLY_ASSEMBLY_INPUT,
    )

    expect(DEMO_CANVAS_APP_ASSEMBLY.capabilities).toEqual({
      comment: true,
      editDocument: true,
      export: true,
      follow: true,
      present: true,
      view: true,
    })
    expect(readOnlyAssembly.capabilities).toEqual({
      comment: false,
      editDocument: false,
      export: false,
      follow: false,
      present: false,
      view: true,
    })
    expect(readOnlyAssembly.affordanceConfig.commands.copy).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.commands.delete).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.gestures.createComment).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.gestures.createShape).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.gestures.move).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.gestures.pan).toBe(true)
    expect(readOnlyAssembly.affordanceConfig.gestures.textEdit).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.overlays.textEditor).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.overlays.minimap).toBe(true)
    expect(readOnlyAssembly.affordanceConfig.shortcuts.editSelection).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.tools.comment).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.tools.rect).toBe(false)
    expect(readOnlyAssembly.affordanceConfig.tools.select).toBe(true)

    expect(commentOnlyAssembly.capabilities).toEqual({
      comment: true,
      editDocument: false,
      export: false,
      follow: false,
      present: false,
      view: true,
    })
    expect(commentOnlyAssembly.affordanceConfig.commands.copy).toBe(false)
    expect(commentOnlyAssembly.affordanceConfig.commands.delete).toBe(false)
    expect(commentOnlyAssembly.affordanceConfig.gestures.createComment).toBe(
      true,
    )
    expect(commentOnlyAssembly.affordanceConfig.gestures.createShape).toBe(false)
    expect(commentOnlyAssembly.affordanceConfig.gestures.move).toBe(false)
    expect(commentOnlyAssembly.affordanceConfig.gestures.pan).toBe(true)
    expect(commentOnlyAssembly.affordanceConfig.gestures.textEdit).toBe(true)
    expect(commentOnlyAssembly.affordanceConfig.tools.comment).toBe(true)
    expect(commentOnlyAssembly.affordanceConfig.tools.rect).toBe(false)
    expect(commentOnlyAssembly.affordanceConfig.tools.select).toBe(true)
  })

  it('keeps the AI labs command in a separate demo fixture', () => {
    const labsAssembly = createCanvasAppAssembly(
      DEMO_CANVAS_AI_LABS_ASSEMBLY_INPUT,
    )

    expect(DEMO_CANVAS_APP_ASSEMBLY.customCommands).toEqual([])
    expect(labsAssembly.installedFeaturePackIds).toContain(
      DEMO_CANVAS_AI_LABS_FEATURE_PACK_MANIFEST.id,
    )
    expect(labsAssembly.customCommands.map((command) => command.id)).toEqual([
      DEMO_CANVAS_AI_LABS_SUMMARIZE_SELECTION_COMMAND.id,
    ])
  })
})
