import {
  CANVAS_STORY_IMPORT_JSON_KIND,
  CANVAS_STORY_IMPORT_JSON_VERSION,
  type CanvasStoryImportInput,
} from './CanvasStoryImportContracts'

export function parseCanvasStoryImportJSONPayload(
  json: unknown,
): CanvasStoryImportInput {
  const input = unwrapCanvasStoryImportJSONPayload(json)

  assertCanvasStoryImportInput(input)

  return input
}

export function assertCanvasStoryImportInput(
  input: unknown,
): asserts input is CanvasStoryImportInput {
  assertCanvasJsonObject(input, 'canvas story import input')

  if (!Array.isArray(input.groups)) {
    throw new Error('Invalid canvas story import groups')
  }

  input.groups.forEach(assertCanvasStoryImportGroup)
}

function unwrapCanvasStoryImportJSONPayload(
  json: unknown,
): CanvasStoryImportInput {
  assertCanvasJsonObject(json, 'canvas story import payload')

  if ('kind' in json) {
    if (json.kind !== CANVAS_STORY_IMPORT_JSON_KIND) {
      throw new Error('Invalid canvas story import payload kind')
    }

    if (
      'version' in json &&
      json.version !== CANVAS_STORY_IMPORT_JSON_VERSION
    ) {
      throw new Error('Invalid canvas story import payload version')
    }

    if (!('input' in json)) {
      throw new Error('Missing canvas story import payload input')
    }

    return json.input as CanvasStoryImportInput
  }

  return json as CanvasStoryImportInput
}

function assertCanvasStoryImportGroup(
  group: unknown,
) {
  assertCanvasJsonObject(group, 'canvas story import group')
  assertCanvasStoryImportString(group.id, 'canvas story import group id')
  assertCanvasStoryImportFiniteNumber(group.h, 'canvas story import group h')
  assertCanvasStoryImportFiniteNumber(group.w, 'canvas story import group w')
  assertCanvasStoryImportFiniteNumber(group.x, 'canvas story import group x')
  assertCanvasStoryImportFiniteNumber(group.y, 'canvas story import group y')

  if (
    group.count !== undefined &&
    !Number.isFinite(group.count)
  ) {
    throw new Error('Invalid canvas story import group count')
  }

  if (
    group.label !== undefined &&
    group.label !== null &&
    typeof group.label !== 'string'
  ) {
    throw new Error('Invalid canvas story import group label')
  }

  if (
    group.title !== undefined &&
    typeof group.title !== 'string'
  ) {
    throw new Error('Invalid canvas story import group title')
  }

  if (group.source !== undefined) {
    assertCanvasStoryImportSource(group.source)
  }

  if (!Array.isArray(group.stories)) {
    throw new Error('Invalid canvas story import group stories')
  }

  group.stories.forEach(assertCanvasStoryImportStory)
}

function assertCanvasStoryImportStory(
  story: unknown,
) {
  assertCanvasJsonObject(story, 'canvas story import story')
  assertCanvasStoryImportString(story.id, 'canvas story import story id')
  assertCanvasStoryImportString(story.title, 'canvas story import story title')
  assertCanvasStoryImportFiniteNumber(story.h, 'canvas story import story h')
  assertCanvasStoryImportFiniteNumber(story.w, 'canvas story import story w')
  assertCanvasStoryImportFiniteNumber(story.x, 'canvas story import story x')
  assertCanvasStoryImportFiniteNumber(story.y, 'canvas story import story y')
}

function assertCanvasStoryImportSource(
  source: unknown,
) {
  assertCanvasJsonObject(source, 'canvas story import source')
  assertCanvasStoryImportString(
    source.exportName,
    'canvas story import source exportName',
  )
  assertCanvasStoryImportString(
    source.importPath,
    'canvas story import source importPath',
  )
  assertCanvasStoryImportString(
    source.layer,
    'canvas story import source layer',
  )
}

function assertCanvasJsonObject(
  value: unknown,
  label: string,
): asserts value is Record<string, unknown> {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(`Invalid ${label}`)
  }
}

function assertCanvasStoryImportString(
  value: unknown,
  label: string,
): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid ${label}`)
  }
}

function assertCanvasStoryImportFiniteNumber(
  value: unknown,
  label: string,
): asserts value is number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${label}`)
  }
}
