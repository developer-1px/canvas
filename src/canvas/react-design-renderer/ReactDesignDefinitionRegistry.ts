import type React from 'react'

import type {
  DesignDocumentRead,
  DesignNode,
  DesignNodeDefinition,
  DesignNodeId,
} from '../design-document'

export type ReactDesignIntrinsicTag = Exclude<
  Extract<keyof React.JSX.IntrinsicElements, keyof HTMLElementTagNameMap>,
  'canvas'
>

export type ReactDesignRootProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'children'
> & {
  readonly ref: (element: HTMLElement | null) => void
  readonly 'data-design-node-id': DesignNodeId
  readonly 'data-design-definition-id': string
  readonly 'data-design-frame-root'?: true
}

export type ReactDesignDefinitionRenderProps = {
  readonly node: DesignNode
  readonly children: React.ReactNode
  readonly read: DesignDocumentRead
  readonly rootProps: ReactDesignRootProps
}

export type ReactDesignDefinition = {
  readonly id: string
  readonly kind: 'component' | 'widget'
  readonly render: React.ComponentType<ReactDesignDefinitionRenderProps>
}

export type ReactDesignDefinitionResolution =
  | {
      readonly kind: 'intrinsic'
      readonly tag: ReactDesignIntrinsicTag
    }
  | {
      readonly kind: 'registered'
      readonly definition: ReactDesignDefinition
    }

export type ReactDesignDefinitionRegistry = {
  resolve(
    reference: DesignNodeDefinition,
  ): ReactDesignDefinitionResolution | null
}

export function createReactDesignDefinitionRegistry({
  definitions = [],
  intrinsics,
}: {
  readonly definitions?: readonly ReactDesignDefinition[]
  readonly intrinsics: readonly ReactDesignIntrinsicTag[]
}): ReactDesignDefinitionRegistry {
  const intrinsicTags = new Set<ReactDesignIntrinsicTag>()
  const registeredDefinitions = new Map<string, ReactDesignDefinition>()

  for (const tag of intrinsics) {
    assertDefinitionId(tag)

    if ((tag as string) === 'canvas') {
      throw new Error('React design intrinsic is not supported: canvas')
    }

    const key = `intrinsic:${tag}`

    if (intrinsicTags.has(tag)) {
      throw new Error(`Duplicate React design definition: ${key}`)
    }

    intrinsicTags.add(tag)
  }

  for (const definition of definitions) {
    assertDefinitionId(definition.id)
    const key = getRegisteredDefinitionKey(definition)

    if (registeredDefinitions.has(key)) {
      throw new Error(
        `Duplicate React design definition: ${definition.kind}:${definition.id}`,
      )
    }

    registeredDefinitions.set(key, Object.freeze({ ...definition }))
  }

  return {
    resolve(reference) {
      if (reference.kind === 'intrinsic') {
        return intrinsicTags.has(reference.id as ReactDesignIntrinsicTag)
          ? {
              kind: 'intrinsic',
              tag: reference.id as ReactDesignIntrinsicTag,
            }
          : null
      }

      if (reference.kind !== 'component' && reference.kind !== 'widget') {
        return null
      }

      const definition = registeredDefinitions.get(
        getRegisteredDefinitionKey({ id: reference.id, kind: reference.kind }),
      )

      return definition ? { kind: 'registered', definition } : null
    },
  }
}

function getRegisteredDefinitionKey(
  definition: Pick<ReactDesignDefinition, 'id' | 'kind'>,
) {
  return JSON.stringify([definition.kind, definition.id])
}

function assertDefinitionId(id: string) {
  if (!id.trim()) {
    throw new Error('React design definition id must not be empty')
  }
}
