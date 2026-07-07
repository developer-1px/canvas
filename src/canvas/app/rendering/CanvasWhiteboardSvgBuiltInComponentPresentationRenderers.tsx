import type { CanvasAppComponentPresentationRenderers } from './CanvasAppRenderingContracts'
import {
  CANVAS_WHITEBOARD_SVG_COMPONENT_FALLBACK_PRESENTATION,
} from './CanvasWhiteboardSvgComponentRenderFallback'
import {
  CanvasWhiteboardSvgChecklistComponent,
  CanvasWhiteboardSvgKanbanComponent,
  CanvasWhiteboardSvgTableComponent,
} from './CanvasWhiteboardSvgStructuredComponentRenderer'
import {
  CanvasWhiteboardSvgCommandCenterComponent,
  CanvasWhiteboardSvgGateStripComponent,
  CanvasWhiteboardSvgReviewBoardComponent,
  CanvasWhiteboardSvgTraceMapComponent,
} from './CanvasWhiteboardSvgCommandCenterComponentRenderer'
import {
  CanvasWhiteboardSvgEvidenceComponent,
  CanvasWhiteboardSvgQueueComponent,
  CanvasWhiteboardSvgScorecardComponent,
  CanvasWhiteboardSvgTimelineComponent,
} from './CanvasWhiteboardSvgReportComponentRenderer'
import {
  CanvasWhiteboardSvgCardComponent,
  CanvasWhiteboardSvgImageComponent,
  CanvasWhiteboardSvgLabelComponent,
  CanvasWhiteboardSvgLinkPreviewComponent,
  CanvasWhiteboardSvgSectionComponent,
  CanvasWhiteboardSvgStickyComponent,
} from './CanvasWhiteboardSvgTextComponentRenderer'
import {
  CanvasWhiteboardSvgConnectorComponent,
  CanvasWhiteboardSvgVoteComponent,
} from './CanvasWhiteboardSvgShapeComponentRenderer'

export const DEFAULT_CANVAS_WHITEBOARD_SVG_COMPONENT_PRESENTATION_RENDERERS: CanvasAppComponentPresentationRenderers = {
  [CANVAS_WHITEBOARD_SVG_COMPONENT_FALLBACK_PRESENTATION]:
    CanvasWhiteboardSvgCardComponent,
  'checklist-list': CanvasWhiteboardSvgChecklistComponent,
  'command-center': CanvasWhiteboardSvgCommandCenterComponent,
  'evidence-ledger': CanvasWhiteboardSvgEvidenceComponent,
  'evidence-map': CanvasWhiteboardSvgTraceMapComponent,
  'gate-strip': CanvasWhiteboardSvgGateStripComponent,
  'image-frame': CanvasWhiteboardSvgImageComponent,
  'inline-label': CanvasWhiteboardSvgLabelComponent,
  'kanban-stack': CanvasWhiteboardSvgKanbanComponent,
  'link-preview-card': CanvasWhiteboardSvgLinkPreviewComponent,
  'line-connector': CanvasWhiteboardSvgConnectorComponent,
  'matrix-table': CanvasWhiteboardSvgTableComponent,
  'metric-scorecard': CanvasWhiteboardSvgScorecardComponent,
  'note-card': CanvasWhiteboardSvgStickyComponent,
  'review-queue': CanvasWhiteboardSvgQueueComponent,
  'review-board': CanvasWhiteboardSvgReviewBoardComponent,
  'workflow-timeline': CanvasWhiteboardSvgTimelineComponent,
  'section-frame': CanvasWhiteboardSvgSectionComponent,
  'vote-badge': CanvasWhiteboardSvgVoteComponent,
}
