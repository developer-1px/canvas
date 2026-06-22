import type {
  CanvasJsonObject,
} from '../../../entities'

export type CanvasDomEditStyleChannel =
  | 'gap'
  | 'margin'
  | 'padding'
  | 'radius'

export type CanvasDomEditStyle = CanvasJsonObject & {
  gap: number
  margin: number
  padding: number
  radius: number
}

export type CanvasDomEditStyleLimit = {
  max: number
  min: number
  step: number
}

export type CanvasDomEditStyleOptions = {
  channels?: readonly CanvasDomEditStyleChannel[]
  defaultValue?: Partial<Record<CanvasDomEditStyleChannel, number>>
  limits?: Partial<Record<CanvasDomEditStyleChannel, Partial<CanvasDomEditStyleLimit>>>
}

export const CANVAS_DOM_EDIT_STYLE_CHANNELS:
  readonly CanvasDomEditStyleChannel[] = [
    'margin',
    'padding',
    'gap',
    'radius',
  ]

export const CANVAS_DOM_EDIT_STYLE_DEFAULTS: CanvasDomEditStyle = {
  gap: 0,
  margin: 0,
  padding: 0,
  radius: 0,
}

export const CANVAS_DOM_EDIT_STYLE_LIMITS: Record<
  CanvasDomEditStyleChannel,
  CanvasDomEditStyleLimit
> = {
  gap: { max: 80, min: 0, step: 1 },
  margin: { max: 80, min: 0, step: 1 },
  padding: { max: 80, min: 0, step: 1 },
  radius: { max: 80, min: 0, step: 1 },
}
