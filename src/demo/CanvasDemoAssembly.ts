import { createCanvasAppAssembly } from '../canvas/app/workflow'
import { RISK_CUSTOM_ITEM_MODULE } from './custom-items'

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly({
  customItemModules: [RISK_CUSTOM_ITEM_MODULE],
})
