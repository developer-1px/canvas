import {
  createCanvasAppAssembly,
  type CanvasAppAssemblyInput,
} from '../canvas'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

export const DEMO_CANVAS_APP_ASSEMBLY_INPUT = {
  customItemModules: DEMO_CUSTOM_ITEM_MODULES,
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly(
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
)
