import { useCanvasStampControls } from '../feature-packs'
import type { CanvasAppStampModelInput } from './CanvasAppStampConsumerContracts'

export function useCanvasAppStampModel(input: CanvasAppStampModelInput) {
  return useCanvasStampControls(input)
}
