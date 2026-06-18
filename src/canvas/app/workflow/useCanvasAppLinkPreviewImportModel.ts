import { useCanvasLinkPreviewImport } from '../feature-packs'
import type {
  CanvasAppLinkPreviewImportModelInput,
} from './CanvasAppIoConsumerContracts'

export function useCanvasAppLinkPreviewImportModel(
  input: CanvasAppLinkPreviewImportModelInput,
) {
  useCanvasLinkPreviewImport(input)
}
