import {
  assertCanvasAppArray,
  assertCanvasAppDescriptorObject,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  assertCanvasAppExtensionId,
} from '../extensions/CanvasAppExtensionIds'
import type {
  CanvasAppFeatureFlagSettingInput,
  CanvasAppFeatureFlagSettings,
  CanvasAppFeaturePackRuntimeStateInput,
} from './CanvasAppFeaturePackRuntimeStateContracts'

export function getCanvasAppFeatureFlagRuntimeStateInputs(
  settings: readonly CanvasAppFeatureFlagSettingInput[] = [],
): readonly CanvasAppFeaturePackRuntimeStateInput[] {
  assertCanvasAppFeatureFlagSettings(settings)

  return Object.freeze(settings.map((setting) => Object.freeze({
    id: setting.id,
    status: setting.enabled ? 'enabled' : 'disabled',
  })))
}

export function setCanvasAppFeatureFlagSetting(
  settings: readonly CanvasAppFeatureFlagSettingInput[] = [],
  setting: CanvasAppFeatureFlagSettingInput,
): CanvasAppFeatureFlagSettings {
  assertCanvasAppFeatureFlagSettings(settings)
  assertCanvasAppFeatureFlagSetting(setting)

  let replaced = false
  const nextSettings = settings.map((current) => {
    if (current.id !== setting.id) {
      return current
    }

    replaced = true
    return setting
  })

  if (!replaced) {
    nextSettings.push(setting)
  }

  return snapshotCanvasAppFeatureFlagSettings(nextSettings)
}

function assertCanvasAppFeatureFlagSettings(
  settings: unknown,
): asserts settings is readonly CanvasAppFeatureFlagSettingInput[] {
  assertCanvasAppArray(settings, 'feature flag settings')

  const ids = new Set<string>()

  for (const setting of settings) {
    assertCanvasAppFeatureFlagSetting(setting)

    if (ids.has(setting.id)) {
      throw new Error(`Duplicate canvas app feature flag setting: ${setting.id}`)
    }

    ids.add(setting.id)
  }
}

function assertCanvasAppFeatureFlagSetting(
  setting: unknown,
): asserts setting is CanvasAppFeatureFlagSettingInput {
  assertCanvasAppDescriptorObject(setting, 'feature flag setting')
  assertCanvasAppExtensionId({
    id: setting.id,
    label: 'feature flag setting',
  })

  if (typeof setting.enabled !== 'boolean') {
    throw new Error(`Invalid canvas app feature flag setting enabled value: ${setting.id}`)
  }
}

function snapshotCanvasAppFeatureFlagSettings(
  settings: readonly CanvasAppFeatureFlagSettingInput[],
): CanvasAppFeatureFlagSettings {
  return Object.freeze(settings.map((setting) => Object.freeze({
    enabled: setting.enabled,
    id: setting.id,
  })))
}
