import type {
  DomEditModelAdapter,
  DomEditNodeId,
  DomEditState,
} from '../../shared/model/DomEditTypes'

export function resolveDomEditClickTarget<
  TNodeId extends DomEditNodeId,
  TState extends DomEditState<TNodeId>,
>({
  adapter,
  exactTarget = false,
  root,
  selectedNodeId,
  target,
}: {
  adapter: DomEditModelAdapter<TNodeId, TState>
  exactTarget?: boolean
  root: HTMLElement
  selectedNodeId: TNodeId | null
  target: EventTarget | null
}): TNodeId | null {
  if (!(target instanceof Element)) {
    return null
  }

  const chain = getDomEditElementChain(root, target)

  if (chain.length === 0) {
    return null
  }

  if (!selectedNodeId) {
    return adapter.readNodeId(chain[0])
  }

  if (exactTarget) {
    return adapter.readNodeId(chain.at(-1) ?? null)
  }

  const selectedIndex = chain.findIndex((element) =>
    adapter.readNodeId(element) === selectedNodeId)

  if (selectedIndex >= 0 && selectedIndex < chain.length - 1) {
    return adapter.readNodeId(chain[selectedIndex + 1])
  }

  return adapter.readNodeId(chain.at(-1) ?? null)
}

function getDomEditElementChain(root: HTMLElement, target: Element) {
  const chain: HTMLElement[] = []
  let current: Element | null = target

  while (current && current !== root.parentElement) {
    if (
      current instanceof HTMLElement &&
      current.hasAttribute('data-dom-edit-node') &&
      root.contains(current)
    ) {
      chain.unshift(current)
    }

    if (current === root) {
      break
    }

    current = current.parentElement
  }

  return chain
}
