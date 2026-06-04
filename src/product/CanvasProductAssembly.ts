import {
  CANVAS_APP_EDITOR_CAPABILITIES,
  createCanvasAppAssembly,
  type CanvasAppAssemblyInput,
} from '../canvas'
import {
  PRODUCT_CANVAS_INITIAL_SELECTION,
  PRODUCT_CANVAS_SEED_ITEMS,
} from './CanvasProductSeedItems'

const PRODUCT_CANVAS_AFFORDANCE_CONFIG = {
  gestures: {
    createCustom: false,
    emoteBurst: false,
    laserPointer: false,
  },
  overlays: {
    commandPalette: false,
    componentPalette: false,
    cursorChat: false,
    drawingControls: true,
    emoteBursts: false,
    emoteControls: false,
    findReplace: false,
    imageControls: false,
    inspector: false,
    laserTrail: false,
    presentationMode: false,
    sessionTimer: false,
    spotlight: false,
    stampControls: true,
    status: true,
    stickyQuickCreate: true,
    toolbar: true,
    votingSession: false,
    zoomControls: true,
  },
  shortcuts: {
    commandPalette: false,
    cursorChat: false,
    findReplace: false,
    laserTool: false,
    quickCreateSticky: true,
  },
  tools: {
    laser: false,
  },
} satisfies CanvasAppAssemblyInput['affordanceConfig']

export const PRODUCT_CANVAS_APP_ASSEMBLY_INPUT = {
  affordanceConfig: PRODUCT_CANVAS_AFFORDANCE_CONFIG,
  capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
  initialItems: PRODUCT_CANVAS_SEED_ITEMS,
  initialSelection: PRODUCT_CANVAS_INITIAL_SELECTION,
} satisfies CanvasAppAssemblyInput

export const PRODUCT_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly(
  PRODUCT_CANVAS_APP_ASSEMBLY_INPUT,
)
