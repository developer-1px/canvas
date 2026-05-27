import {
  createCanvasAppAssembly,
  type CanvasAppAssemblyInput,
  type CanvasWorkspaceStorageProvider,
} from '../canvas'
import { DEMO_CANVAS_SEED_ITEMS } from './CanvasDemoSeedItems'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

const DEMO_CANVAS_STORAGE_PROVIDER: CanvasWorkspaceStorageProvider = () => null

export const DEMO_CANVAS_APP_ASSEMBLY_INPUT = {
  affordanceConfig: {
    overlays: {
      componentPalette: false,
      emoteControls: false,
      imageControls: false,
      presence: false,
      sessionTimer: false,
      spotlight: false,
      status: false,
      votingSession: false,
    },
    tools: {
      comment: false,
      diamond: false,
      ellipse: false,
      eraser: false,
      highlight: false,
      laser: false,
      marker: false,
    },
  },
  customItemModules: DEMO_CUSTOM_ITEM_MODULES,
  initialItems: DEMO_CANVAS_SEED_ITEMS,
  initialSelection: [],
  workspaceStorageProvider: DEMO_CANVAS_STORAGE_PROVIDER,
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly(
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
)
