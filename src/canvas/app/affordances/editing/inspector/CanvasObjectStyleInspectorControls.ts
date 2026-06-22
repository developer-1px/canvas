import type { CanvasItem } from '../../../../entities'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import {
  CANVAS_ARROW_ROUTING_SEGMENTS,
  CANVAS_ARROWHEAD_SEGMENTS,
  CANVAS_OBJECT_FILL_COLORS,
  CANVAS_OBJECT_STROKE_COLORS,
  CANVAS_TEXT_ALIGN_SEGMENTS,
} from './CanvasObjectStyleInspectorPresets'
import {
  getCanvasObjectColorStyleControl,
} from './CanvasObjectColorStyleControl'
import {
  getCanvasObjectNumberStyleControl,
} from './CanvasObjectNumberStyleControl'
import {
  getCanvasObjectSegmentedStyleControl,
} from './CanvasObjectSegmentedStyleControl'
import type {
  CanvasObjectStyleControl,
} from './CanvasObjectStyleInspectorContracts'

export function getCanvasObjectStyleControls({
  commitItemsChange,
  disabled,
  enabled = true,
  items,
  selectedItems,
  selection,
}: {
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  enabled?: boolean
  items?: CanvasItem[]
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleControl[] {
  if (!enabled || selection.length === 0 || selectedItems.length === 0) {
    return []
  }

  return [
    getCanvasObjectColorStyleControl({
      channel: 'fill',
      colors: CANVAS_OBJECT_FILL_COLORS,
      commitItemsChange,
      disabled,
      items,
      label: 'Fill',
      selectedItems,
      selection,
    }),
    getCanvasObjectColorStyleControl({
      channel: 'stroke',
      colors: CANVAS_OBJECT_STROKE_COLORS,
      commitItemsChange,
      disabled,
      items,
      label: 'Stroke',
      selectedItems,
      selection,
    }),
    getCanvasObjectNumberStyleControl({
      channel: 'opacity',
      commitItemsChange,
      disabled,
      items,
      label: 'Opacity',
      max: 1,
      min: 0.05,
      selectedItems,
      selection,
      step: 0.05,
    }),
    getCanvasObjectNumberStyleControl({
      channel: 'strokeWidth',
      commitItemsChange,
      disabled,
      items,
      label: 'Stroke width',
      max: 32,
      min: 0.5,
      selectedItems,
      selection,
      step: 0.5,
    }),
    getCanvasObjectNumberStyleControl({
      channel: 'fontSize',
      commitItemsChange,
      disabled,
      items,
      label: 'Font size',
      max: 72,
      min: 8,
      selectedItems,
      selection,
      step: 1,
    }),
    getCanvasObjectSegmentedStyleControl({
      channel: 'textAlign',
      commitItemsChange,
      disabled,
      items,
      label: 'Text align',
      options: CANVAS_TEXT_ALIGN_SEGMENTS,
      selectedItems,
      selection,
    }),
    getCanvasObjectSegmentedStyleControl({
      channel: 'arrowRouting',
      commitItemsChange,
      disabled,
      items,
      label: 'Line',
      options: CANVAS_ARROW_ROUTING_SEGMENTS,
      selectedItems,
      selection,
    }),
    getCanvasObjectSegmentedStyleControl({
      channel: 'arrowhead',
      commitItemsChange,
      disabled,
      items,
      label: 'Arrowhead',
      options: CANVAS_ARROWHEAD_SEGMENTS,
      selectedItems,
      selection,
    }),
  ].filter((control): control is CanvasObjectStyleControl => control !== null)
}
