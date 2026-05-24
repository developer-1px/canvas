import {
  DEFAULT_CANVAS_AFFORDANCE_CONFIG,
  type CanvasAffordanceConfig,
} from '../../engine'
import type { CanvasAppAffordanceModel } from './CanvasAppAffordanceModelContracts'

export function getCanvasAppAffordanceModel(
  config: CanvasAffordanceConfig = DEFAULT_CANVAS_AFFORDANCE_CONFIG,
): CanvasAppAffordanceModel {
  return {
    command: {
      config,
    },
    component: {
      config,
    },
    control: {
      config,
    },
    drawing: {
      config,
    },
    facilitation: {
      config,
    },
    interaction: {
      config,
    },
    inspector: {
      config,
    },
    image: {
      config,
    },
    keyboard: {
      config,
    },
    pointer: {
      config,
    },
    stamp: {
      config,
    },
    table: {
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
