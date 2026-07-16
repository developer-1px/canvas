// @vitest-environment jsdom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { createEditorEngine } from '@interactive-os/canvas/editor'
import {
  createDomProjection,
  createReactDesignDefinitionRegistry,
} from '@interactive-os/canvas/react-design'

import { createFigmaDesignDocument } from '../design-document'
import { FigmaCloneInspector } from './FigmaCloneInspector'
import {
  createFigmaReactDefinitions,
  FIGMA_REACT_INTRINSICS,
} from './FigmaWorkspaceReactDefinitions'

describe('FigmaCloneInspector React component context', () => {
  it('shows the owning component and exact slot for a selected DOM descendant', () => {
    const document = createFigmaDesignDocument()
    const projection = createDomProjection({
      getStageElement: () => null,
      getViewport: () => ({ scale: 1, x: 0, y: 0 }),
    })
    const registry = createReactDesignDefinitionRegistry({
      definitions: createFigmaReactDefinitions(),
      intrinsics: FIGMA_REACT_INTRINSICS,
    })
    const editor = createEditorEngine({
      definitionResolver: registry,
      document,
      projection,
    })

    editor.commands.execute({
      type: 'selection.replace',
      nodeId: 'mobileExploreFeaturedTitle',
    })
    const markup = renderToStaticMarkup(
      <FigmaCloneInspector
        editor={editor}
        registry={registry}
        snapshot={editor.snapshot()}
        spacingGridSize={4}
      />,
    )

    expect(markup).toContain('<h2>Component</h2>')
    expect(markup).toContain('<dd>Featured stay card</dd>')
    expect(markup).toContain('<dd>Slow House, Jeju</dd>')
    expect(markup).toContain('<dd>title</dd>')
    expect(markup).toContain('<h2>Component edit</h2>')
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Instance<\/button>/)

    editor.commands.execute({
      type: 'selection.replace',
      nodeId: 'workspaceStatRevenueValue',
    })
    const linkedMarkup = renderToStaticMarkup(
      <FigmaCloneInspector
        componentEditScope="definition"
        editor={editor}
        registry={registry}
        snapshot={editor.snapshot()}
        spacingGridSize={4}
      />,
    )

    expect(linkedMarkup).toContain(
      'aria-label="Stat card synced instances"',
    )
    expect(linkedMarkup).toContain('>Revenue</button>')
    expect(linkedMarkup).toContain('>Conversion</button>')
    expect(linkedMarkup).toContain('>Tickets</button>')
    expect(linkedMarkup).toMatch(
      /aria-pressed="true"[^>]*>Definition<\/button>/,
    )

    editor.dispose()
    projection.dispose()
  })
})
