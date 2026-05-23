import type {
  CanvasAppAssemblyAdapters,
  CanvasAppItemAdapters,
} from './CanvasAppAdapterContracts'

export function snapshotCanvasAppAssemblyAdapters({
  itemAdapters,
  itemLayerAdapter,
  stageAdapter,
}: CanvasAppAssemblyAdapters): CanvasAppAssemblyAdapters {
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
