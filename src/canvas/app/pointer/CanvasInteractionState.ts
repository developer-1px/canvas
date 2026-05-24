import type {
  Bounds,
  CanvasCustomToolId,
  CanvasArrowEndpoint,
  CanvasItem,
  EditingText,
  Point,
  ResizeHandle,
  Viewport
} from '../../entities'
import type { CanvasDrawingStrokeStyle } from '../../host'

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
      bounds: Bounds | null
      historySelection: string[]
      startItems: CanvasItem[]
      currentItems: CanvasItem[]
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
      kind: 'create-section'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
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
      kind: 'draw-marker'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      points: Point[]
      style: CanvasDrawingStrokeStyle
      moved: boolean
    }
  | {
      kind: 'draw-highlight'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      points: Point[]
      style: CanvasDrawingStrokeStyle
      moved: boolean
    }
  | {
      kind: 'erase'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      erasedIds: string[]
      points: Point[]
      moved: boolean
    }
  | {
      kind: 'laser'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      points: Point[]
      moved: boolean
    }
  | {
      kind: 'create-arrow'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      endAttachedTo?: string
      startAttachedTo?: string
      moved: boolean
    }
  | {
      kind: 'create-custom'
      pointerId: number
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      tool: CanvasCustomToolId
      moved: boolean
    }
  | {
      kind: 'arrow-endpoint'
      pointerId: number
      arrowId: string
      endpoint: CanvasArrowEndpoint
      startScreen: Point
      startWorld: Point
      currentWorld: Point
      startItems: CanvasItem[]
      currentItems: CanvasItem[]
      historyItems: CanvasItem[]
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
      currentItems: CanvasItem[]
      historyItems: CanvasItem[]
      moved: boolean
    }
