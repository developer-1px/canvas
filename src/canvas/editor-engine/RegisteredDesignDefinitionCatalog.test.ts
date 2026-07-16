import { describe, expect, it } from 'vitest'

import type { DesignNode } from '../design-document'
import {
  createRegisteredDesignDefinitionCatalog,
  defineRegisteredDesignDefinition,
  type RegisteredDesignDefinitionSource,
} from './index'

describe('RegisteredDesignDefinitionCatalog', () => {
  it('replaces definitions from a subscribed source and publishes one revision', () => {
    const first = createDefinition('customer.card')
    const second = createDefinition('customer.hero')
    let definitions = [first]
    const listeners = new Set<() => void>()
    const source: RegisteredDesignDefinitionSource<typeof first> = {
      read: () => definitions,
      subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    }
    const catalog = createRegisteredDesignDefinitionCatalog({ sources: [source] })
    const revisions: number[] = []
    const unsubscribe = catalog.subscribe(() => {
      revisions.push(catalog.snapshot().revision)
    })

    expect(catalog.resolveRegistered(first)).toBe(first)
    expect(catalog.snapshot()).toMatchObject({
      definitions: [first],
      failure: null,
      revision: 0,
    })

    definitions = [second]
    for (const listener of listeners) listener()

    expect(catalog.resolveRegistered(first)).toBeNull()
    expect(catalog.resolveRegistered(second)).toBe(second)
    expect(catalog.snapshot()).toMatchObject({
      definitions: [second],
      failure: null,
      revision: 1,
    })
    expect(revisions).toEqual([1])

    unsubscribe()
    catalog.dispose()
  })

  it('keeps the last valid definitions when a live source update is invalid', () => {
    const stable = createDefinition('customer.card')
    let definitions = [stable]
    let publish: () => void = () => undefined
    const source: RegisteredDesignDefinitionSource<typeof stable> = {
      read: () => definitions,
      subscribe(listener) {
        publish = listener
        return () => undefined
      },
    }
    const catalog = createRegisteredDesignDefinitionCatalog({ sources: [source] })

    definitions = [stable, stable]
    publish()

    expect(catalog.resolveRegistered(stable)).toBe(stable)
    expect(catalog.snapshot()).toMatchObject({
      definitions: [stable],
      failure: 'Duplicate registered design definition: component:customer.card',
      revision: 1,
    })

    const recovered = createDefinition('customer.recovered')

    definitions = [recovered]
    publish()

    expect(catalog.resolveRegistered(stable)).toBeNull()
    expect(catalog.resolveRegistered(recovered)).toBe(recovered)
    expect(catalog.snapshot()).toMatchObject({
      definitions: [recovered],
      failure: null,
      revision: 2,
    })

    catalog.dispose()
  })
})

function createDefinition(id: string) {
  return defineRegisteredDesignDefinition({
    id,
    kind: 'component',
    props: {
      defaults: {},
      safeParse: (value) => typeof value === 'object' && value !== null
        ? { ok: true as const, value: {} }
        : { ok: false as const, reason: 'invalid props' },
    },
    create: ({ nodeId, x, y }): DesignNode => ({
      id: nodeId,
      label: id,
      definition: { id, kind: 'component' },
      children: [],
      props: {},
      text: null,
      layout: { x, y },
      style: {},
      frame: null,
      component: null,
    }),
    capabilities: {
      textEdit: false,
      transform: { move: true, resize: true },
    },
  })
}
