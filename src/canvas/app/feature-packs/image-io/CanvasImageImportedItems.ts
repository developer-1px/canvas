import type {
  CanvasImageItem,
} from '../../../entities'
import {
  createCanvasImageItem,
} from '../../../host'
import type {
  CanvasImageImportSource,
  CanvasImportedImageItemInput,
  CanvasImportedImageSize,
  CanvasImportedImageSizeOptions,
} from './CanvasImageImportContracts'

const DEFAULT_IMAGE_WIDTH = 320
const DEFAULT_IMAGE_HEIGHT = 220
const MAX_IMAGE_WIDTH = 520
const MAX_IMAGE_HEIGHT = 360

export function createCanvasImportedImageItem({
  center,
  createId,
  source,
}: CanvasImportedImageItemInput): CanvasImageItem {
  const size = getCanvasImportedImageSize(source)

  return createCanvasImageItem({
    alt: source.name,
    h: size.h,
    id: createId('image'),
    mimeType: source.mimeType,
    name: source.name,
    naturalHeight: source.naturalHeight,
    naturalWidth: source.naturalWidth,
    src: source.dataUrl,
    w: size.w,
    x: center.x - size.w / 2,
    y: center.y - size.h / 2,
  })
}

export function getCanvasImportedImageSize({
  naturalHeight,
  naturalWidth,
}: Pick<CanvasImageImportSource, 'naturalHeight' | 'naturalWidth'>,
options: CanvasImportedImageSizeOptions = {},
): CanvasImportedImageSize {
  const fallbackWidth =
    options.fallbackSize?.w ?? DEFAULT_IMAGE_WIDTH
  const fallbackHeight =
    options.fallbackSize?.h ?? DEFAULT_IMAGE_HEIGHT
  const maxWidth = options.maxSize?.w ?? MAX_IMAGE_WIDTH
  const maxHeight = options.maxSize?.h ?? MAX_IMAGE_HEIGHT

  if (!naturalWidth || !naturalHeight) {
    return {
      h: Math.max(1, fallbackHeight),
      w: Math.max(1, fallbackWidth),
    }
  }

  const scale = Math.min(
    1,
    maxWidth / naturalWidth,
    maxHeight / naturalHeight,
  )

  return {
    h: Math.max(1, Math.round(naturalHeight * scale)),
    w: Math.max(1, Math.round(naturalWidth * scale)),
  }
}
