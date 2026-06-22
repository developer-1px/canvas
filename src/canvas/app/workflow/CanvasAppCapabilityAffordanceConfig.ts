import type { CanvasAffordanceConfigInput } from '../../engine'
import {
  mergeCanvasAppAffordanceConfigInput,
} from '../feature-packs'
import type {
  CanvasAppCapabilityInput,
} from './CanvasAppCapabilityContracts'
import {
  createCanvasAppCapabilities,
} from './CanvasAppCapabilitySnapshots'

export function withCanvasAppCapabilities(
  config: CanvasAffordanceConfigInput = {},
  capabilities: CanvasAppCapabilityInput = {},
): CanvasAffordanceConfigInput {
  return mergeCanvasAppAffordanceConfigInput(
    config,
    createCanvasAppCapabilityAffordanceConfigInput(capabilities),
  )
}

export function createCanvasAppCapabilityAffordanceConfigInput(
  input: CanvasAppCapabilityInput = {},
): CanvasAffordanceConfigInput {
  const capabilities = createCanvasAppCapabilities(input)
  const configs: CanvasAffordanceConfigInput[] = []

  if (!capabilities.view) {
    configs.push(CANVAS_APP_NO_VIEW_AFFORDANCE_CONFIG)
  }

  if (!capabilities.editDocument) {
    configs.push(CANVAS_APP_NO_EDIT_AFFORDANCE_CONFIG)
  }

  if (!capabilities.comment) {
    configs.push(CANVAS_APP_NO_COMMENT_AFFORDANCE_CONFIG)
  }

  if (!capabilities.editDocument && !capabilities.comment) {
    configs.push(CANVAS_APP_NO_TEXT_EDIT_AFFORDANCE_CONFIG)
  }

  if (!capabilities.export) {
    configs.push(CANVAS_APP_NO_EXPORT_AFFORDANCE_CONFIG)
  }

  if (!capabilities.present && !capabilities.follow) {
    configs.push(CANVAS_APP_NO_PRESENT_AFFORDANCE_CONFIG)
  }

  return mergeCanvasAppAffordanceConfigInput(...configs)
}

const CANVAS_APP_NO_EDIT_AFFORDANCE_CONFIG = deepFreezeCanvasAppAffordanceConfig({
  commands: {
    alignBottom: false,
    alignCenter: false,
    alignLeft: false,
    alignMiddle: false,
    alignRight: false,
    alignTop: false,
    bringForward: false,
    bringToFront: false,
    cut: false,
    delete: false,
    duplicate: false,
    distributeHorizontal: false,
    distributeVertical: false,
    group: false,
    lockSelection: false,
    nudge: false,
    paste: false,
    redo: false,
    sendBackward: false,
    sendToBack: false,
    undo: false,
    ungroup: false,
    unlockAll: false,
  },
  gestures: {
    altDragDuplicate: false,
    createArrow: false,
    createCustom: false,
    createSection: false,
    createShape: false,
    createSticky: false,
    createText: false,
    drawHighlight: false,
    drawMarker: false,
    drawPath: false,
    eraseDrawing: false,
    move: false,
    resize: false,
    snapToAlignment: false,
    snapToGrid: false,
    snapToSpacing: false,
  },
  overlays: {
    alignmentGuides: false,
    componentPalette: false,
    draftArrow: false,
    draftRect: false,
    draftStroke: false,
    drawingControls: false,
    findReplace: false,
    objectStyleControls: false,
    resizeHandles: false,
    spacingGuides: false,
    stickyQuickCreate: false,
  },
  shortcuts: {
    arrowTool: false,
    bringForward: false,
    bringToFront: false,
    cut: false,
    delete: false,
    duplicate: false,
    ellipseTool: false,
    eraserTool: false,
    findReplace: false,
    group: false,
    highlighterTool: false,
    lockSelection: false,
    markerTool: false,
    nudge: false,
    paste: false,
    penTool: false,
    quickCreateSticky: false,
    rectTool: false,
    redo: false,
    sectionTool: false,
    sendBackward: false,
    sendToBack: false,
    stickyTool: false,
    textTool: false,
    undo: false,
    ungroup: false,
    unlockAll: false,
  },
  tools: {
    arrow: false,
    diamond: false,
    ellipse: false,
    eraser: false,
    highlight: false,
    marker: false,
    pen: false,
    rect: false,
    section: false,
    sticky: false,
    text: false,
  },
})

const CANVAS_APP_NO_COMMENT_AFFORDANCE_CONFIG =
  deepFreezeCanvasAppAffordanceConfig({
    gestures: {
      createComment: false,
    },
    overlays: {
      stampControls: false,
      votingSession: false,
    },
    shortcuts: {
      commentTool: false,
    },
    tools: {
      comment: false,
    },
  })

const CANVAS_APP_NO_TEXT_EDIT_AFFORDANCE_CONFIG =
  deepFreezeCanvasAppAffordanceConfig({
    gestures: {
      textEdit: false,
    },
    overlays: {
      inspector: false,
      textEditor: false,
    },
    shortcuts: {
      editSelection: false,
    },
  })

const CANVAS_APP_NO_EXPORT_AFFORDANCE_CONFIG =
  deepFreezeCanvasAppAffordanceConfig({
    commands: {
      copy: false,
    },
    overlays: {
      imageControls: false,
    },
    shortcuts: {
      copy: false,
    },
  })

const CANVAS_APP_NO_PRESENT_AFFORDANCE_CONFIG =
  deepFreezeCanvasAppAffordanceConfig({
    overlays: {
      presentationMode: false,
      spotlight: false,
    },
  })

const CANVAS_APP_NO_VIEW_AFFORDANCE_CONFIG = deepFreezeCanvasAppAffordanceConfig({
  commands: {
    fitView: false,
    selectAll: false,
    zoomIn: false,
    zoomOut: false,
    zoomReset: false,
  },
  gestures: {
    emoteBurst: false,
    laserPointer: false,
    marquee: false,
    pan: false,
    temporaryPan: false,
    textEdit: false,
    wheelZoom: false,
  },
  overlays: {
    commandPalette: false,
    cursorChat: false,
    emoteBursts: false,
    emoteControls: false,
    grid: false,
    inspector: false,
    itemOutline: false,
    laserTrail: false,
    marquee: false,
    minimap: false,
    presence: false,
    selectionBounds: false,
    sessionTimer: false,
    shortcutHelp: false,
    status: false,
    textEditor: false,
    toolbar: false,
    zoomControls: false,
  },
  shortcuts: {
    commandPalette: false,
    cursorChat: false,
    editSelection: false,
    escape: false,
    fitAll: false,
    fitSelection: false,
    laserTool: false,
    panTool: false,
    selectAll: false,
    selectTool: false,
    shortcutHelp: false,
    temporaryPan: false,
    zoomIn: false,
    zoomOut: false,
    zoomReset: false,
  },
  tools: {
    laser: false,
    pan: false,
    select: false,
  },
})

function deepFreezeCanvasAppAffordanceConfig<
  TConfig extends CanvasAffordanceConfigInput,
>(config: TConfig): TConfig {
  for (const values of Object.values(config)) {
    Object.freeze(values)
  }

  return Object.freeze(config)
}
