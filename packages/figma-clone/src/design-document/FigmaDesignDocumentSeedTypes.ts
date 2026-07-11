import type { DesignJSONObject } from '../../../../src/canvas/design-document'

export type FigmaDesignNodeState = {
  readonly align: 'auto' | 'center' | 'end' | 'start' | 'stretch'
  readonly alignSelf: 'auto' | 'center' | 'end' | 'start' | 'stretch'
  readonly direction: 'column' | 'row'
  readonly distribution: 'center' | 'end' | 'packed' | 'start' |
    'space-between'
  readonly gap: number
  readonly h: number
  readonly heightMode: 'fill' | 'fixed' | 'hug'
  readonly margin: number
  readonly opacity: number
  readonly order: number
  readonly padding: number
  readonly paddingBottom: number
  readonly paddingLeft: number
  readonly paddingRight: number
  readonly paddingTop: number
  readonly radius: number
  readonly rotation: number
  readonly w: number
  readonly widthMode: 'fill' | 'fixed' | 'hug'
  readonly x: number
  readonly y: number
}

export function normalizeFigmaDesignNodeState(
  state: FigmaDesignNodeState,
): FigmaDesignNodeState {
  const hasOnlyUniformPadding = state.padding !== 0 &&
    state.paddingBottom === 0 &&
    state.paddingLeft === 0 &&
    state.paddingRight === 0 &&
    state.paddingTop === 0

  if (!hasOnlyUniformPadding) {
    return { ...state }
  }

  return {
    ...state,
    paddingBottom: state.padding,
    paddingLeft: state.padding,
    paddingRight: state.padding,
    paddingTop: state.padding,
  }
}

export function createFigmaDesignNodeLayout(
  state: FigmaDesignNodeState,
): DesignJSONObject {
  return {
    align: state.align,
    alignSelf: state.alignSelf,
    direction: state.direction,
    distribution: state.distribution,
    gap: state.gap,
    h: state.h,
    heightMode: state.heightMode,
    margin: state.margin,
    order: state.order,
    padding: state.padding,
    paddingBottom: state.paddingBottom,
    paddingLeft: state.paddingLeft,
    paddingRight: state.paddingRight,
    paddingTop: state.paddingTop,
    w: state.w,
    widthMode: state.widthMode,
    x: state.x,
    y: state.y,
  }
}

export function createFigmaDesignNodeStyle(
  state: FigmaDesignNodeState,
): DesignJSONObject {
  return {
    opacity: state.opacity,
    radius: state.radius,
    rotation: state.rotation,
  }
}
