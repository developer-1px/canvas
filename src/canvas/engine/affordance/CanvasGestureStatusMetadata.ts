import type {
  CanvasInteractionKind,
} from '../../core'

export const CANVAS_GESTURE_STATUS_LABELS: Partial<
  Record<CanvasInteractionKind, string>
> = Object.freeze({
  'create-arrow': 'Drawing',
  'create-custom': 'Creating',
  'create-shape': 'Drawing',
  'draw-highlight': 'Highlighting',
  'draw-marker': 'Drawing',
  'draw-path': 'Drawing',
  erase: 'Erasing',
  laser: 'Pointing',
  'arrow-endpoint': 'Connecting',
  marquee: 'Selecting',
  move: 'Moving',
  pan: 'Panning',
  resize: 'Resizing',
})
