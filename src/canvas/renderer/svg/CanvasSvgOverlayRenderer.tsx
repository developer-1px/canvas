import type { PointerEvent } from 'react'
import type { CanvasOverlayState } from '../../engine'
import type {
  ResizeHandle,
  Viewport,
} from '../../core'
import {
  CANVAS_SVG_ARROW_MARKER_ID,
  CANVAS_SVG_DRAFT_ARROW_MARKER_ID,
  CANVAS_SVG_DRAFT_ARROW_MARKER_IRI,
  createCanvasSvgArrowPathData,
  createCanvasSvgFreehandPathData,
} from './CanvasSvgDrawingPrimitives'
import { CanvasSvgDraftShapeOverlay } from './CanvasSvgDraftShapeOverlay'
import { CanvasSvgPresenceOverlays } from './CanvasSvgPresenceOverlays'
import {
  CanvasSvgEmoteBurst,
  CanvasSvgLaserTrail,
} from './CanvasSvgTransientOverlays'

type CanvasSvgInteractionOverlaysProps = {
  overlays: CanvasOverlayState
  viewport: Viewport
  onResizePointerDown: (
    event: PointerEvent<SVGRectElement>,
    handle: ResizeHandle,
  ) => void
}

export function CanvasSvgOverlayDefs() {
  return (
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" className="grid-line" />
      </pattern>
      <marker
        id={CANVAS_SVG_ARROW_MARKER_ID}
        markerHeight="8"
        markerWidth="8"
        orient="auto"
        refX="7"
        refY="4"
        viewBox="0 0 8 8"
      >
        <path d="M 0 0 L 8 4 L 0 8 z" className="arrow-head" />
      </marker>
      <marker
        id={CANVAS_SVG_DRAFT_ARROW_MARKER_ID}
        markerHeight="8"
        markerWidth="8"
        orient="auto"
        refX="7"
        refY="4"
        viewBox="0 0 8 8"
      >
        <path d="M 0 0 L 8 4 L 0 8 z" className="draft-arrow-head" />
      </marker>
    </defs>
  )
}

export function CanvasSvgOverlayPlane({
  overlays,
}: {
  overlays: CanvasOverlayState
}) {
  return overlays.grid ? (
    <rect
      className="grid-plane"
      x="-10000"
      y="-10000"
      width="20000"
      height="20000"
    />
  ) : null
}

export function CanvasSvgInteractionOverlays({
  overlays,
  viewport,
  onResizePointerDown,
}: CanvasSvgInteractionOverlaysProps) {
  return (
    <>
      {overlays.draftRect
        ? <CanvasSvgDraftShapeOverlay draftRect={overlays.draftRect} />
        : null}

      {overlays.draftArrow ? (
        <path
          className="draft-arrow"
          d={createCanvasSvgArrowPathData(overlays.draftArrow)}
          markerEnd={CANVAS_SVG_DRAFT_ARROW_MARKER_IRI}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}

      {overlays.draftStroke ? (
        <path
          className={`draft-stroke draft-${overlays.draftStroke.kind}`}
          d={createCanvasSvgFreehandPathData(overlays.draftStroke.points)}
          opacity={overlays.draftStroke.opacity}
          stroke={overlays.draftStroke.stroke}
          strokeWidth={overlays.draftStroke.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}

      {overlays.laserTrail
        ? <CanvasSvgLaserTrail laserTrail={overlays.laserTrail} />
        : null}

      {overlays.emoteBursts.length > 0 ? (
        <g className="emote-bursts">
          {overlays.emoteBursts.map((burst) => (
            <CanvasSvgEmoteBurst
              key={burst.id}
              burst={burst}
              scale={1 / viewport.scale}
            />
          ))}
        </g>
      ) : null}

      {overlays.alignmentGuides.length > 0 ? (
        <g className="alignment-guides">
          {overlays.alignmentGuides.map((guide, index) =>
            guide.orientation === 'vertical' ? (
              <line
                key={`${guide.orientation}-${guide.position}-${index}`}
                className="alignment-guide"
                x1={guide.position}
                y1={guide.start}
                x2={guide.position}
                y2={guide.end}
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <line
                key={`${guide.orientation}-${guide.position}-${index}`}
                className="alignment-guide"
                x1={guide.start}
                y1={guide.position}
                x2={guide.end}
                y2={guide.position}
                vectorEffect="non-scaling-stroke"
              />
            ),
          )}
        </g>
      ) : null}

      {overlays.spacingGuides.length > 0 ? (
        <g className="spacing-guides">
          {overlays.spacingGuides.map((guide, guideIndex) => (
            <g
              key={`${guide.orientation}-${guide.gap}-${guideIndex}`}
              data-gap={guide.gap}
            >
              {guide.segments.map((segment, segmentIndex) => (
                <line
                  key={segmentIndex}
                  className="spacing-guide"
                  x1={segment.start.x}
                  y1={segment.start.y}
                  x2={segment.end.x}
                  y2={segment.end.y}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          ))}
        </g>
      ) : null}

      {overlays.selectionBounds ? (
        <rect
          className="selection-bounds"
          x={overlays.selectionBounds.x}
          y={overlays.selectionBounds.y}
          width={overlays.selectionBounds.w}
          height={overlays.selectionBounds.h}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}

      {overlays.resizeHandles.length > 0 ? (
        <g className="resize-handles">
          {overlays.resizeHandles.map(({ handle, point, size }) => (
            <rect
              key={handle}
              className="resize-handle"
              data-handle={handle}
              x={point.x - size / 2}
              y={point.y - size / 2}
              width={size}
              height={size}
              vectorEffect="non-scaling-stroke"
              onPointerDown={(event) => onResizePointerDown(event, handle)}
            />
          ))}
        </g>
      ) : null}

      {overlays.marquee ? (
        <rect
          className="marquee"
          x={overlays.marquee.x}
          y={overlays.marquee.y}
          width={overlays.marquee.w}
          height={overlays.marquee.h}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}

      {overlays.presence && overlays.presence.length > 0 ? (
        <CanvasSvgPresenceOverlays
          presence={overlays.presence}
          scale={1 / viewport.scale}
        />
      ) : null}
    </>
  )
}
