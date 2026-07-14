import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  createDesignDocument,
  createReactDesignDefinitionRegistry,
  ReactDesignRenderer,
  type DomProjection,
} from '@interactive-os/canvas/react-design'
import {
  createFigmaDesignDocument,
  FIGMA_DESIGN_DOCUMENT_SNAPSHOT,
  FIGMA_WIDGET_DEFINITION_ID,
  FIGMA_WIDGET_NODE_ID,
} from '../design-document'
import {
  FIGMA_REACT_INTRINSICS,
  createFigmaReactDefinitions,
} from './FigmaWorkspaceReactDefinitions'

describe('Figma canonical React definitions', () => {
  it('resolves workspace, homepage component, and widget definitions', () => {
    const registry = createReactDesignDefinitionRegistry({
      definitions: createFigmaReactDefinitions(),
      intrinsics: FIGMA_REACT_INTRINSICS,
    })

    expect(registry.resolve({
      kind: 'component',
      id: 'workspace-stat-card',
    })?.kind).toBe('registered')
    expect(registry.resolve({
      kind: 'component',
      id: 'home-meta-card',
    })?.kind).toBe('registered')
    expect(registry.resolve({
      kind: 'component',
      id: 'mobile-travel-featured-stay-card',
    })?.kind).toBe('registered')
    expect(registry.resolve({
      kind: 'widget',
      id: FIGMA_WIDGET_DEFINITION_ID,
    })?.kind).toBe('registered')
    expect(registry.resolve({ kind: 'intrinsic', id: 'style' })).toBeNull()
    expect(registry.resolve({
      kind: 'intrinsic',
      id: 'unknown-search',
    })).toBeNull()
  })

  it('renders the full product with semantic home tags and widget content', () => {
    const document = createFigmaDesignDocument()
    const registry = createReactDesignDefinitionRegistry({
      definitions: createFigmaReactDefinitions(),
      intrinsics: FIGMA_REACT_INTRINSICS,
    })
    const markup = renderToStaticMarkup(createElement(ReactDesignRenderer, {
      projection: {} as DomProjection,
      read: document.read,
      registry,
    }))

    expect(markup).toContain(
      'data-design-node-id="homePage"',
    )
    expect(markup).toMatch(
      /<h1[^>]*data-design-node-id="homeHeroTitle"/,
    )
    expect(markup).toMatch(
      /<article[^>]*data-design-node-id="homeByline"[^>]*data-design-definition-id="home-meta-card"/,
    )
    expect(markup).toMatch(
      new RegExp(
        'data-design-node-id="' + FIGMA_WIDGET_NODE_ID + '"',
      ),
    )
    expect(markup).toContain('Activation')
    expect(markup).toContain('84.2')
    expect(markup).toContain('+12.4%')
    expect(markup).toMatch(
      /<article[^>]*data-design-node-id="mobileExploreFeaturedCard"[^>]*data-react-component="mobile-featured-stay-card"/,
    )
    expect(markup).toMatch(
      /data-design-node-id="mobileExploreFeaturedImage"[\s\S]*data-design-node-id="mobileExploreFeaturedInfo"/,
    )
    expect(markup).toContain('Slow House, Jeju')
    expect(markup).not.toContain('data-figma-dom-node')

    expect(document.execute({
      label: 'Rename featured stay',
      changes: [{
        type: 'update',
        nodeId: 'mobileExploreFeaturedTitle',
        values: { text: 'Forest House, Jeju' },
      }],
    })).toEqual({ changed: true, ok: true })
    const editedMarkup = renderToStaticMarkup(createElement(
      ReactDesignRenderer,
      { projection: {} as DomProjection, read: document.read, registry },
    ))

    expect(editedMarkup).toMatch(
      /data-design-node-id="mobileExploreFeaturedTitle"[^>]*>Forest House, Jeju<\/strong>/,
    )
  })

  it('keeps component descendants when named slot bindings are unavailable', () => {
    const document = createDesignDocument({
      ...FIGMA_DESIGN_DOCUMENT_SNAPSHOT,
      nodes: FIGMA_DESIGN_DOCUMENT_SNAPSHOT.nodes.map((node) =>
        node.id.startsWith('mobileExploreFeatured') ||
        node.id === 'mobileExploreFavorite'
          ? { ...node, component: null }
          : node),
    })
    const markup = renderToStaticMarkup(createElement(ReactDesignRenderer, {
      projection: {} as DomProjection,
      read: document.read,
      registry: createReactDesignDefinitionRegistry({
        definitions: createFigmaReactDefinitions(),
        intrinsics: FIGMA_REACT_INTRINSICS,
      }),
    }))

    expect(markup).toContain('data-react-component="mobile-featured-stay-card"')
    expect(markup).toContain('data-design-node-id="mobileExploreFeaturedImage"')
    expect(markup).toContain('data-design-node-id="mobileExploreFeaturedInfo"')
    expect(markup).toContain('Slow House, Jeju')
  })
})
