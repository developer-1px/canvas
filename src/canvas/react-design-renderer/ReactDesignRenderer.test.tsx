// @vitest-environment jsdom

import { renderToStaticMarkup } from 'react-dom/server'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  createDesignDocument,
  type DesignDocumentSnapshot,
} from '../design-document'
import { createDomProjection } from '../dom-projection'
import { createReactDesignDefinitionRegistry } from './ReactDesignDefinitionRegistry'
import { ReactDesignRenderer } from './ReactDesignRenderer'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true

describe('ReactDesignRenderer', () => {
  it('renders the ordered document hierarchy as direct intrinsic React DOM', () => {
    const document = createDesignDocument(createSnapshot())
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: ['h1', 'section'],
    })

    expect(renderToStaticMarkup(
      <ReactDesignRenderer
        projection={createProjection()}
        read={document.read}
        registry={registry}
      />,
    )).toBe(
      '<section class="page" data-design-node-id="page" ' +
      'data-design-definition-id="section"><h1 ' +
      'data-design-node-id="title" data-design-definition-id="h1">' +
      'Canonical title</h1></section>',
    )
  })

  it('renders registered component definitions with the same root contract', () => {
    const snapshot = createSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'page'
        ? {
            ...node,
            definition: { kind: 'component' as const, id: 'sales-card' },
          }
        : node),
    })
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: ['h1'],
      definitions: [{
        id: 'sales-card',
        kind: 'component',
        render: ({ children, rootProps }) => (
          <article {...rootProps} data-component="sales-card">
            {children}
          </article>
        ),
      }],
    })
    const markup = renderToStaticMarkup(
      <ReactDesignRenderer
        projection={createProjection()}
        read={document.read}
        registry={registry}
      />,
    )

    expect(markup).toContain(
      '<article class="page" data-design-node-id="page" ' +
      'data-design-definition-id="sales-card" data-component="sales-card">',
    )
    expect(markup).toContain('Canonical title</h1></article>')
  })

  it('moves registrations to a replacement projection and cleans up on unmount', async () => {
    const document = createDesignDocument(createSnapshot())
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: ['h1', 'section'],
    })
    const firstProjection = createProjection()
    const replacementProjection = createProjection()
    const container = documentElement()
    const root = createRoot(container)

    await act(async () => root.render(
      <ReactDesignRenderer
        projection={firstProjection}
        read={document.read}
        registry={registry}
      />,
    ))
    expect(firstProjection.registeredNodeIds()).toEqual(['page', 'title'])

    await act(async () => root.render(
      <ReactDesignRenderer
        projection={replacementProjection}
        read={document.read}
        registry={registry}
      />,
    ))
    expect(firstProjection.registeredNodeIds()).toEqual([])
    expect(replacementProjection.registeredNodeIds()).toEqual(['page', 'title'])

    await act(async () => root.unmount())
    expect(replacementProjection.registeredNodeIds()).toEqual([])
    container.remove()
  })

  it('keeps descendants inspectable when a definition is unknown', () => {
    const snapshot = createSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'page'
        ? {
            ...node,
            definition: { kind: 'component' as const, id: 'missing-widget' },
          }
        : node),
    })
    const markup = renderToStaticMarkup(
      <ReactDesignRenderer
        projection={createProjection()}
        read={document.read}
        registry={createReactDesignDefinitionRegistry({
          intrinsics: ['h1'],
        })}
      />,
    )

    expect(markup).toContain(
      'data-design-render-error="unknown-definition"',
    )
    expect(markup).toContain('data-design-node-id="page"')
    expect(markup).toContain('data-design-definition-id="missing-widget"')
    expect(markup).toContain('data-design-node-id="title"')
    expect(markup).toContain('Canonical title')
  })

  it('contains a registered renderer failure without losing descendants', async () => {
    const snapshot = createSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'page'
        ? {
            ...node,
            definition: { kind: 'component' as const, id: 'broken-card' },
          }
        : node),
    })
    const container = documentElement()
    const root = createRoot(container)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    await act(async () => root.render(
      <ReactDesignRenderer
        projection={createProjection()}
        read={document.read}
        registry={createReactDesignDefinitionRegistry({
          intrinsics: ['h1'],
          definitions: [{
            id: 'broken-card',
            kind: 'component',
            render: () => {
              throw new Error('broken renderer')
            },
          }],
        })}
      />,
    ))

    expect(container.querySelector(
      '[data-design-render-error="render-failed"]',
    )).not.toBeNull()
    expect(container.querySelector('[data-design-node-id="title"]')?.textContent)
      .toBe('Canonical title')

    await act(async () => root.unmount())
    consoleError.mockRestore()
    container.remove()
  })

  it('recovers when a failed definition is replaced under the same id', async () => {
    const snapshot = createSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'page'
        ? {
            ...node,
            definition: { kind: 'component' as const, id: 'sales-card' },
          }
        : node),
    })
    const projection = createProjection()
    const container = documentElement()
    const root = createRoot(container)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const brokenRegistry = createReactDesignDefinitionRegistry({
      intrinsics: ['h1'],
      definitions: [{
        id: 'sales-card',
        kind: 'component',
        render: () => {
          throw new Error('broken renderer')
        },
      }],
    })
    const healthyRegistry = createReactDesignDefinitionRegistry({
      intrinsics: ['h1'],
      definitions: [{
        id: 'sales-card',
        kind: 'component',
        render: ({ children, rootProps }) => (
          <article {...rootProps} data-component="recovered-card">
            {children}
          </article>
        ),
      }],
    })

    await act(async () => root.render(
      <ReactDesignRenderer
        projection={projection}
        read={document.read}
        registry={brokenRegistry}
      />,
    ))
    expect(container.querySelector(
      '[data-design-render-error="render-failed"]',
    )).not.toBeNull()

    await act(async () => root.render(
      <ReactDesignRenderer
        projection={projection}
        read={document.read}
        registry={healthyRegistry}
      />,
    ))
    expect(container.querySelector('[data-component="recovered-card"]'))
      .not.toBeNull()
    expect(container.querySelector(
      '[data-design-render-error="render-failed"]',
    )).toBeNull()

    await act(async () => root.unmount())
    consoleError.mockRestore()
    container.remove()
  })
})

function createProjection() {
  return createDomProjection({
    getStageElement: () => null,
    getViewport: () => ({ scale: 1, x: 0, y: 0 }),
  })
}

function documentElement() {
  const element = document.createElement('div')
  document.body.append(element)
  return element
}

function createSnapshot(): DesignDocumentSnapshot {
  return {
    schemaVersion: 1,
    roots: ['page'],
    nodes: [
      createNode({
        id: 'page',
        definitionId: 'section',
        children: ['title'],
        props: { className: 'page' },
      }),
      createNode({
        id: 'title',
        definitionId: 'h1',
        text: 'Canonical title',
      }),
    ],
  }
}

function createNode({
  id,
  definitionId,
  children = [],
  props = {},
  text = null,
}: {
  id: string
  definitionId: string
  children?: readonly string[]
  props?: Record<string, string>
  text?: string | null
}): DesignDocumentSnapshot['nodes'][number] {
  return {
    id,
    label: id,
    definition: { kind: 'intrinsic', id: definitionId },
    children,
    props,
    text,
    layout: {},
    style: {},
    frame: null,
    component: null,
  }
}
