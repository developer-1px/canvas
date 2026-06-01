import {
  Check,
  Clipboard,
  FileCode2,
  RotateCcw,
  ScrollText,
} from 'lucide-react'
import type { KeyboardEvent } from 'react'
import type {
  CanvasAppInspectorPanelContext,
} from '../../../canvas'
import { getHtmlSpecimenData } from './HtmlSpecimenCustomItemModel'
import {
  isHtmlSpecimenVisualTextEditable,
} from './HtmlSpecimenVisualTextEdit'
import {
  readNodeAttribute,
} from './HtmlSpecimenPreviewNodeLabel'
import {
  HtmlSpecimenOutlineEditor,
} from './HtmlSpecimenOutlineEditor'
import {
  formatHtmlSpecimenCssControlSource,
  formatHtmlSpecimenCssPatchPreview,
  getHtmlSpecimenChanges,
  getHtmlSpecimenCssControlSourceSelector,
  getHtmlSpecimenStyleRuleSummary,
} from './HtmlSpecimenCssInspectorPanelFormatting'
import {
  formatHtmlSpecimenCssTargetLabel,
  getHtmlSpecimenCssControlEntries,
  type HtmlSpecimenCssInspectorTarget,
  type HtmlSpecimenPreviewFocusNode,
} from './HtmlSpecimenCssInspectorPanelModel'

type HtmlSpecimenCssChangeHandler = (params: {
  context: CanvasAppInspectorPanelContext
  nextValue: string
  property: string
}) => boolean

type HtmlSpecimenTextChangeHandler = (params: {
  context: CanvasAppInspectorPanelContext
  nextText: string
}) => boolean

export function renderHtmlSpecimenCssInspector({
  context,
  onCssChange,
  onTextChange,
  target,
}: {
  context: CanvasAppInspectorPanelContext
  onCssChange: HtmlSpecimenCssChangeHandler
  onTextChange: HtmlSpecimenTextChangeHandler
  target: HtmlSpecimenCssInspectorTarget
}) {
  const specimen = getHtmlSpecimenData(target.item)
  const controlEntries = getHtmlSpecimenCssControlEntries({ specimen, target })
  const patchPreview = formatHtmlSpecimenCssPatchPreview(controlEntries)
  const changes = getHtmlSpecimenChanges(specimen)
  const styleRule = getHtmlSpecimenStyleRuleSummary(controlEntries)
  const targetLabel = formatHtmlSpecimenCssTargetLabel(target.node)
  const targetSource = target.node.provenance?.sourceId ?? 'html element'
  const styleSummary = getHtmlSpecimenStyleSummary(controlEntries)
  const patchSummary = changes.length > 0
    ? `${changes.length} edits · ready`
    : 'clean'

  return (
    <div className="html-specimen-css-inspector">
      <div className="html-specimen-dock-scroll">
        <details
          className="html-specimen-devtools-section html-specimen-dock-section html-specimen-target-panel"
        >
          <summary className="html-specimen-dock-summary">
            <span>Target</span>
            <code>{targetLabel}</code>
            <small>{targetSource} · Inspect</small>
          </summary>
          <div className="html-specimen-target-body">
            <div className="html-specimen-target-mode">
              <span>Inspect</span>
              <small>{target.nodes.length} nodes</small>
            </div>
            <div className="html-specimen-dom-meta">
              <div className="html-specimen-css-target">
                <code>{targetLabel}</code>
              </div>
              {renderHtmlSpecimenNodeFacts(target.node)}
            </div>
            {renderHtmlSpecimenTextEditor({ context, onTextChange, target })}
            <HtmlSpecimenOutlineEditor context={context} target={target} />
          </div>
        </details>
        <details
          className="html-specimen-devtools-section html-specimen-dock-section html-specimen-style-panel"
          open
        >
          <summary className="html-specimen-dock-summary">
            <span>Style</span>
            <code>{styleRule.selector}</code>
            <small>{styleRule.source}</small>
          </summary>
          <div className="html-specimen-style-summary">
            {styleSummary.map((entry) => (
              <span key={entry.property}>
                {entry.property} {entry.value}
              </span>
            ))}
          </div>
          <div className="html-specimen-css-rule">
            <div className="html-specimen-css-rule-header">
              <code>{styleRule.selector}</code>
              <span>{styleRule.source}</span>
            </div>
            <div className="html-specimen-css-declarations">
              {controlEntries.map(({ control, model }) => {
                const sourceSelector =
                  getHtmlSpecimenCssControlSourceSelector(model)

                return (
                  <label
                    className="html-specimen-css-field"
                    data-editable={model.editable}
                    key={control.property}
                  >
                    <span className="html-specimen-css-field-label">
                      {control.label}
                    </span>
                    <input
                      key={`${target.node.id}:${control.property}:${model.value}`}
                      defaultValue={model.value}
                      disabled={context.disabled || !model.editable}
                      onBlur={(event) =>
                        onCssChange({
                          context,
                          nextValue: event.currentTarget.value,
                          property: control.property,
                        })}
                      onKeyDown={(event) =>
                        handleHtmlSpecimenCssFieldKeyDown(event, model.value)}
                      spellCheck={false}
                      type="text"
                    />
                    {sourceSelector ? (
                      <span
                        className="html-specimen-css-source"
                        title={sourceSelector}
                      >
                        {formatHtmlSpecimenCssControlSource(model)}
                      </span>
                    ) : (
                      <span className="html-specimen-css-source">
                        No matching rule
                      </span>
                    )}
                  </label>
                )
              })}
            </div>
          </div>
        </details>
        <details
          className="html-specimen-devtools-section html-specimen-dock-section html-specimen-patch-panel"
        >
          <summary className="html-specimen-dock-summary">
            <span>Patch</span>
            <code>{patchSummary}</code>
            <small>{patchPreview.split('\n').length} lines</small>
          </summary>
          {changes.length > 0 ? (
            <div className="html-specimen-css-changes">
              {changes.slice(-5).reverse().map((change) => (
                <div
                  className="html-specimen-css-change"
                  key={change.key}
                >
                  <code>{change.property}</code>
                  <span>{change.value}</span>
                  <small>{change.source}</small>
                </div>
              ))}
            </div>
          ) : null}
          <pre className="html-specimen-css-patch-preview">
            <code>{patchPreview}</code>
          </pre>
        </details>
      </div>
      <div
        className="html-specimen-actions-strip"
        role="toolbar"
        aria-label="Patch actions"
      >
        <button
          className="html-specimen-icon-action"
          aria-label="Copy patch"
          onClick={() => {
            void copyHtmlSpecimenText(patchPreview)
          }}
          type="button"
        >
          <Clipboard aria-hidden="true" size={13} strokeWidth={2} />
          <span>Copy patch</span>
        </button>
        <button
          className="html-specimen-icon-action"
          aria-label="Export HTML"
          onClick={(event) => {
            exportHtmlSpecimenHtml(event.currentTarget, specimen.html)
            void copyHtmlSpecimenText(specimen.html)
          }}
          type="button"
        >
          <FileCode2 aria-hidden="true" size={13} strokeWidth={2} />
          <span>Export HTML</span>
        </button>
        <button
          className="html-specimen-icon-action"
          aria-label="Export CSS"
          onClick={(event) => {
            exportHtmlSpecimenCss(event.currentTarget, specimen.css)
            void copyHtmlSpecimenText(specimen.css)
          }}
          type="button"
        >
          <ScrollText aria-hidden="true" size={13} strokeWidth={2} />
          <span>Export CSS</span>
        </button>
        <button
          className="html-specimen-icon-action"
          aria-label="Revert changes"
          type="button"
        >
          <RotateCcw aria-hidden="true" size={13} strokeWidth={2} />
          <span>Revert changes</span>
        </button>
        <button className="html-specimen-apply-action" type="button">
          <Check aria-hidden="true" size={13} strokeWidth={2} />
          Apply patch
        </button>
      </div>
    </div>
  )
}

function getHtmlSpecimenStyleSummary(
  controlEntries: ReturnType<typeof getHtmlSpecimenCssControlEntries>,
) {
  return controlEntries
    .filter(({ model }) => model.value.trim().length > 0)
    .slice(0, 3)
    .map(({ control, model }) => ({
      property: control.label,
      value: model.value,
    }))
}

function renderHtmlSpecimenTextEditor({
  context,
  onTextChange,
  target,
}: {
  context: CanvasAppInspectorPanelContext
  onTextChange: HtmlSpecimenTextChangeHandler
  target: HtmlSpecimenCssInspectorTarget
}) {
  const editable = isHtmlSpecimenVisualTextEditable({
    node: target.node,
    nodes: target.nodes,
  })
  const text = target.node.text ?? ''

  return (
    <label
      className="html-specimen-content-field"
      data-editable={editable}
    >
      <span className="html-specimen-content-field-label">Text</span>
      <input
        key={`${target.node.id}:text:${text}`}
        defaultValue={text}
        disabled={context.disabled || !editable}
        onBlur={(event) =>
          onTextChange({
            context,
            nextText: event.currentTarget.value,
          })}
        onKeyDown={(event) =>
          handleHtmlSpecimenTextFieldKeyDown(event, text)}
        spellCheck={false}
        type="text"
      />
      <span className="html-specimen-css-source">
        {editable ? 'leaf text' : 'select leaf'}
      </span>
    </label>
  )
}

function renderHtmlSpecimenNodeFacts(
  node: HtmlSpecimenPreviewFocusNode,
) {
  const name = readNodeAttribute(node, 'name')
  const source = node.provenance?.sourceId
  const component = node.provenance?.componentId
  const facts = [
    component ? { label: 'Component', value: component } : null,
    source ? { label: 'Source', value: source } : null,
    name ? { label: 'Name', value: name } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null)

  return facts.length > 0 ? (
    <div className="html-specimen-node-facts">
      {facts.map((fact) => (
        <div className="html-specimen-node-fact" key={fact.label}>
          <span>{fact.label}</span>
          <code>{fact.value}</code>
        </div>
      ))}
    </div>
  ) : (
    <div className="html-specimen-node-meta">html element</div>
  )
}

function exportHtmlSpecimenCss(target: HTMLElement, css: string) {
  target.dispatchEvent(new CustomEvent('html-specimen-css:export', {
    bubbles: true,
    detail: { css },
  }))
}

function exportHtmlSpecimenHtml(target: HTMLElement, html: string) {
  target.dispatchEvent(new CustomEvent('html-specimen-html:export', {
    bubbles: true,
    detail: { html },
  }))
}

async function copyHtmlSpecimenText(text: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return
  }

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Export events remain available when clipboard permission is denied.
  }
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

function handleHtmlSpecimenTextFieldKeyDown(
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
