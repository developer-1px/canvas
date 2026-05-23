import type {
  CanvasAppAssembly,
  CanvasAppItemAdapters,
} from './CanvasAppAssembly'

type CanvasAppAssemblyAdapterSnapshot = Pick<
  CanvasAppAssembly,
  'itemAdapters' | 'itemLayerAdapter' | 'stageAdapter'
>

export function snapshotCanvasAppAssemblyAdapters({
  itemAdapters,
  itemLayerAdapter,
  stageAdapter,
}: CanvasAppAssemblyAdapterSnapshot): CanvasAppAssemblyAdapterSnapshot {
  return Object.freeze({
    itemAdapters: snapshotCanvasAppItemAdapters(itemAdapters),
    itemLayerAdapter: Object.freeze({ ...itemLayerAdapter }),
    stageAdapter: Object.freeze({ ...stageAdapter }),
  })
}

function snapshotCanvasAppItemAdapters(
  itemAdapters: CanvasAppItemAdapters,
): CanvasAppItemAdapters {
  return Object.freeze({
    command: Object.freeze({ ...itemAdapters.command }),
    creation: Object.freeze({ ...itemAdapters.creation }),
    transform: Object.freeze({ ...itemAdapters.transform }),
  })
}
