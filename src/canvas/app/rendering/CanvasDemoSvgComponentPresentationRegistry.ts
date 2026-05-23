import type { ReactNode } from 'react'
import type { CanvasComponentItem } from '../../entities'
import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'
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

export type CanvasDemoSvgComponentRendererStrategy = (input: {
  item: CanvasComponentItem
}) => ReactNode

export type CanvasDemoSvgComponentPresentationRenderers = Readonly<
  Record<string, CanvasDemoSvgComponentRendererStrategy>
>

export const DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS: CanvasDemoSvgComponentPresentationRenderers = {
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

export function createCanvasDemoSvgComponentPresentationRenderers(
  extensions: CanvasDemoSvgComponentPresentationRenderers = {},
): CanvasDemoSvgComponentPresentationRenderers {
  assertCanvasAppExtensionRecordKeys({
    entries: extensions,
    label: 'component presentation renderer',
  })
  assertCanvasDemoSvgComponentPresentationRendererStrategies(extensions)

  return {
    ...DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
    ...extensions,
  }
}

export function getCanvasDemoSvgComponentPresentationRenderer({
  presentation,
  renderers,
}: {
  presentation: string
  renderers: CanvasDemoSvgComponentPresentationRenderers
}) {
  return renderers[presentation] ?? CanvasDemoSvgCardComponent
}

function assertCanvasDemoSvgComponentPresentationRendererStrategies(
  renderers: CanvasDemoSvgComponentPresentationRenderers,
) {
  for (const [presentation, renderer] of Object.entries(renderers)) {
    if (typeof renderer !== 'function') {
      assertCanvasAppDescriptorFunctionField({
        field: 'render strategy',
        owner: `component presentation renderer ${presentation}`,
        value: renderer,
      })
    }
  }
}
