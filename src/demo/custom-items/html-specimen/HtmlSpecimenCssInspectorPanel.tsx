import type {
  CanvasAppInspectorPanel,
  CanvasAppInspectorPanelContext,
} from '../../../canvas'
import {
  getHtmlSpecimenData,
  type HtmlSpecimenCssChange,
  type HtmlSpecimenData,
  type HtmlSpecimenTextChange,
} from './HtmlSpecimenCustomItemModel'
import {
  applyHtmlSpecimenVisualCssEdit,
} from './HtmlSpecimenVisualCssEdit'
import {
  applyHtmlSpecimenVisualTextEdit,
} from './HtmlSpecimenVisualTextEdit'
import {
  formatHtmlSpecimenCssTargetLabel,
  getHtmlSpecimenCssControlByProperty,
  getHtmlSpecimenCssInspectorTarget,
  isHtmlSpecimenCssComputedNoOp,
  type HtmlSpecimenCssInspectorTarget,
} from './HtmlSpecimenCssInspectorPanelModel'
import {
  renderHtmlSpecimenCssInspector,
} from './HtmlSpecimenCssInspectorPanelView'

export const HTML_SPECIMEN_CSS_INSPECTOR_PANEL: CanvasAppInspectorPanel = {
  id: 'html-specimen-css',
  isVisible: (context) => getHtmlSpecimenCssInspectorTarget(context) !== null,
  render: (context) => {
    const target = getHtmlSpecimenCssInspectorTarget(context)

    return target
      ? renderHtmlSpecimenCssInspector({
          context,
          onCssChange: changeHtmlSpecimenPreviewTargetCss,
          onTextChange: changeHtmlSpecimenPreviewTargetText,
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

  if (
    context.disabled ||
    !target ||
    value.length === 0 ||
    !getHtmlSpecimenCssControlByProperty(property)
  ) {
    return false
  }

  if (isHtmlSpecimenCssComputedNoOp({
    property,
    target,
    value,
  })) {
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

  const change = createHtmlSpecimenCssChange({
    result,
    target,
  })
  const nextItems = (context.items ?? context.selectedItems).map((item) =>
    item.id === target.item.id
      ? {
          ...target.item,
          data: appendHtmlSpecimenCssChange({
            change,
            specimen: result.specimen,
          }),
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

export function changeHtmlSpecimenPreviewTargetText({
  context,
  nextText,
}: {
  context: CanvasAppInspectorPanelContext
  nextText: string
}) {
  const target = getHtmlSpecimenCssInspectorTarget(context)

  if (context.disabled || !target) {
    return false
  }

  const currentText = target.node.text ?? ''

  if (nextText === currentText) {
    return false
  }

  const result = applyHtmlSpecimenVisualTextEdit({
    intent: {
      nextText,
      nodeId: target.node.id,
    },
    nodes: target.nodes,
    specimen: getHtmlSpecimenData(target.item),
  })

  if (!result.ok) {
    return false
  }

  const change = createHtmlSpecimenTextChange({
    result,
    target,
  })
  const nextItems = (context.items ?? context.selectedItems).map((item) =>
    item.id === target.item.id
      ? {
          ...target.item,
          data: appendHtmlSpecimenTextChange({
            change,
            specimen: result.specimen,
          }),
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

function appendHtmlSpecimenCssChange({
  change,
  specimen,
}: {
  change: HtmlSpecimenCssChange
  specimen: HtmlSpecimenData
}): HtmlSpecimenData {
  const previousChanges = specimen.cssChanges ?? []
  const nextChanges = previousChanges.filter((previous) =>
    !(
      previous.atRule === change.atRule &&
      previous.selector === change.selector &&
      previous.property === change.property
    ))

  return {
    ...specimen,
    cssChanges: [...nextChanges, change].slice(-8),
  }
}

function appendHtmlSpecimenTextChange({
  change,
  specimen,
}: {
  change: HtmlSpecimenTextChange
  specimen: HtmlSpecimenData
}): HtmlSpecimenData {
  const previousChanges = specimen.textChanges ?? []

  return {
    ...specimen,
    textChanges: [...previousChanges, change].slice(-8),
  }
}

function createHtmlSpecimenCssChange({
  result,
  target,
}: {
  result: Extract<
    ReturnType<typeof applyHtmlSpecimenVisualCssEdit>,
    { ok: true }
  >
  target: HtmlSpecimenCssInspectorTarget
}): HtmlSpecimenCssChange {
  return {
    affectedNodeCount: result.affectedNodeIds.length,
    kind: result.patch.kind === 'insert-declaration' ? 'insert' : 'update',
    property: result.source.property,
    selector: result.source.selector,
    target: formatHtmlSpecimenCssTargetLabel(target.node),
    value: result.source.value,
    ...(result.source.atRule ? { atRule: result.source.atRule } : {}),
    ...(result.previousSource?.value
      ? { previousValue: result.previousSource.value }
      : {}),
  }
}

function createHtmlSpecimenTextChange({
  result,
  target,
}: {
  result: Extract<
    ReturnType<typeof applyHtmlSpecimenVisualTextEdit>,
    { ok: true }
  >
  target: HtmlSpecimenCssInspectorTarget
}): HtmlSpecimenTextChange {
  return {
    nextText: result.nextText,
    nodeId: target.node.id,
    previousText: result.previousText,
    target: formatHtmlSpecimenCssTargetLabel(target.node),
  }
}
