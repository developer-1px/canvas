import type { ReactNode } from 'react'
import type { CanvasComponentItem } from '../../host'
import {
  CanvasSvgConnectorComponent,
  CanvasSvgVoteComponent,
} from './CanvasSvgShapeComponentRenderer'
import {
  CanvasSvgChecklistComponent,
  CanvasSvgKanbanComponent,
  CanvasSvgTableComponent,
} from './CanvasSvgStructuredComponentRenderer'
import {
  CanvasSvgCardComponent,
  CanvasSvgImageComponent,
  CanvasSvgLabelComponent,
  CanvasSvgSectionComponent,
  CanvasSvgStickyComponent,
} from './CanvasSvgTextComponentRenderer'

type CanvasSvgComponentRendererStrategy = (input: {
  item: CanvasComponentItem
}) => ReactNode

const CANVAS_SVG_COMPONENT_PRESENTATION_RENDERERS: Record<
  string,
  CanvasSvgComponentRendererStrategy
> = {
  'accent-card': CanvasSvgCardComponent,
  'checklist-list': CanvasSvgChecklistComponent,
  'image-frame': CanvasSvgImageComponent,
  'inline-label': CanvasSvgLabelComponent,
  'kanban-stack': CanvasSvgKanbanComponent,
  'line-connector': CanvasSvgConnectorComponent,
  'matrix-table': CanvasSvgTableComponent,
  'note-card': CanvasSvgStickyComponent,
  'section-frame': CanvasSvgSectionComponent,
  'vote-badge': CanvasSvgVoteComponent,
}

export function CanvasSvgComponentRenderer({
  getComponentPresentation,
  item,
}: {
  getComponentPresentation: (component: string) => string
  item: CanvasComponentItem
}) {
  const presentation = getComponentPresentation(item.component)
  const renderComponent =
    CANVAS_SVG_COMPONENT_PRESENTATION_RENDERERS[presentation] ??
    CanvasSvgCardComponent

  return renderComponent({ item })
}
