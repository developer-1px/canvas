import {
  createPreviewSurfaceStyleText,
} from '@interactive-os/preview-surface'
import {
  createHtmlSpecimenShadowPreviewCss,
} from './HtmlSpecimenVisualCssEdit'

export function updateHtmlSpecimenPreviewStyle({
  css,
  mediaContext,
  root,
}: {
  css: string
  mediaContext: {
    viewportHeight: number
    viewportWidth: number
  }
  root: ShadowRoot
}) {
  const style = root.querySelector('style')

  if (!(style instanceof HTMLStyleElement)) {
    return
  }

  style.textContent = createPreviewSurfaceStyleText(
    createHtmlSpecimenShadowPreviewCss({
      css,
      mediaContext,
    }),
  )
}
