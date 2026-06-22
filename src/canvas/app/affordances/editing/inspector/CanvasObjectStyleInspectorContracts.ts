export type CanvasObjectStyleColorChannel = 'fill' | 'stroke'
export type CanvasObjectStyleNumberChannel =
  | 'fontSize'
  | 'opacity'
  | 'strokeWidth'
export type CanvasObjectStyleSegmentedChannel =
  | 'arrowhead'
  | 'arrowRouting'
  | 'textAlign'
export type CanvasObjectTextAlign = 'center' | 'left' | 'right'

export type CanvasObjectStyleSwatch = {
  color: string
  selected: boolean
}

export type CanvasObjectStyleSegment = {
  label: string
  selected: boolean
  value: string
}

export type CanvasObjectStyleSwatchControl = {
  disabled: boolean
  id: CanvasObjectStyleColorChannel
  kind: 'swatches'
  label: string
  mixed: boolean
  swatches: CanvasObjectStyleSwatch[]
  onSelect: (color: string) => void
}

export type CanvasObjectStyleNumberControl = {
  disabled: boolean
  id: CanvasObjectStyleNumberChannel
  kind: 'number'
  label: string
  max: number
  min: number
  mixed: boolean
  step: number
  value: number | null
  onChange: (value: number) => void
}

export type CanvasObjectStyleSegmentedControl = {
  disabled: boolean
  id: CanvasObjectStyleSegmentedChannel
  kind: 'segmented'
  label: string
  mixed: boolean
  segments: CanvasObjectStyleSegment[]
  value: string | null
  onSelect: (value: string) => void
}

export type CanvasObjectStyleControl =
  | CanvasObjectStyleNumberControl
  | CanvasObjectStyleSegmentedControl
  | CanvasObjectStyleSwatchControl
