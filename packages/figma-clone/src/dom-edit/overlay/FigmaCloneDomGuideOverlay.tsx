import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import type { Viewport } from '../../../../../src/canvas'
import {
  getFigmaCloneDomEditStyle,
  getFigmaCloneDomLayoutContext,
  getFigmaCloneDomParentId,
  type FigmaCloneDomEditState,
  type FigmaCloneDomNodeId,
} from '../FigmaCloneDomEditModel'
import {
  getFigmaCloneDomOverlayVisibility,
  type FigmaCloneDomAffordanceState,
} from './FigmaCloneDomAffordanceVisibility'
import {
  areFigmaCloneDomOverlayRectsEqual,
  createFigmaCloneDomOverlayRectStyle,
  measureFigmaCloneDomNodeOverlayRect,
  type FigmaCloneDomScaledOverlayRect,
} from './FigmaCloneDomOverlayGeometry'

type GuideRect = FigmaCloneDomScaledOverlayRect

type GuideDistance = {
  axis: 'x' | 'y'
  from: {
    x: number
    y: number
  }
  length: number
}

export function FigmaCloneDomGuideOverlay({
  rect,
  selectedNodeId,
  shellRef,
  state,
  viewport,
  affordanceState = { mode: 'idle' },
}: {
  affordanceState?: FigmaCloneDomAffordanceState
  rect: GuideRect
  selectedNodeId: FigmaCloneDomNodeId
  shellRef: RefObject<HTMLElement | null>
  state: FigmaCloneDomEditState
  viewport: Viewport
}) {
  const [parentRect, setParentRect] = useState<GuideRect | null>(null)
  const context = getFigmaCloneDomLayoutContext(selectedNodeId)
  const style = getFigmaCloneDomEditStyle(state, selectedNodeId)
  const parentId = getFigmaCloneDomParentId(selectedNodeId)
  const visibility = getFigmaCloneDomOverlayVisibility({
    affordanceState,
    context,
  })
  const distances = parentRect
    ? getFigmaCloneInsetDistances(rect, parentRect)
    : []

  useLayoutEffect(() => {
    const nextParentRect = parentId
      ? measureFigmaCloneDomNodeOverlayRect({
          nodeId: parentId,
          shell: shellRef.current,
          state,
          viewport,
        })
      : null

    setParentRect((current) =>
      areFigmaCloneDomOverlayRectsEqual(current, nextParentRect)
        ? current
        : nextParentRect)
  }, [
    parentId,
    rect.h,
    rect.w,
    rect.x,
    rect.y,
    selectedNodeId,
    shellRef,
    state,
    viewport,
  ])

  return (
    <>
      {visibility.parentReference && parentRect ? (
        <div
          className="figma-guide-parent"
          style={createFigmaCloneDomOverlayRectStyle(parentRect)}
        />
      ) : null}
      {visibility.measurements ? distances.map((distance, index) => (
        <FigmaCloneGuideDistance
          key={`${distance.axis}:${index}:${distance.from.x}:${distance.from.y}`}
          distance={distance}
        />
      )) : null}
      {affordanceState.mode === 'transform' && parentRect ? (
        <FigmaCloneTransformGuides
          parentRect={parentRect}
          rect={rect}
        />
      ) : null}
      <div
        className="figma-guide-selected"
        style={createFigmaCloneDomOverlayRectStyle(rect)}
      >
        {visibility.geometry ? (
          <>
            <span className="figma-guide-handle figma-guide-handle--nw" />
            <span className="figma-guide-handle figma-guide-handle--ne" />
            <span className="figma-guide-handle figma-guide-handle--sw" />
            <span className="figma-guide-handle figma-guide-handle--se" />
          </>
        ) : null}
      </div>
      <span
        className="figma-guide-label"
        style={{
          left: rect.x,
          top: Math.max(8, rect.y - 6),
        }}
      >
        {context.label} · {context.display}
        {context.showFlexLayout ? ` ${style.direction === 'row' ? 'H' : 'V'}` : ''}
        {context.showGridLayout ? ' Grid' : ''}
      </span>
    </>
  )
}

function FigmaCloneTransformGuides({
  parentRect,
  rect,
}: {
  parentRect: GuideRect
  rect: GuideRect
}) {
  const parentCenterX = parentRect.x + parentRect.w / 2
  const parentCenterY = parentRect.y + parentRect.h / 2
  const selectedCenterX = rect.x + rect.w / 2
  const selectedCenterY = rect.y + rect.h / 2
  const isAlignedX = Math.abs(parentCenterX - selectedCenterX) <= 1
  const isAlignedY = Math.abs(parentCenterY - selectedCenterY) <= 1

  return (
    <>
      <span
        className={`figma-transform-guide figma-transform-guide--v${isAlignedX ? ' figma-transform-guide--aligned' : ''}`}
        style={{
          height: parentRect.h,
          left: parentCenterX,
          top: parentRect.y,
        }}
      />
      <span
        className={`figma-transform-guide figma-transform-guide--h${isAlignedY ? ' figma-transform-guide--aligned' : ''}`}
        style={{
          left: parentRect.x,
          top: parentCenterY,
          width: parentRect.w,
        }}
      />
      <span
        className="figma-transform-guide figma-transform-guide--v figma-transform-guide--selected"
        style={{
          height: rect.h,
          left: selectedCenterX,
          top: rect.y,
        }}
      />
      <span
        className="figma-transform-guide figma-transform-guide--h figma-transform-guide--selected"
        style={{
          left: rect.x,
          top: selectedCenterY,
          width: rect.w,
        }}
      />
    </>
  )
}

function FigmaCloneGuideDistance({
  distance,
}: {
  distance: GuideDistance
}) {
  const style: CSSProperties = distance.axis === 'x'
    ? {
        left: distance.from.x,
        top: distance.from.y,
        width: distance.length,
      }
    : {
        height: distance.length,
        left: distance.from.x,
        top: distance.from.y,
      }

  return (
    <div
      className={`figma-guide-distance figma-guide-distance--${distance.axis}`}
      style={style}
    >
      <span>{Math.round(distance.length)}</span>
    </div>
  )
}

function getFigmaCloneInsetDistances(
  inner: GuideRect,
  outer: GuideRect,
): GuideDistance[] {
  const midX = inner.x + inner.w / 2
  const midY = inner.y + inner.h / 2
  const outerRight = outer.x + outer.w
  const outerBottom = outer.y + outer.h
  const innerRight = inner.x + inner.w
  const innerBottom = inner.y + inner.h

  const distances: GuideDistance[] = [
    {
      axis: 'y',
      from: { x: midX, y: outer.y },
      length: inner.y - outer.y,
    },
    {
      axis: 'y',
      from: { x: midX, y: innerBottom },
      length: outerBottom - innerBottom,
    },
    {
      axis: 'x',
      from: { x: outer.x, y: midY },
      length: inner.x - outer.x,
    },
    {
      axis: 'x',
      from: { x: innerRight, y: midY },
      length: outerRight - innerRight,
    },
  ]

  return distances.filter((distance) => distance.length > 0.5)
}
