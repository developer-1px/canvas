import {
  createCanvasDataTransferImportActionPlan,
  type CanvasDataTransferImportActionResolverMode,
  type CanvasDataTransferImportActionValue,
} from './CanvasDataTransferImportActionPlan'

export type CanvasDataTransferImportRegistryScope = string

export type CanvasDataTransferImportRegistryResolveInput<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = {
  dataTransfer: DataTransfer | null
  scope: TScope
}

export type CanvasDataTransferImportRegistryResolver<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = {
  id: string
  mode: CanvasDataTransferImportActionResolverMode
  order?: number
  resolve: (
    input: CanvasDataTransferImportRegistryResolveInput<TScope>
  ) => CanvasDataTransferImportActionValue<TAction>
  scope: TScope | readonly TScope[]
  supportedFormats?: readonly string[]
  title?: string
}

export type CanvasDataTransferImportRegistryResolverMetadata<
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = {
  id: string
  mode: CanvasDataTransferImportActionResolverMode
  order: number
  scope: TScope
  supportedFormats: readonly string[]
  title: string
}

export type CanvasDataTransferImportRegistry<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = {
  resolvers: readonly CanvasDataTransferImportRegistryResolver<TAction, TScope>[]
}

export type CanvasDataTransferImportRegistryInput<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = {
  resolvers: readonly CanvasDataTransferImportRegistryResolver<TAction, TScope>[]
}

export type CanvasDataTransferImportRegistryActionPlanInput<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
> = {
  dataTransfer: DataTransfer | null
  registry: CanvasDataTransferImportRegistry<TAction, TScope>
  scope: TScope
}

export function createCanvasDataTransferImportRegistry<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
>({
  resolvers,
}: CanvasDataTransferImportRegistryInput<TAction, TScope>):
  CanvasDataTransferImportRegistry<TAction, TScope> {
  return Object.freeze({
    resolvers: Object.freeze([...resolvers]),
  })
}

export function getCanvasDataTransferImportRegistryMetadata<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
>({
  registry,
  scope,
}: {
  registry: CanvasDataTransferImportRegistry<TAction, TScope>
  scope: TScope
}): CanvasDataTransferImportRegistryResolverMetadata<TScope>[] {
  return getCanvasDataTransferImportRegistryResolvers({
    registry,
    scope,
  }).map((resolver, order) => ({
    id: resolver.id,
    mode: resolver.mode,
    order,
    scope,
    supportedFormats: Object.freeze([...(resolver.supportedFormats ?? [])]),
    title: resolver.title ?? resolver.id,
  }))
}

export function createCanvasDataTransferImportActionPlanFromRegistry<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope =
    CanvasDataTransferImportRegistryScope,
>({
  dataTransfer,
  registry,
  scope,
}: CanvasDataTransferImportRegistryActionPlanInput<TAction, TScope>):
  TAction[] {
  return createCanvasDataTransferImportActionPlan({
    resolvers: getCanvasDataTransferImportRegistryResolvers({
      registry,
      scope,
    }).map((resolver) => ({
      mode: resolver.mode,
      resolve: () => resolver.resolve({ dataTransfer, scope }),
    })),
  })
}

function getCanvasDataTransferImportRegistryResolvers<
  TAction,
  TScope extends CanvasDataTransferImportRegistryScope,
>({
  registry,
  scope,
}: {
  registry: CanvasDataTransferImportRegistry<TAction, TScope>
  scope: TScope
}) {
  return registry.resolvers
    .map((resolver, index) => ({ index, resolver }))
    .filter(({ resolver }) =>
      normalizeCanvasDataTransferImportRegistryScopes(resolver.scope)
        .includes(scope),
    )
    .sort((left, right) =>
      getCanvasDataTransferImportRegistryResolverOrder(left.resolver, left.index) -
      getCanvasDataTransferImportRegistryResolverOrder(right.resolver, right.index)
    )
    .map(({ resolver }) => resolver)
}

function normalizeCanvasDataTransferImportRegistryScopes<
  TScope extends CanvasDataTransferImportRegistryScope,
>(scope: TScope | readonly TScope[]) {
  return Array.isArray(scope) ? [...scope] : [scope]
}

function getCanvasDataTransferImportRegistryResolverOrder(
  resolver: { order?: number },
  fallbackOrder: number,
) {
  return resolver.order === undefined
    ? fallbackOrder
    : resolver.order
}
