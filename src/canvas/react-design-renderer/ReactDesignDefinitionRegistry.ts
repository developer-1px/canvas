import {
  createElement,
  type ComponentType,
  type ReactNode,
} from 'react'

import type {
  DesignDocumentRead,
  DesignJSONValue,
  DesignJSONObject,
  DesignNode,
  DesignNodeDefinition,
  DesignNodeId,
} from '../design-document'
import type {
  EditorEngine,
  RegisteredDesignDefinition,
  RegisteredDesignDefinitionKind,
} from '../editor-engine'

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
  readonly 'data-canvas-wheel-passthrough'?: 'scroll' | 'true'
}

export type ReactDesignSlots = Readonly<Record<string, ReactNode>>

export type ReactDesignDefinitionRenderProps = {
  readonly node: DesignNode
  readonly children: ReactNode
  readonly read: DesignDocumentRead
  readonly rootProps: ReactDesignRootProps
  readonly slots: ReactDesignSlots
}

export type ReactRegisteredDesignRenderProps<
  Props extends object = DesignJSONObject,
> = ReactDesignDefinitionRenderProps & {
  readonly props: Props
}

export type ReactRegisteredDesignFallbackProps<
  Props extends object = DesignJSONObject,
> = ReactRegisteredDesignRenderProps<Props> & {
  readonly reason: string
}

export type ReactRegisteredDesignEditProp<
  Props extends object = DesignJSONObject,
> = <Field extends Extract<keyof Props, string>>(
  field: Field,
  value: Props[Field],
  label: string,
) => void

export type ReactRegisteredDesignInspectorProps<
  Props extends object = DesignJSONObject,
> = {
  readonly editor?: EditorEngine
  readonly node: DesignNode
  readonly props: Props
  readonly editProp: ReactRegisteredDesignEditProp<Props>
}

export type ReactDesignDefinition<
  Props extends object = DesignJSONObject,
  Kind extends RegisteredDesignDefinitionKind = RegisteredDesignDefinitionKind,
> = RegisteredDesignDefinition<Props, Kind> & {
  readonly renderer: ComponentType<ReactRegisteredDesignRenderProps<Props>>
  readonly fallback: ComponentType<ReactRegisteredDesignFallbackProps<Props>>
  readonly Inspector?: ComponentType<ReactRegisteredDesignInspectorProps<Props>>
  readonly render: ComponentType<ReactDesignDefinitionRenderProps>
  readonly renderInspector?: (
    input: ReactRegisteredDesignInspectorRuntimeProps,
  ) => ReactNode
}

export type ReactDesignDefinitionRegistration =
  RegisteredDesignDefinition<object> & {
    readonly Inspector?: unknown
    readonly fallback: unknown
    readonly renderer: unknown
    readonly render: ComponentType<ReactDesignDefinitionRenderProps>
    readonly renderInspector?: (
      input: ReactRegisteredDesignInspectorRuntimeProps,
    ) => ReactNode
  }

export type ReactRegisteredDesignInspectorRuntimeProps = {
  readonly editor: EditorEngine
  readonly node: DesignNode
  readonly editProp: (
    field: string,
    value: DesignJSONValue,
    label: string,
  ) => void
}

export type ReactDesignDefinitionAdapter<
  Props extends object,
  Kind extends RegisteredDesignDefinitionKind = RegisteredDesignDefinitionKind,
> = Pick<
  ReactDesignDefinition<Props, Kind>,
  'Inspector' | 'fallback' | 'renderer'
> & {
  readonly definition: RegisteredDesignDefinition<Props, Kind>
}

export type ReactDesignDefinitionResolution =
  | {
      readonly kind: 'intrinsic'
      readonly tag: ReactDesignIntrinsicTag
    }
  | {
      readonly kind: 'registered'
      readonly definition: ReactDesignDefinitionRegistration
    }

export type ReactDesignDefinitionRegistry = {
  resolveRegistered(
    reference: DesignNodeDefinition,
  ): ReactDesignDefinitionRegistration | null
  resolve(
    reference: DesignNodeDefinition,
  ): ReactDesignDefinitionResolution | null
}

export function defineReactDesignDefinition<
  Props extends object,
  const Kind extends RegisteredDesignDefinitionKind,
>({
  definition,
  fallback,
  Inspector,
  renderer,
}: ReactDesignDefinitionAdapter<Props, Kind>): ReactDesignDefinition<Props, Kind> {
  if (typeof renderer !== 'function' || typeof fallback !== 'function') {
    throw new Error(
      `React design definition ${definition.id} requires renderer and fallback`,
    )
  }

  if (Inspector !== undefined && typeof Inspector !== 'function') {
    throw new Error(`Invalid React design definition Inspector: ${definition.id}`)
  }

  const render = (renderProps: ReactDesignDefinitionRenderProps) => {
    const parsed = definition.props.safeParse(renderProps.node.props)

    return parsed.ok
      ? createElement(renderer, { ...renderProps, props: parsed.value })
      : createElement(fallback, {
          ...renderProps,
          props: definition.props.defaults,
          reason: parsed.reason,
        })
  }
  const renderInspector = Inspector
    ? (input: ReactRegisteredDesignInspectorRuntimeProps) => {
        const parsed = definition.props.safeParse(input.node.props)

        return parsed.ok
          ? createElement(Inspector, {
              ...input,
              editProp: input.editProp as ReactRegisteredDesignEditProp<Props>,
              props: parsed.value,
            })
          : null
      }
    : undefined

  return Object.freeze({
    ...definition,
    fallback,
    ...(Inspector ? { Inspector } : {}),
    render,
    ...(renderInspector ? { renderInspector } : {}),
    renderer,
  })
}

export function createReactDesignDefinitionRegistry({
  definitions = [],
  intrinsics,
}: {
  readonly definitions?: readonly ReactDesignDefinitionRegistration[]
  readonly intrinsics: readonly ReactDesignIntrinsicTag[]
}): ReactDesignDefinitionRegistry {
  const intrinsicTags = new Set<ReactDesignIntrinsicTag>()
  const registeredDefinitions = new Map<string, ReactDesignDefinitionRegistration>()

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
    resolveRegistered(reference) {
      if (reference.kind !== 'component' && reference.kind !== 'widget') {
        return null
      }

      return registeredDefinitions.get(
        getRegisteredDefinitionKey({ id: reference.id, kind: reference.kind }),
      ) ?? null
    },
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
  definition: Pick<ReactDesignDefinitionRegistration, 'id' | 'kind'>,
) {
  return JSON.stringify([definition.kind, definition.id])
}

function assertDefinitionId(id: string) {
  if (!id.trim()) {
    throw new Error('React design definition id must not be empty')
  }
}
