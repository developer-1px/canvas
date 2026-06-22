import type {
  CanvasImageImportSource,
} from './CanvasImageImportContracts'

export async function resolveCanvasImageSourceNaturalSize(
  source: CanvasImageImportSource,
): Promise<CanvasImageImportSource> {
  if (source.naturalWidth && source.naturalHeight) {
    return source
  }

  const naturalSize = await readCanvasImageNaturalSize(source.dataUrl)

  return naturalSize
    ? {
        ...source,
        naturalHeight: naturalSize.h,
        naturalWidth: naturalSize.w,
      }
    : source
}

export async function readCanvasImageNaturalSize(dataUrl: string) {
  if (typeof Image === 'undefined') {
    return null
  }

  try {
    const image = new Image()
    image.src = dataUrl

    await image.decode()

    return image.naturalWidth > 0 && image.naturalHeight > 0
      ? { h: image.naturalHeight, w: image.naturalWidth }
      : null
  } catch {
    return null
  }
}
