import type {
  CanvasExtensionAdapterSlot,
  CanvasExtensionDescriptor,
  CanvasExtensionEffect,
  CanvasExtensionTextTargetContract,
} from '../../../foundation'
import type { CanvasItem } from '../../../entities'
import type {
  CanvasAppItemsChange,
} from '../../workspace/document/CanvasAppDocumentContracts'
import type {
  CanvasAppComponentPresentationRenderers,
  CanvasAppComponentRendererStrategy,
} from '../../rendering/CanvasAppRenderingContracts'
import { snapshotCanvasAppArray } from '../CanvasAppDescriptorSnapshot'
import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorFunctionField,
  assertCanvasAppDescriptorObject,
} from '../CanvasAppDescriptorContracts'

export type CanvasAppFoundationExtensionEffect =
  CanvasExtensionEffect<CanvasAppItemsChange>

export type CanvasAppFoundationExtensionToolPlanner = (
  input: unknown,
) => readonly CanvasAppFoundationExtensionEffect[]

export type CanvasAppFoundationExtensionCapabilityAdapter = Readonly<{
  can?: (capability: string) => boolean
  extensionId: string
  providedAdapters: readonly CanvasExtensionAdapterSlot[]
  rendererSlots?: Readonly<Record<string, Readonly<{
    presentation: string
    render: CanvasAppComponentRendererStrategy
  }>>>
  textTargetSlots?: Readonly<
    Record<string, CanvasExtensionTextTargetContract<CanvasItem>>
  >
  toolPlanners?: Readonly<
    Record<string, CanvasAppFoundationExtensionToolPlanner>
  >
}>

export type CanvasAppFoundationExtensionRuntime = Readonly<{
  componentPresentationRenderers: CanvasAppComponentPresentationRenderers
  hasTool: (toolId: string) => boolean
  planCommand: (
    commandId: string,
    input: unknown,
  ) => readonly CanvasAppFoundationExtensionEffect[] | null
  planTool: (
    toolId: string,
    input: unknown,
  ) => readonly CanvasAppFoundationExtensionEffect[] | null
  textTargets: readonly CanvasExtensionTextTargetContract<CanvasItem>[]
}>

export function compileCanvasAppFoundationExtensions({
  adapters,
  can,
  extensions,
}: {
  adapters: readonly CanvasAppFoundationExtensionCapabilityAdapter[]
  can?: (capability: string) => boolean
  extensions: readonly CanvasExtensionDescriptor[]
}): CanvasAppFoundationExtensionRuntime {
  const adaptersByExtensionId = new Map<
    string,
    CanvasAppFoundationExtensionCapabilityAdapter
  >()

  for (const adapter of adapters) {
    if (adaptersByExtensionId.has(adapter.extensionId)) {
      throw new Error(
        `Duplicate canvas foundation extension adapter: ${adapter.extensionId}`,
      )
    }

    adaptersByExtensionId.set(adapter.extensionId, adapter)
  }
  const componentPresentationRenderers:
    Record<string, CanvasAppComponentRendererStrategy> = {}
  const commandPlanners = new Map<string, Readonly<{
    can: NonNullable<CanvasAppFoundationExtensionCapabilityAdapter['can']>
    plan: CanvasAppFoundationExtensionToolPlanner
    requiredCapability: string
  }>>()
  const toolPlanners = new Map<string, Readonly<{
    can?: CanvasAppFoundationExtensionCapabilityAdapter['can']
    plan: CanvasAppFoundationExtensionToolPlanner
    requiredCapability: string
  }>>()
  const textTargets: CanvasExtensionTextTargetContract<CanvasItem>[] = []
  const textTargetSlotIds = new Set<string>()

  for (const extension of extensions) {
    const adapter = adaptersByExtensionId.get(extension.id)
    const providedAdapters = new Set(adapter?.providedAdapters ?? [])

    for (const requiredAdapter of getRequiredCanvasExtensionAdapters(
      extension,
    )) {
      if (!providedAdapters.has(requiredAdapter)) {
        throw new Error(
          `Canvas foundation extension ${extension.id} is missing ${requiredAdapter} adapter`,
        )
      }
    }

    for (const slot of extension.rendererSlots ?? []) {
      const contribution = adapter?.rendererSlots?.[slot.id]

      if (!contribution) {
        throw new Error(
          `Canvas foundation extension ${extension.id} is missing renderer contribution ${slot.id}`,
        )
      }

      if (componentPresentationRenderers[contribution.presentation]) {
        throw new Error(
          `Duplicate canvas foundation renderer contribution: ${contribution.presentation}`,
        )
      }

      componentPresentationRenderers[contribution.presentation] =
        contribution.render
    }

    for (const command of extension.commands ?? []) {
      if (commandPlanners.has(command.id)) {
        throw new Error(
          `Duplicate canvas foundation command contribution: ${command.id}`,
        )
      }

      const canUse = can ?? adapter?.can

      if (!canUse) {
        throw new Error(
          `Canvas foundation extension ${extension.id} is missing capability adapter`,
        )
      }

      commandPlanners.set(command.id, {
        can: canUse,
        plan: command.plan as CanvasAppFoundationExtensionToolPlanner,
        requiredCapability: command.requiredCapability,
      })
    }

    for (const tool of extension.tools ?? []) {
      const plan = adapter?.toolPlanners?.[tool.id]

      if (!plan) {
        throw new Error(
          `Canvas foundation extension ${extension.id} is missing tool planner ${tool.id}`,
        )
      }

      if (toolPlanners.has(tool.id)) {
        throw new Error(
          `Duplicate canvas foundation tool contribution: ${tool.id}`,
        )
      }

      const canUse = can ?? adapter?.can

      if (!canUse) {
        throw new Error(
          `Canvas foundation extension ${extension.id} is missing capability adapter`,
        )
      }

      toolPlanners.set(tool.id, {
        can: canUse,
        plan,
        requiredCapability: tool.requiredCapability,
      })
    }

    for (const slot of extension.textTargetSlots ?? []) {
      const contribution = adapter?.textTargetSlots?.[slot.id]

      if (!contribution) {
        throw new Error(
          `Canvas foundation extension ${extension.id} is missing text-target contribution ${slot.id}`,
        )
      }

      if (textTargetSlotIds.has(slot.id)) {
        throw new Error(
          `Duplicate canvas foundation text-target contribution: ${slot.id}`,
        )
      }

      textTargetSlotIds.add(slot.id)
      textTargets.push(contribution)
    }
  }

  return Object.freeze({
    componentPresentationRenderers: Object.freeze({
      ...componentPresentationRenderers,
    }),
    hasTool: (toolId) => toolPlanners.has(toolId),
    planCommand: (commandId, input) => runCanvasAppFoundationPlanner({
      input,
      planner: commandPlanners.get(commandId),
    }),
    planTool: (toolId, input) => {
      return runCanvasAppFoundationPlanner({
        input,
        planner: toolPlanners.get(toolId),
      })
    },
    textTargets: Object.freeze([...textTargets]),
  })
}

export function assertCanvasAppFoundationExtensionRuntime(
  runtime: unknown,
): asserts runtime is CanvasAppFoundationExtensionRuntime {
  assertCanvasAppDescriptorObject(runtime, 'foundation extension runtime')
  assertCanvasAppDescriptorObject(
    runtime.componentPresentationRenderers,
    'foundation extension runtime componentPresentationRenderers',
  )

  for (const field of ['hasTool', 'planCommand', 'planTool'] as const) {
    assertCanvasAppDescriptorFunctionField({
      field,
      owner: 'foundation extension runtime',
      value: runtime[field],
    })
  }

  assertCanvasAppArray(
    runtime.textTargets,
    'foundation extension runtime textTargets',
  )
}

export function appendUniqueCanvasAppFoundationExtensionCapabilityAdapters({
  current,
  entries,
  owner,
}: {
  current: readonly CanvasAppFoundationExtensionCapabilityAdapter[]
  entries: readonly CanvasAppFoundationExtensionCapabilityAdapter[]
  owner: string
}) {
  const adapters = [...current, ...entries]
  const ids = new Set<string>()

  for (const adapter of adapters) {
    if (ids.has(adapter.extensionId)) {
      throw new Error(
        `Duplicate canvas ${owner} foundation extension adapter: ${adapter.extensionId}`,
      )
    }

    ids.add(adapter.extensionId)
  }

  return adapters
}

export function snapshotCanvasAppFoundationExtensionCapabilityAdapters(
  adapters: readonly CanvasAppFoundationExtensionCapabilityAdapter[],
) {
  return snapshotCanvasAppArray(adapters.map((adapter) => Object.freeze({
    ...adapter,
    providedAdapters: snapshotCanvasAppArray(adapter.providedAdapters),
    ...(adapter.rendererSlots ? {
      rendererSlots: Object.freeze({ ...adapter.rendererSlots }),
    } : {}),
    ...(adapter.textTargetSlots ? {
      textTargetSlots: Object.freeze({ ...adapter.textTargetSlots }),
    } : {}),
    ...(adapter.toolPlanners ? {
      toolPlanners: Object.freeze({ ...adapter.toolPlanners }),
    } : {}),
  }))) as readonly CanvasAppFoundationExtensionCapabilityAdapter[]
}

function runCanvasAppFoundationPlanner({
  input,
  planner,
}: {
  input: unknown
  planner: Readonly<{
    can?: (capability: string) => boolean
    plan: CanvasAppFoundationExtensionToolPlanner
    requiredCapability: string
  }> | undefined
}) {
  if (!planner) {
    return null
  }

  try {
    if (!planner.can?.(planner.requiredCapability)) {
      return []
    }

    return planner.plan(input)
  } catch {
    return []
  }
}

function getRequiredCanvasExtensionAdapters(
  extension: CanvasExtensionDescriptor,
) {
  return new Set([
    ...(
      (extension.commands?.length ?? 0) > 0 ||
      (extension.tools?.length ?? 0) > 0
        ? ['capability' as const]
        : []
    ),
    ...(extension.requiredAdapters ?? []),
    ...(extension.commands ?? []).flatMap(
      (command) => command.requiredAdapters ?? [],
    ),
    ...(extension.tools ?? []).flatMap(
      (tool) => tool.requiredAdapters ?? [],
    ),
  ])
}
