import { createElement } from 'react'
import {
  createCanvasAppFeaturePackManifest,
} from '../CanvasAppFeaturePackManifests'
import {
  createCanvasAppViewFeaturePack,
} from '../CanvasAppFeaturePackViews'
import { CanvasEmoteControls } from './CanvasEmoteControls'
import { CanvasSessionTimer } from './CanvasSessionTimer'
import { CanvasSpotlight } from './CanvasSpotlight'
import { CanvasVotingSession } from './CanvasVotingSession'
import { useCanvasEmoteModel } from './useCanvasEmoteModel'
import { useCanvasSessionTimerModel } from './useCanvasSessionTimerModel'
import { useCanvasSpotlightModel } from './useCanvasSpotlightModel'
import { useCanvasVotingSessionModel } from './useCanvasVotingSessionModel'

export {
  CANVAS_APP_FACILITATION_AFFORDANCE_CONFIG,
  CANVAS_APP_FACILITATION_BUNDLE_ID,
  CANVAS_APP_FACILITATION_DISABLED_AFFORDANCE_CONFIG,
  createCanvasAppFacilitationAffordanceConfigInput,
  mergeCanvasAppAffordanceConfigInput,
  withCanvasAppFacilitationBundle,
  type CanvasAppFacilitationBundleOptions,
} from './CanvasAppFacilitationBundle'
export { CanvasEmoteControls } from './CanvasEmoteControls'
export { CanvasSessionTimer } from './CanvasSessionTimer'
export { CanvasSpotlight } from './CanvasSpotlight'
export { CanvasVotingSession } from './CanvasVotingSession'
export { useCanvasEmoteModel } from './useCanvasEmoteModel'
export { useCanvasSessionTimerModel } from './useCanvasSessionTimerModel'
export { useCanvasSpotlightModel } from './useCanvasSpotlightModel'
export { useCanvasVotingSessionModel } from './useCanvasVotingSessionModel'

export const CANVAS_APP_FACILITATION_VIEW_FEATURE_PACK =
  createCanvasAppViewFeaturePack({
    id: 'facilitation',
    label: 'Facilitation',
    viewRenderers: {
      emoteControls: (props) => createElement(CanvasEmoteControls, props),
      sessionTimer: (props) => createElement(CanvasSessionTimer, props),
      spotlight: (props) => createElement(CanvasSpotlight, props),
      votingSession: (props) => createElement(CanvasVotingSession, props),
    },
  })

export const CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS = Object.freeze({
  emote: {
    disabledConfig: {
      gestures: {
        emoteBurst: false,
      },
      overlays: {
        emoteBursts: false,
        emoteControls: false,
      },
    },
    featurePackId: 'facilitation',
    id: 'facilitation:emote',
    useModel: useCanvasEmoteModel,
  },
  sessionTimer: {
    disabledConfig: {
      overlays: {
        sessionTimer: false,
      },
    },
    featurePackId: 'facilitation',
    id: 'facilitation:session-timer',
    useModel: useCanvasSessionTimerModel,
  },
  spotlight: {
    disabledConfig: {
      overlays: {
        spotlight: false,
      },
    },
    featurePackId: 'facilitation',
    id: 'facilitation:spotlight',
    useModel: useCanvasSpotlightModel,
  },
  votingSession: {
    disabledConfig: {
      overlays: {
        votingSession: false,
      },
    },
    featurePackId: 'facilitation',
    id: 'facilitation:voting-session',
    useModel: useCanvasVotingSessionModel,
  },
})

export const CANVAS_APP_FACILITATION_FEATURE_PACK_MANIFEST =
  createCanvasAppFeaturePackManifest({
    id: 'facilitation',
    label: 'Facilitation',
    runtimeFeaturePacks: CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS,
    viewFeaturePack: CANVAS_APP_FACILITATION_VIEW_FEATURE_PACK,
  })
