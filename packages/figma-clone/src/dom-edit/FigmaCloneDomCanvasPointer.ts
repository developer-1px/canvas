export function isFigmaCloneDomCanvasPanTarget(
  target: EventTarget | null,
): boolean {
  if (!(target instanceof Element)) {
    return false
  }

  const stage = target.closest('.canvas-stage')

  return stage?.getAttribute('data-mode') === 'pan' ||
    stage?.getAttribute('data-gesture') === 'pan'
}
