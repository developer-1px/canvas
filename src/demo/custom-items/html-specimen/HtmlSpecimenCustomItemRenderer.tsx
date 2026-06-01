import type { CanvasAppCustomItemRendererStrategy } from '../../../canvas'
import {
  getHtmlSpecimenData,
} from './HtmlSpecimenCustomItemModel'
import { HtmlSpecimenShadowPreview } from './HtmlSpecimenShadowPreview'

export const htmlSpecimenItemRenderer: CanvasAppCustomItemRendererStrategy = ({
  item,
}) => {
  const specimen = getHtmlSpecimenData(item)

  return (
    <g className="demo-html-specimen-node">
      <rect
        className="component-card demo-html-specimen-card"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        rx="0"
        fill="transparent"
        stroke="transparent"
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className="demo-html-specimen-shell">
          <HtmlSpecimenShadowPreview
            itemId={item.id}
            specimen={specimen}
            title={item.title}
          />
        </div>
      </foreignObject>
      <rect
        className="demo-html-specimen-hit"
        x={item.x}
        y={item.y}
        width={item.w}
        height={item.h}
        fill="transparent"
      />
    </g>
  )
}
