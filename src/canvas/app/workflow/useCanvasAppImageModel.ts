import { useCanvasImageControls } from '../feature-packs'
import type { CanvasAppImageModelInput } from './CanvasAppIoConsumerContracts'

export function useCanvasAppImageModel(input: CanvasAppImageModelInput) {
  return useCanvasImageControls(input)
}
