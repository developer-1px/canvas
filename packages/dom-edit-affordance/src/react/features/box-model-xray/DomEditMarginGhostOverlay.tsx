import {
  createDomEditOverlayRectStyle,
} from '../../../shared/geometry/DomEditOverlayGeometry'
import {
  getDomEditBoxModelRects,
  readDomEditBoxModelMetrics,
  type DomEditBoxModelRect,
  type DomEditBoxModelSideRect,
} from './DomEditBoxModelGeometry'

export function DomEditMarginGhostOverlay({
  owner = 'selected',
  rect,
  target,
}: {
  owner?: 'hover' | 'selected'
  rect: DomEditBoxModelRect
  target: HTMLElement
}) {
  const metrics = readDomEditBoxModelMetrics(getComputedStyle(target))
  const marginRects = getDomEditBoxModelRects({ metrics, rect }).margin

  return (
    <>
      {marginRects.map((marginRect) => (
        <DomEditMarginGhostBand
          key={marginRect.side}
          owner={owner}
          rect={marginRect}
          value={metrics.margin[marginRect.side]}
        />
      ))}
    </>
  )
}

function DomEditMarginGhostBand({
  owner,
  rect,
  value,
}: {
  owner: 'hover' | 'selected'
  rect: DomEditBoxModelSideRect
  value: number
}) {
  if (value <= 0.5 || rect.h <= 0.5 || rect.w <= 0.5) {
    return null
  }

  return (
    <>
      <div
        className={[
          'figma-margin-ghost',
          `figma-margin-ghost--${rect.side}`,
          `figma-margin-ghost--${owner}`,
        ].join(' ')}
        data-margin-ghost-owner={owner}
        data-margin-readonly="true"
        data-margin-side={rect.side}
        style={createDomEditOverlayRectStyle(rect)}
      />
      <span
        aria-label={`Margin ${rect.side} ${Math.round(value)} read-only`}
        className={[
          'figma-margin-ghost-label',
          `figma-margin-ghost-label--${rect.side}`,
          `figma-margin-ghost-label--${owner}`,
        ].join(' ')}
        data-margin-ghost-owner={owner}
        data-margin-label-side={rect.side}
        style={getDomEditMarginGhostLabelStyle(rect)}
      >
        Margin {Math.round(value)}
      </span>
    </>
  )
}

function getDomEditMarginGhostLabelStyle(
  rect: DomEditBoxModelSideRect,
) {
  return {
    left: rect.x + rect.w / 2,
    top: rect.y + rect.h / 2,
  }
}
