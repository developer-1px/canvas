export type DomEditOverlayLayer =
  | 'boxModel'
  | 'flex'
  | 'grid'
  | 'guides'
  | 'selection'
  | 'spacing'

export type DomEditOverlayLayerVisibility =
  Record<DomEditOverlayLayer, boolean>

export const DEFAULT_DOM_EDIT_OVERLAY_LAYER_VISIBILITY = {
  boxModel: true,
  flex: true,
  grid: true,
  guides: true,
  selection: true,
  spacing: true,
} satisfies DomEditOverlayLayerVisibility

export function getDomEditOverlayLayerVisibility(
  visibility?: Partial<DomEditOverlayLayerVisibility> | null,
): DomEditOverlayLayerVisibility {
  return {
    ...DEFAULT_DOM_EDIT_OVERLAY_LAYER_VISIBILITY,
    ...visibility,
    selection: true,
  }
}

export function isDomEditOverlayLayerVisible(
  visibility: Partial<DomEditOverlayLayerVisibility> | null | undefined,
  layer: DomEditOverlayLayer,
) {
  return getDomEditOverlayLayerVisibility(visibility)[layer]
}
