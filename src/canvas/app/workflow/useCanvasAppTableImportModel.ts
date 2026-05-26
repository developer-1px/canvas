import { useCanvasTableImport } from '../affordances/io/table/useCanvasTableImport'
import type { CanvasAppTableImportModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppTableImportModel(
  input: CanvasAppTableImportModelInput,
) {
  useCanvasTableImport(input)
}
