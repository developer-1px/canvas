export type CanvasHTMLImageSource = Readonly<{
  alt: string
  src: string
  title: string
}>

export function getCanvasHTMLImageSource(
  value: string,
  options: { svgOnly?: boolean } = {},
) {
  return getCanvasHTMLImageSources(value, options)[0] ?? null
}

export function getCanvasHTMLImageSources(
  value: string,
  options: { svgOnly?: boolean } = {},
): readonly CanvasHTMLImageSource[] {
  if (!value) {
    return []
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(value, 'text/html')

    return Array.from(doc.querySelectorAll<HTMLImageElement>('img[src]'))
      .map((image) => ({
        alt: image.alt,
        src: image.getAttribute('src')?.trim() ?? '',
        title: image.title,
      }))
      .filter((image) =>
        /^data:image\//i.test(image.src) &&
        (!options.svgOnly || getCanvasImageSourceLooksLikeSVG(image.src)),
      )
  }

  const images: CanvasHTMLImageSource[] = []

  for (const match of value.matchAll(/<img\b([^>]*)>/gi)) {
    const attributes = match[1]
    const src = getCanvasHTMLAttribute(attributes, 'src')

    if (
      src?.trim().match(/^data:image\//i) &&
      (!options.svgOnly || getCanvasImageSourceLooksLikeSVG(src))
    ) {
      images.push({
        alt: getCanvasHTMLAttribute(attributes, 'alt') ?? '',
        src,
        title: getCanvasHTMLAttribute(attributes, 'title') ?? '',
      })
    }
  }

  return images
}

export function getCanvasInlineSVGFromHTML(value: string) {
  if (!value) {
    return null
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(value, 'text/html')
    const svg = doc.querySelector('svg')

    return svg ? new XMLSerializer().serializeToString(svg) : null
  }

  return /<svg\b[\s\S]*?<\/svg>/i.exec(value)?.[0] ?? null
}

export function getCanvasHTMLAttribute(value: string, name: string) {
  const match = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i',
  ).exec(value)

  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null
}

function getCanvasImageSourceLooksLikeSVG(value: string) {
  return /^data:image\/svg\+xml/i.test(value.trim())
}
