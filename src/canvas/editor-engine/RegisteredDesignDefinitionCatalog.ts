import type { DesignNodeDefinition } from '../design-document'
import type { RegisteredDesignDefinition } from './RegisteredDesignDefinition'

export type RegisteredDesignDefinitionSource<
  Definition extends RegisteredDesignDefinition<object> =
    RegisteredDesignDefinition<object>,
> = {
  read(): readonly Definition[]
  subscribe?(listener: () => void): () => void
}

export type RegisteredDesignDefinitionCatalogSnapshot<
  Definition extends RegisteredDesignDefinition<object> =
    RegisteredDesignDefinition<object>,
> = {
  readonly definitions: readonly Definition[]
  readonly failure: string | null
  readonly revision: number
}

export type RegisteredDesignDefinitionCatalog<
  Definition extends RegisteredDesignDefinition<object> =
    RegisteredDesignDefinition<object>,
> = {
  dispose(): void
  resolveRegistered(reference: DesignNodeDefinition): Definition | null
  snapshot(): RegisteredDesignDefinitionCatalogSnapshot<Definition>
  subscribe(listener: () => void): () => void
}

export function createRegisteredDesignDefinitionCatalog<
  Definition extends RegisteredDesignDefinition<object>,
>({
  definitions = [],
  sources = [],
}: {
  readonly definitions?: readonly Definition[]
  readonly sources?: readonly RegisteredDesignDefinitionSource<Definition>[]
}): RegisteredDesignDefinitionCatalog<Definition> {
  const staticDefinitions = [...definitions]
  const sourceList = [...sources]
  const listeners = new Set<() => void>()
  let disposed = false
  let revision = 0
  let current = collectDefinitions(staticDefinitions, sourceList)
  let snapshot = createSnapshot(current.definitions, null, revision)
  const cleanups: (() => void)[] = []

  try {
    for (const source of sourceList) {
      if (source.subscribe) {
        cleanups.push(source.subscribe(refresh))
      }
    }
  } catch (error) {
    for (const cleanup of cleanups) cleanup()
    throw error
  }

  function refresh() {
    if (disposed) {
      return
    }

    revision += 1

    try {
      current = collectDefinitions(staticDefinitions, sourceList)
      snapshot = createSnapshot(current.definitions, null, revision)
    } catch (error) {
      snapshot = createSnapshot(
        current.definitions,
        getErrorMessage(error),
        revision,
      )
    }

    for (const listener of listeners) {
      try {
        listener()
      } catch {
        // One observer cannot starve the remaining catalog observers.
      }
    }
  }

  return {
    dispose() {
      if (disposed) {
        return
      }

      disposed = true
      listeners.clear()

      for (const cleanup of cleanups.splice(0)) {
        cleanup()
      }
    },
    resolveRegistered(reference) {
      if (reference.kind !== 'component' && reference.kind !== 'widget') {
        return null
      }

      return current.byKey.get(getDefinitionKey(reference)) ?? null
    },
    snapshot: () => snapshot,
    subscribe(listener) {
      if (disposed) {
        return () => undefined
      }

      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

function collectDefinitions<
  Definition extends RegisteredDesignDefinition<object>,
>(
  staticDefinitions: readonly Definition[],
  sources: readonly RegisteredDesignDefinitionSource<Definition>[],
) {
  const definitions = [
    ...staticDefinitions,
    ...sources.flatMap((source) => source.read()),
  ]
  const byKey = new Map<string, Definition>()

  for (const definition of definitions) {
    if (!definition.id.trim()) {
      throw new Error('Registered design definition id must not be empty')
    }

    const key = getDefinitionKey(definition)

    if (byKey.has(key)) {
      throw new Error(
        `Duplicate registered design definition: ${definition.kind}:${definition.id}`,
      )
    }

    byKey.set(key, definition)
  }

  return {
    byKey,
    definitions: Object.freeze([...definitions]),
  }
}

function createSnapshot<
  Definition extends RegisteredDesignDefinition<object>,
>(
  definitions: readonly Definition[],
  failure: string | null,
  revision: number,
): RegisteredDesignDefinitionCatalogSnapshot<Definition> {
  return Object.freeze({ definitions, failure, revision })
}

function getDefinitionKey(
  definition: Pick<DesignNodeDefinition, 'id' | 'kind'>,
) {
  return JSON.stringify([definition.kind, definition.id])
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
