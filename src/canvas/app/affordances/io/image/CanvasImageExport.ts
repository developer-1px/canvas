import type {
  Bounds,
  CanvasItem,
} from '../../../../entities'
import { writeCanvasImageBlobToClipboard } from './CanvasImageClipboard'
import {
  createCanvasItemsImageExport,
  type CanvasImageExportPayload,
} from './CanvasImageExportSvg'

export {
  createCanvasItemsImageExport,
  type CanvasImageExportPayload,
} from './CanvasImageExportSvg'

export type CanvasImageExportReadModel = {
  getSelectedItems: (ids: string[]) => CanvasItem[]
  getSelectionBounds: (ids: Iterable<string>) => Bounds | null
}

export type CanvasImageExportStageSnapshot = {
  getSelectionSvgSnapshot?: (input: {
    bounds: Bounds
    ids: readonly string[]
  }) => Omit<CanvasImageExportPayload, 'filename'> | null
}

const EXPORT_IMAGE_LOAD_TIMEOUT_MS = 3000

export function createCanvasSelectionImageExport({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}): CanvasImageExportPayload | null {
  if (selection.length === 0) {
    return null
  }

  const bounds = itemReadModel.getSelectionBounds(selection)

  if (!bounds) {
    return null
  }

  const snapshot = stageElement?.getSelectionSvgSnapshot?.({
    bounds,
    ids: selection,
  })

  if (snapshot) {
    return {
      ...snapshot,
      filename: 'canvas-selection.png',
    }
  }

  const items = itemReadModel.getSelectedItems(selection)

  if (items.length === 0) {
    return null
  }

  return createCanvasItemsImageExport({ bounds, items })
}

export function createCanvasSelectionImageExportCandidates({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}): CanvasImageExportPayload[] {
  if (selection.length === 0) {
    return []
  }

  const bounds = itemReadModel.getSelectionBounds(selection)

  if (!bounds) {
    return []
  }

  const snapshot = stageElement?.getSelectionSvgSnapshot?.({
    bounds,
    ids: selection,
  })
  const items = itemReadModel.getSelectedItems(selection)
  const candidates: CanvasImageExportPayload[] = []

  if (snapshot) {
    candidates.push({
      ...snapshot,
      filename: 'canvas-selection.png',
    })
  }

  if (items.length > 0) {
    candidates.push(createCanvasItemsImageExport({ bounds, items }))
  }

  return candidates
}

export async function downloadCanvasSelectionImage({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}) {
  const exportPayload = await renderCanvasImageExportCandidatePngBlob(
    createCanvasSelectionImageExportCandidates({
      itemReadModel,
      selection,
      stageElement,
    }),
  )

  if (!exportPayload) {
    return false
  }

  downloadCanvasImageBlob(exportPayload.blob, exportPayload.filename)
  return true
}

export async function copyCanvasSelectionImageToClipboard({
  itemReadModel,
  selection,
  stageElement,
}: {
  itemReadModel: CanvasImageExportReadModel
  selection: string[]
  stageElement?: CanvasImageExportStageSnapshot
}) {
  const exportPayload = await renderCanvasImageExportCandidatePngBlob(
    createCanvasSelectionImageExportCandidates({
      itemReadModel,
      selection,
      stageElement,
    }),
  )

  return exportPayload
    ? writeCanvasImageBlobToClipboard(exportPayload.blob)
    : false
}

async function renderCanvasImageExportCandidatePngBlob(
  candidates: CanvasImageExportPayload[],
) {
  for (const candidate of candidates) {
    try {
      return {
        blob: await renderCanvasImageExportPngBlob(candidate),
        filename: candidate.filename,
      }
    } catch {
      // Try the next representation; browser SVG rasterization support varies.
    }
  }

  return null
}

async function renderCanvasImageExportPngBlob({
  height,
  svg,
  width,
}: CanvasImageExportPayload) {
  const image = await loadCanvasImageFromSvg(svg)
  const canvas = document.createElement('canvas')
  const scale = Math.max(1, Math.ceil(window.devicePixelRatio || 1))
  const context = canvas.getContext('2d')

  canvas.width = width * scale
  canvas.height = height * scale

  if (!context) {
    throw new Error('Canvas image export unavailable')
  }

  context.scale(scale, scale)
  context.drawImage(image, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
        return
      }

      reject(new Error('Canvas image export failed'))
    }, 'image/png')
  })
}

function loadCanvasImageFromSvg(svg: string) {
  const url = URL.createObjectURL(
    new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
  )
  const image = new Image()

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Canvas image export timed out'))
    }, EXPORT_IMAGE_LOAD_TIMEOUT_MS)
    const cleanup = () => {
      window.clearTimeout(timeout)
      URL.revokeObjectURL(url)
    }

    image.addEventListener('load', () => {
      cleanup()
      resolve(image)
    }, { once: true })
    image.addEventListener('error', () => {
      cleanup()
      reject(new Error('Canvas image export failed'))
    }, { once: true })
    image.src = url
  })
}

function downloadCanvasImageBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}
