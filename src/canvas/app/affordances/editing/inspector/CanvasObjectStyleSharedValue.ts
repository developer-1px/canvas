export function getSharedCanvasStyleValue<TValue>(
  values: readonly TValue[],
): TValue | null {
  const [first] = values

  if (first === undefined) {
    return null
  }

  return values.every((value) => Object.is(value, first)) ? first : null
}
