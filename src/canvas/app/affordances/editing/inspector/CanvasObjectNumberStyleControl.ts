import type { CanvasItem } from '../../../../entities'
import type { CommitCanvasItemsChange } from '../../../workflow/CanvasWorkflowContract'
import {
  applyCanvasObjectNumberStyle,
  canApplyCanvasObjectNumberStyle,
  clampCanvasObjectNumberStyle,
  getCanvasObjectNumberStyleValue,
} from './CanvasObjectStyleInspectorItemStyles'
import type {
  CanvasObjectStyleNumberChannel,
  CanvasObjectStyleNumberControl,
} from './CanvasObjectStyleInspectorContracts'
import { commitCanvasObjectStyleChange } from './CanvasObjectStyleChangeCommit'
import { getSharedCanvasStyleValue } from './CanvasObjectStyleSharedValue'

export function getCanvasObjectNumberStyleControl({
  channel,
  commitItemsChange,
  disabled,
  items,
  label,
  max,
  min,
  selectedItems,
  selection,
  step,
}: {
  channel: CanvasObjectStyleNumberChannel
  commitItemsChange: CommitCanvasItemsChange
  disabled: boolean
  items?: CanvasItem[]
  label: string
  max: number
  min: number
  selectedItems: CanvasItem[]
  selection: string[]
  step: number
}): CanvasObjectStyleNumberControl | null {
  const stylableItems = selectedItems.filter((item) =>
    canApplyCanvasObjectNumberStyle(item, channel),
  )
  const sharedValue = getSharedCanvasStyleValue(
    stylableItems.map((item) => getCanvasObjectNumberStyleValue(item, channel)),
  )

  if (stylableItems.length === 0) {
    return null
  }

  return {
    disabled,
    id: channel,
    kind: 'number',
    label,
    max,
    min,
    mixed: sharedValue === null,
    step,
    value: sharedValue,
    onChange: (value) => {
      if (!Number.isFinite(value)) {
        return
      }

      commitCanvasObjectStyleChange({
        apply: (item) =>
          applyCanvasObjectNumberStyle(
            item,
            channel,
            clampCanvasObjectNumberStyle(value, min, max),
          ),
        canApply: (item) => canApplyCanvasObjectNumberStyle(item, channel),
        commitItemsChange,
        disabled,
        items,
        selectedItems,
        selection,
      })
    },
  }
}
