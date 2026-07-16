import { describe, expect, it } from 'vitest'

import {
  defineRegisteredDesignDefinition,
  type RegisteredDesignDefinitionSource,
} from '../editor-engine'
import {
  createReactDesignDefinitionRegistry,
  defineReactDesignDefinition,
  type ReactDesignDefinitionRenderProps,
} from './ReactDesignDefinitionRegistry'

describe('ReactDesignDefinitionRegistry', () => {
  it('resolves only explicitly allowlisted intrinsic elements', () => {
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: ['section', 'span'],
    })

    expect(registry.resolve({ kind: 'intrinsic', id: 'section' })).toEqual({
      kind: 'intrinsic',
      tag: 'section',
    })
    expect(registry.resolve({ kind: 'intrinsic', id: 'button' })).toBeNull()
    expect(registry.resolve({ kind: 'intrinsic', id: 'canvas' })).toBeNull()
  })

  it('resolves a registered definition only when its kind and id match', () => {
    const definition = createDefinition('sales-card', 'component')
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: [],
      definitions: [definition],
    })

    expect(registry.resolve({ kind: 'component', id: 'sales-card' }))
      .toEqual({ kind: 'registered', definition })
    expect(registry.resolve({ kind: 'widget', id: 'sales-card' })).toBeNull()
  })

  it('rejects duplicate registrations within the same definition kind', () => {
    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: ['section', 'section'],
    })).toThrow('Duplicate React design definition: intrinsic:section')

    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: [],
      definitions: [
        createDefinition('note', 'widget'),
        createDefinition('note', 'widget'),
      ],
    })).toThrow('Duplicate React design definition: widget:note')

    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: [],
      definitions: [
        createDefinition('note', 'component'),
        createDefinition('note', 'widget'),
      ],
    })).not.toThrow()
  })

  it('rejects empty or whitespace-only definition ids', () => {
    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: ['' as 'section'],
    })).toThrow('React design definition id must not be empty')

    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: [],
      definitions: [{
        ...createDefinition('valid', 'component'),
        id: '  ',
      }],
    })).toThrow('React design definition id must not be empty')
  })

  it('snapshots registry inputs so later caller mutations cannot change resolution', () => {
    const intrinsics: Array<'section' | 'span'> = ['section']
    const definitions = [createDefinition('sales-card', 'component')]
    const registry = createReactDesignDefinitionRegistry({
      intrinsics,
      definitions,
    })

    intrinsics.push('span')
    definitions.push(createDefinition('renamed-card', 'component'))

    expect(registry.resolve({ kind: 'intrinsic', id: 'span' })).toBeNull()
    expect(registry.resolve({ kind: 'component', id: 'sales-card' }))
      .toMatchObject({ kind: 'registered' })
    expect(registry.resolve({ kind: 'component', id: 'renamed-card' }))
      .toBeNull()
  })

  it('rejects canvas even when an untyped caller bypasses the intrinsic type', () => {
    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: ['canvas' as 'section'],
    })).toThrow('React design intrinsic is not supported: canvas')
  })

  it('resolves live definitions supplied through a reusable definition source', () => {
    const first = createDefinition('customer-card', 'component')
    const second = createDefinition('customer-hero', 'component')
    let definitions = [first]
    let publish: () => void = () => undefined
    const source: RegisteredDesignDefinitionSource<typeof first> = {
      read: () => definitions,
      subscribe(listener) {
        publish = listener
        return () => undefined
      },
    }
    const registry = createReactDesignDefinitionRegistry({
      intrinsics: [],
      sources: [source],
    })

    expect(registry.resolve({ kind: 'component', id: first.id }))
      .toEqual({ kind: 'registered', definition: first })

    definitions = [second]
    publish()

    expect(registry.resolve({ kind: 'component', id: first.id })).toBeNull()
    expect(registry.resolve({ kind: 'component', id: second.id }))
      .toEqual({ kind: 'registered', definition: second })
    expect(registry.snapshot()).toMatchObject({
      definitions: [second],
      failure: null,
      revision: 1,
    })

    registry.dispose()
  })
})

function createDefinition(
  id: string,
  kind: 'component' | 'widget',
  renderer: (props: ReactDesignDefinitionRenderProps) => null = () => null,
) {
  return defineReactDesignDefinition({
    definition: defineRegisteredDesignDefinition({
      id,
      kind,
      props: {
        defaults: {},
        safeParse: (value) => (
          typeof value === 'object' && value !== null && !Array.isArray(value)
            ? { ok: true as const, value: {} }
            : { ok: false as const, reason: 'invalid props' }
        ),
      },
      create: ({ nodeId }) => ({
        id: nodeId,
        label: id,
        definition: { id, kind },
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
