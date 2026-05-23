import type { CanvasBuiltinTool } from '../../core'
import type { CANVAS_AFFORDANCE_CONFIG_DEFAULTS } from './CanvasAffordanceCatalog'

type CanvasAffordanceConfigDefaults =
  typeof CANVAS_AFFORDANCE_CONFIG_DEFAULTS

export type CanvasCommandId = keyof CanvasAffordanceConfigDefaults['commands']
export type CanvasGestureId = keyof CanvasAffordanceConfigDefaults['gestures']
export type CanvasOverlayId = keyof CanvasAffordanceConfigDefaults['overlays']
export type CanvasShortcutId =
  keyof CanvasAffordanceConfigDefaults['shortcuts']

export type CanvasAffordanceConfig = {
  commands: Record<CanvasCommandId, boolean>
  gestures: Record<CanvasGestureId, boolean>
  overlays: Record<CanvasOverlayId, boolean>
  shortcuts: Record<CanvasShortcutId, boolean>
  tools: Record<CanvasBuiltinTool, boolean>
}

export type CanvasAffordanceConfigInput = {
  commands?: Partial<Record<CanvasCommandId, boolean>>
  gestures?: Partial<Record<CanvasGestureId, boolean>>
  overlays?: Partial<Record<CanvasOverlayId, boolean>>
  shortcuts?: Partial<Record<CanvasShortcutId, boolean>>
  tools?: Partial<Record<CanvasBuiltinTool, boolean>>
}
