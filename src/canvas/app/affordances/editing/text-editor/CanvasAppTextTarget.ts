import type { CanvasItem } from '../../../../entities'
import type { CanvasExtensionTextTargetContract } from '../../../../foundation'
import { CANVAS_WHITEBOARD_TEXT_TARGET, isCanvasCustomItem } from '../../../../host'
import type {
  CanvasAppCustomItemTextTarget,
  CanvasAppCustomItemTextTargets,
} from '../../../extensions/custom-item-modules/CanvasAppCustomItemTextTargetContracts'

export type CanvasAppTextTarget = CanvasExtensionTextTargetContract<CanvasItem>

export const CANVAS_APP_TEXT_TARGET: CanvasAppTextTarget =
  CANVAS_WHITEBOARD_TEXT_TARGET

export function createCanvasAppTextTarget(
  customItemTextTargets: CanvasAppCustomItemTextTargets = {},
): CanvasAppTextTarget {
  const customEntries = Object.entries(customItemTextTargets)

  if (customEntries.length === 0) {
    return CANVAS_WHITEBOARD_TEXT_TARGET
  }

  const customTargets = Object.fromEntries(
    customEntries.map(([kind, textTarget]) => [
      kind,
      widenCanvasAppCustomItemTextTarget(textTarget),
    ]),
  )
  const resolveTarget = (item: CanvasItem): CanvasAppTextTarget | null =>
    isCanvasCustomItem(item)
      ? customTargets[item.kind] ?? null
      : CANVAS_WHITEBOARD_TEXT_TARGET

  return {
    canEdit: (item) => resolveTarget(item)?.canEdit(item) ?? false,
    commitsOnEnter: (item) =>
      resolveTarget(item)?.commitsOnEnter(item) ?? false,
    getCommittedValue: ({ item, value }) =>
      resolveTarget(item)?.getCommittedValue({ item, value }) ?? value,
    getEditorBounds: (item) =>
      resolveTarget(item)?.getEditorBounds(item) ?? null,
    getValue: (item) => resolveTarget(item)?.getValue(item) ?? '',
    planCommitUpdates: (item, text) =>
      resolveTarget(item)?.planCommitUpdates(item, text) ?? [],
  }
}

function widenCanvasAppCustomItemTextTarget(
  textTarget: CanvasAppCustomItemTextTarget,
): CanvasAppTextTarget {
  return {
    canEdit: (item) => isCanvasCustomItem(item) && textTarget.canEdit(item),
    commitsOnEnter: (item) =>
      isCanvasCustomItem(item) && textTarget.commitsOnEnter(item),
    getCommittedValue: ({ item, value }) =>
      isCanvasCustomItem(item)
        ? textTarget.getCommittedValue({ item, value })
        : value,
    getEditorBounds: (item) =>
      isCanvasCustomItem(item) ? textTarget.getEditorBounds(item) : null,
    getValue: (item) =>
      isCanvasCustomItem(item) ? textTarget.getValue(item) : '',
    planCommitUpdates: (item, text) =>
      isCanvasCustomItem(item)
        ? textTarget.planCommitUpdates(item, text)
        : [],
  }
}
