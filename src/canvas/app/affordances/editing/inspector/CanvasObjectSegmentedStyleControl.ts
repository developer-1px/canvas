import type { CanvasItem } from '../../../../entities'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import {
  applyCanvasObjectSegmentedStyle,
  canApplyCanvasObjectSegmentedStyle,
  getCanvasObjectSegmentedStyleValue,
} from './CanvasObjectStyleInspectorItemStyles'
import type {
  CanvasObjectStyleSegmentedChannel,
  CanvasObjectStyleSegmentedControl,
} from './CanvasObjectStyleInspectorContracts'
import { commitCanvasObjectStyleChange } from './CanvasObjectStyleChangeCommit'
import { getSharedCanvasStyleValue } from './CanvasObjectStyleSharedValue'

export function getCanvasObjectSegmentedStyleControl({
  channel,
  commitItemsChange,
  disabled,
  items,
  label,
  options,
  selectedItems,
  selection,
}: {
  channel: CanvasObjectStyleSegmentedChannel
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  label: string
  options: readonly { label: string; value: string }[]
  selectedItems: CanvasItem[]
  selection: string[]
}): CanvasObjectStyleSegmentedControl | null {
  const stylableItems = selectedItems.filter((item) =>
    canApplyCanvasObjectSegmentedStyle(item, channel),
  )
  const sharedValue = getSharedCanvasStyleValue(
    stylableItems.map((item) =>
      getCanvasObjectSegmentedStyleValue(item, channel),
    ),
  )

  if (stylableItems.length === 0) {
    return null
  }

  return {
    disabled,
    id: channel,
    kind: 'segmented',
    label,
    mixed: sharedValue === null,
    segments: options.map((option) => ({
      ...option,
      selected: sharedValue === option.value,
    })),
    value: sharedValue,
    onSelect: (value) => {
      commitCanvasObjectStyleChange({
        apply: (item) => applyCanvasObjectSegmentedStyle(item, channel, value),
        canApply: (item) => canApplyCanvasObjectSegmentedStyle(item, channel),
        commitItemsChange,
        disabled,
        items,
        selectedItems,
        selection,
      })
    },
  }
}
