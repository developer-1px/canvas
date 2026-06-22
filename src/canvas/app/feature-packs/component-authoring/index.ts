import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import {
  CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY,
} from '../component-library'
import { CanvasComponentPalette } from './CanvasComponentPalette'
import {
  CanvasStickyQuickCreateControl,
} from './CanvasStickyQuickCreateControl'

export {
  insertCanvasComponent,
} from './CanvasComponentInsertionExecution'
export {
  CanvasComponentPalette,
  type CanvasComponentPaletteItem,
  type CanvasComponentPaletteProps,
} from './CanvasComponentPalette'
export {
  CanvasStickyQuickCreateControl,
  type CanvasStickyQuickCreateControlPoint,
  type CanvasStickyQuickCreateControlProps,
} from './CanvasStickyQuickCreateControl'
export {
  getCanvasStickyQuickCreateControlPoints,
  quickCreateCanvasSticky,
  type CanvasStickyQuickCreateControlPoint as CanvasStickyQuickCreateExecutionControlPoint,
  type CanvasStickyQuickCreateControlPointInput,
} from './CanvasStickyQuickCreateExecution'
export {
  useCanvasComponentInsertion,
  useCanvasStickyQuickCreate,
  useCanvasStickyQuickCreateControlPoints,
} from './useCanvasComponentInsertion'

export const CANVAS_APP_COMPONENT_AUTHORING_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'component-authoring',
    label: 'Component authoring',
    viewRenderers: {
      componentPalette: (props) => createElement(CanvasComponentPalette, props),
      stickyQuickCreate: (props) =>
        createElement(CanvasStickyQuickCreateControl, props),
    },
  })

export const CANVAS_APP_COMPONENT_AUTHORING_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    category: 'authoring',
    contributes: {
      surfaces: ['view-renderer'],
    },
    id: 'component-authoring',
    label: 'Component authoring',
    lifecycle: {
      hotReloadable: true,
      orphanedDataPolicy: 'preserve',
      partialUpdate: ['view-renderer'],
      runtimeToggleable: true,
    },
    requires: [CANVAS_COMPONENT_RUNTIME_FEATURE_PACK_CAPABILITY],
    viewFeaturePack: CANVAS_APP_COMPONENT_AUTHORING_VIEW_FEATURE_PACK,
  })
