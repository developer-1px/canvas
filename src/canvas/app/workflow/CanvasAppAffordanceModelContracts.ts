import type { CanvasAffordanceConfig } from '../../engine'

export type CanvasAppAffordanceConfigContext = {
  config: CanvasAffordanceConfig
}

export type CanvasAppAffordanceCommandModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceControlModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceInteractionModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceInspectorModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceImageModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceStampModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceKeyboardModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordancePointerModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceTextModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceViewportModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceModel = {
  command: CanvasAppAffordanceCommandModel
  control: CanvasAppAffordanceControlModel
  image: CanvasAppAffordanceImageModel
  interaction: CanvasAppAffordanceInteractionModel
  inspector: CanvasAppAffordanceInspectorModel
  keyboard: CanvasAppAffordanceKeyboardModel
  pointer: CanvasAppAffordancePointerModel
  stamp: CanvasAppAffordanceStampModel
  text: CanvasAppAffordanceTextModel
  viewport: CanvasAppAffordanceViewportModel
}
