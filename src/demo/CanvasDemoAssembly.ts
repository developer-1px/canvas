import {
  createCanvasAppAssembly,
  type CanvasAppAssemblyInput,
  type CanvasPresenceOverlay,
} from '../canvas'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

export const DEMO_CANVAS_APP_ASSEMBLY_INPUT = {
  customItemModules: DEMO_CUSTOM_ITEM_MODULES,
  initialSelection: [],
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly(
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
)

export const DEMO_CANVAS_PRESENCE = Object.freeze([
  Object.freeze({
    color: '#2563eb',
    id: 'mia',
    label: 'Mia',
    point: { x: 456, y: 252 },
    selectionBounds: { h: 148, w: 188, x: 92, y: 88 },
  }),
  Object.freeze({
    color: '#dc2626',
    id: 'owen',
    label: 'Owen',
    point: { x: 920, y: 228 },
    selectionBounds: { h: 190, w: 214, x: 760, y: 292 },
  }),
] satisfies readonly CanvasPresenceOverlay[])
