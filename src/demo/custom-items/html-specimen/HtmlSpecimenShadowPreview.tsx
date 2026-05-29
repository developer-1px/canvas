import {
  getOrCreatePreviewSurfaceRoot,
  indexPreviewSurface,
  renderHtmlPreviewSurface,
} from '@interactive-os/preview-surface'
import {
  useEffect,
  useRef,
} from 'react'
import type { HtmlSpecimenData } from './HtmlSpecimenCustomItemModel'

export function HtmlSpecimenShadowPreview({
  specimen,
  title,
}: {
  specimen: HtmlSpecimenData
  title: string
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    const root = getOrCreatePreviewSurfaceRoot(host)

    renderHtmlPreviewSurface(root, {
      css: specimen.css,
      html: specimen.html,
    })

    const nodes = indexPreviewSurface(root)
    host.dataset.previewNodeCount = String(nodes.length)
    host.dispatchEvent(new CustomEvent('preview-surface:indexed', {
      bubbles: true,
      detail: { nodes },
    }))
  }, [specimen.css, specimen.html])

  return (
    <div
      ref={hostRef}
      className="demo-html-specimen-preview"
      title={title}
    />
  )
}
