type CanvasKeyboardIntent = {
  kind: string
}

type CanvasKeyboardIntentRunner<
  TIntent extends CanvasKeyboardIntent,
  THandlers,
  TKind extends TIntent['kind'],
> = (args: {
  handlers: THandlers
  intent: Extract<TIntent, { kind: TKind }>
}) => void

type CanvasKeyboardIntentRunnerTable<
  TIntent extends CanvasKeyboardIntent,
  THandlers,
> = Partial<{
  [TKind in TIntent['kind']]:
    CanvasKeyboardIntentRunner<TIntent, THandlers, TKind>
}>

export function createCanvasKeyboardIntentDispatchTable<
  TIntent extends CanvasKeyboardIntent,
  THandlers,
>() {
  return <
    const TRunners extends CanvasKeyboardIntentRunnerTable<
      TIntent,
      THandlers
    >,
  >(runners: TRunners) => {
    type TSupportedKind = Extract<keyof TRunners, TIntent['kind']>
    type TSupportedIntent = Extract<TIntent, { kind: TSupportedKind }>

    const frozenRunners = Object.freeze(runners)

    return {
      hasKind(kind: string): kind is TSupportedKind {
        return Object.prototype.hasOwnProperty.call(frozenRunners, kind)
      },
      run({
        handlers,
        intent,
      }: {
        handlers: THandlers
        intent: TSupportedIntent
      }) {
        const runner = frozenRunners[
          intent.kind as TSupportedKind
        ] as unknown as (args: {
          handlers: THandlers
          intent: TSupportedIntent
        }) => void

        runner({ handlers, intent })
      },
      runners: frozenRunners,
    } as const
  }
}
