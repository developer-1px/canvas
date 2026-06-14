import {
  CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
  CANVAS_APP_EDITOR_CAPABILITIES,
  CANVAS_APP_READ_ONLY_CAPABILITIES,
  createCanvasAppAiLabsDemoSummaryProvider,
  createCanvasAppAiLabsSummarizeSelectionCommand,
  createCanvasAppAssembly,
  type CanvasAppAssemblyInput,
  type CanvasWorkspaceStorage,
  type CanvasWorkspaceStorageProvider,
} from '../canvas'
import {
  DEMO_CANVAS_INITIAL_SELECTION,
  DEMO_CANVAS_REFERENCE_BOUNDS,
  DEMO_CANVAS_SEED_ITEMS,
} from './CanvasDemoSeedItems'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

function createDemoCanvasInitialWorkspace() {
  return JSON.stringify({
    items: DEMO_CANVAS_SEED_ITEMS,
    selection: DEMO_CANVAS_INITIAL_SELECTION,
    version: 1,
    viewport: createDemoCanvasInitialViewport(),
  })
}

function createDemoCanvasInitialViewport() {
  const viewportWidth = typeof globalThis.innerWidth === 'number'
    ? globalThis.innerWidth
    : 1440
  const isMobile = viewportWidth < 700
  const canvasWidth = Math.max(isMobile ? viewportWidth : 640, viewportWidth)
  const scale = clampNumber(
    (canvasWidth - (isMobile ? 32 : 96)) / DEMO_CANVAS_REFERENCE_BOUNDS.w,
    isMobile
      ? { max: 0.62, min: 0.28 }
      : viewportWidth < 1360
        ? { max: 1.04, min: 0.62 }
        : { max: 1.18, min: 0.72 },
  )
  const demoScreenWidth = DEMO_CANVAS_REFERENCE_BOUNDS.w * scale
  const viewportX = Math.max(
    isMobile ? 16 : 48,
    (canvasWidth - demoScreenWidth) / 2 -
      DEMO_CANVAS_REFERENCE_BOUNDS.x * scale,
  )

  return {
    scale,
    x: Math.round(viewportX),
    y: isMobile ? 18 : 58,
  }
}

function clampNumber(
  value: number,
  bounds: {
    max: number
    min: number
  },
) {
  return Math.min(bounds.max, Math.max(bounds.min, value))
}

const DEMO_CANVAS_STORAGE: CanvasWorkspaceStorage = {
  getItem: createDemoCanvasInitialWorkspace,
  setItem: () => undefined,
}

const DEMO_CANVAS_STORAGE_PROVIDER: CanvasWorkspaceStorageProvider = () =>
  DEMO_CANVAS_STORAGE

const DEMO_CANVAS_FOCUSED_AFFORDANCE_CONFIG = {
  gestures: {
    altDragDuplicate: false,
    createArrow: true,
    createComment: true,
    createCustom: false,
    createSection: true,
    createShape: true,
    createSticky: true,
    createText: true,
    drawHighlight: true,
    drawMarker: true,
    drawPath: true,
    emoteBurst: false,
    eraseDrawing: true,
    laserPointer: false,
    marquee: true,
    move: true,
    pan: true,
    resize: true,
    snapToAlignment: true,
    snapToGrid: true,
    snapToSpacing: true,
    temporaryPan: true,
    textEdit: true,
    wheelZoom: true,
  },
  overlays: {
    alignmentGuides: true,
    commandPalette: false,
    componentPalette: false,
    cursorChat: false,
    draftArrow: true,
    draftRect: true,
    draftStroke: true,
    drawingControls: false,
    emoteBursts: false,
    emoteControls: false,
    findReplace: false,
    grid: false,
    imageControls: false,
    inspector: true,
    itemOutline: true,
    laserTrail: false,
    marquee: true,
    presence: false,
    presentationMode: true,
    resizeHandles: true,
    selectionBounds: true,
    sessionTimer: false,
    spacingGuides: true,
    spotlight: false,
    stampControls: false,
    stickyQuickCreate: true,
    status: false,
    textEditor: true,
    toolbar: false,
    votingSession: false,
    zoomControls: false,
  },
  shortcuts: {
    arrowTool: true,
    bringForward: true,
    bringToFront: true,
    commandPalette: false,
    commentTool: true,
    cursorChat: false,
    copy: true,
    cut: true,
    delete: true,
    duplicate: true,
    ellipseTool: false,
    eraserTool: true,
    escape: true,
    fitAll: true,
    fitSelection: true,
    findReplace: false,
    group: true,
    highlighterTool: true,
    laserTool: false,
    lockSelection: true,
    markerTool: true,
    nudge: true,
    penTool: true,
    quickCreateSticky: true,
    panTool: true,
    paste: true,
    rectTool: true,
    redo: true,
    sectionTool: true,
    sendBackward: true,
    sendToBack: true,
    stickyTool: true,
    selectAll: true,
    selectTool: true,
    textTool: true,
    temporaryPan: true,
    undo: true,
    ungroup: true,
    unlockAll: true,
    zoomIn: true,
    zoomOut: true,
    zoomReset: true,
  },
  tools: {
    arrow: true,
    comment: true,
    diamond: false,
    ellipse: false,
    eraser: true,
    highlight: true,
    marker: true,
    laser: false,
    pan: true,
    pen: true,
    rect: true,
    section: true,
    sticky: true,
    select: true,
    text: true,
  },
} satisfies CanvasAppAssemblyInput['affordanceConfig']

const DEMO_CANVAS_BASE_ASSEMBLY_INPUT = {
  affordanceConfig: DEMO_CANVAS_FOCUSED_AFFORDANCE_CONFIG,
  customItemModules: DEMO_CUSTOM_ITEM_MODULES,
  initialItems: DEMO_CANVAS_SEED_ITEMS,
  initialSelection: DEMO_CANVAS_INITIAL_SELECTION,
  workspaceStorageProvider: DEMO_CANVAS_STORAGE_PROVIDER,
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_APP_ASSEMBLY_INPUT = {
  ...DEMO_CANVAS_BASE_ASSEMBLY_INPUT,
  capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_AI_LABS_SUMMARIZE_SELECTION_COMMAND =
  createCanvasAppAiLabsSummarizeSelectionCommand({
    provider: createCanvasAppAiLabsDemoSummaryProvider(),
    requestReview: () => ({
      kind: 'cancel',
      reason: 'demo fixture requires a host review UI',
    }),
  })

export const DEMO_CANVAS_AI_LABS_ASSEMBLY_INPUT = {
  ...DEMO_CANVAS_APP_ASSEMBLY_INPUT,
  customCommands: [DEMO_CANVAS_AI_LABS_SUMMARIZE_SELECTION_COMMAND],
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_READ_ONLY_ASSEMBLY_INPUT = {
  ...DEMO_CANVAS_BASE_ASSEMBLY_INPUT,
  capabilities: CANVAS_APP_READ_ONLY_CAPABILITIES,
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_COMMENT_ONLY_ASSEMBLY_INPUT = {
  ...DEMO_CANVAS_BASE_ASSEMBLY_INPUT,
  capabilities: CANVAS_APP_COMMENT_ONLY_CAPABILITIES,
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly(
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
)
