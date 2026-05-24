import { useCanvasImageControls } from '../image/useCanvasImageControls'
import type { CanvasAppImageModelInput } from './CanvasAppConsumerContracts'

export function useCanvasAppImageModel(input: CanvasAppImageModelInput) {
  return useCanvasImageControls(input)
}
