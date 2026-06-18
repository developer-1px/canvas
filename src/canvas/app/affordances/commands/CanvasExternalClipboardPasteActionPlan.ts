import type {
  CanvasDataTransferImportActionResolverMode,
  CanvasDataTransferImportActionValue,
} from './CanvasDataTransferImportActionPlan'

export type CanvasExternalClipboardReadClipboard = {
  read?: () => Promise<readonly ClipboardItem[]>
}

export type CanvasExternalClipboardPasteActionResolverInput = {
  clipboard: CanvasExternalClipboardReadClipboard | null
}

export type CanvasExternalClipboardPasteActionResolveValue<TAction> =
  | CanvasDataTransferImportActionValue<TAction>
  | Promise<CanvasDataTransferImportActionValue<TAction>>

export type CanvasExternalClipboardPasteActionResolver<TAction> = {
  id: string
  mode: CanvasDataTransferImportActionResolverMode
  order?: number
  resolve: (
    input: CanvasExternalClipboardPasteActionResolverInput
  ) => CanvasExternalClipboardPasteActionResolveValue<TAction>
  supportedFormats?: readonly string[]
  title?: string
}

export type CanvasExternalClipboardPasteActionPlanInput<TAction> = {
  clipboard?: CanvasExternalClipboardReadClipboard | null
  resolvers: readonly CanvasExternalClipboardPasteActionResolver<TAction>[]
}

export type CanvasExternalClipboardImagePasteActionResolverInput<
  TAction,
  TImageSource,
> = {
  createAction: (
    source: TImageSource,
  ) => CanvasDataTransferImportActionValue<TAction>
  id?: string
  mode?: CanvasDataTransferImportActionResolverMode
  order?: number
  readImageSource: () => Promise<TImageSource | null>
  supportedFormats?: readonly string[]
  title?: string
}

export type CanvasExternalClipboardPasteCommandTrigger =
  | 'explicit-command'
  | 'keyboard-shortcut'

export type CanvasExternalClipboardPasteCommandRoute =
  | 'external-clipboard'
  | 'internal-clipboard'
  | 'native-paste-event'
  | 'none'

export type CanvasExternalClipboardPasteCommandRouteInput = {
  clipboard?: CanvasExternalClipboardReadClipboard | null
  hasInternalClipboard: boolean
  trigger?: CanvasExternalClipboardPasteCommandTrigger
}

export type CanvasExternalClipboardReadSupportInput = {
  clipboard?: CanvasExternalClipboardReadClipboard | null
}

export async function createCanvasExternalClipboardPasteActionPlan<TAction>({
  clipboard = getCanvasExternalClipboardNavigatorClipboard(),
  resolvers,
}: CanvasExternalClipboardPasteActionPlanInput<TAction>): Promise<TAction[]> {
  const actions: TAction[] = []

  for (const resolver of getCanvasExternalClipboardPasteActionResolvers(
    resolvers,
  )) {
    const resolved = normalizeCanvasExternalClipboardPasteActionValue(
      await resolveCanvasExternalClipboardPasteAction({
        clipboard,
        resolver,
      }),
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

export function createCanvasExternalClipboardImagePasteActionResolver<
  TAction,
  TImageSource,
>({
  createAction,
  id = 'clipboard-image',
  mode = 'exclusive',
  order = 0,
  readImageSource,
  supportedFormats = ['image/*'],
  title = 'Clipboard image',
}: CanvasExternalClipboardImagePasteActionResolverInput<
  TAction,
  TImageSource
>): CanvasExternalClipboardPasteActionResolver<TAction> {
  return {
    id,
    mode,
    order,
    resolve: async () => {
      const source = await readImageSource()

      return source === null ? null : createAction(source)
    },
    supportedFormats,
    title,
  }
}

export function canReadCanvasExternalClipboard({
  clipboard = getCanvasExternalClipboardNavigatorClipboard(),
}: CanvasExternalClipboardReadSupportInput = {}) {
  return typeof clipboard?.read === 'function'
}

export function getCanvasExternalClipboardPasteCommandRoute({
  clipboard = getCanvasExternalClipboardNavigatorClipboard(),
  hasInternalClipboard,
  trigger = 'explicit-command',
}: CanvasExternalClipboardPasteCommandRouteInput):
  CanvasExternalClipboardPasteCommandRoute {
  if (hasInternalClipboard) {
    return 'internal-clipboard'
  }

  if (trigger === 'keyboard-shortcut') {
    return 'native-paste-event'
  }

  return canReadCanvasExternalClipboard({ clipboard })
    ? 'external-clipboard'
    : 'none'
}

async function resolveCanvasExternalClipboardPasteAction<TAction>({
  clipboard,
  resolver,
}: {
  clipboard: CanvasExternalClipboardReadClipboard | null
  resolver: CanvasExternalClipboardPasteActionResolver<TAction>
}) {
  try {
    return await resolver.resolve({ clipboard })
  } catch {
    return null
  }
}

function getCanvasExternalClipboardPasteActionResolvers<TAction>(
  resolvers: readonly CanvasExternalClipboardPasteActionResolver<TAction>[],
) {
  return resolvers
    .map((resolver, index) => ({ index, resolver }))
    .sort((left, right) =>
      getCanvasExternalClipboardPasteActionResolverOrder(
        left.resolver,
        left.index,
      ) -
      getCanvasExternalClipboardPasteActionResolverOrder(
        right.resolver,
        right.index,
      )
    )
    .map(({ resolver }) => resolver)
}

function getCanvasExternalClipboardPasteActionResolverOrder(
  resolver: { order?: number },
  fallbackOrder: number,
) {
  return resolver.order === undefined
    ? fallbackOrder
    : resolver.order
}

function normalizeCanvasExternalClipboardPasteActionValue<TAction>(
  value: CanvasDataTransferImportActionValue<TAction>,
): TAction[] {
  if (value === null || value === undefined) {
    return []
  }

  return Array.isArray(value) ? [...value] : [value as TAction]
}

function getCanvasExternalClipboardNavigatorClipboard():
  CanvasExternalClipboardReadClipboard | null {
  if (typeof navigator === 'undefined') {
    return null
  }

  return navigator.clipboard ?? null
}
