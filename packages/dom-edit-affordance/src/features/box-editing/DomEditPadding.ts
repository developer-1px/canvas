import type {
  DomEditField,
  DomEditStyle,
} from '../../shared/model/DomEditTypes'

export type DomEditPaddingSide = 'bottom' | 'left' | 'right' | 'top'
export type DomEditPaddingAxis = 'horizontal' | 'vertical'
export type DomEditPaddingScope =
  | 'all'
  | DomEditPaddingAxis
  | DomEditPaddingSide

export type DomEditPaddingSides = Record<DomEditPaddingSide, number>

export const DOM_EDIT_PADDING_SIDE_FIELDS = {
  bottom: 'paddingBottom',
  left: 'paddingLeft',
  right: 'paddingRight',
  top: 'paddingTop',
} satisfies Record<DomEditPaddingSide, DomEditField>

export function getDomEditOppositePaddingSide(
  side: DomEditPaddingSide,
): DomEditPaddingSide {
  if (side === 'bottom') {
    return 'top'
  }

  if (side === 'left') {
    return 'right'
  }

  if (side === 'right') {
    return 'left'
  }

  return 'bottom'
}

export function getDomEditPaddingSides(
  style: Pick<
    DomEditStyle,
    | 'padding'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingTop'
  >,
): DomEditPaddingSides {
  const sides = {
    bottom: style.paddingBottom,
    left: style.paddingLeft,
    right: style.paddingRight,
    top: style.paddingTop,
  }

  if (
    style.padding !== 0 &&
    sides.bottom === 0 &&
    sides.left === 0 &&
    sides.right === 0 &&
    sides.top === 0
  ) {
    return createDomEditUniformPaddingSides(style.padding)
  }

  return sides
}

export function createDomEditUniformPaddingSides(
  value: number,
): DomEditPaddingSides {
  return {
    bottom: value,
    left: value,
    right: value,
    top: value,
  }
}

export function getDomEditUniformPadding(
  sides: DomEditPaddingSides,
): number | null {
  return sides.top === sides.right &&
    sides.right === sides.bottom &&
    sides.bottom === sides.left
    ? sides.top
    : null
}

export function getDomEditPaddingScopeSides(
  scope: DomEditPaddingScope,
): readonly DomEditPaddingSide[] {
  if (scope === 'all') {
    return ['top', 'right', 'bottom', 'left']
  }

  if (scope === 'horizontal') {
    return ['left', 'right']
  }

  if (scope === 'vertical') {
    return ['top', 'bottom']
  }

  return [scope]
}

export function getDomEditPaddingScopeFields(
  scope: DomEditPaddingScope,
): readonly DomEditField[] {
  return getDomEditPaddingScopeSides(scope).map(
    (side) => DOM_EDIT_PADDING_SIDE_FIELDS[side],
  )
}

export function getDomEditPaddingSummary(
  sides: DomEditPaddingSides,
): string {
  const uniform = getDomEditUniformPadding(sides)

  if (uniform !== null) {
    return String(uniform)
  }

  if (sides.top === sides.bottom && sides.left === sides.right) {
    return `Y ${sides.top} X ${sides.left}`
  }

  return `T ${sides.top} R ${sides.right} B ${sides.bottom} L ${sides.left}`
}
