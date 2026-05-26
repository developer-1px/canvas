import { useCanvasImageControls } from '../io/image/useCanvasImageControls'
import type { CanvasAppImageModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppImageModel(input: CanvasAppImageModelInput) {
  return useCanvasImageControls(input)
}
