import type { CanvasAppCustomItemModule } from '../../canvas'

const modules = import.meta.glob<{ default: CanvasAppCustomItemModule }>(
  './*/index.ts',
  {
    eager: true,
  },
)

export const DEMO_CUSTOM_ITEM_MODULES = Object.entries(modules)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([, module]) => module.default)
