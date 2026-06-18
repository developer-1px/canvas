export type CanvasDataTransferImportActionResolverMode =
  | 'append'
  | 'exclusive'

export type CanvasDataTransferImportActionValue<TAction> =
  | TAction
  | readonly TAction[]
  | null
  | undefined

export type CanvasDataTransferImportActionResolver<TAction> = {
  mode: CanvasDataTransferImportActionResolverMode
  resolve: () => CanvasDataTransferImportActionValue<TAction>
}

export type CanvasDataTransferImportActionPlanInput<TAction> = {
  resolvers: readonly CanvasDataTransferImportActionResolver<TAction>[]
}

export function createCanvasDataTransferImportActionPlan<TAction>({
  resolvers,
}: CanvasDataTransferImportActionPlanInput<TAction>): TAction[] {
  const actions: TAction[] = []

  for (const resolver of resolvers) {
    const resolved = normalizeCanvasDataTransferImportActionValue(
      resolver.resolve(),
    )

    if (resolved.length === 0) {
      continue
    }

    if (resolver.mode === 'exclusive') {
      return resolved
    }

    actions.push(...resolved)
  }

  return actions
}

function normalizeCanvasDataTransferImportActionValue<TAction>(
  value: CanvasDataTransferImportActionValue<TAction>,
): TAction[] {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? [...value] : [value as TAction]
}
