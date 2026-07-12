import type React from 'react'

import type { DesignNode } from '../design-document'

export type ReactDesignNodeDomProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'children' | 'style'
> & {
  readonly style: React.CSSProperties
  readonly type?: string
  readonly [key: `data-${string}`]: string | number | boolean | undefined
  readonly [key: `aria-${string}`]: string | number | boolean | undefined
}

const SAFE_STRING_ATTRIBUTES = new Set([
  'className',
  'id',
  'role',
  'title',
  'type',
])

const SAFE_EXTENDED_ATTRIBUTE = /^(?:aria|data)-[a-z][a-z0-9_.:-]*$/

export function createReactDesignNodeDomProps(
  node: DesignNode,
  parent: DesignNode | null = null,
): ReactDesignNodeDomProps {
  const props: Record<string, unknown> = {}

  for (const [name, value] of Object.entries(node.props)) {
    if (SAFE_STRING_ATTRIBUTES.has(name) && typeof value === 'string') {
      props[name] = value
      continue
    }

    if (name === 'tabIndex' && typeof value === 'number' && Number.isFinite(value)) {
      props[name] = value
      continue
    }

    if (SAFE_EXTENDED_ATTRIBUTE.test(name) && isSafeAttributePrimitive(value)) {
      props[name] = value
    }
  }

  return {
    ...props,
    ...(node.frame?.heightMode === 'fixed' && node.frame.overflow === 'scroll'
      ? { 'data-canvas-wheel-passthrough': 'scroll' }
      : {}),
    style: createReactDesignNodeStyle(node, parent),
  } as ReactDesignNodeDomProps
}

function createReactDesignNodeStyle(
  node: DesignNode,
  parent: DesignNode | null,
): React.CSSProperties {
  const style: React.CSSProperties = {}
  const position = readChoice(node.props.position, [
    'absolute',
    'fixed',
    'relative',
    'static',
    'sticky',
  ])
  const flexWrap = readChoice(node.props.flexWrap, [
    'nowrap',
    'wrap',
    'wrap-reverse',
  ])

  if (position) {
    style.position = position
  }

  if (flexWrap) {
    style.flexWrap = flexWrap
  }

  const direction = readChoice(node.layout.direction, ['column', 'row'])

  if (node.children.length > 0 && direction) {
    style.display = 'flex'

    const align = mapFlexAlignment(node.layout.align)
    const distribution = mapFlexDistribution(node.layout.distribution)
    const gap = readFiniteNumber(node.layout.gap)

    if (align) {
      style.alignItems = align
    }

    style.flexDirection = direction

    if (distribution) {
      style.justifyContent = distribution
    }

    if (gap !== null) {
      style.gap = gap
    }
  }

  applyAuthoredPresentationStyle(style, node)

  const alignSelf = mapFlexAlignment(node.layout.alignSelf, true)

  if (alignSelf) {
    style.alignSelf = alignSelf
  }

  assignFiniteStyleNumber(style, 'margin', node.layout.margin)
  assignFiniteStyleNumber(style, 'order', node.layout.order)
  assignPadding(style, node)
  assignDimension(style, 'width', node.layout.widthMode, node.layout.w)
  assignDimension(style, 'height', node.layout.heightMode, node.layout.h)
  applyWrappedHugGeometry(style, node, parent)
  applyParentParticipationStyle(style, node, parent)
  assignFiniteStyleNumber(style, 'borderRadius', node.style.radius)

  const opacity = readFiniteNumber(node.style.opacity)

  if (opacity !== null) {
    style.opacity = Math.min(1, Math.max(0, opacity / 100))
  }

  const rotation = readFiniteNumber(node.style.rotation)

  if (rotation !== null && rotation !== 0) {
    style.transform = `rotate(${rotation}deg)`
  }

  if (position === 'absolute') {
    const x = readFiniteNumber(node.layout.x)
    const y = readFiniteNumber(node.layout.y)

    if (x !== null) {
      style.left = x
    }

    if (y !== null) {
      style.top = y
    }
  }

  if (node.frame) {
    applyFrameStyle(style, node.frame)
  }

  return style
}

function applyWrappedHugGeometry(
  style: React.CSSProperties,
  node: DesignNode,
  parent: DesignNode | null,
) {
  if (!usesWrappingAutoLayout(node) && !usesWrappingAutoLayout(parent)) {
    return
  }

  if (node.layout.widthMode === 'hug') {
    assignFiniteDimension(style, 'width', node.layout.w)
  }

  if (node.layout.heightMode === 'hug') {
    assignFiniteDimension(style, 'height', node.layout.h)
  }
}

function usesWrappingAutoLayout(node: DesignNode | null) {
  return node !== null && readChoice(node.props.flexWrap, [
    'nowrap',
    'wrap',
    'wrap-reverse',
  ]) !== null && node.props.flexWrap !== 'nowrap'
}

function assignFiniteDimension(
  style: React.CSSProperties,
  axis: 'height' | 'width',
  value: unknown,
) {
  const number = readFiniteNumber(value)

  if (number !== null) {
    style[axis] = number
  }
}

function applyParentParticipationStyle(
  style: React.CSSProperties,
  node: DesignNode,
  parent: DesignNode | null,
) {
  if (!parent || !isFlexContainer(parent)) {
    return
  }

  const direction = readChoice(parent.layout.direction, ['column', 'row'])
  const fillsMainAxis = direction === 'row'
    ? node.layout.widthMode === 'fill'
    : direction === 'column' && node.layout.heightMode === 'fill'

  if (!fillsMainAxis) {
    return
  }

  style.flexBasis = 0
  style.flexGrow = 1
  style.flexShrink = 1

  if (direction === 'row') {
    style.minWidth = 0
    style.width = 0
  } else {
    style.height = 0
    style.minHeight = 0
  }
}

function isFlexContainer(node: DesignNode) {
  const display = readChoice(node.props.display, [
    'block',
    'flex',
    'grid',
    'inline',
    'inline-block',
    'inline-flex',
    'inline-grid',
    'none',
  ])

  if (display) {
    return display === 'flex' || display === 'inline-flex'
  }

  return node.children.length > 0 &&
    readChoice(node.layout.direction, ['column', 'row']) !== null
}

function applyAuthoredPresentationStyle(
  style: React.CSSProperties,
  node: DesignNode,
) {
  const display = readChoice(node.props.display, [
    'block',
    'flex',
    'grid',
    'inline',
    'inline-block',
    'inline-flex',
    'inline-grid',
    'none',
  ])

  if (display) {
    style.display = display
  }

  const gridTemplateColumns = readNonEmptyString(
    node.props.gridTemplateColumns,
  )
  const gridTemplateRows = readNonEmptyString(node.props.gridTemplateRows)

  if (gridTemplateColumns) {
    style.gridTemplateColumns = gridTemplateColumns
  }

  if (gridTemplateRows) {
    style.gridTemplateRows = gridTemplateRows
  }
}

function applyFrameStyle(
  style: React.CSSProperties,
  frame: NonNullable<DesignNode['frame']>,
) {
  style.position = 'absolute'
  style.left = frame.x
  style.top = frame.y
  style.width = frame.widthMode === 'fixed' ? frame.width : 'fit-content'
  style.height = frame.heightMode === 'fixed' ? frame.height : 'fit-content'
  style.overflow = frame.heightMode === 'content'
    ? 'visible'
    : frame.overflow === 'clip'
      ? 'hidden'
      : frame.overflow === 'scroll' ? 'auto' : 'visible'

  if (frame.rotation !== 0) {
    style.transform = `rotate(${frame.rotation}deg)`
  }
}

function assignDimension(
  style: React.CSSProperties,
  axis: 'height' | 'width',
  modeValue: unknown,
  sizeValue: unknown,
) {
  const mode = readChoice(modeValue, ['fill', 'fixed', 'hug'])
  const size = readFiniteNumber(sizeValue)

  if (!mode || size === null) {
    return
  }

  if (mode === 'fill') {
    style[axis] = '100%'
    style[axis === 'width' ? 'minWidth' : 'minHeight'] = 0
    return
  }

  if (mode === 'hug') {
    style[axis] = 'fit-content'
    style.flexShrink = 0
    return
  }

  style[axis] = size
}

function assignPadding(style: React.CSSProperties, node: DesignNode) {
  const sides = [
    ['paddingBottom', node.layout.paddingBottom],
    ['paddingLeft', node.layout.paddingLeft],
    ['paddingRight', node.layout.paddingRight],
    ['paddingTop', node.layout.paddingTop],
  ] as const
  const hasSide = sides.some(([, value]) => readFiniteNumber(value) !== null)

  if (hasSide) {
    for (const [property, value] of sides) {
      assignFiniteStyleNumber(style, property, value)
    }
    return
  }

  assignFiniteStyleNumber(style, 'padding', node.layout.padding)
}

function assignFiniteStyleNumber(
  style: React.CSSProperties,
  property: 'borderRadius' | 'margin' | 'order' | 'padding' |
    'paddingBottom' | 'paddingLeft' | 'paddingRight' | 'paddingTop',
  value: unknown,
) {
  const number = readFiniteNumber(value)

  if (number !== null) {
    style[property] = number
  }
}

function mapFlexAlignment(
  value: unknown,
  allowAuto = false,
): React.CSSProperties['alignItems'] | React.CSSProperties['alignSelf'] | null {
  const alignment = readChoice(value, [
    'auto',
    'center',
    'end',
    'start',
    'stretch',
  ])

  if (!alignment || (alignment === 'auto' && !allowAuto)) {
    return null
  }

  if (alignment === 'start') {
    return 'flex-start'
  }

  if (alignment === 'end') {
    return 'flex-end'
  }

  return alignment
}

function mapFlexDistribution(
  value: unknown,
): React.CSSProperties['justifyContent'] | null {
  const distribution = readChoice(value, [
    'center',
    'end',
    'packed',
    'space-between',
    'start',
  ])

  if (!distribution) {
    return null
  }

  if (distribution === 'end') {
    return 'flex-end'
  }

  if (distribution === 'packed' || distribution === 'start') {
    return 'flex-start'
  }

  return distribution
}

function isSafeAttributePrimitive(
  value: unknown,
): value is string | number | boolean {
  return typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
}

function readChoice<TChoice extends string>(
  value: unknown,
  choices: readonly TChoice[],
): TChoice | null {
  return typeof value === 'string' && choices.includes(value as TChoice)
    ? value as TChoice
    : null
}

function readFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null
}
