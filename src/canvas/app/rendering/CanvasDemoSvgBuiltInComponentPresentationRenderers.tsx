import type { CanvasAppComponentPresentationRenderers } from './CanvasAppRenderingContracts'
import {
  CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION,
} from './CanvasDemoSvgComponentRenderFallback'
import {
  CanvasDemoSvgChecklistComponent,
  CanvasDemoSvgKanbanComponent,
  CanvasDemoSvgTableComponent,
} from './CanvasDemoSvgStructuredComponentRenderer'
import {
  CanvasDemoSvgCardComponent,
  CanvasDemoSvgImageComponent,
  CanvasDemoSvgLabelComponent,
  CanvasDemoSvgSectionComponent,
  CanvasDemoSvgStickyComponent,
} from './CanvasDemoSvgTextComponentRenderer'
import {
  CanvasDemoSvgConnectorComponent,
  CanvasDemoSvgVoteComponent,
} from './CanvasDemoSvgShapeComponentRenderer'

export const DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS: CanvasAppComponentPresentationRenderers = {
  [CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION]:
    CanvasDemoSvgCardComponent,
  'checklist-list': CanvasDemoSvgChecklistComponent,
  'image-frame': CanvasDemoSvgImageComponent,
  'inline-label': CanvasDemoSvgLabelComponent,
  'kanban-stack': CanvasDemoSvgKanbanComponent,
  'line-connector': CanvasDemoSvgConnectorComponent,
  'matrix-table': CanvasDemoSvgTableComponent,
  'note-card': CanvasDemoSvgStickyComponent,
  'section-frame': CanvasDemoSvgSectionComponent,
  'vote-badge': CanvasDemoSvgVoteComponent,
}
