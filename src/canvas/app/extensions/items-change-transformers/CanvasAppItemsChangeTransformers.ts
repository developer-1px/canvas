import type { CanvasItem } from '../../../entities'
import type {
  CanvasComponentDefinitionRegistry,
} from '../../../host'
import type {
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'

export type CanvasAppItemsChangeTransformContext = {
  change: CanvasAppItemsChange
  componentDefinitionRegistry: CanvasComponentDefinitionRegistry
  currentItems: readonly CanvasItem[]
}

export type CanvasAppItemsChangeTransformer = {
  id: string
  transform: (
    context: CanvasAppItemsChangeTransformContext,
  ) => CanvasAppItemsChange
}

export function transformCanvasAppItemsChange({
  change,
  componentDefinitionRegistry,
  currentItems,
  transformers,
}: CanvasAppItemsChangeTransformContext & {
  transformers: readonly CanvasAppItemsChangeTransformer[]
}): CanvasAppItemsChange {
  return transformers.reduce(
    (currentChange, transformer) =>
      transformer.transform({
        change: currentChange,
        componentDefinitionRegistry,
        currentItems,
      }),
    change,
  )
}
