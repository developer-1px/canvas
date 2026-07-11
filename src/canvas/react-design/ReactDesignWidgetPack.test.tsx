import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  createDesignDocument,
  createReactDesignWidgetPack,
  defineReactDesignWidget,
  type DesignNode,
  type ReactDesignWidgetCapabilities,
  type ReactDesignWidgetCreateInput,
  type ReactDesignWidgetEditProp,
  type ReactDesignWidgetJSONProps,
  type ReactDesignWidgetPropsContract,
  type ReactDesignWidgetPropsParseResult,
} from './index'

interface BadgeProps {
  readonly tone: 'info' | 'warning'
}

describe('ReactDesignWidgetPack', () => {
  it('creates a widget through one definition-owned authoring seam', () => {
    const definition = createBadgeDefinition()
    const pack = createReactDesignWidgetPack({ definitions: [definition] })

    expect(pack.resolve('external.badge')).toBe(definition)
    expect(pack.create('external.badge', {
      nodeId: 'badge-1',
      x: 24,
      y: 36,
    })).toEqual({
      ok: true,
      node: expect.objectContaining({
        id: 'badge-1',
        frame: expect.objectContaining({ x: 24, y: 36 }),
        props: { tone: 'info' },
      }),
    })
    expect(pack.parseProps('external.badge', { tone: 'warning' })).toEqual({
      ok: true,
      value: { tone: 'warning' },
    })
    expect(pack.definitions).toHaveLength(1)
    const created = pack.create('external.badge', {
      nodeId: 'badge-2',
      x: 0,
      y: 0,
    })
    const node = created.ok ? created.node : neverNode()

    expect(renderToStaticMarkup(
      createElement(pack.definitions[0].render, {
        node,
        children: null,
        read: createRead(node),
        rootProps: {
          ref: () => undefined,
          'data-design-node-id': 'badge-2',
          'data-design-definition-id': 'external.badge',
        },
      }),
    )).toContain('info')
  })

  it('renders invalid document props through definition fallback and defaults', () => {
    const pack = createReactDesignWidgetPack({
      definitions: [createBadgeDefinition()],
    })
    const created = pack.create('external.badge', {
      nodeId: 'badge-invalid',
      x: 0,
      y: 0,
    })
    const node = created.ok ? created.node : neverNode()
    const markup = renderToStaticMarkup(createElement(
      pack.definitions[0].render,
      {
        node: { ...node, props: { tone: 'danger' } },
        children: null,
        read: createRead(node),
        rootProps: {
          ref: () => undefined,
          'data-design-node-id': node.id,
          'data-design-definition-id': 'external.badge',
        },
      },
    ))

    expect(markup).toContain('fallback:info:tone must be info or warning')
    expect(markup).not.toContain('data-widget-renderer="true"')
  })

  it('snapshots and deeply freezes definition contracts', () => {
    const definition = createBadgeDefinition()
    const pack = createReactDesignWidgetPack({ definitions: [definition] })

    expect(Object.isFrozen(definition)).toBe(true)
    expect(Object.isFrozen(definition.props)).toBe(true)
    expect(Object.isFrozen(definition.props.defaults)).toBe(true)
    expect(Object.isFrozen(definition.capabilities)).toBe(true)
    expect(Object.isFrozen(definition.capabilities.transform)).toBe(true)
    expect(Object.isFrozen(pack)).toBe(true)
    expect(Object.isFrozen(pack.definitions)).toBe(true)
    expect(Object.isFrozen(pack.definitions[0])).toBe(true)
    expect(() => {
      (definition.props.defaults as { tone: string }).tone = 'warning'
    }).toThrow(TypeError)
    expect(() => {
      (definition.capabilities.transform as { move: boolean }).move = false
    }).toThrow(TypeError)
    expect(pack.parseProps('external.badge', definition.props.defaults))
      .toEqual({ ok: true, value: { tone: 'info' } })
    const parsed = pack.parseProps('external.badge', { tone: 'warning' })

    expect(parsed.ok && Object.isFrozen(parsed.value)).toBe(true)
    expect(() => {
      if (parsed.ok) {
        (parsed.value as { tone: string }).tone = 'info'
      }
    }).toThrow(TypeError)
  })

  it('deeply freezes nested values returned by props parsers', () => {
    interface NestedProps {
      readonly settings: {
        readonly labels: readonly string[]
      }
    }
    const definition = defineReactDesignWidget<NestedProps>({
      id: 'external.nested-card',
      kind: 'widget',
      props: {
        defaults: { settings: { labels: ['default'] } },
        safeParse: (value) => ({
          ok: true,
          value: {
            settings: {
              labels: value === 'sparse' ? Array(1) : ['parsed'],
            },
          },
        }),
      },
      create: (input) => ({
        ...createBadgeNode(input),
        definition: { id: 'external.nested-card', kind: 'widget' },
        props: { settings: { labels: ['created'] } },
      }),
      capabilities: {
        textEdit: false,
        transform: { move: true, resize: true },
      },
      renderer: () => null,
      fallback: () => null,
    })
    const pack = createReactDesignWidgetPack({ definitions: [definition] })
    const parsed = pack.parseProps('external.nested-card', {})

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) {
      return
    }

    const settings = parsed.value.settings as {
      readonly labels: readonly string[]
    }

    expect(Object.isFrozen(parsed.value)).toBe(true)
    expect(Object.isFrozen(settings)).toBe(true)
    expect(Object.isFrozen(settings.labels)).toBe(true)
    expect(pack.parseProps('external.nested-card', 'sparse')).toEqual({
      ok: false,
      reason: 'Widget props must be a JSON object',
    })
  })

  it('captures and normalizes the props parser at definition time', () => {
    const props = {
      defaults: { tone: 'info' as const },
      safeParse: parseBadgeProps,
    }
    const definition = createBadgeDefinition({ props })
    const pack = createReactDesignWidgetPack({ definitions: [definition] })

    props.safeParse = () => ({
      ok: true,
      value: { tone: 'warning' },
    })

    expect(definition.props.safeParse({ tone: 'danger' })).toEqual({
      ok: false,
      reason: 'tone must be info or warning',
    })
    expect(pack.parseProps('external.badge', { tone: 'danger' })).toEqual({
      ok: false,
      reason: 'tone must be info or warning',
    })
    const parsed = definition.props.safeParse({ tone: 'info' })

    expect(parsed.ok && Object.isFrozen(parsed.value)).toBe(true)
  })

  it('keeps inspector prop edits keyed to the declared props interface', () => {
    const checkEditProp = (editProp: ReactDesignWidgetEditProp<BadgeProps>) => {
      editProp('tone', 'warning', 'Change tone')
      // @ts-expect-error an undeclared field is not editable
      editProp('missing', 'warning', 'Change missing field')
      // @ts-expect-error the value must match the selected field
      editProp('tone', 'danger', 'Change tone')
    }
    const invalidDefaults: ReactDesignWidgetJSONProps<{
      readonly callback: () => void
    }> = {
      // @ts-expect-error functions cannot enter persisted widget props
      callback: () => undefined,
    }

    expect(checkEditProp).toBeTypeOf('function')
    expect(invalidDefaults).toBeTypeOf('object')
  })

  it('rejects invalid and duplicate definitions at the authoring seam', () => {
    expect(() => defineReactDesignWidget({
      ...createBadgeDefinition(),
      id: 'External..badge',
    })).toThrow('Invalid React design widget definition id: External..badge')
    expect(() => defineReactDesignWidget({
      ...createBadgeDefinition(),
      props: {
        defaults: { tone: 'invalid' } as never,
        safeParse: () => ({ ok: false, reason: 'invalid defaults' }),
      },
    })).toThrow(
      'Invalid React design widget defaults for external.badge: invalid defaults',
    )

    const definition = createBadgeDefinition()

    expect(() => createReactDesignWidgetPack({
      definitions: [definition, definition],
    })).toThrow('Duplicate React design widget definition: external.badge')
    expect(() => createReactDesignWidgetPack({
      definitions: [{} as never],
    })).toThrow(
      'React design widget packs accept definitions created by defineReactDesignWidget',
    )
  })

  it.each([
    [
      'node identity',
      ({ x, y }: ReactDesignWidgetCreateInput) => ({
        ...createBadgeNode({ nodeId: 'changed-id', x, y }),
      }),
      'React design widget creator changed node id: badge-invalid',
    ],
    [
      'definition type',
      (input: ReactDesignWidgetCreateInput) => ({
        ...createBadgeNode(input),
        definition: { id: 'external.other', kind: 'widget' as const },
      }),
      'React design widget creator returned the wrong definition: external.badge',
    ],
    [
      'leaf structure',
      (input: ReactDesignWidgetCreateInput) => ({
        ...createBadgeNode(input),
        children: ['nested'],
      }),
      'React design widget creator must return a leaf node',
    ],
    [
      'text capability',
      (input: ReactDesignWidgetCreateInput) => ({
        ...createBadgeNode(input),
        text: 'unexpected',
      }),
      'React design widget without text editing must use null node text',
    ],
    [
      'JSON props',
      (input: ReactDesignWidgetCreateInput) => ({
        ...createBadgeNode(input),
        props: { tone: 'danger' },
      }),
      'Invalid React design widget creator props: tone must be info or warning',
    ],
    [
      'non-JSON props',
      (input: ReactDesignWidgetCreateInput) => ({
        ...createBadgeNode(input),
        props: { tone: 'info', callback: () => undefined } as never,
      }),
      'React design widget creator props must be a JSON object',
    ],
  ] as const)(
    'contains invalid creator output for %s',
    (_label, create, reason) => {
      const pack = createReactDesignWidgetPack({
        definitions: [createBadgeDefinition({ create })],
      })

      expect(pack.create('external.badge', {
        nodeId: 'badge-invalid',
        x: 10,
        y: 20,
      })).toEqual({ ok: false, reason })
    },
  )
})

function createBadgeDefinition({
  capabilities = {
    textEdit: false,
    transform: { move: true, resize: true },
  },
  create = createBadgeNode,
  props = {
    defaults: { tone: 'info' },
    safeParse: parseBadgeProps,
  },
}: {
  capabilities?: ReactDesignWidgetCapabilities
  create?: (input: ReactDesignWidgetCreateInput) => DesignNode
  props?: ReactDesignWidgetPropsContract<BadgeProps>
} = {}) {
  return defineReactDesignWidget<BadgeProps>({
    id: 'external.badge',
    kind: 'widget',
    props,
    create,
    capabilities,
    renderer: ({ props, rootProps }) => (
      <div {...rootProps} data-widget-renderer="true">{props.tone}</div>
    ),
    fallback: ({ props, reason, rootProps }) => (
      <div {...rootProps}>fallback:{props.tone}:{reason}</div>
    ),
  })
}

function parseBadgeProps(
  value: unknown,
): ReactDesignWidgetPropsParseResult<BadgeProps> {
  if (
    typeof value === 'object' &&
    value !== null &&
    'tone' in value &&
    (value.tone === 'info' || value.tone === 'warning')
  ) {
    return { ok: true as const, value: { tone: value.tone } }
  }

  return {
    ok: false as const,
    reason: 'tone must be info or warning',
  }
}

function createBadgeNode({
  nodeId,
  x,
  y,
}: ReactDesignWidgetCreateInput): DesignNode {
  return {
    id: nodeId,
    label: 'Badge',
    definition: { id: 'external.badge', kind: 'widget' },
    children: [],
    props: { tone: 'info' },
    text: null,
    layout: {},
    style: {},
    frame: {
      x,
      y,
      width: 120,
      height: 48,
      rotation: 0,
      widthMode: 'fixed',
      heightMode: 'fixed',
      overflow: 'visible',
    },
    component: null,
  }
}

function neverNode(): never {
  throw new Error('expected widget creation to succeed')
}

function createRead(node: DesignNode) {
  return createDesignDocument({
    schemaVersion: 1,
    roots: [node.id],
    nodes: [node],
  }).read
}
