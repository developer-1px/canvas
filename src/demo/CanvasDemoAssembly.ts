import { createCanvasAppAssembly } from '../canvas/app/workflow'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly({
  customItemModules: DEMO_CUSTOM_ITEM_MODULES,
})
