import type {
  CanvasJsonObject,
} from '../../../entities'
import {
  defineCanvasAppCustomItemModule,
} from '../custom-item-modules/CanvasAppCustomItemModules'
import {
  createCanvasAppHtmlWidgetData,
  isCanvasAppHtmlWidgetData,
} from './CanvasAppHtmlWidgetData'
import type {
  CanvasAppHtmlWidgetData,
} from './CanvasAppHtmlWidgetData'
import {
  createCanvasAppWidgetCreationTool,
} from './CanvasAppWidgetCreationTool'
import {
  getCanvasAppWidgetRenderKey,
  renderCanvasAppWidgetItem,
} from './CanvasAppWidgetItemRenderer'
import type {
  CanvasAppHtmlWidgetModuleInput,
  CanvasAppReactWidgetModuleInput,
  CanvasAppWidgetInteraction,
  CanvasAppWidgetItem,
  CanvasAppWidgetModule,
  CanvasAppWidgetModuleInput,
} from './CanvasAppWidgetModuleTypes'

export {
  getCanvasAppWidgetInteractions,
} from './CanvasAppWidgetInteractions'
export type {
  CanvasAppHtmlWidgetData,
} from './CanvasAppHtmlWidgetData'
export type {
  CanvasAppHtmlWidgetModuleInput,
  CanvasAppReactWidgetModuleInput,
  CanvasAppWidgetCreationOptions,
  CanvasAppWidgetInteraction,
  CanvasAppWidgetInteractionRenderContext,
  CanvasAppWidgetInteractions,
  CanvasAppWidgetIsolationMode,
  CanvasAppWidgetItem,
  CanvasAppWidgetModule,
  CanvasAppWidgetRenderContext,
} from './CanvasAppWidgetModuleTypes'

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
}: CanvasAppWidgetModuleInput<TData>): CanvasAppWidgetModule<TData> {
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
    getRenderKey: getCanvasAppWidgetRenderKey,
    inspectorPanels,
    presentation,
    renderItem: ({ item }) =>
      renderCanvasAppWidgetItem({
        getDefaultData,
        id,
        isWidgetData,
        isolation,
        item,
        renderWidget,
        title,
      }),
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
