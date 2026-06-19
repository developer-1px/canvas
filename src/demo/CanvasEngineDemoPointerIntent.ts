export type CanvasEngineDemoPointerButtonInput = Readonly<{
  button: number
}>

export function isCanvasEngineDemoSelectionPointerButton({
  button,
}: CanvasEngineDemoPointerButtonInput) {
  return button === 0
}
