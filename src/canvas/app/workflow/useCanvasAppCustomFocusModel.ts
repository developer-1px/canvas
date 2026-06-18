import { useCanvasAppCustomFocus } from '../extensions/custom-focus'

export function useCanvasAppCustomFocusModel({
  selection,
}: {
  selection: readonly string[]
}) {
  return {
    customFocus: useCanvasAppCustomFocus({ selection }),
  }
}
