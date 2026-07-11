import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  ReactDesignRenderer,
  createDesignDocument,
  createDomProjection,
  createReactDesignDefinitionRegistry,
  createReactDesignWidgetPack,
  defineReactDesignWidget,
  type ReactDesignWidgetInspectorProps,
} from '@interactive-os/canvas/react-design'

interface CounterProps {
  readonly count: number
  readonly label: string
}

describe('React design public facade consumer', () => {
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
  return {
    id: nodeId,
    label: 'Counter card',
    definition: { id: 'external.counter-card', kind: 'widget' as const },
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

function createProjection() {
  return createDomProjection({
    getStageElement: () => null,
    getViewport: () => ({ scale: 1, x: 0, y: 0 }),
  })
}
