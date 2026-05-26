import { useCanvasLinkPreviewImport } from '../io/link-preview/useCanvasLinkPreviewImport'
import type {
  CanvasAppLinkPreviewImportModelInput,
} from './CanvasAppIoConsumerContracts'

export function useCanvasAppLinkPreviewImportModel(
  input: CanvasAppLinkPreviewImportModelInput,
) {
  useCanvasLinkPreviewImport(input)
}
