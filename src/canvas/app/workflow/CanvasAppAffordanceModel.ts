import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  type CanvasAffordanceConfig,
} from '../../engine'

export function getCanvasAppAffordanceModel(
  config: CanvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG,
) {
  return {
    command: {
      config,
    },
    control: {
      config,
    },
    interaction: {
      config,
    },
    inspector: {
      config,
    },
    keyboard: {
      config,
    },
    pointer: {
      config,
    },
    text: {
      config,
    },
    viewport: {
      config,
    },
  }
}
