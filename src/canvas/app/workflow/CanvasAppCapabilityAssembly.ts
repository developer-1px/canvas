import type { CanvasAffordanceConfigInput } from '../../engine'
import {
  mergeCanvasAppAffordanceConfigInput,
} from '../extensions/facilitation/CanvasAppFacilitationBundle'
import {
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'

export type CanvasAppCapabilitySnapshot = {
  comment: boolean
  editDocument: boolean
  export: boolean
  follow: boolean
  present: boolean
  view: boolean
}

export type CanvasAppCapabilityInput = Partial<CanvasAppCapabilitySnapshot>

export type CanvasAppCapabilityAssemblyInput = {
  capabilities?: CanvasAppCapabilityInput
}

export type CanvasAppCapabilityAssembly = {
  capabilities: CanvasAppCapabilitySnapshot
}

const CANVAS_APP_CAPABILITY_FIELDS = [
  'comment',
  'editDocument',
  'export',
  'follow',
  'present',
  'view',
] as const satisfies readonly (keyof CanvasAppCapabilitySnapshot)[]

export const CANVAS_APP_EDITOR_CAPABILITIES: CanvasAppCapabilitySnapshot =
  deepFreezeCanvasAppCapabilities({
    comment: true,
    editDocument: true,
    export: true,
    follow: true,
    present: true,
    view: true,
  })

export const CANVAS_APP_COMMENT_ONLY_CAPABILITIES: CanvasAppCapabilitySnapshot =
  deepFreezeCanvasAppCapabilities({
    comment: true,
    editDocument: false,
    export: false,
    follow: false,
    present: false,
    view: true,
  })

export const CANVAS_APP_READ_ONLY_CAPABILITIES: CanvasAppCapabilitySnapshot =
  deepFreezeCanvasAppCapabilities({
    comment: false,
    editDocument: false,
    export: false,
    follow: false,
    present: false,
    view: true,
  })

export function createCanvasAppCapabilityAssembly(
  input: CanvasAppCapabilityAssemblyInput,
  defaults: CanvasAppCapabilityAssembly,
): CanvasAppCapabilityAssembly {
  return {
    capabilities: createCanvasAppCapabilities(
      input.capabilities ?? defaults.capabilities,
    ),
  }
}

export function createCanvasAppCapabilities(
  input: CanvasAppCapabilityInput = {},
): CanvasAppCapabilitySnapshot {
  const capabilities: CanvasAppCapabilitySnapshot = {
    comment: input.comment ?? CANVAS_APP_EDITOR_CAPABILITIES.comment,
    editDocument:
      input.editDocument ?? CANVAS_APP_EDITOR_CAPABILITIES.editDocument,
    export: input.export ?? CANVAS_APP_EDITOR_CAPABILITIES.export,
    follow: input.follow ?? CANVAS_APP_EDITOR_CAPABILITIES.follow,
    present: input.present ?? CANVAS_APP_EDITOR_CAPABILITIES.present,
    view: input.view ?? CANVAS_APP_EDITOR_CAPABILITIES.view,
  }

  if (!capabilities.view) {
    return deepFreezeCanvasAppCapabilities({
      comment: false,
      editDocument: false,
      export: false,
      follow: false,
      present: false,
      view: false,
    })
  }

  return deepFreezeCanvasAppCapabilities(capabilities)
}

export function assertCanvasAppCapabilityAssembly({
  capabilities,
}: CanvasAppCapabilityAssembly) {
  assertCanvasAppDescriptorObject(capabilities, 'assembly capabilities')

  for (const field of CANVAS_APP_CAPABILITY_FIELDS) {
    if (typeof capabilities[field] !== 'boolean') {
      throw new Error(`Canvas app assembly capabilities requires ${field}`)
    }
  }
}

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
    presence: false,
    selectionBounds: false,
    sessionTimer: false,
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

function deepFreezeCanvasAppCapabilities(
  capabilities: CanvasAppCapabilitySnapshot,
): CanvasAppCapabilitySnapshot {
  return Object.freeze({ ...capabilities })
}
