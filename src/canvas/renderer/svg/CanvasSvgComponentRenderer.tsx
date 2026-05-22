import type { ReactNode } from 'react'
import type { CanvasComponentItem } from '../../host/model'
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

const CANVAS_SVG_COMPONENT_RENDERERS: Record<
  string,
  CanvasSvgComponentRendererStrategy
> = {
  card: CanvasSvgCardComponent,
  checklist: CanvasSvgChecklistComponent,
  connector: CanvasSvgConnectorComponent,
  image: CanvasSvgImageComponent,
  kanban: CanvasSvgKanbanComponent,
  label: CanvasSvgLabelComponent,
  section: CanvasSvgSectionComponent,
  sticky: CanvasSvgStickyComponent,
  table: CanvasSvgTableComponent,
  vote: CanvasSvgVoteComponent,
}

export function CanvasSvgComponentRenderer({
  item,
}: {
  item: CanvasComponentItem
}) {
  const renderComponent =
    CANVAS_SVG_COMPONENT_RENDERERS[item.component] ?? CanvasSvgCardComponent

  return renderComponent({ item })
}
