import { useCanvasTableImport } from '../feature-packs'
import type { CanvasAppTableImportModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppTableImportModel(
  input: CanvasAppTableImportModelInput,
) {
  useCanvasTableImport(input)
}
