import type {
  CanvasItem,
} from '../../entities'
import {
  canReorderCanvasItems,
  type CanvasZOrderMode,
} from '../../host'

const CANVAS_APP_SELECTION_LAYER_ORDER_MODES = [
  'bringForward',
  'bringToFront',
  'sendBackward',
  'sendToBack',
] as const satisfies readonly CanvasZOrderMode[]

export function getCanvasAppSelectionLayerOrderAvailability({
  disabled,
  items,
  selection,
}: {
  disabled: boolean
  items: CanvasItem[]
  selection: string[]
}): Record<CanvasZOrderMode, boolean> {
  return Object.fromEntries(
    CANVAS_APP_SELECTION_LAYER_ORDER_MODES.map((mode) => [
      mode,
      !disabled && canReorderCanvasItems(items, selection, mode),
    ]),
  ) as Record<CanvasZOrderMode, boolean>
}
