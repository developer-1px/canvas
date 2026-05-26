import { useCanvasLinkPreviewImport } from '../link/useCanvasLinkPreviewImport'
import type {
  CanvasAppLinkPreviewImportModelInput,
} from './CanvasAppIoConsumerContracts'

export function useCanvasAppLinkPreviewImportModel(
  input: CanvasAppLinkPreviewImportModelInput,
) {
  useCanvasLinkPreviewImport(input)
}
