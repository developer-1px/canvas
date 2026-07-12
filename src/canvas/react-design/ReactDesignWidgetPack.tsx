import type { ComponentType } from 'react'

import {
  type DesignJSONObject,
  type DesignNode,
} from '../design-document'
import {
  defineRegisteredDesignDefinition,
  type RegisteredDesignCapabilities,
  type RegisteredDesignCreateInput,
  type RegisteredDesignDefinitionInput,
  type RegisteredDesignJSONProps,
  type RegisteredDesignPropsContract,
  type RegisteredDesignPropsParseResult,
  type RegisteredDesignTextEditCapability,
} from '../editor-engine'
import {
  defineReactDesignDefinition,
  type ReactDesignDefinition,
  type ReactDesignDefinitionRegistration,
  type ReactRegisteredDesignEditProp,
  type ReactRegisteredDesignFallbackProps,
  type ReactRegisteredDesignInspectorProps,
  type ReactRegisteredDesignRenderProps,
} from '../react-design-renderer'

export type ReactDesignWidgetPropsParseResult<
  Props extends object = DesignJSONObject,
> = RegisteredDesignPropsParseResult<Props>

export type ReactDesignWidgetPropsContract<
  Props extends object = DesignJSONObject,
> = RegisteredDesignPropsContract<Props>

export type ReactDesignWidgetCreateInput = RegisteredDesignCreateInput

export type ReactDesignWidgetTextEditCapability =
  RegisteredDesignTextEditCapability

export type ReactDesignWidgetCapabilities = RegisteredDesignCapabilities

export type ReactDesignWidgetRenderProps<
  Props extends object = DesignJSONObject,
> = ReactRegisteredDesignRenderProps<Props>

export type ReactDesignWidgetFallbackProps<
  Props extends object = DesignJSONObject,
> = ReactRegisteredDesignFallbackProps<Props>

export type ReactDesignWidgetEditProp<
  Props extends object = DesignJSONObject,
> = ReactRegisteredDesignEditProp<Props>

export type ReactDesignWidgetInspectorProps<
  Props extends object = DesignJSONObject,
> = ReactRegisteredDesignInspectorProps<Props>

export type ReactDesignWidgetDefinition<
  Props extends object = DesignJSONObject,
> = ReactDesignDefinition<Props, 'widget'>

export type ReactDesignWidgetJSONProps<Props extends object> =
  RegisteredDesignJSONProps<Props>

export type ReactDesignWidgetDefinitionInput<Props extends object> =
  RegisteredDesignDefinitionInput<Props, 'widget'> & {
    readonly renderer: ComponentType<ReactDesignWidgetRenderProps<Props>>
    readonly fallback: ComponentType<ReactDesignWidgetFallbackProps<Props>>
    readonly Inspector?: ComponentType<ReactDesignWidgetInspectorProps<Props>>
  }

export type ReactDesignWidgetCreateResult =
  | { readonly ok: true; readonly node: DesignNode }
  | { readonly ok: false; readonly reason: string }

export type ReactDesignWidgetPack = {
  readonly definitions: readonly ReactDesignDefinitionRegistration[]
  resolve(id: string): ReactDesignDefinitionRegistration | null
  create(
    id: string,
    input: ReactDesignWidgetCreateInput,
  ): ReactDesignWidgetCreateResult
  parseProps(
    id: string,
    value: unknown,
  ): ReactDesignWidgetPropsParseResult
}

type ReactDesignWidgetRuntime = {
  readonly definition: ReactDesignDefinitionRegistration
  create(input: ReactDesignWidgetCreateInput): ReactDesignWidgetCreateResult
  parseProps(value: unknown): ReactDesignWidgetPropsParseResult
}

const widgetRuntimeByDefinition = new WeakMap<object, ReactDesignWidgetRuntime>()

export function defineReactDesignWidget<
  Props extends object,
>(
  input: ReactDesignWidgetDefinitionInput<Props>,
): ReactDesignWidgetDefinition<Props> {
  const base = defineRegisteredDesignDefinition<Props, 'widget'>({
    id: input.id,
    kind: input.kind,
    props: input.props,
    create: input.create,
    capabilities: input.capabilities,
  })
  const definition = defineReactDesignDefinition({
    definition: base,
    renderer: input.renderer,
    fallback: input.fallback,
    ...(input.Inspector ? { Inspector: input.Inspector } : {}),
  })
  const parseProps = (value: unknown): ReactDesignWidgetPropsParseResult =>
    definition.props.safeParse(value) as ReactDesignWidgetPropsParseResult
  const runtime: ReactDesignWidgetRuntime = {
    definition,
    create: (createInput) => createWidgetNode(definition, createInput),
    parseProps,
  }

  widgetRuntimeByDefinition.set(definition, runtime)
  return definition
}

export function createReactDesignWidgetPack({
  definitions,
}: {
  readonly definitions: readonly ReactDesignDefinitionRegistration[]
}): ReactDesignWidgetPack {
  const runtimes = new Map<string, ReactDesignWidgetRuntime>()

  for (const candidate of definitions) {
    const runtime = candidate && widgetRuntimeByDefinition.get(candidate)

    if (!runtime || runtime.definition.kind !== 'widget') {
      throw new Error(
        'React design widget packs accept definitions created by defineReactDesignWidget',
      )
    }

    if (runtimes.has(runtime.definition.id)) {
      throw new Error(
        `Duplicate React design widget definition: ${runtime.definition.id}`,
      )
    }

    runtimes.set(runtime.definition.id, runtime)
  }

  return Object.freeze({
    definitions: Object.freeze(
      [...runtimes.values()].map((runtime) => runtime.definition),
    ),
    resolve(id: string) {
      return runtimes.get(id)?.definition ?? null
    },
    create(
      id: string,
      input: ReactDesignWidgetCreateInput,
    ): ReactDesignWidgetCreateResult {
      const runtime = runtimes.get(id)

      return runtime
        ? runtime.create(input)
        : { ok: false, reason: `Unknown React design widget: ${id}` }
    },
    parseProps(
      id: string,
      value: unknown,
    ): ReactDesignWidgetPropsParseResult {
      const runtime = runtimes.get(id)

      return runtime
        ? runtime.parseProps(value)
        : { ok: false, reason: `Unknown React design widget: ${id}` }
    },
  })
}

function createWidgetNode(
  definition: ReactDesignDefinitionRegistration,
  input: ReactDesignWidgetCreateInput,
): ReactDesignWidgetCreateResult {
  try {
    return { ok: true, node: definition.create(input) }
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}
