import { useCanvasStampControls } from '../stamp/useCanvasStampControls'
import type { CanvasAppStampModelInput } from './CanvasAppStampConsumerContracts'

export function useCanvasAppStampModel(input: CanvasAppStampModelInput) {
  return useCanvasStampControls(input)
}
