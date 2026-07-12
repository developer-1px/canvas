import {
  CANVAS_WHEEL_PASSTHROUGH_SELECTOR,
  isCanvasNativeWheelPassthroughTarget,
} from '../../../../browser-runtime/CanvasNativeGestureBoundary'

export const CANVAS_CONTROL_TARGET_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="tab"]',
].join(',')

export { CANVAS_WHEEL_PASSTHROUGH_SELECTOR }

export type CanvasInteractionTargetSelectorInput = {
  selectors: readonly string[] | string
  target: EventTarget | null
}

export type CanvasControlTargetInput = {
  extraSelectors?: readonly string[] | string
  target: EventTarget | null
}

export function isCanvasTargetWithinSelector({
  selectors,
  target,
}: CanvasInteractionTargetSelectorInput) {
  const element = getCanvasInteractionTargetElement(target)
  const selector = getCanvasInteractionTargetSelector(selectors)

  if (!element || !selector) {
    return false
  }

  try {
    return Boolean(element.closest(selector))
  } catch {
    return false
  }
}

export function isCanvasControlTarget({
  extraSelectors,
  target,
}: CanvasControlTargetInput) {
  return isCanvasTargetWithinSelector({
    selectors: [
      CANVAS_CONTROL_TARGET_SELECTOR,
      ...getCanvasInteractionTargetSelectors(extraSelectors),
    ],
    target,
  })
}

export function isCanvasWheelPassthroughTarget(target: EventTarget | null) {
  return isCanvasNativeWheelPassthroughTarget(target)
}

function getCanvasInteractionTargetElement(target: EventTarget | null) {
  if (!target) {
    return null
  }

  if (typeof Element !== 'undefined' && target instanceof Element) {
    return target
  }

  if (
    typeof Node !== 'undefined' &&
    target instanceof Node &&
    'parentElement' in target
  ) {
    return target.parentElement
  }

  return null
}

function getCanvasInteractionTargetSelector(
  selectors: readonly string[] | string | undefined,
) {
  return getCanvasInteractionTargetSelectors(selectors).join(',')
}

function getCanvasInteractionTargetSelectors(
  selectors: readonly string[] | string | undefined,
) {
  return (Array.isArray(selectors) ? selectors : [selectors])
    .filter((selector): selector is string => typeof selector === 'string')
    .map((selector) => selector.trim())
    .filter(Boolean)
}
