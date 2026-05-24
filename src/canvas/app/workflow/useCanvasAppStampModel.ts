import { useCanvasStampControls } from '../stamp/useCanvasStampControls'
import type { CanvasAppStampModelInput } from './CanvasAppConsumerContracts'

export function useCanvasAppStampModel(input: CanvasAppStampModelInput) {
  return useCanvasStampControls(input)
}
