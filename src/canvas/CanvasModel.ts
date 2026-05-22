import type {
  Bounds,
  Point,
  ResizeHandle,
  Viewport,
} from './CanvasPrimitives'

export {
  clamp,
  DRAG_THRESHOLD,
  fitBoundsIntoViewport,
  handlePoint,
  INITIAL_VIEWPORT,
  MAX_SCALE,
  MIN_ITEM_SIZE,
  MIN_SCALE,
  normalizeBounds,
  pointDistance,
  RESIZE_HANDLES,
  resizeBounds,
  scaleItemBounds,
  unique,
  zoomViewport,
} from './CanvasPrimitives'
export type {
  Bounds,
  CanvasInteractionKind,
  Point,
  ResizeHandle,
  Tool,
  Viewport,
} from './CanvasPrimitives'

export type RectItem = Bounds & {
  id: string
  type: 'rect'
  fill: string
  stroke: string
  text?: string
}

export type TextItem = Bounds & {
  id: string
  type: 'text'
  text: string
}

export type GroupItem = Bounds & {
  id: string
  type: 'group'
  children: CanvasItem[]
}

export type CanvasItem = RectItem | TextItem | GroupItem

export type Interaction =
  | { kind: 'none' }
  | {
      kind: 'pan'
      pointerId: number
      startScreen: Point
      origin: Viewport
    }
  | {
      kind: 'move'
      pointerId: number
      startScreen: Point
      startWorld: Point
      ids: string[]
      startItems: CanvasItem[]
      historyItems: CanvasItem[]
      edit?: EditingText
      moved: boolean
    }
  | {
      kind: 'marquee'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      additive: boolean
      baseSelection: string[]
      moved: boolean
    }
  | {
      kind: 'create-rect'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      moved: boolean
    }
  | {
      kind: 'resize'
      pointerId: number
      handle: ResizeHandle
      startScreen: Point
      startWorld: Point
      ids: string[]
      bounds: Bounds
      startItems: CanvasItem[]
      historyItems: CanvasItem[]
      moved: boolean
    }

export type EditingText = {
  id: string
  value: string
}

export const INITIAL_ITEMS: CanvasItem[] = [
  {
    id: 'rect-1',
    type: 'rect',
    x: 96,
    y: 96,
    w: 210,
    h: 126,
    fill: '#dbeafe',
    stroke: '#3b82f6',
  },
  {
    id: 'rect-2',
    type: 'rect',
    x: 354,
    y: 168,
    w: 168,
    h: 112,
    fill: '#dcfce7',
    stroke: '#16a34a',
  },
  {
    id: 'text-1',
    type: 'text',
    x: 122,
    y: 266,
    w: 190,
    h: 42,
    text: 'Text',
  },
]
