import { describe, expect, it } from 'vitest'
import {
  DEMO_CANVAS_APP_ASSEMBLY,
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
} from './CanvasDemoAssembly'

const modules = import.meta.glob('./**/*.{ts,tsx,css}', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

describe('CanvasDemoAssembly', () => {
  it('keeps the top-level demo assembly focused on module composition', () => {
    expect(modules['./CanvasDemoAssembly.ts']).not.toMatch(
      /RISK|DECISION|defineCanvasAppCustomItemModule|createCanvasWhiteboardSvgCustomItemRenderers|risk-node|decision-node|demo-risk-text|demo-decision|kind:\s*['"](risk|decision)['"]/,
    )
  })

  it('keeps the demo free of custom modules and product fixtures', () => {
    expect(DEMO_CANVAS_APP_ASSEMBLY_INPUT).not.toHaveProperty(
      'customItemModules',
    )
    expect(DEMO_CANVAS_APP_ASSEMBLY.customCreationTools).toEqual([])
    expect(DEMO_CANVAS_APP_ASSEMBLY.customCommands).toEqual([])
    expect(DEMO_CANVAS_APP_ASSEMBLY.textPasteImporters).toEqual([])
    expect(
      DEMO_CANVAS_APP_ASSEMBLY.initialItems.every(
        (item) => item.type !== 'custom',
      ),
    ).toBe(true)
  })

  it('assembles the minimal engine demo seed and selection', () => {
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
      ])
  })

  it('keeps product UI surfaces out of the minimal engine demo', () => {
    const overlays = DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig.overlays

    expect(overlays.toolbar).toBe(false)
    expect(overlays.selectionToolbar).toBe(true)
    expect(overlays.inspector).toBe(false)
    expect(overlays.minimap).toBe(false)
    expect(overlays.presentationMode).toBe(false)
    expect(overlays.status).toBe(false)
    expect(overlays.componentPalette).toBe(false)
    expect(overlays.sessionTimer).toBe(false)
    expect(overlays.votingSession).toBe(false)
    expect(overlays.spotlight).toBe(false)
    expect(overlays.emoteControls).toBe(false)
    expect(overlays.stampControls).toBe(false)
    expect(overlays.presence).toBe(false)
    expect(overlays.zoomControls).toBe(false)
  })

  it('keeps the verified engine affordances enabled', () => {
    const { gestures, overlays, tools } =
      DEMO_CANVAS_APP_ASSEMBLY.affordanceConfig

    expect(gestures.move).toBe(true)
    expect(gestures.resize).toBe(true)
    expect(gestures.textEdit).toBe(true)
    expect(gestures.pan).toBe(true)
    expect(gestures.wheelZoom).toBe(true)
    expect(gestures.marquee).toBe(true)
    expect(gestures.createArrow).toBe(true)
    expect(gestures.createShape).toBe(true)
    expect(gestures.createSticky).toBe(true)
    expect(gestures.createComment).toBe(true)
    expect(gestures.createSection).toBe(true)
    expect(gestures.drawHighlight).toBe(true)
    expect(gestures.drawMarker).toBe(true)
    expect(gestures.drawPath).toBe(true)
    expect(gestures.eraseDrawing).toBe(true)
    expect(gestures.snapToAlignment).toBe(true)
    expect(gestures.snapToGrid).toBe(true)
    expect(gestures.snapToSpacing).toBe(true)
    expect(overlays.selectionBounds).toBe(true)
    expect(overlays.resizeHandles).toBe(true)
    expect(overlays.alignmentGuides).toBe(true)
    expect(overlays.spacingGuides).toBe(true)
    expect(overlays.itemOutline).toBe(true)
    expect(overlays.marquee).toBe(true)
    expect(overlays.textEditor).toBe(true)
    expect(overlays.stickyQuickCreate).toBe(true)
    expect(overlays.commandPalette).toBe(true)
    expect(overlays.shortcutHelp).toBe(true)
    expect(overlays.grid).toBe(false)
    expect(tools.select).toBe(true)
    expect(tools.pan).toBe(true)
    expect(tools.rect).toBe(true)
    expect(tools.text).toBe(true)
    expect(tools.sticky).toBe(true)
    expect(tools.comment).toBe(true)
    expect(tools.section).toBe(true)
    expect(tools.pen).toBe(true)
    expect(tools.marker).toBe(true)
    expect(tools.highlight).toBe(true)
    expect(tools.eraser).toBe(true)
    expect(tools.arrow).toBe(true)
    expect(tools.ellipse).toBe(false)
    expect(tools.diamond).toBe(false)
  })

  it('assembles editor capabilities and an empty presence provider', () => {
    expect(DEMO_CANVAS_APP_ASSEMBLY.capabilities).toEqual({
      comment: true,
      editDocument: true,
      export: true,
      follow: true,
      present: true,
      view: true,
    })
    expect(DEMO_CANVAS_APP_ASSEMBLY.presenceProvider({
      selection: [],
      viewport: { scale: 1, x: 0, y: 0 },
    })).toEqual([])
  })
})
