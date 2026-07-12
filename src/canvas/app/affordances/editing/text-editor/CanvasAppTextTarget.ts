import type { CanvasItem } from '../../../../entities'
import type { CanvasExtensionTextTargetContract } from '../../../../foundation'
import {
  CANVAS_WHITEBOARD_TEXT_TARGET,
  isCanvasCustomItem,
  isCanvasStickyComponentItem,
} from '../../../../host'
import type {
  CanvasAppCustomItemTextTarget,
  CanvasAppCustomItemTextTargets,
} from '../../../extensions/custom-item-modules/CanvasAppCustomItemTextTargetContracts'

export type CanvasAppTextTarget = CanvasExtensionTextTargetContract<CanvasItem>

export const CANVAS_APP_TEXT_TARGET: CanvasAppTextTarget = Object.freeze({
  canEdit: (item) => !isCanvasStickyComponentItem(item) &&
    CANVAS_WHITEBOARD_TEXT_TARGET.canEdit(item),
  commitsOnEnter: (item) => !isCanvasStickyComponentItem(item) &&
    CANVAS_WHITEBOARD_TEXT_TARGET.commitsOnEnter(item),
  getCommittedValue: ({ item, value }) =>
    isCanvasStickyComponentItem(item)
      ? value
      : CANVAS_WHITEBOARD_TEXT_TARGET.getCommittedValue({ item, value }),
  getEditorBounds: (item) => isCanvasStickyComponentItem(item)
    ? null
    : CANVAS_WHITEBOARD_TEXT_TARGET.getEditorBounds(item),
  getValue: (item) => isCanvasStickyComponentItem(item)
    ? ''
    : CANVAS_WHITEBOARD_TEXT_TARGET.getValue(item),
  planCommitUpdates: (item, text) => isCanvasStickyComponentItem(item)
    ? []
    : CANVAS_WHITEBOARD_TEXT_TARGET.planCommitUpdates(item, text),
})

export function createCanvasAppTextTarget(
  customItemTextTargets: CanvasAppCustomItemTextTargets = {},
  foundationTextTargets: readonly CanvasAppTextTarget[] = [],
): CanvasAppTextTarget {
  const customEntries = Object.entries(customItemTextTargets)

  if (customEntries.length === 0 && foundationTextTargets.length === 0) {
    return CANVAS_APP_TEXT_TARGET
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
      : foundationTextTargets.find((target) => target.canEdit(item)) ??
        CANVAS_APP_TEXT_TARGET

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
