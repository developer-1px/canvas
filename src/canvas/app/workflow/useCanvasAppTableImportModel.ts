import { useCanvasTableImport } from '../table/useCanvasTableImport'
import type { CanvasAppTableImportModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppTableImportModel(
  input: CanvasAppTableImportModelInput,
) {
  useCanvasTableImport(input)
}
