import type { CanvasCustomItem } from '../../../entities'
import type { CanvasExtensionTextTargetContract } from '../../../foundation'
import { assertCanvasAppDescriptorFunctionField } from '../CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionRecordKeys } from '../CanvasAppExtensionIds'

export type CanvasAppCustomItemTextTarget =
  CanvasExtensionTextTargetContract<CanvasCustomItem>

export type CanvasAppCustomItemTextTargets = Readonly<
  Record<string, CanvasAppCustomItemTextTarget>
>

const CANVAS_APP_CUSTOM_ITEM_TEXT_TARGET_SLOTS = [
  'canEdit',
  'commitsOnEnter',
  'getCommittedValue',
  'getEditorBounds',
  'getValue',
  'planCommitUpdates',
] as const satisfies readonly (keyof CanvasAppCustomItemTextTarget)[]

export function assertCanvasAppCustomItemTextTarget({
  owner,
  textTarget,
}: {
  owner: string
  textTarget: CanvasAppCustomItemTextTarget
}) {
  for (const slot of CANVAS_APP_CUSTOM_ITEM_TEXT_TARGET_SLOTS) {
    assertCanvasAppDescriptorFunctionField({
      field: slot,
      owner,
      value: textTarget[slot],
    })
  }
}

export function assertCanvasAppCustomItemTextTargets(
  customItemTextTargets: CanvasAppCustomItemTextTargets,
) {
  assertCanvasAppExtensionRecordKeys({
    entries: customItemTextTargets,
    label: 'custom item text target',
  })

  for (const [kind, textTarget] of Object.entries(customItemTextTargets)) {
    assertCanvasAppCustomItemTextTarget({
      owner: `custom item text target ${kind}`,
      textTarget,
    })
  }
}
