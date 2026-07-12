import type {
  DesignJSONObject,
  DesignNode,
  DesignNodeDefinition,
  DesignNodeId,
} from '../design-document'
import { parseDesignNode } from '../design-document/DesignDocumentSchema'

const REGISTERED_DESIGN_DEFINITION_ID_PATTERN =
  /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:-[a-z0-9]+)*)*$/

export type RegisteredDesignDefinitionKind = Exclude<
  DesignNodeDefinition['kind'],
  'intrinsic'
>

export type RegisteredDesignPropsParseResult<
  Props extends object = DesignJSONObject,
> =
  | { readonly ok: true; readonly value: Props }
  | { readonly ok: false; readonly reason: string }

export type RegisteredDesignPropsContract<
  Props extends object = DesignJSONObject,
> = {
  readonly defaults: Props
  safeParse(value: unknown): RegisteredDesignPropsParseResult<Props>
}

export type RegisteredDesignCreateInput = {
  readonly nodeId: DesignNodeId
  readonly x: number
  readonly y: number
}

export type RegisteredDesignTextEditCapability =
  | false
  | {
      readonly source: 'node-text'
      readonly multiline: boolean
    }

export type RegisteredDesignCapabilities = {
  readonly textEdit: RegisteredDesignTextEditCapability
  readonly transform: {
    readonly move: boolean
    readonly resize: boolean
  }
}

export type RegisteredDesignDefinition<
  Props extends object = object,
  Kind extends RegisteredDesignDefinitionKind = RegisteredDesignDefinitionKind,
> = {
  readonly id: string
  readonly kind: Kind
  readonly props: RegisteredDesignPropsContract<Props>
  create(input: RegisteredDesignCreateInput): DesignNode
  ownCreatedNode(
    input: RegisteredDesignCreateInput,
    createNode: () => unknown,
  ): DesignNode
  readonly capabilities: RegisteredDesignCapabilities
}

export type RegisteredDesignDefinitionResolver = {
  resolveRegistered(
    reference: DesignNodeDefinition,
  ): RegisteredDesignDefinition<object> | null
}

export type RegisteredDesignJSONProps<Props extends object> = {
  readonly [Field in keyof Props]: RegisteredDesignJSONValue<Props[Field]>
}

export type RegisteredDesignDefinitionInput<
  Props extends object,
  Kind extends RegisteredDesignDefinitionKind = RegisteredDesignDefinitionKind,
> = Omit<
  RegisteredDesignDefinition<Props, Kind>,
  'ownCreatedNode' | 'props'
> & {
  readonly props: Omit<RegisteredDesignPropsContract<Props>, 'defaults'> & {
    readonly defaults: Props & RegisteredDesignJSONProps<Props>
  }
}

type RegisteredDesignJSONValue<Value> =
  Value extends boolean | number | string | null
    ? Value
    : Value extends readonly (infer Item)[]
      ? readonly RegisteredDesignJSONValue<Item>[]
      : Value extends (...args: never[]) => unknown
        ? never
        : Value extends object
          ? { readonly [Field in keyof Value]: RegisteredDesignJSONValue<Value[Field]> }
          : never

export function defineRegisteredDesignDefinition<
  Props extends object,
  const Kind extends RegisteredDesignDefinitionKind,
>(
  input: RegisteredDesignDefinitionInput<Props, Kind>,
): RegisteredDesignDefinition<Props, Kind> {
  assertRegisteredDesignDefinitionShape(input)
  const inputSafeParse = input.props.safeParse
  const inputCreate = input.create
  const definitionId = input.id
  const definitionKind = input.kind
  const safeParse = (value: unknown): RegisteredDesignPropsParseResult<Props> =>
    parseRegisteredDesignProps(inputSafeParse, value)
  const parsedDefaults = safeParse(input.props.defaults)

  if (!parsedDefaults.ok) {
    throw new Error(
      `Invalid registered design definition defaults for ${input.id}: ${parsedDefaults.reason}`,
    )
  }

  const capabilities = freezeCapabilities(input.capabilities)
  const ownCreatedNode = (
    createInput: RegisteredDesignCreateInput,
    createNode: () => unknown,
  ) => {
    assertRegisteredDesignCreateInput(definitionId, createInput)
    let candidate: unknown

    try {
      candidate = createNode()
    } catch (error) {
      throw new Error(
        `Registered design definition ${definitionId} creator failed: ${
          getErrorReason(error)
        }`,
        { cause: error },
      )
    }

    return ownRegisteredDesignNode({
      capabilities,
      candidate,
      definitionId,
      definitionKind,
      input: createInput,
      safeParse,
    })
  }
  const create = (createInput: RegisteredDesignCreateInput) =>
    ownCreatedNode(createInput, () => inputCreate(createInput))

  return Object.freeze({
    ...input,
    create,
    ownCreatedNode,
    props: Object.freeze({
      defaults: parsedDefaults.value,
      safeParse,
    }),
    capabilities,
  })
}

function ownRegisteredDesignNode<Props extends object>({
  candidate,
  capabilities,
  definitionId,
  definitionKind,
  input,
  safeParse,
}: {
  readonly candidate: unknown
  readonly capabilities: RegisteredDesignCapabilities
  readonly definitionId: string
  readonly definitionKind: RegisteredDesignDefinitionKind
  readonly input: RegisteredDesignCreateInput
  readonly safeParse: RegisteredDesignPropsContract<Props>['safeParse']
}) {
  assertRegisteredDesignCreateInput(definitionId, input)

  if (!candidate || typeof candidate !== 'object') {
    throw new Error(
      `Registered design definition ${definitionId} creator must return a node`,
    )
  }

  const node = candidate as DesignNode

  if (node.id !== input.nodeId) {
    throw new Error(
      `Registered design definition ${definitionId} creator changed node id: ${input.nodeId}`,
    )
  }

  if (
    node.definition?.id !== definitionId ||
    node.definition.kind !== definitionKind
  ) {
    throw new Error(
      `Registered design definition ${definitionId} creator returned the wrong definition`,
    )
  }

  if (!Array.isArray(node.children) || node.children.length > 0) {
    throw new Error(
      `Registered design definition ${definitionId} creator must return a leaf node`,
    )
  }

  if (
    capabilities.textEdit === false
      ? node.text !== null
      : typeof node.text !== 'string'
  ) {
    throw new Error(
      capabilities.textEdit === false
        ? `Registered design definition ${definitionId} without text editing must use null node text`
        : `Registered design definition ${definitionId} text editing requires string node text`,
    )
  }

  if (
    capabilities.textEdit !== false &&
    !capabilities.textEdit.multiline &&
    typeof node.text === 'string' &&
    /[\r\n]/.test(node.text)
  ) {
    throw new Error(
      `Registered design definition ${definitionId} requires single-line text`,
    )
  }

  if (!tryCloneDesignJSONObject(node.props)) {
    throw new Error(
      `Registered design definition ${definitionId} creator props must be a JSON object`,
    )
  }

  const parsedProps = safeParse(node.props)

  if (!parsedProps.ok) {
    throw new Error(
      `Invalid registered design definition ${definitionId} creator props: ${parsedProps.reason}`,
    )
  }

  try {
    return deepFreeze(parseDesignNode({
      ...node,
      props: parsedProps.value,
    }))
  } catch (error) {
    throw new Error(
      `Invalid registered design definition ${definitionId} creator node: ${
        getErrorReason(error)
      }`,
      { cause: error },
    )
  }
}

function assertRegisteredDesignCreateInput(
  definitionId: string,
  input: RegisteredDesignCreateInput,
) {
  if (!input.nodeId.trim()) {
    throw new Error(
      `Registered design definition ${definitionId} requires a node id`,
    )
  }

  if (!Number.isFinite(input.x) || !Number.isFinite(input.y)) {
    throw new Error(
      `Registered design definition ${definitionId} requires finite placement`,
    )
  }
}

function assertRegisteredDesignDefinitionShape<
  Props extends object,
  Kind extends RegisteredDesignDefinitionKind,
>(definition: RegisteredDesignDefinitionInput<Props, Kind>) {
  if (!REGISTERED_DESIGN_DEFINITION_ID_PATTERN.test(definition.id)) {
    throw new Error(`Invalid registered design definition id: ${definition.id}`)
  }

  if (definition.kind !== 'component' && definition.kind !== 'widget') {
    throw new Error(
      `Invalid registered design definition kind: ${String(definition.kind)}`,
    )
  }

  if (!definition.props || typeof definition.props.safeParse !== 'function') {
    throw new Error(
      `Registered design definition ${definition.id} requires props.safeParse`,
    )
  }

  if (typeof definition.create !== 'function') {
    throw new Error(
      `Registered design definition ${definition.id} requires create`,
    )
  }

  assertCapabilities(definition.id, definition.capabilities)
}

function assertCapabilities(
  id: string,
  capabilities: RegisteredDesignCapabilities,
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
    throw new Error(`Invalid registered design text capability: ${id}`)
  }

  if (
    !transform ||
    typeof transform.move !== 'boolean' ||
    typeof transform.resize !== 'boolean'
  ) {
    throw new Error(`Invalid registered design transform capability: ${id}`)
  }
}

function freezeCapabilities(
  capabilities: RegisteredDesignCapabilities,
): RegisteredDesignCapabilities {
  return Object.freeze({
    textEdit: capabilities.textEdit === false
      ? false
      : Object.freeze({ ...capabilities.textEdit }),
    transform: Object.freeze({ ...capabilities.transform }),
  })
}

function parseRegisteredDesignProps<Props extends object>(
  safeParse: RegisteredDesignPropsContract<Props>['safeParse'],
  value: unknown,
): RegisteredDesignPropsParseResult<Props> {
  let result: RegisteredDesignPropsParseResult<Props>

  try {
    result = safeParse(value)
  } catch (error) {
    return {
      ok: false,
      reason: `Registered definition props parser failed: ${getErrorReason(error)}`,
    }
  }

  if (!result || typeof result !== 'object' || typeof result.ok !== 'boolean') {
    return {
      ok: false,
      reason: 'Registered definition props parser returned an invalid result',
    }
  }

  if (!result.ok) {
    return {
      ok: false,
      reason: typeof result.reason === 'string' && result.reason.trim()
        ? result.reason
        : 'Registered definition props parser rejected the value',
    }
  }

  const cloned = tryCloneDesignJSONObject(result.value)

  return cloned
    ? { ok: true, value: deepFreeze(cloned) as Props }
    : { ok: false, reason: 'Registered definition props must be a JSON object' }
}

function tryCloneDesignJSONObject(value: unknown): DesignJSONObject | null {
  try {
    if (!isPlainObject(value)) {
      return null
    }

    return cloneDesignJSONValue(value, new WeakSet()) as DesignJSONObject
  } catch {
    return null
  }
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

  if (typeof value !== 'object' || ancestors.has(value)) {
    throw new Error('Value is not JSON')
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
      cloneDesignJSONValue(value[key], ancestors),
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
