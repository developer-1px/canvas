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
  CanvasDemoSvgCommandCenterComponent,
  CanvasDemoSvgEvidenceComponent,
  CanvasDemoSvgGateStripComponent,
  CanvasDemoSvgQueueComponent,
  CanvasDemoSvgReviewBoardComponent,
  CanvasDemoSvgScorecardComponent,
  CanvasDemoSvgTimelineComponent,
  CanvasDemoSvgTraceMapComponent,
} from './CanvasDemoSvgReportComponentRenderer'
import {
  CanvasDemoSvgCardComponent,
  CanvasDemoSvgImageComponent,
  CanvasDemoSvgLabelComponent,
  CanvasDemoSvgLinkPreviewComponent,
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
  'command-center': CanvasDemoSvgCommandCenterComponent,
  'evidence-ledger': CanvasDemoSvgEvidenceComponent,
  'evidence-map': CanvasDemoSvgTraceMapComponent,
  'gate-strip': CanvasDemoSvgGateStripComponent,
  'image-frame': CanvasDemoSvgImageComponent,
  'inline-label': CanvasDemoSvgLabelComponent,
  'kanban-stack': CanvasDemoSvgKanbanComponent,
  'link-preview-card': CanvasDemoSvgLinkPreviewComponent,
  'line-connector': CanvasDemoSvgConnectorComponent,
  'matrix-table': CanvasDemoSvgTableComponent,
  'metric-scorecard': CanvasDemoSvgScorecardComponent,
  'note-card': CanvasDemoSvgStickyComponent,
  'review-queue': CanvasDemoSvgQueueComponent,
  'review-board': CanvasDemoSvgReviewBoardComponent,
  'workflow-timeline': CanvasDemoSvgTimelineComponent,
  'section-frame': CanvasDemoSvgSectionComponent,
  'vote-badge': CanvasDemoSvgVoteComponent,
}
