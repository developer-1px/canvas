import type {
  CanvasAffordanceConfig,
  CanvasAffordanceConfigInput,
} from '../../engine'
import {
  CANVAS_APP_CURSOR_CHAT_RUNTIME_FEATURE_PACK,
} from './cursor-chat'
import {
  CANVAS_APP_DRAWING_TOOLS_RUNTIME_FEATURE_PACK,
} from './drawing-tools'
import {
  CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS,
} from './facilitation'
import {
  CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK,
} from './shape-authoring'
import type { CanvasAppFeaturePackId } from './CanvasAppFeaturePacks'

type CanvasAppRuntimeFeaturePackDescriptor = Readonly<{
  disabledConfig: CanvasAffordanceConfigInput
  featurePackId: CanvasAppFeaturePackId
}>

type CursorChatModelInput =
  Parameters<typeof CANVAS_APP_CURSOR_CHAT_RUNTIME_FEATURE_PACK.useModel>[0]
type DrawingModelInput =
  Parameters<typeof CANVAS_APP_DRAWING_TOOLS_RUNTIME_FEATURE_PACK.useModel>[0]
type EmoteModelInput =
  Parameters<
    typeof CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.emote.useModel
  >[0]
type SessionTimerModelInput =
  Parameters<
    typeof CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.sessionTimer.useModel
  >[0]
type SpotlightModelInput =
  Parameters<
    typeof CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.spotlight.useModel
  >[0]
type VotingSessionModelInput =
  Parameters<
    typeof CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.votingSession.useModel
  >[0]

export type CanvasAppTransientFeaturePackModelInput = {
  cursorChat: CursorChatModelInput
  emote: EmoteModelInput
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  sessionTimer: SessionTimerModelInput
  spotlight: SpotlightModelInput
  votingSession: VotingSessionModelInput
}

export type CanvasAppToolFeaturePackModelInput = {
  drawing: DrawingModelInput
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
}

export type CanvasAppShapeAuthoringFeatureConfigInput = {
  config: CanvasAffordanceConfig
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
}

export function useCanvasAppTransientFeaturePackModel({
  cursorChat,
  emote,
  enabledFeaturePackIds,
  sessionTimer,
  spotlight,
  votingSession,
}: CanvasAppTransientFeaturePackModelInput) {
  const cursorChatFeaturePack = CANVAS_APP_CURSOR_CHAT_RUNTIME_FEATURE_PACK
  const sessionTimerFeaturePack =
    CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.sessionTimer
  const spotlightFeaturePack =
    CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.spotlight
  const votingSessionFeaturePack =
    CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.votingSession
  const emoteFeaturePack =
    CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS.emote

  const cursorChatModel = cursorChatFeaturePack.useModel({
    ...cursorChat,
    config: getCanvasAppRuntimeFeatureConfig({
      config: cursorChat.config,
      disabledConfig: cursorChatFeaturePack.disabledConfig,
      enabled: isCanvasAppRuntimeFeaturePackEnabled({
        enabledFeaturePackIds,
        featurePack: cursorChatFeaturePack,
      }),
    }),
  })
  const sessionTimerModel = sessionTimerFeaturePack.useModel({
    ...sessionTimer,
    config: getCanvasAppRuntimeFeatureConfig({
      config: sessionTimer.config,
      disabledConfig: sessionTimerFeaturePack.disabledConfig,
      enabled: isCanvasAppRuntimeFeaturePackEnabled({
        enabledFeaturePackIds,
        featurePack: sessionTimerFeaturePack,
      }),
    }),
  })
  const spotlightModel = spotlightFeaturePack.useModel({
    ...spotlight,
    config: getCanvasAppRuntimeFeatureConfig({
      config: spotlight.config,
      disabledConfig: spotlightFeaturePack.disabledConfig,
      enabled: isCanvasAppRuntimeFeaturePackEnabled({
        enabledFeaturePackIds,
        featurePack: spotlightFeaturePack,
      }),
    }),
  })
  const votingSessionModel = votingSessionFeaturePack.useModel({
    ...votingSession,
    config: getCanvasAppRuntimeFeatureConfig({
      config: votingSession.config,
      disabledConfig: votingSessionFeaturePack.disabledConfig,
      enabled: isCanvasAppRuntimeFeaturePackEnabled({
        enabledFeaturePackIds,
        featurePack: votingSessionFeaturePack,
      }),
    }),
  })
  const emoteModel = emoteFeaturePack.useModel({
    ...emote,
    config: getCanvasAppRuntimeFeatureConfig({
      config: emote.config,
      disabledConfig: emoteFeaturePack.disabledConfig,
      enabled: isCanvasAppRuntimeFeaturePackEnabled({
        enabledFeaturePackIds,
        featurePack: emoteFeaturePack,
      }),
    }),
  })

  return {
    cursorChat: cursorChatModel,
    emotes: emoteModel,
    sessionTimer: sessionTimerModel,
    spotlight: spotlightModel,
    votingSession: votingSessionModel,
  }
}

export function useCanvasAppToolFeaturePackModel({
  drawing,
  enabledFeaturePackIds,
}: CanvasAppToolFeaturePackModelInput) {
  const drawingFeaturePack = CANVAS_APP_DRAWING_TOOLS_RUNTIME_FEATURE_PACK

  return {
    drawing: drawingFeaturePack.useModel({
      ...drawing,
      config: getCanvasAppRuntimeFeatureConfig({
        config: drawing.config,
        disabledConfig: drawingFeaturePack.disabledConfig,
        enabled: isCanvasAppRuntimeFeaturePackEnabled({
          enabledFeaturePackIds,
          featurePack: drawingFeaturePack,
        }),
      }),
    }),
  }
}

export function getCanvasAppShapeAuthoringFeatureConfig({
  config,
  enabledFeaturePackIds,
}: CanvasAppShapeAuthoringFeatureConfigInput): CanvasAffordanceConfig {
  return getCanvasAppRuntimeFeatureConfig({
    config,
    disabledConfig:
      CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK.disabledConfig,
    enabled: isCanvasAppRuntimeFeaturePackEnabled({
      enabledFeaturePackIds,
      featurePack: CANVAS_APP_SHAPE_AUTHORING_RUNTIME_FEATURE_PACK,
    }),
  })
}

export function getCanvasAppRuntimeFeatureConfig({
  config,
  disabledConfig,
  enabled,
}: {
  config: CanvasAffordanceConfig
  disabledConfig: CanvasAffordanceConfigInput
  enabled: boolean
}): CanvasAffordanceConfig {
  if (enabled) {
    return config
  }

  return {
    commands: {
      ...config.commands,
      ...disabledConfig.commands,
    },
    gestures: {
      ...config.gestures,
      ...disabledConfig.gestures,
    },
    overlays: {
      ...config.overlays,
      ...disabledConfig.overlays,
    },
    shortcuts: {
      ...config.shortcuts,
      ...disabledConfig.shortcuts,
    },
    tools: {
      ...config.tools,
      ...disabledConfig.tools,
    },
  }
}

function isCanvasAppRuntimeFeaturePackEnabled({
  enabledFeaturePackIds,
  featurePack,
}: {
  enabledFeaturePackIds: readonly CanvasAppFeaturePackId[]
  featurePack: CanvasAppRuntimeFeaturePackDescriptor
}) {
  return enabledFeaturePackIds.includes(featurePack.featurePackId)
}
