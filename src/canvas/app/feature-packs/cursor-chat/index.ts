import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasCursorChat } from './CanvasCursorChat'
import {
  useCanvasCursorChatModel,
} from './useCanvasCursorChatModel'

export {
  CanvasCursorChat,
  type CanvasCursorChatProps,
} from './CanvasCursorChat'
export {
  CANVAS_CURSOR_CHAT_MAX_LENGTH,
  useCanvasCursorChatModel,
} from './useCanvasCursorChatModel'

export const CANVAS_APP_CURSOR_CHAT_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'cursor-chat',
    label: 'Cursor chat',
    viewRenderers: {
      cursorChat: (props) => createElement(CanvasCursorChat, props),
    },
  })

export const CANVAS_APP_CURSOR_CHAT_RUNTIME_FEATURE_PACK = Object.freeze({
  disabledConfig: {
    overlays: {
      cursorChat: false,
    },
    shortcuts: {
      cursorChat: false,
    },
  },
  featurePackId: 'cursor-chat',
  id: 'cursor-chat',
  useModel: useCanvasCursorChatModel,
})

export const CANVAS_APP_CURSOR_CHAT_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'cursor-chat',
    label: 'Cursor chat',
    runtimeFeaturePacks: {
      cursorChat: CANVAS_APP_CURSOR_CHAT_RUNTIME_FEATURE_PACK,
    },
    viewFeaturePack: CANVAS_APP_CURSOR_CHAT_VIEW_FEATURE_PACK,
  })
