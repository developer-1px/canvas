import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasImageControls } from './CanvasImageControls'

export {
  readCanvasClipboardImageSource,
  writeCanvasImageBlobToClipboard,
} from './CanvasImageClipboard'
export {
  CanvasImageControls,
  type CanvasImageControlsProps,
} from './CanvasImageControls'
export {
  copyCanvasSelectionImageToClipboard,
  createCanvasItemsImageExport,
  createCanvasSelectionImageExport,
  createCanvasSelectionImageExportCandidates,
  downloadCanvasSelectionImage,
  type CanvasImageExportPayload,
  type CanvasImageExportReadModel,
  type CanvasImageExportStageSnapshot,
} from './CanvasImageExport'
export {
  CANVAS_IMAGE_FILE_IMPORT_SUPPORTED_FORMATS,
  CANVAS_IMAGE_SOURCE_IMPORT_SUPPORTED_FORMATS,
  createCanvasImportedImageItem,
  getCanvasDataImageSourceFromHTML,
  getCanvasDataImageSourceFromDataTransfer,
  getCanvasHTMLDataImageSourcesFromHTML,
  getCanvasHTMLDataImageSourcesFromDataTransfer,
  getCanvasImageFileFromDataTransfer,
  getCanvasImageFileFromList,
  getCanvasImageFilesFromDataTransfer,
  getCanvasImageFilesFromList,
  getCanvasImageSourceFromDataTransfer,
  getCanvasImportedImageSize,
  getCanvasSVGImageSourceFromHTML,
  getCanvasSVGImageSourceFromDataTransfer,
  isCanvasImageBlob,
  readCanvasImageFileSources,
  readCanvasImageFileSource,
  resolveCanvasImageSourceNaturalSize,
  routeCanvasImagePasteReplace,
  type CanvasImageImportFormat,
  type CanvasImageImportSource,
  type CanvasImagePasteReplaceFallbackReason,
  type CanvasImagePasteReplaceFallbackRoute,
  type CanvasImagePasteReplaceIntent,
  type CanvasImagePasteReplaceRoute,
  type CanvasImagePasteReplaceRouteInput,
  type CanvasImagePasteReplaceRoutedRoute,
  type CanvasImagePasteReplaceTarget,
  type CanvasImagePasteReplaceTargetInput,
  type CanvasImportedImageItemInput,
  type CanvasImportedImageSize,
  type CanvasImportedImageSizeOptions,
} from './CanvasImageImport'
export {
  getCanvasImageInsertCenter,
  insertCanvasImageSource,
  type CanvasImageInsertCenterInput,
  type CanvasImageInsertionContext,
} from './CanvasImageInsertion'
export {
  useCanvasImageControls,
  type CanvasImageControlsInput,
  type CanvasImageControlsModel,
} from './useCanvasImageControls'

export const CANVAS_APP_IMAGE_IO_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'image-io',
    label: 'Image IO',
    viewRenderers: {
      imageControls: (props) => createElement(CanvasImageControls, props),
    },
  })

export const CANVAS_APP_IMAGE_IO_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'image-io',
    label: 'Image IO',
    viewFeaturePack: CANVAS_APP_IMAGE_IO_VIEW_FEATURE_PACK,
  })
