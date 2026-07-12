import {
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppOptionalDescriptorFunctionField,
} from '../CanvasAppDescriptorContracts'
import { assertCanvasAppExtensionEntries } from '../CanvasAppExtensionIds'
import { assertCanvasAppRequiredCapability } from '../../CanvasAppCapabilityContracts'
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
    assertCanvasAppRequiredCapability({
      owner,
      value: panel.requiredCapability,
    })
    assertCanvasAppOptionalDescriptorFunctionField({
      field: 'isVisible',
      owner,
      value: panel.isVisible,
    })
  }
}
