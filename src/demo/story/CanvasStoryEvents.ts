import * as z from 'zod'

export const CANVAS_STORY_EVENT_VERSION = 1

export const CANVAS_STORY_LANES = [
  'architecture',
  'generation',
  'workflow',
  'extension',
  'quality',
] as const

export const CANVAS_STORY_CARD_ROLES = [
  'contract',
  'module',
  'workflow',
  'control',
  'principle',
  'guardrail',
] as const

export const CANVAS_STORY_RELATIONS = [
  'feeds',
  'owns',
  'renders',
  'validates',
  'extends',
  'generates',
  'guards',
] as const

const CanvasStoryStableIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)
  .describe('Stable lower-kebab id used for references between story events.')

const CanvasStoryTextSchema = z
  .string()
  .describe('Short human-readable text. Keep it concise; layout is automatic.')

const CanvasStoryLaneSchema = z
  .enum(CANVAS_STORY_LANES)
  .describe('High-level infinite-canvas lane where a section should appear.')

const CanvasStoryCardRoleSchema = z
  .enum(CANVAS_STORY_CARD_ROLES)
  .describe('Semantic role used by the renderer to choose card styling.')

const CanvasStoryRelationSchema = z
  .enum(CANVAS_STORY_RELATIONS)
  .describe('Semantic relationship rendered as a connector.')

const CanvasStoryEventBaseSchema = {
  id: CanvasStoryStableIdSchema,
  v: z
    .literal(CANVAS_STORY_EVENT_VERSION)
    .describe('Canvas story event schema version.'),
}

export const CanvasStorySectionEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    lane: CanvasStoryLaneSchema,
    purpose: CanvasStoryTextSchema,
    title: CanvasStoryTextSchema,
    type: z.literal('section'),
  })
  .strict()
  .describe('Creates a large section frame. The generator owns all geometry.')

export const CanvasStoryCardEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    points: z
      .array(CanvasStoryTextSchema)
      .describe('Short point fragments; do not write long paragraphs.'),
    role: CanvasStoryCardRoleSchema,
    sectionId: CanvasStoryStableIdSchema,
    title: CanvasStoryTextSchema,
    type: z.literal('card'),
  })
  .strict()
  .describe('Creates a compact concept card inside a section.')

export const CanvasStoryNoteEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    body: CanvasStoryTextSchema,
    sectionId: CanvasStoryStableIdSchema,
    title: CanvasStoryTextSchema,
    type: z.literal('note'),
  })
  .strict()
  .describe('Creates a sticky-note style principle or callout.')

export const CanvasStoryChecklistEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    checked: z
      .array(CanvasStoryTextSchema)
      .describe('Items considered done; values should match entries in items.'),
    items: z.array(CanvasStoryTextSchema),
    sectionId: CanvasStoryStableIdSchema,
    title: CanvasStoryTextSchema,
    type: z.literal('checklist'),
  })
  .strict()
  .describe('Creates a checklist component inside a section.')

export const CanvasStoryTableEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    columns: z.array(CanvasStoryTextSchema),
    rows: z.array(z.array(CanvasStoryTextSchema)),
    sectionId: CanvasStoryStableIdSchema,
    title: CanvasStoryTextSchema,
    type: z.literal('table'),
  })
  .strict()
  .describe('Creates a matrix table component inside a section.')

export const CanvasStoryDecisionEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    option: CanvasStoryTextSchema,
    sectionId: CanvasStoryStableIdSchema,
    status: z.enum(['proposed', 'decided', 'blocked']),
    title: CanvasStoryTextSchema,
    type: z.literal('decision'),
  })
  .strict()
  .describe('Creates the demo decision custom item.')

export const CanvasStoryRiskEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    sectionId: CanvasStoryStableIdSchema,
    severity: z.enum(['Low', 'Medium', 'High']),
    title: CanvasStoryTextSchema,
    type: z.literal('risk'),
  })
  .strict()
  .describe('Creates the demo risk custom item.')

export const CanvasStoryEdgeEventSchema = z
  .object({
    ...CanvasStoryEventBaseSchema,
    from: CanvasStoryStableIdSchema,
    label: CanvasStoryTextSchema,
    relation: CanvasStoryRelationSchema,
    to: CanvasStoryStableIdSchema,
    type: z.literal('edge'),
  })
  .strict()
  .describe('Creates a semantic connector between two generated story items.')

export const CanvasStoryEventSchema = z.discriminatedUnion('type', [
  CanvasStorySectionEventSchema,
  CanvasStoryCardEventSchema,
  CanvasStoryNoteEventSchema,
  CanvasStoryChecklistEventSchema,
  CanvasStoryTableEventSchema,
  CanvasStoryDecisionEventSchema,
  CanvasStoryRiskEventSchema,
  CanvasStoryEdgeEventSchema,
])

export const CanvasStoryEventBatchSchema = z
  .object({
    events: z.array(CanvasStoryEventSchema),
  })
  .describe('A complete story event batch. Streaming may emit one event at a time.')

export const CANVAS_STORY_EVENT_JSON_SCHEMA =
  z.toJSONSchema(CanvasStoryEventSchema)

export const CANVAS_STORY_EVENT_BATCH_JSON_SCHEMA =
  z.toJSONSchema(CanvasStoryEventBatchSchema)

export type CanvasStoryEvent = z.infer<typeof CanvasStoryEventSchema>
export type CanvasStorySectionEvent =
  z.infer<typeof CanvasStorySectionEventSchema>

export function parseCanvasStoryEvent(event: unknown): CanvasStoryEvent {
  return CanvasStoryEventSchema.parse(event)
}

export function parseCanvasStoryEvents(
  events: readonly unknown[],
): CanvasStoryEvent[] {
  return events.map(parseCanvasStoryEvent)
}
