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

export type CanvasDataTransferImportActionPlanRunAction<TAction> = (
  action: TAction,
  actionIndex: number,
) => boolean

export type CanvasDataTransferImportActionPlanConsumedResult<TAction> =
  Readonly<{
    attemptedActions: readonly TAction[]
    consumed: true
    consumedAction: TAction
    consumedActionIndex: number
  }>

export type CanvasDataTransferImportActionPlanUnconsumedResult<TAction> =
  Readonly<{
    attemptedActions: readonly TAction[]
    consumed: false
    consumedAction: null
    consumedActionIndex: -1
  }>

export type CanvasDataTransferImportActionPlanRunResult<TAction> =
  | CanvasDataTransferImportActionPlanConsumedResult<TAction>
  | CanvasDataTransferImportActionPlanUnconsumedResult<TAction>

export type CanvasDataTransferImportActionPlanRunInput<TAction> = {
  actions: readonly TAction[]
  onConsumed?: (
    result: CanvasDataTransferImportActionPlanConsumedResult<TAction>
  ) => void
  runAction: CanvasDataTransferImportActionPlanRunAction<TAction>
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

export function runCanvasDataTransferImportActionPlan<TAction>({
  actions,
  onConsumed,
  runAction,
}: CanvasDataTransferImportActionPlanRunInput<TAction>):
  CanvasDataTransferImportActionPlanRunResult<TAction> {
  const attemptedActions: TAction[] = []

  for (const [actionIndex, action] of actions.entries()) {
    attemptedActions.push(action)

    if (!runAction(action, actionIndex)) {
      continue
    }

    const result: CanvasDataTransferImportActionPlanConsumedResult<TAction> = {
      attemptedActions: Object.freeze([...attemptedActions]),
      consumed: true,
      consumedAction: action,
      consumedActionIndex: actionIndex,
    }
    onConsumed?.(result)

    return result
  }

  return {
    attemptedActions: Object.freeze([...attemptedActions]),
    consumed: false,
    consumedAction: null,
    consumedActionIndex: -1,
  }
}

function normalizeCanvasDataTransferImportActionValue<TAction>(
  value: CanvasDataTransferImportActionValue<TAction>,
): TAction[] {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? [...value] : [value as TAction]
}
