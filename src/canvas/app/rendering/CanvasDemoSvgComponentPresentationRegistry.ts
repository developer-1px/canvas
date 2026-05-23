import { assertCanvasAppDescriptorFunctionField } from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../extensions/CanvasAppExtensionIds'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
} from './CanvasAppRenderingContracts'
import {
  CanvasDemoSvgConnectorComponent,
  CanvasDemoSvgVoteComponent,
} from './CanvasDemoSvgShapeComponentRenderer'
import {
  CANVAS_DEMO_SVG_COMPONENT_FALLBACK_PRESENTATION,
  getCanvasDemoSvgComponentFallbackRenderer,
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

export type CanvasDemoSvgComponentRendererStrategy =
  CanvasAppComponentRendererStrategy

export type CanvasDemoSvgComponentPresentationRenderers =
  CanvasAppComponentPresentationRenderers

export const DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS: CanvasDemoSvgComponentPresentationRenderers = {
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

export function createCanvasDemoSvgComponentPresentationRenderers(
  extensions: CanvasDemoSvgComponentPresentationRenderers = {},
): CanvasDemoSvgComponentPresentationRenderers {
  assertCanvasDemoSvgComponentPresentationRenderers(extensions)

  return {
    ...DEFAULT_CANVAS_DEMO_SVG_COMPONENT_PRESENTATION_RENDERERS,
    ...extensions,
  }
}

export function assertCanvasDemoSvgComponentPresentationRenderers(
  renderers: CanvasDemoSvgComponentPresentationRenderers,
) {
  assertCanvasAppExtensionRecordKeys({
    entries: renderers,
    label: 'component presentation renderer',
  })
  assertCanvasDemoSvgComponentPresentationRendererStrategies(renderers)
}

export function getCanvasDemoSvgComponentPresentationRenderer({
  presentation,
  renderers,
}: {
  presentation: string
  renderers: CanvasDemoSvgComponentPresentationRenderers
}) {
  return renderers[presentation] ?? getCanvasDemoSvgComponentFallbackRenderer()
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
