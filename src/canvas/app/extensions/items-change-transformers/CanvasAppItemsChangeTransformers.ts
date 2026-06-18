import type { CanvasCommandItem } from '../../../foundation'
import type { CanvasItem } from '../../../entities'
import type {
  CanvasComponentDefinitionRegistry,
} from '../../../host'
import type {
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'

export type CanvasAppItemsChangeTransformContext<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  change: CanvasAppItemsChange<TItem>
  componentDefinitionRegistry: CanvasComponentDefinitionRegistry
  currentItems: readonly TItem[]
}

export type CanvasAppItemsChangeTransformer<
  TItem extends CanvasCommandItem = CanvasItem,
> = {
  id: string
  transform: (
    context: CanvasAppItemsChangeTransformContext<TItem>,
  ) => CanvasAppItemsChange<TItem>
}

export function transformCanvasAppItemsChange<
  TItem extends CanvasCommandItem = CanvasItem,
>({
  change,
  componentDefinitionRegistry,
  currentItems,
  transformers,
}: CanvasAppItemsChangeTransformContext<TItem> & {
  transformers: readonly CanvasAppItemsChangeTransformer<TItem>[]
}): CanvasAppItemsChange<TItem> {
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
