import {
  applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate,
  createCanvasStoryCanvasFeaturePackAssemblyInput,
  executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction,
  getCanvasAppFeaturePackMarketplaceAssemblyModel,
  getCanvasAppFeaturePackMarketplaceItemTarget,
  type CanvasAppAssemblyInput,
  type CanvasAppAssemblySource,
  type CanvasAppFeaturePackMarketplaceAssemblyModel,
  type CanvasAppFeaturePackMarketplaceItem,
  type CanvasAppFeaturePackMarketplaceModel,
  type CanvasAppFeaturePackMarketplacePrimaryAction,
  type CanvasAppFeaturePackMarketplacePrimaryActionKind,
  type CanvasAppFeaturePackMarketplaceSection,
  type CanvasAppFeaturePackMarketplaceTarget,
  type CanvasAppFeaturePackRuntimeStateInput,
} from '../canvas'
import { DEMO_CANVAS_APP_ASSEMBLY_INPUT } from './CanvasDemoAssembly'

export type CanvasMarketplaceDemoItemId =
  | `pack:${string}`
  | `profile:${string}`
  | `suite:${string}`

export type CanvasMarketplaceDemoModel = Readonly<{
  assemblyInput: CanvasAppAssemblyInput
  assemblyModel: CanvasAppFeaturePackMarketplaceAssemblyModel
  marketplaceModel: CanvasAppFeaturePackMarketplaceModel
  runtimeStates: readonly CanvasAppFeaturePackRuntimeStateInput[]
  sections: readonly CanvasAppFeaturePackMarketplaceSection[]
  source: CanvasAppAssemblySource
}>

export type CanvasMarketplaceDemoApplyInput = Readonly<{
  actionKind: CanvasAppFeaturePackMarketplacePrimaryActionKind
  itemId: CanvasMarketplaceDemoItemId
  source: CanvasAppAssemblySource
}>

export type CanvasMarketplaceDemoApplyResult = Readonly<{
  action: CanvasAppFeaturePackMarketplacePrimaryAction | null
  actionKind: CanvasAppFeaturePackMarketplacePrimaryActionKind
  applied: boolean
  itemId: CanvasMarketplaceDemoItemId
  source: CanvasAppAssemblySource
  status: 'applied' | 'held' | 'missing-action' | 'missing-item'
  target: CanvasAppFeaturePackMarketplaceTarget | null
}>

const CANVAS_MARKETPLACE_DEMO_SEED_ASSEMBLY_INPUT =
  createCanvasMarketplaceDemoSeedAssemblyInput(DEMO_CANVAS_APP_ASSEMBLY_INPUT)

export const CANVAS_MARKETPLACE_DEMO_INITIAL_ASSEMBLY_INPUT = Object.freeze({
  ...CANVAS_MARKETPLACE_DEMO_SEED_ASSEMBLY_INPUT,
  featurePackProfileId: 'core-only',
} satisfies CanvasAppAssemblyInput)

export function createCanvasMarketplaceDemoSource(
  assemblyInput: CanvasAppAssemblyInput =
    CANVAS_MARKETPLACE_DEMO_INITIAL_ASSEMBLY_INPUT,
): CanvasAppAssemblySource {
  return Object.freeze({
    assemblyInput,
  })
}

export function createCanvasMarketplaceDemoModel(
  source: CanvasAppAssemblySource = createCanvasMarketplaceDemoSource(),
): CanvasMarketplaceDemoModel {
  const assemblyInput =
    source.assemblyInput ?? CANVAS_MARKETPLACE_DEMO_INITIAL_ASSEMBLY_INPUT
  const assemblyModel = getCanvasAppFeaturePackMarketplaceAssemblyModel({
    assemblyInput,
  })
  const runtimeStates = assemblyModel.assemblyInput.featurePackStates ?? []

  return Object.freeze({
    assemblyInput: assemblyModel.assemblyInput,
    assemblyModel,
    marketplaceModel: assemblyModel.marketplaceModel,
    runtimeStates,
    sections: assemblyModel.marketplaceModel.sections,
    source,
  })
}

export async function applyCanvasMarketplaceDemoOperation({
  actionKind,
  itemId,
  source,
}: CanvasMarketplaceDemoApplyInput): Promise<CanvasMarketplaceDemoApplyResult> {
  const demoModel = createCanvasMarketplaceDemoModel(source)
  const item = findCanvasMarketplaceDemoItem({
    itemId,
    sections: demoModel.sections,
  })

  if (!item) {
    return Object.freeze({
      action: null,
      actionKind,
      applied: false,
      itemId,
      source,
      status: 'missing-item',
      target: null,
    })
  }

  const action = getCanvasMarketplaceDemoItemAction({
    actionKind,
    item,
  })
  const target = getCanvasAppFeaturePackMarketplaceItemTarget(item)

  if (!action) {
    return Object.freeze({
      action,
      actionKind,
      applied: false,
      itemId,
      source,
      status: 'missing-action',
      target,
    })
  }

  const transactionResult =
    await executeCanvasAppFeaturePackMarketplaceAssemblyApplyTransaction({
      action,
      executeCleanupEffect: () => ({ kind: 'not-run' as const }),
      model: demoModel.assemblyModel,
    })
  const sourceResult =
    applyCanvasAppAssemblySourceFeaturePackMarketplaceHostUpdate({
      hostUpdate: transactionResult.hostUpdate,
      source,
    })

  return Object.freeze({
    action,
    actionKind,
    applied: sourceResult.applied,
    itemId,
    source: sourceResult.source,
    status: sourceResult.applied ? 'applied' : 'held',
    target,
  })
}

export function getCanvasMarketplaceDemoItemId(
  item: CanvasAppFeaturePackMarketplaceItem,
): CanvasMarketplaceDemoItemId {
  return getCanvasMarketplaceDemoTargetId(
    getCanvasAppFeaturePackMarketplaceItemTarget(item),
  )
}

export function getCanvasMarketplaceDemoTargetId(
  target: CanvasAppFeaturePackMarketplaceTarget,
): CanvasMarketplaceDemoItemId {
  if (target.kind === 'pack') {
    return `pack:${target.featurePackId}`
  }

  if (target.kind === 'profile') {
    return `profile:${target.profileId}`
  }

  return `suite:${target.suiteId}`
}

export function getCanvasMarketplaceDemoItemAction({
  actionKind,
  item,
}: {
  actionKind: CanvasAppFeaturePackMarketplacePrimaryActionKind
  item: CanvasAppFeaturePackMarketplaceItem
}): CanvasAppFeaturePackMarketplacePrimaryAction | null {
  const actions =
    item.actions as readonly CanvasAppFeaturePackMarketplacePrimaryAction[]

  return actions.find((action) => action.kind === actionKind) ?? null
}

export function findCanvasMarketplaceDemoItem({
  itemId,
  sections,
}: {
  itemId: CanvasMarketplaceDemoItemId
  sections: readonly CanvasAppFeaturePackMarketplaceSection[]
}): CanvasAppFeaturePackMarketplaceItem | null {
  for (const section of sections) {
    const items = section.items as readonly CanvasAppFeaturePackMarketplaceItem[]
    const item = items.find((candidate) =>
      getCanvasMarketplaceDemoItemId(candidate) === itemId
    )

    if (item) {
      return item
    }
  }

  return null
}

function createCanvasMarketplaceDemoSeedAssemblyInput(
  input: CanvasAppAssemblyInput,
): CanvasAppAssemblyInput {
  const seedInput: CanvasAppAssemblyInput = { ...input }

  delete seedInput.affordanceConfig
  delete seedInput.disabledFeaturePackIds
  delete seedInput.featureFlagSettings
  delete seedInput.featurePackProfile
  delete seedInput.featurePackProfileId
  delete seedInput.featurePackStates

  const storyCanvasAssemblyInput = createCanvasStoryCanvasFeaturePackAssemblyInput({
    assemblyInput: seedInput,
    renderGroupItem: ({ groupLabel }) => groupLabel,
    renderPreviewItem: ({ storyId }) => storyId,
  })

  return Object.freeze({
    ...seedInput,
    ...storyCanvasAssemblyInput,
  })
}
