import {
  applyPatch,
  createJSONDocument,
  type JSONChangeMetadata,
  type JSONDocument,
  type JSONDocumentCommitOptions,
  type JSONPatchOperation,
  type JSONResult,
} from '@interactive-os/json-document'
import {
  DesignDocumentSnapshotSchema,
  parseDesignDocumentSnapshot,
} from './DesignDocumentSchema'
import type {
  DesignDocument,
  DesignDocumentSnapshot,
} from './DesignDocumentTypes'
import { validateAndIndexDesignDocument } from './DesignDocumentValidation'

/**
 * Guarded JSON projection for integrations that need patch publication.
 * Commits pass both the persisted schema and DesignDocument graph invariants,
 * then synchronize the immutable snapshot before returning. Concrete external
 * commits advance the local history barrier and do not accept text selection.
 */
export type DesignDocumentPatchPort = Pick<
  JSONDocument<DesignDocumentSnapshot>,
  'at' | 'canPatch' | 'commit' | 'query' | 'subscribe' | 'value'
>

export type DesignDocumentPublicationOwnership =
  | false
  | { readonly sequence: number }

export type DesignDocumentPublication = {
  readonly operations: ReadonlyArray<JSONPatchOperation>
  readonly metadata?: JSONChangeMetadata
}

export type DesignDocumentPublicationCoordinator = {
  readonly port: DesignDocumentPatchPort
  isPublishing(): boolean
  ownsPublication(): DesignDocumentPublicationOwnership
  publish<T>(publication: () => T): T
}

const coordinators = new WeakMap<
  DesignDocument,
  DesignDocumentPublicationCoordinator
>()

type PublicationListener = Parameters<DesignDocumentPatchPort['subscribe']>[0]
type PublicationSubscription = {
  readonly listener: PublicationListener
}

export function createDesignDocumentPublicationCoordinator({
  onExternalPublication,
  readSnapshot,
  store,
  synchronize,
}: {
  onExternalPublication?: () => void
  readSnapshot: () => DesignDocumentSnapshot
  store: JSONDocument<DesignDocumentSnapshot>
  synchronize: () => void
}): DesignDocumentPublicationCoordinator {
  let activeSequence: number | null = null
  let nextSequence = 0
  let pendingPublications: DesignDocumentPublication[] = []
  let projectionSnapshot: DesignDocumentSnapshot | null = null
  let projection: JSONDocument<DesignDocumentSnapshot> | null = null
  const subscriptions = new Set<PublicationSubscription>()

  store.subscribe((operations, metadata) => {
    const publication = ownPublication(operations, metadata)

    if (activeSequence !== null) {
      pendingPublications.push(publication)
      return
    }

    const recipients = [...subscriptions]
    synchronize()
    notifyPublicationListeners(
      subscriptions,
      recipients,
      [publication],
    )
  })

  function readProjection() {
    const snapshot = readSnapshot()

    if (projectionSnapshot !== snapshot || projection === null) {
      const nextProjection = createJSONDocument(
        DesignDocumentSnapshotSchema as never,
        snapshot as never,
        { history: 0, strict: false, trustedInitial: true },
      ) as JSONDocument<DesignDocumentSnapshot>

      projectionSnapshot = snapshot
      projection = nextProjection
    }

    return projection
  }

  function publish<T>(publication: () => T): T {
    if (activeSequence !== null) {
      throw new Error('DesignDocument publications cannot be nested')
    }

    const sequence = nextSequence + 1
    if (!Number.isSafeInteger(sequence)) {
      throw new Error('DesignDocument publication sequence is exhausted')
    }

    nextSequence = sequence
    activeSequence = sequence
    pendingPublications = []

    try {
      return publication()
    } finally {
      const observed = pendingPublications
      pendingPublications = []

      try {
        if (observed.length > 0) {
          const recipients = [...subscriptions]
          synchronize()
          notifyPublicationListeners(
            subscriptions,
            recipients,
            observed,
          )
        }
      } finally {
        activeSequence = null
        pendingPublications = []
      }
    }
  }

  const port: DesignDocumentPatchPort = {
    at(path) {
      return readProjection().at(path)
    },
    canPatch(operations) {
      const owned = ownPatchOperations(
        Array.isArray(operations) ? operations : [operations],
      )
      if (!owned.ok) {
        return owned.result
      }

      return previewDesignDocumentPatch(
        readSnapshot(),
        owned.operations,
      ).result
    },
    commit(operations, options) {
      if (activeSequence !== null) {
        return publicationFailure('DesignDocument publications cannot be nested')
      }

      const metadata = ownCommitMetadata(options)
      if (!metadata.ok) {
        return metadata.result
      }

      const owned = ownPatchOperations(operations)
      if (!owned.ok) {
        return owned.result
      }

      const preview = previewDesignDocumentPatch(
        readSnapshot(),
        owned.operations,
      )
      if (!preview.result.ok || !preview.changed) {
        return preview.result
      }

      return publish(() => {
        const result = store.patch(
          owned.operations,
          metadata.value,
        )

        if (result.ok && pendingPublications.length > 0) {
          onExternalPublication?.()
        }

        return result
      })
    },
    query(jsonpath) {
      return readProjection().query(jsonpath)
    },
    subscribe(listener) {
      const subscription = { listener }
      subscriptions.add(subscription)

      return () => subscriptions.delete(subscription)
    },
    get value() {
      return readSnapshot()
    },
  }

  return {
    port,
    isPublishing: () => activeSequence !== null,
    ownsPublication: () => activeSequence === null
      ? false
      : { sequence: activeSequence },
    publish,
  }
}

function ownPatchOperations(
  operations: ReadonlyArray<JSONPatchOperation>,
):
  | { readonly ok: true; readonly operations: ReadonlyArray<JSONPatchOperation> }
  | { readonly ok: false; readonly result: JSONResult } {
  try {
    return {
      ok: true,
      operations: deepFreeze(structuredClone(operations)),
    }
  } catch (error) {
    return {
      ok: false,
      result: publicationFailure(
        `DesignDocument patch could not be owned: ${getErrorMessage(error)}`,
      ),
    }
  }
}

function ownPublication(
  operations: ReadonlyArray<JSONPatchOperation>,
  metadata: JSONChangeMetadata | undefined,
): DesignDocumentPublication {
  const ownedOperations = deepFreeze(structuredClone(operations))
  const contentMetadata = compactPublishedMetadata(metadata)

  return contentMetadata === undefined
    ? { operations: ownedOperations }
    : {
        operations: ownedOperations,
        metadata: deepFreeze(contentMetadata),
      }
}

function notifyPublicationListeners(
  subscriptions: ReadonlySet<PublicationSubscription>,
  recipients: ReadonlyArray<PublicationSubscription>,
  publications: ReadonlyArray<DesignDocumentPublication>,
) {
  for (const publication of publications) {
    for (const subscription of recipients) {
      if (!subscriptions.has(subscription)) {
        continue
      }

      try {
        subscription.listener(publication.operations, publication.metadata)
      } catch {
        // One integration observer cannot starve later publication observers.
      }
    }
  }
}

export function registerDesignDocumentPublicationCoordinator(
  document: DesignDocument,
  coordinator: DesignDocumentPublicationCoordinator,
) {
  coordinators.set(document, coordinator)
}

export function getDesignDocumentPatchPort(
  document: DesignDocument,
): DesignDocumentPatchPort {
  return requireCoordinator(document).port
}

export function tryGetDesignDocumentPublicationCoordinator(
  document: DesignDocument,
): DesignDocumentPublicationCoordinator | null {
  return coordinators.get(document) ?? null
}

function requireCoordinator(document: DesignDocument) {
  const coordinator = coordinators.get(document)

  if (!coordinator) {
    throw new TypeError('The document was not created by createDesignDocument()')
  }

  return coordinator
}

function previewDesignDocumentPatch(
  snapshot: DesignDocumentSnapshot,
  operations: ReadonlyArray<JSONPatchOperation>,
): {
  readonly changed: boolean
  readonly result: JSONResult
} {
  const preview = applyPatch(
    DesignDocumentSnapshotSchema,
    snapshot as never,
    operations,
  )

  if (!preview.result.ok) {
    return { changed: false, result: preview.result }
  }

  try {
    const raw = preview.state as DesignDocumentSnapshot
    const canonical = parseDesignDocumentSnapshot(raw)

    if (!areJSONValuesEqual(raw, canonical)) {
      return {
        changed: false,
        result: publicationFailure(
          'DesignDocument patches must already contain canonical values',
        ),
      }
    }

    validateAndIndexDesignDocument(canonical)
    return {
      changed: !areJSONValuesEqual(snapshot, canonical),
      result: { ok: true },
    }
  } catch (error) {
    return {
      changed: false,
      result: publicationFailure(getErrorMessage(error)),
    }
  }
}

function ownCommitMetadata(
  options: JSONDocumentCommitOptions | undefined,
):
  | { readonly ok: true; readonly value: JSONChangeMetadata | undefined }
  | { readonly ok: false; readonly result: JSONResult } {
  if (options === undefined) {
    return { ok: true, value: undefined }
  }

  try {
    const selectionAfter = options.selectionAfter
    const label = options.label
    const mergeKey = options.mergeKey
    const origin = options.origin

    if (selectionAfter !== undefined) {
      return {
        ok: false,
        result: publicationFailure(
          'DesignDocument authored content does not own text selection',
        ),
      }
    }

    const fields = [
      ['label', label],
      ['mergeKey', mergeKey],
      ['origin', origin],
    ] as const
    const invalid = fields.find(([, value]) =>
      value !== undefined && typeof value !== 'string')

    if (invalid) {
      return {
        ok: false,
        result: publicationFailure(
          `DesignDocument patch metadata ${invalid[0]} must be a string`,
        ),
      }
    }

    return {
      ok: true,
      value: compactContentMetadata({
        label,
        mergeKey,
        origin,
      }),
    }
  } catch (error) {
    return {
      ok: false,
      result: publicationFailure(
        `DesignDocument patch metadata could not be read: ${getErrorMessage(error)}`,
      ),
    }
  }
}

function compactPublishedMetadata(
  metadata: JSONChangeMetadata | undefined,
): JSONChangeMetadata | undefined {
  try {
    if (!metadata || typeof metadata !== 'object') {
      return undefined
    }

    const label = metadata.label
    const mergeKey = metadata.mergeKey
    const origin = metadata.origin

    return compactContentMetadata({
      label: typeof label === 'string' ? label : undefined,
      mergeKey: typeof mergeKey === 'string' ? mergeKey : undefined,
      origin: typeof origin === 'string' ? origin : undefined,
    })
  } catch {
    return undefined
  }
}

function compactContentMetadata(options: {
  readonly label?: string | undefined
  readonly mergeKey?: string | undefined
  readonly origin?: string | undefined
}): JSONChangeMetadata | undefined {
  if (!options) {
    return undefined
  }

  const { label, mergeKey, origin } = options

  return label === undefined && mergeKey === undefined && origin === undefined
    ? undefined
    : {
        ...(label === undefined ? {} : { label }),
        ...(mergeKey === undefined ? {} : { mergeKey }),
        ...(origin === undefined ? {} : { origin }),
      }
}

function publicationFailure(reason: string): JSONResult {
  return { code: 'schema_violation', ok: false, reason }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value
  }

  Object.freeze(value)

  for (const child of Object.values(value)) {
    deepFreeze(child)
  }

  return value
}

function areJSONValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) =>
        areJSONValuesEqual(value, right[index]))
  }

  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  ) {
    return false
  }

  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const leftKeys = Object.keys(leftRecord)
  const rightKeys = Object.keys(rightRecord)

  return leftKeys.length === rightKeys.length &&
    leftKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(rightRecord, key) &&
      areJSONValuesEqual(leftRecord[key], rightRecord[key]))
}
