import type { CanvasItem } from '../../entities'
import type {
  CanvasAppCommitItemsChange,
  CanvasAppDocumentAuthority,
} from '../workspace/document/CanvasAppDocumentContracts'
import type { CanvasAppCapabilitySnapshot } from '../CanvasAppCapabilityContracts'
import { CANVAS_APP_EDITOR_CAPABILITIES } from './CanvasAppCapabilityAssembly'
import {
  createCanvasAppDocumentAuthority,
  createCanvasAppDocumentAuthorityRead,
} from './CanvasAppDocumentAuthority'

export function createCanvasAppTestDocumentAuthority({
  capabilities = CANVAS_APP_EDITOR_CAPABILITIES,
  commitItemsChange = () => true,
  readItems = () => [],
}: {
  capabilities?: CanvasAppCapabilitySnapshot
  commitItemsChange?: CanvasAppCommitItemsChange
  readItems?: () => readonly CanvasItem[]
} = {}): CanvasAppDocumentAuthority {
  return createCanvasAppDocumentAuthority({
    commitItemsChange,
    read: createCanvasAppDocumentAuthorityRead(capabilities),
    readItems,
  })
}
