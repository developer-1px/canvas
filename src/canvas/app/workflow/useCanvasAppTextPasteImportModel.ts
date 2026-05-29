import { useCanvasTextPasteImport } from '../affordances/io/text-paste/useCanvasTextPasteImport'
import type { CanvasAppTextPasteImportModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppTextPasteImportModel(
  input: CanvasAppTextPasteImportModelInput,
) {
  useCanvasTextPasteImport(input)
}
