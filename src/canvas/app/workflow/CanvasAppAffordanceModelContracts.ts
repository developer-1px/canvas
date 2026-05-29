import type { CanvasAffordanceConfig } from '../../engine'

export type CanvasAppAffordanceConfigContext = {
  config: CanvasAffordanceConfig
}

export type CanvasAppAffordanceCommandModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceComponentModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceControlModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceDrawingModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceFacilitationModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceInteractionModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceInspectorModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceImageModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceLinkPreviewModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceTableModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceStampModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceKeyboardModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordancePointerModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceTextModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceTextPasteModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceViewportModel =
  CanvasAppAffordanceConfigContext

export type CanvasAppAffordanceModel = {
  command: CanvasAppAffordanceCommandModel
  component: CanvasAppAffordanceComponentModel
  control: CanvasAppAffordanceControlModel
  drawing: CanvasAppAffordanceDrawingModel
  facilitation: CanvasAppAffordanceFacilitationModel
  image: CanvasAppAffordanceImageModel
  interaction: CanvasAppAffordanceInteractionModel
  inspector: CanvasAppAffordanceInspectorModel
  keyboard: CanvasAppAffordanceKeyboardModel
  linkPreview: CanvasAppAffordanceLinkPreviewModel
  pointer: CanvasAppAffordancePointerModel
  stamp: CanvasAppAffordanceStampModel
  table: CanvasAppAffordanceTableModel
  text: CanvasAppAffordanceTextModel
  textPaste: CanvasAppAffordanceTextPasteModel
  viewport: CanvasAppAffordanceViewportModel
}
