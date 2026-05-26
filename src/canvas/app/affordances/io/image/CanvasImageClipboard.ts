import {
  readCanvasImageFileSource,
  type CanvasImageImportSource,
} from './CanvasImageImport'

export async function readCanvasClipboardImageSource(): Promise<
  CanvasImageImportSource | null
> {
  if (typeof navigator === 'undefined') {
    return null
  }

  const clipboard = navigator.clipboard

  if (!clipboard || typeof clipboard.read !== 'function') {
    return null
  }

  try {
    const items = await clipboard.read()

    for (const item of items) {
      const imageType = item.types.find((type) => type.startsWith('image/'))

      if (!imageType) {
        continue
      }

      return readCanvasImageFileSource(await item.getType(imageType))
    }
  } catch {
    return null
  }

  return null
}

export async function writeCanvasImageBlobToClipboard(blob: Blob) {
  if (typeof navigator === 'undefined') {
    return false
  }

  const clipboard = navigator.clipboard

  if (
    !clipboard ||
    typeof clipboard.write !== 'function' ||
    typeof ClipboardItem === 'undefined'
  ) {
    return false
  }

  try {
    await clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
    return true
  } catch {
    return false
  }
}
