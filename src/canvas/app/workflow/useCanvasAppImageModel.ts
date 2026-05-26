import { useCanvasImageControls } from '../image/useCanvasImageControls'
import type { CanvasAppImageModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppImageModel(input: CanvasAppImageModelInput) {
  return useCanvasImageControls(input)
}
