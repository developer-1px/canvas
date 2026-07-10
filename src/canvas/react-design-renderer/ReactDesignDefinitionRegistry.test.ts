import { describe, expect, it } from 'vitest'

import { createReactDesignDefinitionRegistry } from './ReactDesignDefinitionRegistry'

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
    const definition = {
      id: 'sales-card',
      kind: 'component' as const,
      render: () => null,
    }
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
        { id: 'note', kind: 'widget', render: () => null },
        { id: 'note', kind: 'widget', render: () => null },
      ],
    })).toThrow('Duplicate React design definition: widget:note')

    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: [],
      definitions: [
        { id: 'note', kind: 'component', render: () => null },
        { id: 'note', kind: 'widget', render: () => null },
      ],
    })).not.toThrow()
  })

  it('rejects empty or whitespace-only definition ids', () => {
    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: ['' as 'section'],
    })).toThrow('React design definition id must not be empty')

    expect(() => createReactDesignDefinitionRegistry({
      intrinsics: [],
      definitions: [{ id: '  ', kind: 'component', render: () => null }],
    })).toThrow('React design definition id must not be empty')
  })

  it('snapshots registry inputs so later caller mutations cannot change resolution', () => {
    const intrinsics: Array<'section' | 'span'> = ['section']
    const definitions = [{
      id: 'sales-card',
      kind: 'component' as const,
      render: () => null,
    }]
    const registry = createReactDesignDefinitionRegistry({
      intrinsics,
      definitions,
    })

    intrinsics.push('span')
    definitions[0].id = 'renamed-card'

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
})
