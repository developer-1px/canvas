import {
  createDomEditOverlayRectStyle,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import {
  getDomEditBoxModelRects,
  readDomEditBoxModelMetrics,
  type DomEditBoxModelRect,
  type DomEditBoxModelSides,
  type DomEditBoxModelMetrics,
  type DomEditBoxModelSideRect,
} from './DomEditBoxModelGeometry'

type DomEditBoxModelOwner = 'hover' | 'selected'
type DomEditBoxModelLayer = 'border' | 'content' | 'margin' | 'padding'

export function DomEditBoxModelOverlay({
  owner = 'selected',
  rect,
  target,
}: {
  owner?: DomEditBoxModelOwner
  rect: DomEditBoxModelRect
  target: HTMLElement
}) {
  const metrics = measureDomEditBoxModel(target)
  const boxRects = getDomEditBoxModelRects({ metrics, rect })

  return (
    <>
      {boxRects.margin.map((marginRect) => (
        <DomEditBoxModelBand
          key={`margin:${marginRect.side}`}
          layer="margin"
          owner={owner}
          rect={marginRect}
        />
      ))}
      <DomEditBoxModelLayerRect
        layer="border"
        owner={owner}
        rect={boxRects.border}
      />
      {boxRects.padding.map((paddingRect) => (
        <DomEditBoxModelBand
          key={`padding:${paddingRect.side}`}
          layer="padding"
          owner={owner}
          rect={paddingRect}
        />
      ))}
      <DomEditBoxModelLayerRect
        layer="content"
        owner={owner}
        rect={boxRects.content}
      />
      {hasAnySide(metrics.margin) ? (
        <span
          className={[
            'figma-boxmodel-value',
            'figma-boxmodel-value--margin',
            `figma-boxmodel-value--${owner}`,
          ].join(' ')}
          data-box-model-owner={owner}
          style={{
            left: rect.x - metrics.margin.left,
            top: rect.y - metrics.margin.top - 4,
          }}
        >
          Mar {formatDomEditSides(metrics.margin)}
        </span>
      ) : null}
      {hasAnySide(metrics.padding) ? (
        <span
          className={[
            'figma-boxmodel-value',
            'figma-boxmodel-value--padding',
            `figma-boxmodel-value--${owner}`,
          ].join(' ')}
          data-box-model-owner={owner}
          style={{
            left: rect.x + metrics.border.left + metrics.padding.left,
            top: rect.y + metrics.border.top + metrics.padding.top,
          }}
        >
          Pad {formatDomEditSides(metrics.padding)}
        </span>
      ) : null}
    </>
  )
}

function DomEditBoxModelLayerRect({
  layer,
  owner,
  rect,
}: {
  layer: DomEditBoxModelLayer
  owner: DomEditBoxModelOwner
  rect: DomEditBoxModelRect
}) {
  return (
    <div
      className={getDomEditBoxModelLayerClassName(layer, owner)}
      data-box-model-layer={layer}
      data-box-model-owner={owner}
      style={createDomEditOverlayRectStyle(rect)}
    />
  )
}

function DomEditBoxModelBand({
  layer,
  owner,
  rect,
}: {
  layer: 'margin' | 'padding'
  owner: DomEditBoxModelOwner
  rect: DomEditBoxModelSideRect
}) {
  if (rect.h <= 0.5 || rect.w <= 0.5) {
    return null
  }

  return (
    <div
      className={getDomEditBoxModelLayerClassName(layer, owner)}
      data-box-model-layer={layer}
      data-box-model-owner={owner}
      data-box-model-side={rect.side}
      style={createDomEditOverlayRectStyle(rect)}
    />
  )
}

function measureDomEditBoxModel(target: HTMLElement): DomEditBoxModelMetrics {
  return readDomEditBoxModelMetrics(getComputedStyle(target))
}

function getDomEditBoxModelLayerClassName(
  layer: DomEditBoxModelLayer,
  owner: DomEditBoxModelOwner,
) {
  return [
    'figma-boxmodel-layer',
    `figma-boxmodel-layer--${owner}`,
    `figma-boxmodel-${layer}`,
    `figma-boxmodel-${layer}--${owner}`,
  ].join(' ')
}

function hasAnySide(sides: DomEditBoxModelSides): boolean {
  return Object.values(sides).some((value) => value > 0.5)
}

function formatDomEditSides(sides: DomEditBoxModelSides): string {
  const values = [sides.top, sides.right, sides.bottom, sides.left]
    .map((value) => Math.round(value))
  const uniqueValues = new Set(values)

  return uniqueValues.size === 1
    ? String(values[0])
    : values.join('/')
}
