import type {
  CanvasAppStageDomElement,
  CanvasAppStageRect,
  CanvasElementRectTarget,
} from './CanvasAppStageElementContracts'

export function getCanvasElementRect(
  target?: CanvasElementRectTarget | null,
) {
  return target?.getBoundingClientRect?.() ?? null
}

export function getCanvasAppStageElementRect(
  element: CanvasAppStageDomElement,
): CanvasAppStageRect {
  const rect = element.getBoundingClientRect()

  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  }
}
