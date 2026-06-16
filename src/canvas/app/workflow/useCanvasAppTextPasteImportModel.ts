import { useCanvasTextPasteImport } from '../feature-packs'
import type { CanvasAppTextPasteImportModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppTextPasteImportModel(
  input: CanvasAppTextPasteImportModelInput,
) {
  useCanvasTextPasteImport(input)
}
