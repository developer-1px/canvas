import {
  CANVAS_COMPONENT_TEMPLATES,
  type CanvasComponentTemplate,
} from './CanvasComponentCatalog'
import { createCanvasComponentItem } from './CanvasComponentFactory'

export type CanvasComponentLibrary = {
  templates: readonly CanvasComponentTemplate[]
  createItem: typeof createCanvasComponentItem
}

export const CANVAS_COMPONENT_LIBRARY: CanvasComponentLibrary = {
  templates: CANVAS_COMPONENT_TEMPLATES,
  createItem: createCanvasComponentItem,
}

export type { CanvasComponentTemplate }
