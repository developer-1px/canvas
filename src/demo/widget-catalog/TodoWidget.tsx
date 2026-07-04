import {
  type CanvasCustomItem,
  type CanvasJsonObject,
} from '../../canvas'
import {
  defineCanvasAppReactWidgetModule,
} from '../../canvas/app/authoring'

export const TODO_WIDGET_KIND = 'todo-widget'
export const TODO_WIDGET_PRESENTATION = 'todo-widget-card'

export type TodoWidgetItem = {
  done: boolean
  text: string
}

export type TodoWidgetData = CanvasJsonObject & {
  items: TodoWidgetItem[]
  title: string
}

function isTodoWidgetItem(value: unknown): value is TodoWidgetItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TodoWidgetItem).text === 'string' &&
    typeof (value as TodoWidgetItem).done === 'boolean'
  )
}

export function isTodoWidgetData(data: CanvasJsonObject): data is TodoWidgetData {
  return (
    typeof data.title === 'string' &&
    Array.isArray(data.items) &&
    data.items.every(isTodoWidgetItem)
  )
}

function createTodoWidgetData(): TodoWidgetData {
  return {
    items: [
      { done: true, text: 'Define the widget seam' },
      { done: false, text: 'Ship the isolation host' },
      { done: false, text: 'Add a Todo widget' },
    ],
    title: 'Today',
  }
}

// Pure data mutation used by play-mode interaction. Kept independent of the
// overlay UI so commits can flow through the host document update path.
export function toggleTodoWidgetItemDone(
  data: TodoWidgetData,
  index: number,
): TodoWidgetData {
  if (index < 0 || index >= data.items.length) {
    return data
  }

  return {
    ...data,
    items: data.items.map((item, current) =>
      current === index ? { ...item, done: !item.done } : item,
    ),
  }
}

export function createTodoWidgetSeedItem(): CanvasCustomItem {
  return {
    data: createTodoWidgetData(),
    h: 132,
    id: 'engine-todo-widget',
    kind: TODO_WIDGET_KIND,
    presentation: TODO_WIDGET_PRESENTATION,
    title: 'Todo widget',
    type: 'custom',
    w: 220,
    x: 320,
    y: 470,
  }
}

function renderTodoWidgetCard({
  active = false,
  data,
  itemId,
  onToggleItem,
}: {
  active?: boolean
  data: TodoWidgetData
  itemId: string
  onToggleItem?: (index: number) => void
}) {
  return (
    <div
      data-todo-widget={itemId}
      style={{
        background: '#fff',
        border: active ? '1px solid #2457c5' : '1px solid #d0d2cc',
        borderRadius: 6,
        boxShadow: active ? '0 1px 4px rgba(23,32,51,0.12)' : 'none',
        boxSizing: 'border-box',
        color: '#1d2028',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, sans-serif',
        gap: 6,
        height: '100%',
        padding: 12,
        width: '100%',
      }}
    >
      <div style={{ color: '#39404c', fontSize: 12, fontWeight: 600 }}>
        {data.title}
      </div>
      <ul
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}
      >
        {data.items.map((todo, index) => (
          <li
            key={index}
            style={{
              alignItems: 'center',
              color: todo.done ? '#6d7380' : '#1d2028',
              display: 'flex',
              fontSize: 13,
              gap: 8,
              textDecoration: todo.done ? 'line-through' : 'none',
            }}
          >
            {onToggleItem ? (
              <label
                style={{
                  alignItems: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => onToggleItem(index)}
                />
                <span>{todo.text}</span>
              </label>
            ) : (
              <>
                <span aria-hidden="true">{todo.done ? '☑' : '☐'}</span>
                <span>{todo.text}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const TODO_WIDGET_MODULE =
  defineCanvasAppReactWidgetModule<TodoWidgetData>({
    defaultData: createTodoWidgetData,
    defaultSize: { h: 132, w: 220 },
    id: TODO_WIDGET_KIND,
    isolation: 'none',
    label: 'Todo',
    presentation: TODO_WIDGET_PRESENTATION,
    tool: false,
    interaction: {
      render: ({ data, item, onChangeData }) =>
        renderTodoWidgetCard({
          active: true,
          data,
          itemId: item.id,
          onToggleItem: (index) => {
            onChangeData(toggleTodoWidgetItemDone(data, index))
          },
        }),
    },
    render: ({ data, item }) =>
      renderTodoWidgetCard({
        data,
        itemId: item.id,
      }),
    title: 'Todo widget',
    validateData: isTodoWidgetData,
  })
