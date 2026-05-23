import type { ReactNode } from 'react'
import type { CanvasComponentItem } from '../../entities'
import {
  CanvasDemoSvgConnectorComponent,
  CanvasDemoSvgVoteComponent,
} from './CanvasDemoSvgShapeComponentRenderer'
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

type CanvasDemoSvgComponentRendererStrategy = (input: {
  item: CanvasComponentItem
}) => ReactNode

const CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS: Record<
  string,
  CanvasDemoSvgComponentRendererStrategy
> = {
  'accent-card': CanvasDemoSvgCardComponent,
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

export function CanvasDemoSvgComponentRenderer({
  getComponentPresentation,
  item,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
}) {
  const presentation = getComponentPresentation(item.component)
  const renderComponent =
    CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS[presentation] ??
    CanvasDemoSvgCardComponent

  return renderComponent({ item })
}
