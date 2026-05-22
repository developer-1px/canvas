import type { CanvasComponentItem } from '../../host/CanvasModel'
import { CanvasSvgComponentText } from './CanvasSvgComponentText'

export function CanvasSvgTextComponentRenderer({
  item,
}: {
  item: CanvasComponentItem
}) {
  if (item.component === 'sticky') {
    return <StickyComponent item={item} />
  }

  if (item.component === 'label') {
    return <LabelComponent item={item} />
  }

  if (item.component === 'section') {
    return <SectionComponent item={item} />
  }

  if (item.component === 'image') {
    return <ImageComponent item={item} />
  }

  return <CardComponent item={item} />
}

function CardComponent({ item }: { item: CanvasComponentItem }) {
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
      <CanvasSvgComponentText item={item} />
    </>
  )
}

function StickyComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <rect
        className="component-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="3"
        fill={item.fill}
        stroke={item.stroke}
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={`M ${item.x + item.w - 28} ${item.y} L ${item.x + item.w} ${
          item.y
        } L ${item.x + item.w} ${item.y + 28} Z`}
        fill="rgba(255, 255, 255, 0.45)"
      />
      <CanvasSvgComponentText item={item} />
    </>
  )
}

function LabelComponent({ item }: { item: CanvasComponentItem }) {
  return (
    <>
      <rect
        className="component-hit"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
      />
      <CanvasSvgComponentText item={item} compact />
    </>
  )
}

function SectionComponent({ item }: { item: CanvasComponentItem }) {
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
      <CanvasSvgComponentText item={item} compact />
    </>
  )
}

function ImageComponent({ item }: { item: CanvasComponentItem }) {
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
      <CanvasSvgComponentText item={item} compact />
    </>
  )
}
