import type { PointerEvent } from 'react'
import type { CanvasOverlayState } from '../../engine'
import type {
  Bounds,
  ResizeHandle,
  Viewport,
} from '../../core'
import {
  CANVAS_SVG_ARROW_MARKER_ID,
  CANVAS_SVG_DRAFT_ARROW_MARKER_ID,
  CANVAS_SVG_DRAFT_ARROW_MARKER_IRI,
  createCanvasSvgArrowPathData,
  createCanvasSvgPathData,
} from './CanvasSvgDrawingPrimitives'

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
      {overlays.draftRect ? (
        <rect
          className="draft-rect"
          x={overlays.draftRect.x}
          y={overlays.draftRect.y}
          width={overlays.draftRect.w}
          height={overlays.draftRect.h}
          vectorEffect="non-scaling-stroke"
        />
      ) : null}

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
          d={createCanvasSvgPathData(overlays.draftStroke.points)}
          opacity={overlays.draftStroke.opacity}
          stroke={overlays.draftStroke.stroke}
          strokeWidth={overlays.draftStroke.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
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
        <g className="presence-overlays">
          {overlays.presence.map((presence) =>
            presence.selectionBounds ? (
              <CanvasSvgPresenceSelection
                key={`${presence.id}-selection`}
                bounds={presence.selectionBounds}
                color={presence.color}
                label={presence.label}
                scale={1 / viewport.scale}
              />
            ) : null,
          )}
          {overlays.presence.map((presence) => (
            <CanvasSvgPresenceCursor
              key={presence.id}
              color={presence.color}
              label={presence.label}
              scale={1 / viewport.scale}
              x={presence.point.x}
              y={presence.point.y}
            />
          ))}
        </g>
      ) : null}
    </>
  )
}

function CanvasSvgPresenceSelection({
  bounds,
  color,
  label,
  scale,
}: {
  bounds: Bounds
  color: string
  label: string
  scale: number
}) {
  const labelWidth = Math.max(36, label.length * 7 + 18)

  return (
    <g className="presence-selection">
      <rect
        className="presence-selection-rect"
        x={bounds.x}
        y={bounds.y}
        width={bounds.w}
        height={bounds.h}
        stroke={color}
        vectorEffect="non-scaling-stroke"
      />
      <g
        className="presence-selection-label"
        transform={`translate(${bounds.x} ${bounds.y}) scale(${scale})`}
      >
        <rect width={labelWidth} height="22" rx="5" fill={color} />
        <text className="presence-label-text" x="9" y="15">
          {label}
        </text>
      </g>
    </g>
  )
}

function CanvasSvgPresenceCursor({
  color,
  label,
  scale,
  x,
  y,
}: {
  color: string
  label: string
  scale: number
  x: number
  y: number
}) {
  const labelWidth = Math.max(36, label.length * 7 + 18)

  return (
    <g
      className="presence-cursor"
      transform={`translate(${x} ${y}) scale(${scale})`}
    >
      <path
        className="presence-cursor-pointer"
        d="M 0 0 L 0 22 L 6 16 L 10 26 L 15 24 L 10 14 L 19 14 Z"
        fill={color}
      />
      <g transform="translate(12 18)">
        <rect
          className="presence-label-bg"
          width={labelWidth}
          height="22"
          rx="5"
          fill={color}
        />
        <text className="presence-label-text" x="9" y="15">
          {label}
        </text>
      </g>
    </g>
  )
}
