import { useCanvasLinkPreviewImport } from '../link/useCanvasLinkPreviewImport'
import type {
  CanvasAppLinkPreviewImportModelInput,
} from './CanvasAppConsumerContracts'

export function useCanvasAppLinkPreviewImportModel(
  input: CanvasAppLinkPreviewImportModelInput,
) {
  useCanvasLinkPreviewImport(input)
}
