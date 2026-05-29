import { Copy } from 'lucide-react'
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
        rx="5"
        fill="#ffffff"
        stroke="#dfe5ee"
        vectorEffect="non-scaling-stroke"
      />
      <foreignObject x={item.x} y={item.y} width={item.w} height={item.h}>
        <div className="demo-html-specimen-shell">
          <div className="demo-html-specimen-bar">
            <strong>{item.title}</strong>
            <div className="demo-html-specimen-bar-actions">
              <span>
                {specimen.viewportWidth}x{specimen.viewportHeight}
              </span>
              <button
                aria-label="Copy HTML"
                className="demo-html-specimen-copy"
                onClick={(event) => {
                  if (event.detail === 0) {
                    exportHtmlSpecimenHtml(event.currentTarget, specimen.html)
                    void copyHtmlSpecimenText(specimen.html)
                  }
                }}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  exportHtmlSpecimenHtml(event.currentTarget, specimen.html)
                  void copyHtmlSpecimenText(specimen.html)
                }}
                title="Copy HTML"
                type="button"
              >
                <Copy aria-hidden="true" size={13} strokeWidth={1.8} />
                <span>HTML</span>
              </button>
              <button
                aria-label="Copy CSS"
                className="demo-html-specimen-copy"
                onClick={(event) => {
                  if (event.detail === 0) {
                    exportHtmlSpecimenCss(event.currentTarget, specimen.css)
                    void copyHtmlSpecimenText(specimen.css)
                  }
                }}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  exportHtmlSpecimenCss(event.currentTarget, specimen.css)
                  void copyHtmlSpecimenText(specimen.css)
                }}
                title="Copy CSS"
                type="button"
              >
                <Copy aria-hidden="true" size={13} strokeWidth={1.8} />
                <span>CSS</span>
              </button>
            </div>
          </div>
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

function exportHtmlSpecimenCss(target: HTMLElement, css: string) {
  target.dispatchEvent(new CustomEvent('html-specimen-css:export', {
    bubbles: true,
    detail: { css },
  }))
}

function exportHtmlSpecimenHtml(target: HTMLElement, html: string) {
  target.dispatchEvent(new CustomEvent('html-specimen-html:export', {
    bubbles: true,
    detail: { html },
  }))
}

async function copyHtmlSpecimenText(text: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return
  }

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Export event above remains available when clipboard permission is denied.
  }
}
