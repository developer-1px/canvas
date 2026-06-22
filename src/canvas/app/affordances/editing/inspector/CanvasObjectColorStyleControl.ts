import type { CanvasItem } from '../../../../entities'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import {
  applyCanvasObjectColorStyle,
  canApplyCanvasObjectColorStyle,
  getCanvasObjectColorStyleValue,
} from './CanvasObjectStyleInspectorItemStyles'
import type {
  CanvasObjectStyleColorChannel,
  CanvasObjectStyleSwatchControl,
} from './CanvasObjectStyleInspectorContracts'
import { commitCanvasObjectStyleChange } from './CanvasObjectStyleChangeCommit'
import { getSharedCanvasStyleValue } from './CanvasObjectStyleSharedValue'

export function getCanvasObjectColorStyleControl({
  channel,
  colors,
  commitItemsChange,
  disabled,
  items,
  label,
  selectedItems,
  selection,
}: {
  channel: CanvasObjectStyleColorChannel
  colors: readonly string[]
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  label: string
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleSwatchControl | null {
  const stylableItems = selectedItems.filter((item) =>
    canApplyCanvasObjectColorStyle(item, channel),
  )
  const sharedValue = getSharedCanvasStyleValue(
    stylableItems.map((item) => getCanvasObjectColorStyleValue(item, channel)),
  )

  if (stylableItems.length === 0) {
    return null
  }

  return {
    disabled,
    id: channel,
    kind: 'swatches',
    label,
    mixed: sharedValue === null,
    swatches: colors.map((color) => ({
      color,
      selected: sharedValue === color,
    })),
    onSelect: (color) => {
      commitCanvasObjectStyleChange({
        apply: (item) => applyCanvasObjectColorStyle(item, channel, color),
        canApply: (item) => canApplyCanvasObjectColorStyle(item, channel),
        commitItemsChange,
        disabled,
        items,
        selectedItems,
        selection,
      })
    },
  }
}
