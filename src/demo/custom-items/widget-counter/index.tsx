import {
  CanvasCore,
  defineCanvasAppReactWidgetModule,
  type CanvasAppCustomCommand,
  type CanvasAppCustomCommandContext,
  type CanvasCustomItem,
  type CanvasItem,
  type CanvasJsonObject,
} from '../../../canvas'

export const WIDGET_COUNTER_KIND = 'widget-counter'
export const WIDGET_COUNTER_PRESENTATION = 'widget-counter-card'
export const WIDGET_COUNTER_INCREMENT_COMMAND = 'widget-counter-increment'

export type WidgetCounterData = CanvasJsonObject & {
  count: number
  label: string
  stuckTo?: string
}

export type WidgetCounterItem = CanvasCustomItem & {
  data: WidgetCounterData
  kind: typeof WIDGET_COUNTER_KIND
  presentation: typeof WIDGET_COUNTER_PRESENTATION
}

export function createWidgetCounterData({
  count = 0,
  label = 'Counter',
  stuckTo,
}: Partial<WidgetCounterData> = {}): WidgetCounterData {
  return stuckTo
    ? { count, label, stuckTo }
    : { count, label }
}

export function createWidgetCounterItem({
  data,
  h = 96,
  id = 'widget-counter-1',
  locked,
  title = 'Counter',
  w = 160,
  x = 0,
  y = 0,
}: Partial<Omit<WidgetCounterItem, 'type' | 'kind' | 'presentation'>> = {}):
  WidgetCounterItem {
  return {
    data: createWidgetCounterData(data),
    h,
    id,
    kind: WIDGET_COUNTER_KIND,
    locked,
    presentation: WIDGET_COUNTER_PRESENTATION,
    title,
    type: 'custom',
    w,
    x,
    y,
  }
}

export function isWidgetCounterItem(item: CanvasItem): item is WidgetCounterItem {
  return item.type === 'custom' &&
    item.kind === WIDGET_COUNTER_KIND &&
    item.presentation === WIDGET_COUNTER_PRESENTATION &&
    isWidgetCounterData(item.data)
}

export function isWidgetCounterData(
  data: CanvasJsonObject,
): data is WidgetCounterData {
  return (
    Number.isInteger(data.count) &&
    typeof data.label === 'string' &&
    data.label.trim().length > 0 &&
    data.label.length <= 32 &&
    (
      data.stuckTo === undefined ||
      CanvasCore.isCanvasStableId(data.stuckTo)
    )
  )
}

export const widgetCounterIncrementCommand: CanvasAppCustomCommand = {
  ariaLabel: 'Increment widget counter',
  id: WIDGET_COUNTER_INCREMENT_COMMAND,
  label: '+1',
  title: 'Increment counter',
  isEnabled: (context) => getSelectedWidgetCounterItem(context) !== null,
  run: (context) => {
    const selectedItem = getSelectedWidgetCounterItem(context)

    if (!selectedItem) {
      return
    }

    context.commitItemsChange({
      type: 'replace-changed',
      items: replaceWidgetCounterItem(context.items, selectedItem.id, (item) => ({
        ...item,
        data: {
          ...item.data,
          count: item.data.count + 1,
        },
      })),
    }, {
      before: context.selection,
      after: context.selection,
    })
  },
}

export const WIDGET_COUNTER_CUSTOM_ITEM_MODULE =
  defineCanvasAppReactWidgetModule<WidgetCounterData>({
    customCommands: [widgetCounterIncrementCommand],
    defaultData: createWidgetCounterData,
    defaultSize: {
      h: 96,
      w: 160,
    },
    id: WIDGET_COUNTER_KIND,
    label: 'Count',
    presentation: WIDGET_COUNTER_PRESENTATION,
    render: ({ data, item }) => (
      <div
        data-widget-counter={item.id}
        style={{
          background: '#fff',
          border: '1px solid #475569',
          borderRadius: 6,
          boxSizing: 'border-box',
          color: '#111827',
          display: 'grid',
          fontFamily: 'Inter, system-ui, sans-serif',
          gridTemplateRows: '32px 1fr',
          height: '100%',
          padding: '14px 16px',
          width: '100%',
        }}
      >
        <div
          style={{
            color: '#334155',
            fontSize: 13,
            fontWeight: 620,
          }}
        >
          {data.label}
        </div>
        <div
          style={{
            alignSelf: 'center',
            fontSize: 30,
            fontWeight: 650,
            lineHeight: 1,
          }}
        >
          {data.count}
        </div>
      </div>
    ),
    title: 'Widget counter',
    validateData: isWidgetCounterData,
  })

function getSelectedWidgetCounterItem({
  items,
  selection,
}: Pick<CanvasAppCustomCommandContext, 'items' | 'selection'>) {
  if (selection.length !== 1) {
    return null
  }

  return findWidgetCounterItem(items, selection[0] ?? '') ?? null
}

function findWidgetCounterItem(
  items: readonly CanvasItem[],
  id: string,
): WidgetCounterItem | null {
  for (const item of items) {
    if (item.id === id && isWidgetCounterItem(item)) {
      return item
    }

    if (item.type === 'group') {
      const child = findWidgetCounterItem(item.children, id)

      if (child) {
        return child
      }
    }
  }

  return null
}

function replaceWidgetCounterItem(
  items: readonly CanvasItem[],
  id: string,
  replaceItem: (item: WidgetCounterItem) => WidgetCounterItem,
): CanvasItem[] {
  return items.map((item) => {
    if (item.id === id && isWidgetCounterItem(item)) {
      return replaceItem(item)
    }

    return item.type === 'group'
      ? {
          ...item,
          children: replaceWidgetCounterItem(item.children, id, replaceItem),
        }
      : item
  })
}
