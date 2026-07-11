import { createElement, type ComponentType, type ReactNode } from 'react'

import {
  createDesignDocument,
  type DesignDocumentRead,
  type DesignJSONObject,
  type DesignNode,
  type DesignNodeId,
} from '../design-document'
import type {
  ReactDesignDefinition,
  ReactDesignDefinitionRenderProps,
  ReactDesignRootProps,
} from '../react-design-renderer'

const REACT_DESIGN_WIDGET_ID_PATTERN =
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*$/

const reactDesignWidgetRuntime = Symbol('ReactDesignWidgetRuntime')

export type ReactDesignWidgetPropsParseResult<
  Props extends object = DesignJSONObject,
> =
  | { readonly ok: true; readonly value: Props }
  | { readonly ok: false; readonly reason: string }

export type ReactDesignWidgetPropsContract<
  Props extends object = DesignJSONObject,
> = {
  readonly defaults: Props
  safeParse(value: unknown): ReactDesignWidgetPropsParseResult<Props>
}

export type ReactDesignWidgetCreateInput = {
  readonly nodeId: DesignNodeId
  readonly x: number
  readonly y: number
}

export type ReactDesignWidgetTextEditCapability =
  | false
  | {
      readonly source: 'node-text'
      readonly multiline: boolean
    }

export type ReactDesignWidgetCapabilities = {
  readonly textEdit: ReactDesignWidgetTextEditCapability
  readonly transform: {
    readonly move: boolean
    readonly resize: boolean
  }
}

export type ReactDesignWidgetRenderProps<
  Props extends object = DesignJSONObject,
> = {
  readonly node: DesignNode
  readonly props: Props
  readonly children: ReactNode
  readonly read: DesignDocumentRead
  readonly rootProps: ReactDesignRootProps
}

export type ReactDesignWidgetFallbackProps<
  Props extends object = DesignJSONObject,
> = ReactDesignWidgetRenderProps<Props> & {
  readonly reason: string
}

export type ReactDesignWidgetEditProp<
  Props extends object = DesignJSONObject,
> = <Field extends Extract<keyof Props, string>>(
  field: Field,
  value: Props[Field],
  label: string,
) => void

export type ReactDesignWidgetInspectorProps<
  Props extends object = DesignJSONObject,
> = {
  readonly node: DesignNode
  readonly props: Props
  readonly editProp: ReactDesignWidgetEditProp<Props>
}

export type ReactDesignWidgetDefinition<
  Props extends object = DesignJSONObject,
> = {
  readonly id: string
  readonly kind: 'widget'
  readonly props: ReactDesignWidgetPropsContract<Props>
  create(input: ReactDesignWidgetCreateInput): DesignNode
  readonly capabilities: ReactDesignWidgetCapabilities
  readonly renderer: ComponentType<ReactDesignWidgetRenderProps<Props>>
  readonly fallback: ComponentType<ReactDesignWidgetFallbackProps<Props>>
  readonly Inspector?: ComponentType<ReactDesignWidgetInspectorProps<Props>>
  readonly [reactDesignWidgetRuntime]: ReactDesignWidgetRuntime
}

export type ReactDesignWidgetJSONProps<Props extends object> = {
  readonly [Field in keyof Props]: ReactDesignWidgetJSONValue<Props[Field]>
}

export type ReactDesignWidgetDefinitionInput<Props extends object> =
  Omit<ReactDesignWidgetDefinition<Props>,
    | 'props'
    | typeof reactDesignWidgetRuntime> & {
      readonly props: Omit<ReactDesignWidgetPropsContract<Props>, 'defaults'> & {
        readonly defaults: Props & ReactDesignWidgetJSONProps<Props>
      }
    }

type ReactDesignWidgetJSONValue<Value> =
  Value extends boolean | number | string | null
    ? Value
    : Value extends readonly (infer Item)[]
      ? readonly ReactDesignWidgetJSONValue<Item>[]
      : Value extends (...args: never[]) => unknown
        ? never
        : Value extends object
          ? { readonly [Field in keyof Value]: ReactDesignWidgetJSONValue<Value[Field]> }
          : never

export type ReactDesignWidgetCreateResult =
  | { readonly ok: true; readonly node: DesignNode }
  | { readonly ok: false; readonly reason: string }

export type ReactDesignWidgetPack = {
  readonly definitions: readonly ReactDesignDefinition[]
  resolve(id: string): ReactDesignWidgetDefinition | null
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
  readonly definition: ReactDesignWidgetDefinition
  readonly renderDefinition: ReactDesignDefinition
  create(input: ReactDesignWidgetCreateInput): ReactDesignWidgetCreateResult
  parseProps(value: unknown): ReactDesignWidgetPropsParseResult
}

type DefinedReactDesignWidget = {
  readonly [reactDesignWidgetRuntime]: ReactDesignWidgetRuntime
}

export function defineReactDesignWidget<
  Props extends object,
>(
  input: ReactDesignWidgetDefinitionInput<Props>,
): ReactDesignWidgetDefinition<Props> {
  assertDefinitionShape(input)
  const inputSafeParse = input.props.safeParse
  const safeParse = (value: unknown): ReactDesignWidgetPropsParseResult<Props> =>
    parseWidgetProps(inputSafeParse, value)
  const parsedDefaults = safeParse(input.props.defaults)

  if (!parsedDefaults.ok) {
    throw new Error(
      `Invalid React design widget defaults for ${input.id}: ${parsedDefaults.reason}`,
    )
  }

  const defaults = parsedDefaults.value
  const capabilities = freezeCapabilities(input.capabilities)
  const definition = {
    ...input,
    props: Object.freeze({
      defaults,
      safeParse,
    }),
    capabilities,
  } as ReactDesignWidgetDefinition<Props>

  const parseProps = (value: unknown): ReactDesignWidgetPropsParseResult =>
    safeParse(value) as unknown as ReactDesignWidgetPropsParseResult
  const runtime: ReactDesignWidgetRuntime = {
    definition: definition as unknown as ReactDesignWidgetDefinition,
    renderDefinition: Object.freeze({
      id: definition.id,
      kind: 'widget',
      render: (renderProps: ReactDesignDefinitionRenderProps) => {
        const parsed = safeParse(renderProps.node.props)

        if (!parsed.ok) {
          return createElement(definition.fallback, {
            ...renderProps,
            props: defaults,
            reason: parsed.reason,
          })
        }

        return createElement(definition.renderer, {
          ...renderProps,
          props: parsed.value,
        })
      },
    }),
    create: (createInput) => createWidgetNode(
      definition,
      parseProps,
      createInput,
    ),
    parseProps,
  }

  Object.defineProperty(definition, reactDesignWidgetRuntime, {
    configurable: false,
    enumerable: false,
    value: runtime,
    writable: false,
  })

  return Object.freeze(definition)
}

export function createReactDesignWidgetPack({
  definitions,
}: {
  readonly definitions: readonly DefinedReactDesignWidget[]
}): ReactDesignWidgetPack {
  const runtimes = new Map<string, ReactDesignWidgetRuntime>()

  for (const candidate of definitions) {
    const runtime = candidate?.[reactDesignWidgetRuntime]

    if (!runtime || runtime.definition.kind !== 'widget') {
      throw new Error(
        'React design widget packs accept definitions created by defineReactDesignWidget',
      )
    }

    assertReactDesignWidgetId(runtime.definition.id)

    if (runtimes.has(runtime.definition.id)) {
      throw new Error(
        `Duplicate React design widget definition: ${runtime.definition.id}`,
      )
    }

    runtimes.set(runtime.definition.id, runtime)
  }

  const renderDefinitions = Object.freeze(
    [...runtimes.values()].map((runtime) => runtime.renderDefinition),
  )

  return Object.freeze({
    definitions: renderDefinitions,
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

function createWidgetNode<Props extends object>(
  definition: ReactDesignWidgetDefinition<Props>,
  parseProps: (value: unknown) => ReactDesignWidgetPropsParseResult,
  input: ReactDesignWidgetCreateInput,
): ReactDesignWidgetCreateResult {
  if (!input.nodeId.trim()) {
    return { ok: false, reason: 'React design widget node id must not be empty' }
  }

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    return {
      ok: false,
      reason: 'React design widget placement must use finite coordinates',
    }
  }

  let node: DesignNode

  try {
    node = definition.create(input)
  } catch (error) {
    return {
      ok: false,
      reason: `React design widget creator failed: ${getErrorReason(error)}`,
    }
  }

  if (!node || typeof node !== 'object') {
    return { ok: false, reason: 'React design widget creator must return a node' }
  }

  if (node.id !== input.nodeId) {
    return {
      ok: false,
      reason: `React design widget creator changed node id: ${input.nodeId}`,
    }
  }

  if (
    node.definition?.kind !== 'widget' ||
    node.definition.id !== definition.id
  ) {
    return {
      ok: false,
      reason: `React design widget creator returned the wrong definition: ${definition.id}`,
    }
  }

  if (!Array.isArray(node.children) || node.children.length > 0) {
    return {
      ok: false,
      reason: 'React design widget creator must return a leaf node',
    }
  }

  if (
    definition.capabilities.textEdit === false
      ? node.text !== null
      : typeof node.text !== 'string'
  ) {
    return {
      ok: false,
      reason: definition.capabilities.textEdit === false
        ? 'React design widget without text editing must use null node text'
        : 'React design widget text editing requires string node text',
    }
  }

  const creatorProps = tryCloneDesignJSONObject(node.props)

  if (!creatorProps) {
    return {
      ok: false,
      reason: 'React design widget creator props must be a JSON object',
    }
  }

  const parsedProps = parseProps(creatorProps)

  if (!parsedProps.ok) {
    return {
      ok: false,
      reason: `Invalid React design widget creator props: ${parsedProps.reason}`,
    }
  }

  try {
    const document = createDesignDocument({
      schemaVersion: 1,
      roots: [node.id],
      nodes: [{ ...node, props: parsedProps.value }],
    })

    return { ok: true, node: document.snapshot.nodes[0] }
  } catch (error) {
    return {
      ok: false,
      reason: `Invalid React design widget creator node: ${getErrorReason(error)}`,
    }
  }
}

function assertDefinitionShape<Props extends object>(
  definition: ReactDesignWidgetDefinitionInput<Props>,
) {
  assertReactDesignWidgetId(definition.id)

  if (definition.kind !== 'widget') {
    throw new Error('React design widget definition kind must be widget')
  }

  if (!definition.props || typeof definition.props.safeParse !== 'function') {
    throw new Error(
      `React design widget definition ${definition.id} requires props.safeParse`,
    )
  }

  if (typeof definition.create !== 'function') {
    throw new Error(
      `React design widget definition ${definition.id} requires create`,
    )
  }

  if (
    typeof definition.renderer !== 'function' ||
    typeof definition.fallback !== 'function'
  ) {
    throw new Error(
      `React design widget definition ${definition.id} requires renderer and fallback`,
    )
  }

  if (
    definition.Inspector !== undefined &&
    typeof definition.Inspector !== 'function'
  ) {
    throw new Error(
      `Invalid React design widget Inspector: ${definition.id}`,
    )
  }

  assertCapabilities(definition.id, definition.capabilities)
}

function assertReactDesignWidgetId(id: string) {
  if (!REACT_DESIGN_WIDGET_ID_PATTERN.test(id)) {
    throw new Error(`Invalid React design widget definition id: ${id}`)
  }
}

function assertCapabilities(
  id: string,
  capabilities: ReactDesignWidgetCapabilities,
) {
  const textEdit = capabilities?.textEdit
  const transform = capabilities?.transform

  if (
    textEdit !== false &&
    (
      !textEdit ||
      textEdit.source !== 'node-text' ||
      typeof textEdit.multiline !== 'boolean'
    )
  ) {
    throw new Error(
      `Invalid React design widget text capability: ${id}`,
    )
  }

  if (
    !transform ||
    typeof transform.move !== 'boolean' ||
    typeof transform.resize !== 'boolean'
  ) {
    throw new Error(
      `Invalid React design widget transform capability: ${id}`,
    )
  }
}

function freezeCapabilities(
  capabilities: ReactDesignWidgetCapabilities,
): ReactDesignWidgetCapabilities {
  return Object.freeze({
    textEdit: capabilities.textEdit === false
      ? false
      : Object.freeze({ ...capabilities.textEdit }),
    transform: Object.freeze({ ...capabilities.transform }),
  })
}

function parseWidgetProps<Props extends object>(
  safeParse: ReactDesignWidgetPropsContract<Props>['safeParse'],
  value: unknown,
): ReactDesignWidgetPropsParseResult<Props> {
  let result: ReactDesignWidgetPropsParseResult<Props>

  try {
    result = safeParse(value)
  } catch (error) {
    return {
      ok: false,
      reason: `Widget props parser failed: ${getErrorReason(error)}`,
    }
  }

  if (!result || typeof result !== 'object' || typeof result.ok !== 'boolean') {
    return { ok: false, reason: 'Widget props parser returned an invalid result' }
  }

  if (!result.ok) {
    return {
      ok: false,
      reason: typeof result.reason === 'string' && result.reason.trim()
        ? result.reason
        : 'Widget props parser rejected the value',
    }
  }

  const cloned = tryCloneDesignJSONObject(result.value)

  return cloned
    ? { ok: true, value: deepFreeze(cloned) as Props }
    : { ok: false, reason: 'Widget props must be a JSON object' }
}

function tryCloneDesignJSONObject(value: unknown): DesignJSONObject | null {
  try {
    if (!isPlainObject(value)) {
      return null
    }

    return cloneDesignJSONObject(value as DesignJSONObject)
  } catch {
    return null
  }
}

function cloneDesignJSONObject(value: DesignJSONObject): DesignJSONObject {
  return cloneDesignJSONValue(value, new WeakSet()) as DesignJSONObject
}

function cloneDesignJSONValue(value: unknown, ancestors: WeakSet<object>): unknown {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('JSON numbers must be finite')
    }

    return value
  }

  if (typeof value !== 'object') {
    throw new Error('Value is not JSON')
  }

  if (ancestors.has(value)) {
    throw new Error('JSON values cannot contain cycles')
  }

  ancestors.add(value)

  try {
    if (Array.isArray(value)) {
      assertDenseDesignJSONArray(value)
      return value.map((child) => cloneDesignJSONValue(child, ancestors))
    }

    if (!isPlainObject(value)) {
      throw new Error('JSON objects must use a plain prototype')
    }

    const keys = Object.keys(value)

    if (Reflect.ownKeys(value).length !== keys.length) {
      throw new Error('JSON objects require enumerable string keys')
    }

    return Object.fromEntries(keys.map((key) => [
      key,
      cloneDesignJSONValue(
        (value as Record<string, unknown>)[key],
        ancestors,
      ),
    ]))
  } finally {
    ancestors.delete(value)
  }
}

function assertDenseDesignJSONArray(value: readonly unknown[]) {
  const keys = Object.keys(value)
  const hasDenseIndexes = keys.length === value.length &&
    keys.every((key, index) => key === String(index))

  if (
    !hasDenseIndexes ||
    Reflect.ownKeys(value).length !== value.length + 1
  ) {
    throw new Error('JSON arrays must contain only dense indexes')
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value) as unknown

  return prototype === Object.prototype || prototype === null
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  for (const child of Object.values(value)) {
    deepFreeze(child)
  }

  return value
}

function getErrorReason(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
