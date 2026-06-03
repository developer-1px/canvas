import {
  CANVAS_APP_EDITOR_CAPABILITIES,
  createCanvasAppAssembly,
  type CanvasAppAssemblyInput,
} from '../canvas'
import {
  DEMO_CANVAS_INITIAL_SELECTION,
  DEMO_CANVAS_SEED_ITEMS,
} from '../demo/CanvasDemoSeedItems'
import { DEMO_CUSTOM_ITEM_MODULES } from '../demo/custom-items'

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
    toolbar: true,
    votingSession: false,
    zoomControls: true,
  },
  shortcuts: {
    commandPalette: false,
    cursorChat: false,
    findReplace: false,
    laserTool: false,
  },
  tools: {
    laser: false,
  },
} satisfies CanvasAppAssemblyInput['affordanceConfig']

export const PRODUCT_CANVAS_APP_ASSEMBLY_INPUT = {
  affordanceConfig: PRODUCT_CANVAS_AFFORDANCE_CONFIG,
  capabilities: CANVAS_APP_EDITOR_CAPABILITIES,
  customItemModules: DEMO_CUSTOM_ITEM_MODULES,
  initialItems: DEMO_CANVAS_SEED_ITEMS,
  initialSelection: DEMO_CANVAS_INITIAL_SELECTION,
} satisfies CanvasAppAssemblyInput

export const PRODUCT_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly(
  PRODUCT_CANVAS_APP_ASSEMBLY_INPUT,
)
