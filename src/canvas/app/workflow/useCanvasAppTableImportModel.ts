import { useCanvasTableImport } from '../table/useCanvasTableImport'
import type { CanvasAppTableImportModelInput } from './CanvasAppConsumerContracts'

export function useCanvasAppTableImportModel(
  input: CanvasAppTableImportModelInput,
) {
  useCanvasTableImport(input)
}
