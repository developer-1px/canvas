import type { Bounds } from '../../core'

export const CANVAS_SECTION_COMPONENT_KIND = 'section'

export const CANVAS_SECTION_DEFAULT_SIZE: Pick<Bounds, 'h' | 'w'> =
  Object.freeze({
    h: 340,
    w: 340,
  })
