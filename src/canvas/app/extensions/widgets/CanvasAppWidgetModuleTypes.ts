import type { ReactNode } from 'react'
import type {
  CanvasCustomItem,
  CanvasJsonObject,
} from '../../../entities'
import type { CanvasAppCustomCommand } from '../custom-commands'
import type {
  defineCanvasAppCustomItemModule,
} from '../custom-item-modules/CanvasAppCustomItemModules'
import type { CanvasAppCustomToolShortcut } from '../custom-tools/CanvasAppCustomCreationTools'
import type { CanvasAppInspectorPanel } from '../inspector-panels'
import type {
  CanvasTextPasteImporter,
} from '../../feature-packs/text-paste-import'
import type { CanvasAppHtmlWidgetData } from './CanvasAppHtmlWidgetData'
import type {
  CanvasWidgetIsolationMode,
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

export type CanvasAppWidgetCreationOptions = {
  ariaLabel?: string
  label?: string
  shortcut?: CanvasAppCustomToolShortcut
  statusLabel?: string
  title?: string
}

export type CanvasAppWidgetModuleBaseInput<
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

export type CanvasAppWidgetModuleInput<
  TData extends CanvasJsonObject,
> = CanvasAppWidgetModuleBaseInput<TData> & {
  interaction?: CanvasAppReactWidgetModuleInput<TData>['interaction']
  renderWidget: (context: CanvasAppWidgetRenderContext<TData>) => ReactNode
}
