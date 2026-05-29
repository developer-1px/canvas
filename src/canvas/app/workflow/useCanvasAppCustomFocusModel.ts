import { useCanvasAppCustomFocus } from '../affordances/interaction/focus/useCanvasAppCustomFocus'

export function useCanvasAppCustomFocusModel({
  selection,
}: {
  selection: readonly string[]
}) {
  return {
    customFocus: useCanvasAppCustomFocus({ selection }),
  }
}
