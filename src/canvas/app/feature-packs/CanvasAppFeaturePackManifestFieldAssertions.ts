import {
  assertCanvasAppDescriptorObject,
  assertCanvasAppDescriptorStringField,
} from '../extensions/CanvasAppDescriptorContracts'
import {
  CANVAS_APP_FEATURE_PACK_CATEGORIES,
} from './CanvasAppFeaturePackManifestConstants'
import type {
  CanvasAppFeaturePackManifestCategory,
} from './CanvasAppFeaturePackManifestTypes'

export function assertCanvasAppFeaturePackManifestCategory({
  category,
  owner,
}: {
  category: unknown
  owner: string
}) {
  if (
    typeof category !== 'string' ||
    !CANVAS_APP_FEATURE_PACK_CATEGORIES.includes(
      category as CanvasAppFeaturePackManifestCategory,
    )
  ) {
    throw new Error(`Invalid ${owner} category: ${String(category)}`)
  }
}

export function assertCanvasAppFeaturePackManifestCompatibility({
  compatibility,
  owner,
}: {
  compatibility: unknown
  owner: string
}) {
  assertCanvasAppDescriptorObject(compatibility, `${owner} compatibility`)
  assertCanvasAppDescriptorStringField({
    field: 'engineVersion',
    owner: `${owner} compatibility`,
    value: compatibility.engineVersion,
  })

  for (const field of [
    'documentSchemaVersion',
    'featureStateVersion',
  ] as const) {
    if (
      compatibility[field] !== undefined &&
      typeof compatibility[field] !== 'string'
    ) {
      throw new Error(`Expected ${owner} compatibility ${field} string`)
    }
  }
}

export function assertCanvasAppFeaturePackManifestPackage({
  owner,
  packageInfo,
}: {
  owner: string
  packageInfo: unknown
}) {
  assertCanvasAppDescriptorObject(packageInfo, `${owner} package`)
  const typedPackageInfo = packageInfo as {
    name?: unknown
    subpath?: unknown
  }

  assertCanvasAppDescriptorStringField({
    field: 'name',
    owner: `${owner} package`,
    value: typedPackageInfo.name,
  })

  if (typedPackageInfo.subpath === undefined) {
    return
  }

  assertCanvasAppDescriptorStringField({
    field: 'subpath',
    owner: `${owner} package`,
    value: typedPackageInfo.subpath,
  })

  if (
    typeof typedPackageInfo.subpath === 'string' &&
    !typedPackageInfo.subpath.startsWith('.')
  ) {
    throw new Error(
      `Invalid ${owner} package subpath: ${String(typedPackageInfo.subpath)}`,
    )
  }
}
