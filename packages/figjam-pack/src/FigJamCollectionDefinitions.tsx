/* eslint-disable react-refresh/only-export-components */
import {
  defineReactDesignWidget,
  type ReactDesignWidgetFallbackProps,
  type ReactDesignWidgetInspectorProps,
  type ReactDesignWidgetRenderProps,
} from '@interactive-os/canvas/react-design'

import {
  cloneDesignProps,
  createFigJamAbsoluteWidgetNode,
  includes,
  isJSONObject,
  isNonEmptyString,
  joinClassNames,
  type FigJamPlacementInput,
  type FigJamSizeInput,
} from './FigJamWidgetPrimitives'

export const FIGJAM_CHECKLIST_DEFINITION_ID = 'figjam.checklist'
export const FIGJAM_KANBAN_DEFINITION_ID = 'figjam.kanban'
export const FIGJAM_TABLE_DEFINITION_ID = 'figjam.table'
export const FIGJAM_LINK_PREVIEW_DEFINITION_ID = 'figjam.link-preview'

export type FigJamChecklistItem = {
  readonly checked: boolean
  readonly id: string
  readonly text: string
}

export type FigJamChecklistProps = {
  readonly items: readonly FigJamChecklistItem[]
  readonly position: 'absolute'
  readonly title: string
}

export type CreateFigJamChecklistNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly items?: readonly FigJamChecklistItem[]
    readonly title?: string
  }

export type FigJamKanbanCard = {
  readonly id: string
  readonly text: string
}

export type FigJamKanbanColumn = {
  readonly cards: readonly FigJamKanbanCard[]
  readonly id: string
  readonly title: string
}

export type FigJamKanbanProps = {
  readonly columns: readonly FigJamKanbanColumn[]
  readonly position: 'absolute'
  readonly title: string
}

export type CreateFigJamKanbanNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly columns?: readonly FigJamKanbanColumn[]
    readonly title?: string
  }

export type FigJamTableProps = {
  readonly columns: readonly string[]
  readonly position: 'absolute'
  readonly rows: readonly (readonly string[])[]
  readonly title: string
}

export type CreateFigJamTableNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly columns?: readonly string[]
    readonly rows?: readonly (readonly string[])[]
    readonly title?: string
  }

export const FIGJAM_LINK_PREVIEW_ORIENTATIONS = [
  'horizontal',
  'vertical',
] as const

export type FigJamLinkPreviewOrientation =
  typeof FIGJAM_LINK_PREVIEW_ORIENTATIONS[number]

export type FigJamLinkPreviewProps = {
  readonly description: string
  readonly orientation: FigJamLinkPreviewOrientation
  readonly position: 'absolute'
  readonly title: string
  readonly url: string | null
}

export type CreateFigJamLinkPreviewNodeInput = FigJamPlacementInput &
  FigJamSizeInput & {
    readonly description?: string
    readonly orientation?: FigJamLinkPreviewOrientation
    readonly title?: string
    readonly url?: string | null
  }

export const FIGJAM_CHECKLIST_DEFAULT_PROPS = Object.freeze({
  items: Object.freeze([
    Object.freeze({ checked: true, id: 'scope', text: 'Scope' }),
    Object.freeze({ checked: false, id: 'owner', text: 'Owner' }),
    Object.freeze({ checked: false, id: 'next', text: 'Next' }),
  ]),
  position: 'absolute',
  title: 'Checklist',
} as const satisfies FigJamChecklistProps)

export const FIGJAM_KANBAN_DEFAULT_PROPS = Object.freeze({
  columns: Object.freeze([
    Object.freeze({
      cards: Object.freeze([Object.freeze({ id: 'now-1', text: 'Now' })]),
      id: 'now',
      title: 'Now',
    }),
    Object.freeze({
      cards: Object.freeze([Object.freeze({ id: 'next-1', text: 'Next' })]),
      id: 'next',
      title: 'Next',
    }),
  ]),
  position: 'absolute',
  title: 'Queue',
} as const satisfies FigJamKanbanProps)

export const FIGJAM_TABLE_DEFAULT_PROPS = Object.freeze({
  columns: Object.freeze(['A', 'B', 'C']),
  position: 'absolute',
  rows: Object.freeze([
    Object.freeze(['Impact', 'High', 'Medium']),
    Object.freeze(['Effort', 'Low', 'Medium']),
  ]),
  title: 'Matrix',
} as const satisfies FigJamTableProps)

export const FIGJAM_LINK_PREVIEW_DEFAULT_PROPS = Object.freeze({
  description: 'Paste a URL to create a preview',
  orientation: 'horizontal',
  position: 'absolute',
  title: 'Link preview',
  url: null,
} as const satisfies FigJamLinkPreviewProps)

export const FIGJAM_CHECKLIST_DEFINITION =
  defineReactDesignWidget<FigJamChecklistProps>({
    id: FIGJAM_CHECKLIST_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_CHECKLIST_DEFAULT_PROPS,
      safeParse: parseFigJamChecklistProps,
    },
    create: ({ nodeId, x, y }) => createFigJamChecklistNode({ nodeId, x, y }),
    capabilities: widgetCapabilities(),
    renderer: FigJamChecklist,
    fallback: FigJamChecklistFallback,
    Inspector: FigJamChecklistInspector,
  })

export const FIGJAM_KANBAN_DEFINITION =
  defineReactDesignWidget<FigJamKanbanProps>({
    id: FIGJAM_KANBAN_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_KANBAN_DEFAULT_PROPS,
      safeParse: parseFigJamKanbanProps,
    },
    create: ({ nodeId, x, y }) => createFigJamKanbanNode({ nodeId, x, y }),
    capabilities: widgetCapabilities(),
    renderer: FigJamKanban,
    fallback: FigJamKanbanFallback,
  })

export const FIGJAM_TABLE_DEFINITION =
  defineReactDesignWidget<FigJamTableProps>({
    id: FIGJAM_TABLE_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_TABLE_DEFAULT_PROPS,
      safeParse: parseFigJamTableProps,
    },
    create: ({ nodeId, x, y }) => createFigJamTableNode({ nodeId, x, y }),
    capabilities: widgetCapabilities(),
    renderer: FigJamTable,
    fallback: FigJamTableFallback,
  })

export const FIGJAM_LINK_PREVIEW_DEFINITION =
  defineReactDesignWidget<FigJamLinkPreviewProps>({
    id: FIGJAM_LINK_PREVIEW_DEFINITION_ID,
    kind: 'widget',
    props: {
      defaults: FIGJAM_LINK_PREVIEW_DEFAULT_PROPS,
      safeParse: parseFigJamLinkPreviewProps,
    },
    create: ({ nodeId, x, y }) => createFigJamLinkPreviewNode({ nodeId, x, y }),
    capabilities: widgetCapabilities(),
    renderer: FigJamLinkPreview,
    fallback: FigJamLinkPreviewFallback,
  })

export function createFigJamChecklistNode({
  height = 156,
  items = FIGJAM_CHECKLIST_DEFAULT_PROPS.items,
  nodeId,
  title = FIGJAM_CHECKLIST_DEFAULT_PROPS.title,
  width = 224,
  x,
  y,
}: CreateFigJamChecklistNodeInput) {
  return createCollectionNode({
    definitionId: FIGJAM_CHECKLIST_DEFINITION_ID,
    height,
    label: 'Checklist',
    nodeId,
    parsed: parseFigJamChecklistProps({ items, position: 'absolute', title }),
    width,
    x,
    y,
  })
}

export function createFigJamKanbanNode({
  columns = FIGJAM_KANBAN_DEFAULT_PROPS.columns,
  height = 190,
  nodeId,
  title = FIGJAM_KANBAN_DEFAULT_PROPS.title,
  width = 248,
  x,
  y,
}: CreateFigJamKanbanNodeInput) {
  return createCollectionNode({
    definitionId: FIGJAM_KANBAN_DEFINITION_ID,
    height,
    label: 'Kanban',
    nodeId,
    parsed: parseFigJamKanbanProps({ columns, position: 'absolute', title }),
    width,
    x,
    y,
  })
}

export function createFigJamTableNode({
  columns = FIGJAM_TABLE_DEFAULT_PROPS.columns,
  height = 156,
  nodeId,
  rows = FIGJAM_TABLE_DEFAULT_PROPS.rows,
  title = FIGJAM_TABLE_DEFAULT_PROPS.title,
  width = 260,
  x,
  y,
}: CreateFigJamTableNodeInput) {
  return createCollectionNode({
    definitionId: FIGJAM_TABLE_DEFINITION_ID,
    height,
    label: 'Table',
    nodeId,
    parsed: parseFigJamTableProps({ columns, position: 'absolute', rows, title }),
    width,
    x,
    y,
  })
}

export function createFigJamLinkPreviewNode({
  description = FIGJAM_LINK_PREVIEW_DEFAULT_PROPS.description,
  height = 112,
  nodeId,
  orientation = FIGJAM_LINK_PREVIEW_DEFAULT_PROPS.orientation,
  title = FIGJAM_LINK_PREVIEW_DEFAULT_PROPS.title,
  url = null,
  width = 260,
  x,
  y,
}: CreateFigJamLinkPreviewNodeInput) {
  return createCollectionNode({
    definitionId: FIGJAM_LINK_PREVIEW_DEFINITION_ID,
    height,
    label: 'Link preview',
    nodeId,
    parsed: parseFigJamLinkPreviewProps({
      description,
      orientation,
      position: 'absolute',
      title,
      url,
    }),
    width,
    x,
    y,
  })
}

export function parseFigJamChecklistProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isNonEmptyString(value.title) &&
    Array.isArray(value.items) &&
    value.items.length > 0 &&
    value.items.every(isChecklistItem) &&
    hasUniqueStrings(value.items.map((item) => item.id))
  ) {
    return {
      ok: true as const,
      value: {
        items: value.items.map((item) => ({ ...item })),
        position: value.position,
        title: value.title,
      } satisfies FigJamChecklistProps,
    }
  }

  return invalidCollectionProps('Checklist')
}

export function parseFigJamKanbanProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isNonEmptyString(value.title) &&
    Array.isArray(value.columns) &&
    value.columns.length > 0 &&
    value.columns.every(isKanbanColumn) &&
    hasUniqueStrings(value.columns.map((column) => column.id)) &&
    hasUniqueStrings(value.columns.flatMap((column) =>
      column.cards.map((card) => card.id)))
  ) {
    return {
      ok: true as const,
      value: {
        columns: value.columns.map((column) => ({
          ...column,
          cards: column.cards.map((card) => ({ ...card })),
        })),
        position: value.position,
        title: value.title,
      } satisfies FigJamKanbanProps,
    }
  }

  return invalidCollectionProps('Kanban')
}

export function parseFigJamTableProps(value: unknown) {
  const columns = isJSONObject(value) ? value.columns : null

  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isNonEmptyString(value.title) &&
    isNonEmptyStringArray(columns) &&
    columns.length > 0 &&
    Array.isArray(value.rows) &&
    value.rows.every((row) =>
      isStringArray(row) && row.length === columns.length)
  ) {
    return {
      ok: true as const,
      value: {
        columns: [...columns],
        position: value.position,
        rows: value.rows.map((row) => [...row]),
        title: value.title,
      } satisfies FigJamTableProps,
    }
  }

  return invalidCollectionProps('Table')
}

export function parseFigJamLinkPreviewProps(value: unknown) {
  if (
    isJSONObject(value) &&
    value.position === 'absolute' &&
    isNonEmptyString(value.title) &&
    typeof value.description === 'string' &&
    includes(FIGJAM_LINK_PREVIEW_ORIENTATIONS, value.orientation) &&
    (value.url === null || isHttpUrl(value.url))
  ) {
    return {
      ok: true as const,
      value: {
        description: value.description,
        orientation: value.orientation,
        position: value.position,
        title: value.title,
        url: value.url,
      } satisfies FigJamLinkPreviewProps,
    }
  }

  return invalidCollectionProps('Link preview')
}

function FigJamChecklist({
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamChecklistProps>) {
  return (
    <article {...rootProps} className={collectionClass(rootProps.className)} data-figjam-widget="checklist">
      <h3>{props.title}</h3>
      <ul className="figjam-checklist__items">
        {props.items.map((item) => (
          <li key={item.id}>
            <label>
              <input checked={item.checked} readOnly type="checkbox" />
              <span>{item.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </article>
  )
}

function FigJamChecklistInspector({
  editProp,
  props,
}: ReactDesignWidgetInspectorProps<FigJamChecklistProps>) {
  return (
    <div className="figjam-checklist-inspector">
      {props.items.map((item) => (
        <label key={item.id}>
          <input
            aria-label={`Toggle ${item.text}`}
            checked={item.checked}
            type="checkbox"
            onChange={(event) => editProp(
              'items',
              props.items.map((candidate) => candidate.id === item.id
                ? { ...candidate, checked: event.currentTarget.checked }
                : candidate),
              'Toggle checklist item',
            )}
          />
          <span>{item.text}</span>
        </label>
      ))}
    </div>
  )
}

function FigJamKanban({
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamKanbanProps>) {
  return (
    <article {...rootProps} className={collectionClass(rootProps.className)} data-figjam-widget="kanban">
      <h3>{props.title}</h3>
      <div className="figjam-kanban__columns">
        {props.columns.map((column) => (
          <section key={column.id}>
            <h4>{column.title}</h4>
            {column.cards.map((card) => <p key={card.id}>{card.text}</p>)}
          </section>
        ))}
      </div>
    </article>
  )
}

function FigJamTable({
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamTableProps>) {
  return (
    <article {...rootProps} className={collectionClass(rootProps.className)} data-figjam-widget="table">
      <h3>{props.title}</h3>
      <table>
        <thead><tr>{props.columns.map((column, index) => <th key={index}>{column}</th>)}</tr></thead>
        <tbody>
          {props.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, index) => <td key={index}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </article>
  )
}

function FigJamLinkPreview({
  props,
  rootProps,
}: ReactDesignWidgetRenderProps<FigJamLinkPreviewProps>) {
  const content = (
    <>
      <strong>{props.title}</strong>
      <span>{props.description}</span>
    </>
  )

  return (
    <article
      {...rootProps}
      className={collectionClass(rootProps.className)}
      data-figjam-widget="link-preview"
      data-link-orientation={props.orientation}
    >
      {props.url ? <a href={props.url}>{content}</a> : <div>{content}</div>}
    </article>
  )
}

function FigJamChecklistFallback(props: ReactDesignWidgetFallbackProps<FigJamChecklistProps>) {
  return <CollectionFallback {...props} family="Checklist" />
}

function FigJamKanbanFallback(props: ReactDesignWidgetFallbackProps<FigJamKanbanProps>) {
  return <CollectionFallback {...props} family="Kanban" />
}

function FigJamTableFallback(props: ReactDesignWidgetFallbackProps<FigJamTableProps>) {
  return <CollectionFallback {...props} family="Table" />
}

function FigJamLinkPreviewFallback(props: ReactDesignWidgetFallbackProps<FigJamLinkPreviewProps>) {
  return <CollectionFallback {...props} family="Link preview" />
}

function CollectionFallback({
  family,
  reason,
  rootProps,
}: {
  readonly family: string
  readonly reason: string
  readonly rootProps: ReactDesignWidgetFallbackProps['rootProps']
}) {
  return (
    <article
      {...rootProps}
      className={joinClassNames(rootProps.className, 'figjam-collection', 'figjam-widget-fallback')}
      data-figjam-widget-error={reason}
    >
      {family} unavailable
    </article>
  )
}

function createCollectionNode<Props extends object>({
  definitionId,
  height,
  label,
  nodeId,
  parsed,
  width,
  x,
  y,
}: FigJamPlacementInput & {
  readonly definitionId: string
  readonly height: number
  readonly label: string
  readonly parsed:
    | { readonly ok: true; readonly value: Props }
    | { readonly ok: false; readonly reason: string }
  readonly width: number
}) {
  if (!parsed.ok) {
    throw new Error(parsed.reason)
  }

  return createFigJamAbsoluteWidgetNode({
    definitionId,
    height,
    label,
    nodeId,
    props: cloneDesignProps(parsed.value),
    text: null,
    width,
    x,
    y,
  })
}

function widgetCapabilities() {
  return {
    textEdit: false as const,
    transform: { move: true, resize: true },
  }
}

function isChecklistItem(value: unknown): value is FigJamChecklistItem {
  return isJSONObject(value) &&
    isNonEmptyString(value.id) &&
    typeof value.text === 'string' &&
    typeof value.checked === 'boolean'
}

function isKanbanColumn(value: unknown): value is FigJamKanbanColumn {
  return isJSONObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    Array.isArray(value.cards) &&
    value.cards.every((card) =>
      isJSONObject(card) &&
      isNonEmptyString(card.id) &&
      typeof card.text === 'string')
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString)
}

function hasUniqueStrings(values: readonly string[]) {
  return new Set(values).size === values.length
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function invalidCollectionProps(family: string) {
  return { ok: false as const, reason: `${family} props are invalid` }
}

function collectionClass(className: string | undefined) {
  return joinClassNames(className, 'figjam-collection')
}
