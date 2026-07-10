import * as z from 'zod'

import type {
  DesignDocumentSnapshot,
  DesignJSONValue,
} from './DesignDocumentTypes'

const DesignJSONValueSchema: z.ZodType<DesignJSONValue> = z.lazy(() =>
  z.union([
    z.boolean(),
    z.number().finite(),
    z.string(),
    z.null(),
    z.array(DesignJSONValueSchema),
    z.record(z.string(), DesignJSONValueSchema),
  ]),
)

const DesignJSONObjectSchema = z.record(z.string(), DesignJSONValueSchema)
const StableIdSchema = z.string().trim().min(1)

const DesignNodeSchema = z.object({
  id: StableIdSchema,
  label: StableIdSchema,
  definition: z.object({
    kind: z.enum(['component', 'intrinsic', 'widget']),
    id: StableIdSchema,
  }).strict(),
  children: z.array(StableIdSchema),
  props: DesignJSONObjectSchema,
  text: z.string().nullable(),
  layout: DesignJSONObjectSchema,
  style: DesignJSONObjectSchema,
  frame: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
    width: z.number().finite().nonnegative(),
    height: z.number().finite().nonnegative(),
    rotation: z.number().finite(),
    widthMode: z.enum(['content', 'fixed']),
    heightMode: z.enum(['content', 'fixed']),
    overflow: z.enum(['clip', 'scroll', 'visible']),
  }).strict().nullable(),
  component: z.object({
    definitionId: StableIdSchema,
    instanceId: StableIdSchema,
    slotId: StableIdSchema,
  }).strict().nullable(),
}).strict()

export const DesignDocumentSnapshotSchema = z.object({
  schemaVersion: z.literal(1),
  roots: z.array(StableIdSchema),
  nodes: z.array(DesignNodeSchema),
}).strict()

export function parseDesignDocumentSnapshot(
  value: unknown,
): DesignDocumentSnapshot {
  return DesignDocumentSnapshotSchema.parse(value) as DesignDocumentSnapshot
}
