import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppOptionalDescriptorFunctionField,
} from '../extensions/CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionEntries } from '../extensions/CanvasAppExtensionIds'
import type { CanvasAppInspectorPanel } from './CanvasAppInspectorPanels'

export function assertCanvasAppInspectorPanels(
  panels: readonly CanvasAppInspectorPanel[],
) {
  assertCanvasAppExtensionEntries({
    entries: panels,
    label: 'inspector panel',
  })

  for (const panel of panels) {
    const owner = `inspector panel ${panel.id}`

    assertCanvasAppDescriptorFunctionField({
      field: 'render',
      owner,
      value: panel.render,
    })
    assertCanvasAppOptionalDescriptorFunctionField({
      field: 'isVisible',
      owner,
      value: panel.isVisible,
    })
  }
}
