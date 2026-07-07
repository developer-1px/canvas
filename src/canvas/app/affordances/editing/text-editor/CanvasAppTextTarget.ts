import type { CanvasItem } from '../../../../entities'
import type { CanvasExtensionTextTargetContract } from '../../../../foundation'
import { CANVAS_WHITEBOARD_TEXT_TARGET } from '../../../../host'

export type CanvasAppTextTarget = CanvasExtensionTextTargetContract<CanvasItem>

export const CANVAS_APP_TEXT_TARGET: CanvasAppTextTarget =
  CANVAS_WHITEBOARD_TEXT_TARGET
