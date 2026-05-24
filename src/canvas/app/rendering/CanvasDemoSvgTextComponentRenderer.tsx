import type { CanvasComponentItem } from '../../entities'
import {
  getCanvasLinkPreviewDomain,
  normalizeCanvasLinkPreviewOrientation,
} from '../../host'
import {
  CanvasDemoSvgComponentText,
  CanvasDemoSvgStickyText,
} from './CanvasDemoSvgComponentText'

export function CanvasDemoSvgCardComponent({
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
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={item.x}
        y={item.y}
        width="6"
        height={item.h}
        rx="3"
        fill={item.accent}
      />
      <CanvasDemoSvgComponentText item={item} />
    </>
  )
}

export function CanvasDemoSvgStickyComponent({
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
        rx="2"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasDemoSvgStickyText item={item} />
    </>
  )
}

export function CanvasDemoSvgLabelComponent({
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
      <CanvasDemoSvgComponentText item={item} compact />
    </>
  )
}

export function CanvasDemoSvgSectionComponent({
  item,
}: {
  item: CanvasComponentItem
}) {
  return (
    <>
      <rect
        className="component-section"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <CanvasDemoSvgComponentText item={item} compact />
    </>
  )
}

export function CanvasDemoSvgImageComponent({
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
        rx="8"
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
      <CanvasDemoSvgComponentText item={item} compact />
    </>
  )
}

export function CanvasDemoSvgLinkPreviewComponent({
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
        rx="8"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={item.x}
        y={item.y}
        width={item.w}
        height={mediaHeight}
        rx="8"
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
