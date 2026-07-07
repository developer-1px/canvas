import type { CanvasExtensionTextTargetContract } from '../../foundation'
import type { CanvasItem } from '../model'
import {
  getCanvasEditableTextBounds,
  getCanvasEditableTextPatchUpdates,
  getCanvasEditableTextValue,
  getCommittedCanvasEditableTextValue,
  isCanvasEditableTextItem,
  shouldCommitCanvasEditableTextOnEnter,
} from './CanvasEditableTextItem'

export type CanvasItemTextTarget = CanvasExtensionTextTargetContract<CanvasItem>

export const CANVAS_WHITEBOARD_TEXT_TARGET = {
  canEdit: (item) => isCanvasEditableTextItem(item),
  commitsOnEnter: (item) =>
    isCanvasEditableTextItem(item) &&
    shouldCommitCanvasEditableTextOnEnter(item),
  getCommittedValue: ({ item, value }) =>
    isCanvasEditableTextItem(item)
      ? getCommittedCanvasEditableTextValue({ item, value })
      : value,
  getEditorBounds: (item) =>
    isCanvasEditableTextItem(item)
      ? getCanvasEditableTextBounds(item)
      : null,
  getValue: (item) =>
    isCanvasEditableTextItem(item) ? getCanvasEditableTextValue(item) : '',
  planCommitUpdates: (item, text) =>
    isCanvasEditableTextItem(item)
      ? getCanvasEditableTextPatchUpdates(item, text)
      : [],
} satisfies CanvasExtensionTextTargetContract<CanvasItem>
