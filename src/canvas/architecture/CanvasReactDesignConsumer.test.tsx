import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  createEditorEngine,
  defineRegisteredDesignDefinition,
} from '@interactive-os/canvas/editor'
import {
  ReactDesignRenderer,
  createDesignDocument,
  createDomProjection,
  createReactDesignDefinitionRegistry,
  createReactDesignComponentInstance,
  createReactDesignWidgetPack,
  defineReactDesignDefinition,
  defineReactDesignWidget,
  type ReactDesignWidgetInspectorProps,
} from '@interactive-os/canvas/react-design'

interface CounterProps {
  readonly count: number
  readonly label: string
}

describe('React design public facade consumer', () => {
  it('adapts component and widget definitions from the same headless contract', () => {
    const base = defineRegisteredDesignDefinition({
      id: 'external.counter-component',
      kind: 'component',
      props: {
        defaults: { count: 0, label: 'Count' },
        safeParse: parseCounterProps,
      },
      create: ({ nodeId, x, y }) => createDefinitionNode(
        'external.counter-component',
        nodeId,
        x,
        y,
        'component',
      ),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
    })
    const component = defineReactDesignDefinition({
      definition: base,
      renderer: ({ props, rootProps }) => (
        <article {...rootProps}>{props.label}: {props.count}</article>
      ),
      fallback: ({ props, reason, rootProps }) => (
        <article {...rootProps} data-counter-fallback={reason}>
          {props.label}: {props.count}
        </article>
      ),
      Inspector: CounterInspector,
    })
    const widget = defineReactDesignWidget<CounterProps>({
      id: 'external.counter-widget',
      kind: 'widget',
      props: {
        defaults: { count: 0, label: 'Count' },
        safeParse: parseCounterProps,
      },
      create: ({ nodeId, x, y }) => createDefinitionNode(
        'external.counter-widget',
        nodeId,
        x,
        y,
        'widget',
      ),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
      renderer: ({ props, rootProps }) => (
        <article {...rootProps}>{props.label}: {props.count}</article>
      ),
      fallback: ({ props, reason, rootProps }) => (
        <article {...rootProps} data-counter-fallback={reason}>
          {props.label}: {props.count}
        </article>
      ),
    })
    const registry = createReactDesignDefinitionRegistry({
      definitions: [component, widget],
      intrinsics: [],
    })

    expect(registry.resolveRegistered({
      id: component.id,
      kind: component.kind,
    })).toEqual(component)
    expect(registry.resolveRegistered({
      id: widget.id,
      kind: widget.kind,
    })).toEqual(widget)
    expect(component.props.safeParse({ count: 'invalid' })).toEqual({
      ok: false,
      reason: 'counter props are invalid',
    })
    expect(component.Inspector).toBe(CounterInspector)
    const componentNode = createDefinitionNode(
      component.id,
      'external-component-1',
      0,
      0,
      'component',
    )
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [componentNode.id],
      nodes: [componentNode],
    })
    const projection = createProjection()
    const editor = createEditorEngine({
      definitionResolver: registry,
      document,
      projection,
    })
    const resolved = registry.resolveRegistered(componentNode.definition)

    expect(renderToStaticMarkup(<>{resolved?.renderInspector?.({
      editor,
      editProp: () => undefined,
      node: componentNode,
    })}</>)).toContain('Increment')

    const invalidDocument = createDesignDocument({
      schemaVersion: 1,
      roots: [componentNode.id],
      nodes: [{ ...componentNode, props: { count: 'invalid' } }],
    })
    const invalidMarkup = renderToStaticMarkup(
      <ReactDesignRenderer
        projection={createProjection()}
        read={invalidDocument.read}
        registry={registry}
      />,
    )

    expect(invalidMarkup).toContain('Count: 0')
    expect(invalidMarkup).toContain(
      'data-counter-fallback="counter props are invalid"',
    )

    editor.dispose()
    projection.dispose()
  })

  it('lets a second external pack author and render without private imports', () => {
    const counter = defineReactDesignWidget<CounterProps>({
      id: 'external.counter-card',
      kind: 'widget',
      props: {
        defaults: { count: 0, label: 'Count' },
        safeParse(value) {
          if (
            typeof value === 'object' &&
            value !== null &&
            'count' in value &&
            Number.isFinite(value.count) &&
            'label' in value &&
            typeof value.label === 'string'
          ) {
            return {
              ok: true,
              value: { count: value.count as number, label: value.label },
            }
          }

          return { ok: false, reason: 'counter props are invalid' }
        },
      },
      create: ({ nodeId, x, y }) => ({
        id: nodeId,
        label: 'Counter card',
        definition: { id: 'external.counter-card', kind: 'widget' },
        children: [],
        props: { count: 0, label: 'Count' },
        text: null,
        layout: {},
        style: {},
        frame: {
          x,
          y,
          width: 160,
          height: 96,
          rotation: 0,
          widthMode: 'fixed',
          heightMode: 'fixed',
          overflow: 'visible',
        },
        component: null,
      }),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
      renderer: ({ props, rootProps }) => (
        <article {...rootProps}>{props.label}: {props.count}</article>
      ),
      fallback: ({ props, reason, rootProps }) => (
        <article {...rootProps} data-counter-fallback={reason}>
          {props.label}: {props.count}
        </article>
      ),
      Inspector: CounterInspector,
    })
    const pack = createReactDesignWidgetPack({ definitions: [counter] })
    const created = pack.create('external.counter-card', {
      nodeId: 'external-counter-1',
      x: 32,
      y: 48,
    })

    expect(created.ok).toBe(true)
    if (!created.ok) {
      return
    }

    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [created.node.id],
      nodes: [created.node],
    })
    const markup = renderToStaticMarkup(
      <ReactDesignRenderer
        projection={createProjection()}
        read={document.read}
        registry={createReactDesignDefinitionRegistry({
          definitions: pack.definitions,
          intrinsics: [],
        })}
      />,
    )

    expect(markup).toContain('Count: 0')
    expect(pack.resolve('external.counter-card')?.Inspector)
      .toBe(CounterInspector)
    expect(pack.resolve('unknown.widget')).toBeNull()
  })

  it('contains invalid persisted props with the definition fallback defaults', () => {
    const definition = defineReactDesignWidget<CounterProps>({
      id: 'external.counter-card',
      kind: 'widget',
      props: {
        defaults: { count: 0, label: 'Count' },
        safeParse: (value) => (
          typeof value === 'object' &&
          value !== null &&
          'count' in value &&
          typeof value.count === 'number' &&
          'label' in value &&
          typeof value.label === 'string'
            ? {
                ok: true,
                value: { count: value.count, label: value.label },
              }
            : { ok: false, reason: 'counter props are invalid' }
        ),
      },
      create: ({ nodeId, x, y }) => createCounterNode(nodeId, x, y),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
      renderer: ({ rootProps }) => <article {...rootProps}>valid</article>,
      fallback: ({ props, reason, rootProps }) => (
        <article {...rootProps} data-counter-fallback={reason}>
          {props.label}: {props.count}
        </article>
      ),
    })
    const pack = createReactDesignWidgetPack({ definitions: [definition] })
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: ['invalid-counter'],
      nodes: [{
        ...createCounterNode('invalid-counter', 0, 0),
        props: { count: 'not-a-number' },
      }],
    })
    const markup = renderToStaticMarkup(
      <ReactDesignRenderer
        projection={createProjection()}
        read={document.read}
        registry={createReactDesignDefinitionRegistry({
          definitions: pack.definitions,
          intrinsics: [],
        })}
      />,
    )

    expect(markup).toContain('Count: 0')
    expect(markup).toContain('data-counter-fallback="counter props are invalid"')
    expect(markup).not.toContain('>valid<')
  })

  it('creates editable component slot trees through the public facade', () => {
    const instance = createReactDesignComponentInstance({
      instanceId: 'external-card-1',
      label: 'Insert external card',
      parentId: null,
      index: 0,
      root: {
        node: {
          id: 'external-card',
          label: 'External card',
          definition: { kind: 'component', id: 'external.card' },
          props: {},
          text: null,
          layout: {},
          style: {},
          frame: null,
        },
        slotId: 'root',
        children: [{
          node: {
            id: 'external-card-title',
            label: 'External card title',
            definition: { kind: 'intrinsic', id: 'h2' },
            props: {},
            text: 'Inspectable title',
            layout: {},
            style: {},
            frame: null,
          },
          slotId: 'title',
        }],
      },
    })
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [],
      nodes: [],
    })

    expect(document.execute(instance.command)).toEqual({
      changed: true,
      ok: true,
    })
    expect(document.read.node('external-card-title')?.component).toEqual({
      definitionId: 'external.card',
      instanceId: 'external-card-1',
      slotId: 'title',
    })
  })
})

function CounterInspector({
  props,
  editProp,
}: ReactDesignWidgetInspectorProps<CounterProps>) {
  return (
    <button onClick={() => editProp('count', props.count + 1, 'Increment')}>
      Increment
    </button>
  )
}

function createCounterNode(nodeId: string, x: number, y: number) {
  return createDefinitionNode('external.counter-card', nodeId, x, y, 'widget')
}

function createDefinitionNode(
  definitionId: string,
  nodeId: string,
  x: number,
  y: number,
  kind: 'component' | 'widget',
) {
  return {
    id: nodeId,
    label: 'Counter card',
    definition: {
      id: definitionId,
      kind,
    },
    children: [],
    props: { count: 0, label: 'Count' },
    text: null,
    layout: {},
    style: {},
    frame: {
      x,
      y,
      width: 160,
      height: 96,
      rotation: 0,
      widthMode: 'fixed' as const,
      heightMode: 'fixed' as const,
      overflow: 'visible' as const,
    },
    component: null,
  }
}

function parseCounterProps(value: unknown) {
  if (
    typeof value === 'object' &&
    value !== null &&
    'count' in value &&
    typeof value.count === 'number' &&
    'label' in value &&
    typeof value.label === 'string'
  ) {
    return {
      ok: true as const,
      value: { count: value.count, label: value.label },
    }
  }

  return { ok: false as const, reason: 'counter props are invalid' }
}

function createProjection() {
  return createDomProjection({
    getStageElement: () => null,
    getViewport: () => ({ scale: 1, x: 0, y: 0 }),
  })
}
