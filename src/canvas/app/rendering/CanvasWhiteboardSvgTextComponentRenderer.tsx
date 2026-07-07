import type { CanvasComponentItem } from '../../entities'
import {
  getCanvasLinkPreviewDomain,
  normalizeCanvasLinkPreviewOrientation,
} from '../../host'
import {
  CanvasWhiteboardSvgComponentText,
  CanvasWhiteboardSvgSectionText,
  CanvasWhiteboardSvgStickyText,
} from './CanvasWhiteboardSvgComponentText'

export function CanvasWhiteboardSvgCardComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <>
      <rect
        className="component-card component-concept-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="5"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasWhiteboardSvgComponentText item={item} />
    </>
  )
}

export function CanvasWhiteboardSvgStickyComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <>
      <rect
        className="component-sticky-note"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="4"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasWhiteboardSvgStickyText item={item} />
    </>
  )
}

export function CanvasWhiteboardSvgLabelComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <>
      <rect
        className="component-hit"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
      />
      <CanvasWhiteboardSvgComponentText item={item} compact />
    </>
  )
}

export function CanvasWhiteboardSvgSectionComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <>
      <rect
        className="component-section"
        data-section-id={item.id}
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="5"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <line
        className="component-section-spine"
        data-section-id={item.id}
        x1={item.x}
        y1={item.y + 12}
        x2={item.x}
        y2={item.y + item.h - 12}
        stroke={item.accent}
        vectorEffect="non-scaling-stroke"
      />
      <line
        className="component-section-rule"
        data-section-id={item.id}
        x1={item.x + 16}
        y1={item.y + 44}
        x2={item.x + item.w - 16}
        y2={item.y + 44}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasWhiteboardSvgSectionText item={item} />
    </>
  )
}

export function CanvasWhiteboardSvgImageComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="5"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${item.x + 18} ${item.y + item.h - 22} L ${item.x + 78} ${
          item.y + 88
        } L ${item.x + 122} ${item.y + 122} L ${item.x + item.w - 18} ${
          item.y + 58
        }`}
        fill="none"
        stroke={item.accent}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={item.x + item.w - 42} cy={item.y + 36} r="10" fill={item.accent} />
      <CanvasWhiteboardSvgComponentText item={item} compact />
    </>
  )
}

export function CanvasWhiteboardSvgLinkPreviewComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  const url = item.url ?? item.body ?? ''
  const domain = url ? getCanvasLinkPreviewDomain(url) : item.title
  const orientation = normalizeCanvasLinkPreviewOrientation(item.orientation)
  const isVertical = orientation === 'vertical'
  const mediaHeight = isVertical ? 116 : 38

  return (
    <>
      <rect
        className={`component-card component-link-preview-card component-link-preview-card-${orientation}`}
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="5"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={item.x}
        y={item.y}
        width={item.w}
        height={mediaHeight}
        rx="5"
        fill="#eff6ff"
      />
      <rect
        x={item.x}
        y={item.y + mediaHeight - 10}
        width={item.w}
        height="10"
        fill="#eff6ff"
      />
      <circle
        cx={item.x + (isVertical ? item.w - 24 : 23)}
        cy={item.y + (isVertical ? mediaHeight - 24 : 19)}
        r={isVertical ? 11 : 7}
        fill={item.accent}
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className={`component-link-preview component-link-preview-${orientation}`}>
          <div className="component-link-preview-domain">{domain}</div>
          <div className="component-link-preview-title">{item.title}</div>
          <div className="component-link-preview-url">{url}</div>
        </div>
      </foreignObject>
    </>
  )
}
