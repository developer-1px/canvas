import type { ReactNode } from 'react'
import type {
  Bounds,
  CanvasItem,
} from '../../../entities'
import type {
  CanvasAppDocumentAuthority,
} from '../../workspace/document/CanvasAppDocumentContracts'
import type { CanvasAppCapability } from '../../CanvasAppCapabilityContracts'
import type {
  CanvasAppCustomFocus,
} from '../custom-focus'

export type CanvasAppInspectorPanelContext = {
  bounds: Bounds | null
  customFocus?: CanvasAppCustomFocus | null
  disabled: boolean
  document: CanvasAppDocumentAuthority
  items?: CanvasItem[]
  label: string | null
  selectedItems: CanvasItem[]
  selection: string[]
}

export type CanvasAppInspectorPanel = {
  id: string
  isVisible?: (context: CanvasAppInspectorPanelContext) => boolean
  requiredCapability: CanvasAppCapability
  render: (context: CanvasAppInspectorPanelContext) => ReactNode
}

export type CanvasAppInspectorPanelView = {
  content: ReactNode
  id: string
}
