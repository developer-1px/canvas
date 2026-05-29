import type { KeyboardEvent } from 'react'
import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
  CanvasCustomItem,
} from '../../../canvas'
import {
  getHtmlSpecimenData,
  isHtmlSpecimenItem,
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit,
  resolveHtmlSpecimenCssDeclarationSource,
  type HtmlSpecimenCssDeclarationSource,
  type HtmlSpecimenVisualCssNode,
} from './HtmlSpecimenVisualCssEdit'

type HtmlSpecimenCssControl = {
  computedStyleKey:
    | 'backgroundColor'
    | 'borderRadius'
    | 'color'
    | 'fontSize'
    | 'margin'
    | 'padding'
  label: string
  property: string
}

type HtmlSpecimenPreviewFocusData = {
  node: HtmlSpecimenVisualCssNode & {
    computedStyle?: Partial<Record<HtmlSpecimenCssControl['computedStyleKey'], string>>
  }
  nodes: readonly HtmlSpecimenVisualCssNode[]
}

const HTML_SPECIMEN_CSS_CONTROLS: readonly HtmlSpecimenCssControl[] = [
  {
    computedStyleKey: 'color',
    label: 'Text',
    property: 'color',
  },
  {
    computedStyleKey: 'backgroundColor',
    label: 'Bg',
    property: 'background-color',
  },
  {
    computedStyleKey: 'fontSize',
    label: 'Font',
    property: 'font-size',
  },
  {
    computedStyleKey: 'borderRadius',
    label: 'Radius',
    property: 'border-radius',
  },
  {
    computedStyleKey: 'padding',
    label: 'Pad',
    property: 'padding',
  },
  {
    computedStyleKey: 'margin',
    label: 'Margin',
    property: 'margin',
  },
]

export const HTML_SPECIMEN_CSS_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'html-specimen-css',
  isVisible: (context) => getHtmlSpecimenCssInspectorTarget(context) !== null,
  render: (context) => {
    const target = getHtmlSpecimenCssInspectorTarget(context)

    return target
      ? renderHtmlSpecimenCssInspector({
          context,
          target,
        })
      : null
  },
}

export function changeHtmlSpecimenPreviewTargetCss({
  context,
  nextValue,
  property,
}: {
  context: CanvasAppInspectorPanelContext
  nextValue: string
  property: string
}) {
  const target = getHtmlSpecimenCssInspectorTarget(context)
  const value = nextValue.trim()

  if (context.disabled || !target || value.length === 0) {
    return false
  }

  const result = applyHtmlSpecimenVisualCssEdit({
    intent: {
      nextValue: value,
      nodeId: target.node.id,
      property,
    },
    nodes: target.nodes,
    specimen: getHtmlSpecimenData(target.item),
  })

  if (!result.ok) {
    return false
  }

  const nextItems = (context.items ?? context.selectedItems).map((item) =>
    item.id === target.item.id
      ? {
          ...target.item,
          data: result.specimen,
        }
      : item,
  )

  return context.commitItemsChange({
    items: nextItems,
    type: 'replace-changed',
  }, {
    after: context.selection,
    before: context.selection,
  })
}

function renderHtmlSpecimenCssInspector({
  context,
  target,
}: {
  context: CanvasAppInspectorPanelContext
  target: HtmlSpecimenCssInspectorTarget
}) {
  return (
    <div className="html-specimen-css-inspector">
      <div className="html-specimen-css-target">
        {formatHtmlSpecimenCssTargetLabel(target.node)}
      </div>
      {HTML_SPECIMEN_CSS_CONTROLS.map((control) => {
        const model = getHtmlSpecimenCssControlModel({ control, target })

        return (
          <label className="html-specimen-css-field" key={control.property}>
            <span className="html-specimen-css-field-label">
              {control.label}
            </span>
            <input
              key={`${target.node.id}:${control.property}:${model.value}`}
              defaultValue={model.value}
              disabled={context.disabled}
              onBlur={(event) =>
                changeHtmlSpecimenPreviewTargetCss({
                  context,
                  nextValue: event.currentTarget.value,
                  property: control.property,
                })}
              onKeyDown={(event) =>
                handleHtmlSpecimenCssFieldKeyDown(event, model.value)}
              spellCheck={false}
              type="text"
            />
            {model.source ? (
              <span
                className="html-specimen-css-source"
                title={model.source.selector}
              >
                {formatHtmlSpecimenCssSource(model.source)}
              </span>
            ) : null}
          </label>
        )
      })}
    </div>
  )
}

function getHtmlSpecimenCssInspectorTarget(
  context: CanvasAppInspectorPanelContext,
): HtmlSpecimenCssInspectorTarget | null {
  if (context.selection.length !== 1 || context.selectedItems.length !== 1) {
    return null
  }

  const [item] = context.selectedItems
  const focus = context.customFocus

  if (
    !item ||
    !isHtmlSpecimenItem(item) ||
    !focus ||
    focus.ownerId !== 'html-specimen' ||
    focus.itemId !== item.id
  ) {
    return null
  }

  const focusData = readHtmlSpecimenPreviewFocusData(focus.data)

  if (!focusData || focusData.node.id !== focus.targetId) {
    return null
  }

  return {
    item,
    node: focusData.node,
    nodes: focusData.nodes,
  }
}

type HtmlSpecimenCssInspectorTarget = {
  item: CanvasCustomItem
  node: HtmlSpecimenPreviewFocusData['node']
  nodes: readonly HtmlSpecimenVisualCssNode[]
}

function getHtmlSpecimenCssControlModel({
  control,
  target,
}: {
  control: HtmlSpecimenCssControl
  target: HtmlSpecimenCssInspectorTarget
}) {
  const source = resolveHtmlSpecimenCssDeclarationSource({
    css: getHtmlSpecimenData(target.item).css,
    nodeId: target.node.id,
    nodes: target.nodes,
    property: control.property,
  })

  return {
    source,
    value:
      source?.value ??
      target.node.computedStyle?.[control.computedStyleKey] ??
      '',
  }
}

function readHtmlSpecimenPreviewFocusData(
  data: unknown,
): HtmlSpecimenPreviewFocusData | null {
  if (!isRecord(data) || !isHtmlSpecimenCssNode(data.node)) {
    return null
  }

  const nodes = Array.isArray(data.nodes)
    ? data.nodes.filter(isHtmlSpecimenCssNode)
    : []

  return nodes.length > 0
    ? {
        node: data.node,
        nodes,
      }
    : null
}

function isHtmlSpecimenCssNode(value: unknown): value is HtmlSpecimenVisualCssNode {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.tagName === 'string' &&
    isRecord(value.attributes) &&
    Array.isArray(value.classList)
  )
}

function formatHtmlSpecimenCssTargetLabel(
  node: HtmlSpecimenVisualCssNode,
) {
  const classes = node.classList.length > 0
    ? `.${node.classList.join('.')}`
    : ''

  return `${node.tagName}${classes}`
}

function formatHtmlSpecimenCssSource(
  source: HtmlSpecimenCssDeclarationSource,
) {
  const count = source.affectedNodeIds.length

  return `Rule ${formatHtmlSpecimenCssSelector(source.selector)} / ${count} ${
    count === 1 ? 'node' : 'nodes'
  }`
}

function formatHtmlSpecimenCssSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').trim()
}

function handleHtmlSpecimenCssFieldKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  value: string,
) {
  if (event.key === 'Enter') {
    event.currentTarget.blur()
    return
  }

  if (event.key === 'Escape') {
    event.currentTarget.value = value
    event.currentTarget.blur()
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
