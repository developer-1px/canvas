// @vitest-environment jsdom

import { renderToStaticMarkup } from 'react-dom/server'
import { createRoot } from 'react-dom/client'
import { act, type ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import {
  createDesignDocument,
  type DesignJSONObject,
  type DesignDocumentSnapshot,
} from '../design-document'
import { createDomProjection } from '../dom-projection'
import {
  defineRegisteredDesignDefinition,
  type RegisteredDesignDefinitionSource,
} from '../editor-engine'
import {
  createReactDesignDefinitionRegistry,
  defineReactDesignDefinition,
  type ReactDesignDefinitionRenderProps,
} from './ReactDesignDefinitionRegistry'
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
      definitions: [createRegisteredDefinition(
        'sales-card',
        ({ children, read, rootProps }) => (
          <article
            {...rootProps}
            data-component="sales-card"
            data-related-title={read.node('title')?.text ?? undefined}
          >
            {children}
          </article>
        ),
      )],
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
      'data-design-definition-id="sales-card" data-component="sales-card" ' +
      'data-related-title="Canonical title">',
    )
    expect(markup).toContain('Canonical title</h1></article>')
  })

  it('rerenders when a subscribed definition source registers the component', async () => {
    const snapshot = createSnapshot()
    const document = createDesignDocument({
      ...snapshot,
      nodes: snapshot.nodes.map((node) => node.id === 'page'
        ? {
            ...node,
            definition: { kind: 'component' as const, id: 'live-card' },
          }
        : node),
    })
    const definition = createRegisteredDefinition(
      'live-card',
      ({ children, rootProps }) => (
        <article {...rootProps} data-component="live-card">{children}</article>
      ),
    )
    let definitions: typeof definition[] = []
    let publish: () => void = () => undefined
    const source: RegisteredDesignDefinitionSource<typeof definition> = {
      read: () => definitions,
      subscribe(listener) {
        publish = listener
        return () => undefined
      },
    }
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: ['h1'],
      sources: [source],
    })
    const container = documentElement()
    const root = createRoot(container)

    await act(async () => root.render(
      <ReactDesignRenderer
        projection={createProjection()}
        read={document.read}
        registry={registry}
      />,
    ))
    expect(container.querySelector('[data-design-render-error="unknown-definition"]'))
      .not.toBeNull()

    await act(async () => {
      definitions = [definition]
      publish()
    })

    expect(container.querySelector('[data-component="live-card"]')).not.toBeNull()
    expect(container.querySelector('[data-design-render-error]')).toBeNull()

    await act(async () => root.unmount())
    registry.dispose()
    container.remove()
  })

  it('renders named component slots as inspectable document nodes', async () => {
    const instance = {
      definitionId: 'sales-card',
      instanceId: 'sales-card-1',
    }
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: ['page'],
      nodes: [
        {
          ...createNode({
            id: 'page',
            definitionId: 'sales-card',
            children: ['title', 'action'],
            props: { className: 'page' },
          }),
          definition: { kind: 'component', id: 'sales-card' },
          component: { ...instance, slotId: 'root' },
        },
        {
          ...createNode({
            id: 'title',
            definitionId: 'h1',
            text: 'Canonical title',
          }),
          component: { ...instance, slotId: 'title' },
        },
        {
          ...createNode({
            id: 'action',
            definitionId: 'button',
            text: 'Open report',
          }),
          component: { ...instance, slotId: 'action' },
        },
      ],
    })
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: ['button', 'h1'],
      definitions: [createRegisteredDefinition(
        'sales-card',
        ({ rootProps, slots }) => (
          <article {...rootProps} data-component="sales-card">
            <div data-slot="action">{slots.action}</div>
            <header data-slot="title">{slots.title}</header>
          </article>
        ),
      )],
    })
    const projection = createProjection()
    const renderer = (
      <ReactDesignRenderer
        projection={projection}
        read={document.read}
        registry={registry}
      />
    )
    const markup = renderToStaticMarkup(renderer)

    expect(markup.indexOf('data-design-node-id="action"')).toBeLessThan(
      markup.indexOf('data-design-node-id="title"'),
    )
    expect(markup).toContain(
      '<button data-design-node-id="action" data-design-definition-id="button">' +
      'Open report</button>',
    )
    expect(markup).toContain(
      '<h1 data-design-node-id="title" data-design-definition-id="h1">' +
      'Canonical title</h1>',
    )

    const container = documentElement()
    const root = createRoot(container)

    await act(async () => root.render(renderer))
    expect(projection.registeredNodeIds()).toEqual(['action', 'page', 'title'])

    await act(async () => root.unmount())
    container.remove()
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
          definitions: [createRegisteredDefinition(
            'broken-card',
            () => {
              throw new Error('broken renderer')
            },
          )],
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
      definitions: [createRegisteredDefinition(
        'sales-card',
        () => {
          throw new Error('broken renderer')
        },
      )],
    })
    const healthyRegistry = createReactDesignDefinitionRegistry({
      intrinsics: ['h1'],
      definitions: [createRegisteredDefinition(
        'sales-card',
        ({ children, rootProps }) => (
          <article {...rootProps} data-component="recovered-card">
            {children}
          </article>
        ),
      )],
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

function createRegisteredDefinition(
  id: string,
  renderer: (props: ReactDesignDefinitionRenderProps) => ReactNode,
) {
  return defineReactDesignDefinition({
    definition: defineRegisteredDesignDefinition({
      id,
      kind: 'component',
      props: {
        defaults: {},
        safeParse: (value) => (
          typeof value === 'object' && value !== null && !Array.isArray(value)
            ? {
                ok: true as const,
                value: value as DesignJSONObject,
              }
            : { ok: false as const, reason: 'invalid component props' }
        ),
      },
      create: ({ nodeId }) => ({
        id: nodeId,
        label: id,
        definition: { id, kind: 'component' },
        children: [],
        props: {},
        text: null,
        layout: {},
        style: {},
        frame: null,
        component: null,
      }),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
    }),
    renderer,
    fallback: () => null,
  })
}

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
