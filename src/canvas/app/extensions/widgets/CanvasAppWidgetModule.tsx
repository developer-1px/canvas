import type { ReactNode } from 'react'
import type {
  CanvasCustomItem,
  CanvasJsonObject,
} from '../../../entities'
import type { CanvasAppCustomCommand } from '../../affordances/commands/CanvasAppCustomCommands'
import type { CanvasAppInspectorPanel } from '../../affordances/editing/inspector/CanvasAppInspectorPanels'
import type {
  CanvasTextPasteImporter,
} from '../../affordances/io/text-paste/CanvasTextPasteImporters'
import {
  defineCanvasAppCustomItemModule,
  type CanvasAppCustomItemModuleCreationTool,
} from '../custom-item-modules/CanvasAppCustomItemModules'
import type { CanvasAppCustomToolShortcut } from '../custom-tools/CanvasAppCustomCreationTools'
import {
  CanvasWidgetIsolationHost,
  type CanvasWidgetIsolationMode,
} from './CanvasWidgetIsolationHost'

export type CanvasAppWidgetIsolationMode = CanvasWidgetIsolationMode

export type CanvasAppWidgetItem<
  TData extends CanvasJsonObject = CanvasJsonObject,
> = CanvasCustomItem & {
  data: TData
}

export type CanvasAppWidgetRenderContext<
  TData extends CanvasJsonObject = CanvasJsonObject,
> = {
  data: TData
  item: CanvasAppWidgetItem<TData>
}

export type CanvasAppWidgetInteractionRenderContext<
  TData extends CanvasJsonObject = CanvasJsonObject,
> = CanvasAppWidgetRenderContext<TData> & {
  onChangeData: (data: TData) => void
}

export type CanvasAppWidgetInteraction<
  TData extends CanvasJsonObject = CanvasJsonObject,
> = {
  render: (context: CanvasAppWidgetInteractionRenderContext<TData>) => ReactNode
}

export type CanvasAppWidgetInteractions = Readonly<
  Record<string, CanvasAppWidgetInteraction>
>

export type CanvasAppWidgetModule<
  TData extends CanvasJsonObject = CanvasJsonObject,
> = ReturnType<typeof defineCanvasAppCustomItemModule> & {
  widgetInteraction?: CanvasAppWidgetInteraction<TData>
}

type CanvasAppWidgetInteractionCarrier =
  ReturnType<typeof defineCanvasAppCustomItemModule> & {
    widgetInteraction?: CanvasAppWidgetInteraction
  }

export type CanvasAppHtmlWidgetData = CanvasJsonObject & {
  css?: string
  html: string
}

export type CanvasAppWidgetCreationOptions = {
  ariaLabel?: string
  label?: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel?: string
  title?: string
}

type CanvasAppWidgetModuleBaseInput<
  TData extends CanvasJsonObject,
> = {
  customCommands?: readonly CanvasAppCustomCommand[]
  defaultData?: TData | (() => TData)
  defaultSize?: {
    h: number
    w: number
  }
  id: string
  inspectorPanels?: readonly CanvasAppInspectorPanel[]
  isolation?: CanvasAppWidgetIsolationMode
  label?: string
  presentation?: string
  textPasteImporters?: readonly CanvasTextPasteImporter[]
  title: string
  tool?: false | CanvasAppWidgetCreationOptions
  validateData?: (data: CanvasJsonObject) => data is TData
}

export type CanvasAppReactWidgetModuleInput<
  TData extends CanvasJsonObject = CanvasJsonObject,
> = CanvasAppWidgetModuleBaseInput<TData> & {
  interaction?: {
    render: (
      context: CanvasAppWidgetInteractionRenderContext<TData>,
    ) => ReactNode
  }
  render: (context: CanvasAppWidgetRenderContext<TData>) => ReactNode
}

export type CanvasAppHtmlWidgetModuleInput =
  CanvasAppWidgetModuleBaseInput<CanvasAppHtmlWidgetData> & {
    defaultCss?: string
    defaultHtml: string
  }

export function defineCanvasAppReactWidgetModule<
  TData extends CanvasJsonObject = CanvasJsonObject,
>({
  render,
  ...input
}: CanvasAppReactWidgetModuleInput<TData>) {
  return defineCanvasAppWidgetModule({
    ...input,
    renderWidget: (context) => render(context),
  })
}

export function defineCanvasAppHtmlWidgetModule({
  defaultCss,
  defaultHtml,
  validateData,
  ...input
}: CanvasAppHtmlWidgetModuleInput) {
  return defineCanvasAppWidgetModule({
    ...input,
    defaultData: input.defaultData ?? createCanvasAppHtmlWidgetData({
      css: defaultCss,
      html: defaultHtml,
    }),
    renderWidget: ({ data }) =>
      isCanvasAppHtmlWidgetData(data)
        ? (
            <>
              {data.css ? <style>{data.css}</style> : null}
              <div dangerouslySetInnerHTML={{ __html: data.html }} />
            </>
          )
        : null,
    validateData: (data): data is CanvasAppHtmlWidgetData =>
      isCanvasAppHtmlWidgetData(data) &&
      (validateData ? validateData(data) : true),
  })
}

function defineCanvasAppWidgetModule<
  TData extends CanvasJsonObject,
>({
  customCommands,
  defaultData,
  defaultSize = { h: 160, w: 240 },
  id,
  interaction,
  inspectorPanels,
  isolation = 'shadow',
  label,
  presentation = `${id}-widget`,
  renderWidget,
  textPasteImporters,
  title,
  tool = {},
  validateData,
}: CanvasAppWidgetModuleBaseInput<TData> & {
  interaction?: CanvasAppReactWidgetModuleInput<TData>['interaction']
  renderWidget: (context: CanvasAppWidgetRenderContext<TData>) => ReactNode
}): CanvasAppWidgetModule<TData> {
  const getDefaultData = () => {
    if (typeof defaultData === 'function') {
      return defaultData()
    }

    return defaultData ?? ({} as TData)
  }
  const isWidgetData = (data: CanvasJsonObject): data is TData =>
    validateData ? validateData(data) : true

  const module = defineCanvasAppCustomItemModule({
    customCommands,
    customCreationTools: tool === false
      ? undefined
      : [createCanvasAppWidgetCreationTool({
          defaultSize,
          getDefaultData,
          id,
          label: tool.label ?? label ?? title,
          tool,
          title,
        })],
    id,
    inspectorPanels,
    presentation,
    renderItem: ({ item }) => {
      const widgetItem = item as CanvasAppWidgetItem<TData>
      const data = isWidgetData(widgetItem.data)
        ? widgetItem.data
        : getDefaultData()

      return (
        <>
          <foreignObject
            x={item.x}
            y={item.y}
            width={item.w}
            height={item.h}
          >
            <div
              className="canvas-widget"
              data-canvas-widget-kind={id}
              style={{
                height: '100%',
                pointerEvents: 'none',
                width: '100%',
              }}
            >
              <CanvasWidgetIsolationHost
                fallbackLabel={`${title} unavailable`}
                mode={isolation}
              >
                {renderWidget({
                  data,
                  item: widgetItem,
                })}
              </CanvasWidgetIsolationHost>
            </div>
          </foreignObject>
          <rect
            className="canvas-widget-hit"
            data-canvas-widget-hit={id}
            fill="transparent"
            height={item.h}
            pointerEvents="all"
            width={item.w}
            x={item.x}
            y={item.y}
          />
        </>
      )
    },
    textPasteImporters,
    validateItem: (item) =>
      item.kind === id &&
      item.presentation === presentation &&
      isWidgetData(item.data),
  })

  if (!interaction) {
    return module
  }

  const widgetInteraction: CanvasAppWidgetInteraction<TData> = Object.freeze({
    render: ({ data, item, onChangeData }) => {
      const widgetData = isWidgetData(data) ? data : getDefaultData()

      return interaction.render({
        data: widgetData,
        item: item as CanvasAppWidgetItem<TData>,
        onChangeData,
      })
    },
  })

  return Object.freeze({
    ...module,
    widgetInteraction,
  })
}

export function getCanvasAppWidgetInteractions(
  modules: readonly ReturnType<typeof defineCanvasAppCustomItemModule>[] = [],
): CanvasAppWidgetInteractions {
  const interactions: Record<string, CanvasAppWidgetInteraction> = {}

  for (const module of modules) {
    const widgetInteraction =
      (module as CanvasAppWidgetInteractionCarrier).widgetInteraction

    if (widgetInteraction) {
      interactions[module.id] = widgetInteraction
    }
  }

  return Object.freeze(interactions)
}

function createCanvasAppWidgetCreationTool<
  TData extends CanvasJsonObject,
>({
  defaultSize,
  getDefaultData,
  id,
  label,
  title,
  tool,
}: {
  defaultSize: {
    h: number
    w: number
  }
  getDefaultData: () => TData
  id: string
  label: string
  title: string
  tool: CanvasAppWidgetCreationOptions
}): CanvasAppCustomItemModuleCreationTool {
  return {
    ariaLabel: tool.ariaLabel ?? `${title} tool`,
    id,
    label,
    shortcut: tool.shortcut,
    statusLabel: tool.statusLabel ?? title,
    title: tool.title ?? title,
    createItem: ({ currentWorld, moved, startWorld }) => {
      const bounds = moved
        ? {
            h: Math.max(defaultSize.h, Math.abs(currentWorld.y - startWorld.y)),
            w: Math.max(defaultSize.w, Math.abs(currentWorld.x - startWorld.x)),
            x: Math.min(startWorld.x, currentWorld.x),
            y: Math.min(startWorld.y, currentWorld.y),
          }
        : {
            ...defaultSize,
            x: startWorld.x,
            y: startWorld.y,
          }

      return {
        ...bounds,
        data: getDefaultData(),
        title,
      }
    },
  }
}

function createCanvasAppHtmlWidgetData({
  css,
  html,
}: {
  css?: string
  html: string
}): CanvasAppHtmlWidgetData {
  return css ? { css, html } : { html }
}

function isCanvasAppHtmlWidgetData(
  data: CanvasJsonObject,
): data is CanvasAppHtmlWidgetData {
  return (
    typeof data.html === 'string' &&
    (data.css === undefined || typeof data.css === 'string')
  )
}
