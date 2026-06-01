import { DESIGN_SYSTEM_SAMPLE_CSS } from './DesignSystemSampleCss'
import type {
  DesignSystemSampleArtifact,
  DesignSystemSampleBatchBarBlock,
  DesignSystemSampleBlock,
  DesignSystemSampleFiltersBlock,
  DesignSystemSampleReleaseRow,
  DesignSystemSampleReleaseTableBlock,
  DesignSystemSampleSummaryBlock,
  DesignSystemSampleToolbarBlock,
  RenderedDesignSystemSampleArtifact,
} from './DesignSystemSampleArtifact'

export function renderDesignSystemSampleArtifact(
  artifact: DesignSystemSampleArtifact,
): RenderedDesignSystemSampleArtifact {
  const catalog = new Map(
    artifact.catalog.components.map((entry) => [entry.id, entry.source]),
  )
  const html = renderSurface({ artifact, catalog })

  return {
    css: DESIGN_SYSTEM_SAMPLE_CSS,
    html,
    viewportHeight: artifact.viewport.height,
    viewportWidth: artifact.viewport.width,
  }
}

function renderSurface({
  artifact,
  catalog,
}: {
  artifact: DesignSystemSampleArtifact
  catalog: Map<string, string>
}) {
  const blocks = artifact.surface.blocks
    .map((block) => renderBlock({ block, catalog }))
    .join('\n\n')

  return `<main
  class="release-queue"
  ${surfaceAttrs({
    catalog,
    component: artifact.surface.component,
    source: artifact.surface.source,
  })}
>
${indent(blocks, 2)}
</main>`
}

function renderBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleBlock
  catalog: Map<string, string>
}) {
  if (block.kind === 'app-toolbar') {
    return renderToolbarBlock({ block, catalog })
  }

  if (block.kind === 'filters') {
    return renderFiltersBlock({ block, catalog })
  }

  if (block.kind === 'summary-strip') {
    return renderSummaryBlock({ block, catalog })
  }

  if (block.kind === 'release-table') {
    return renderReleaseTableBlock({ block, catalog })
  }

  return renderBatchBarBlock({ block, catalog })
}

function renderToolbarBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleToolbarBlock
  catalog: Map<string, string>
}) {
  const actions = block.actions.map((action) =>
    `<button
  class="button ${escapeHtml(action.props.variant)}"
  ${surfaceAttrs({
    catalog,
    component: action.component,
    props: action.props,
  })}
>${escapeHtml(action.label)}</button>`,
  ).join('\n')

  return `<section
  class="queue-toolbar"
  ${surfaceAttrs({ catalog, component: 'QueueToolbar' })}
>
  <div>
    <p class="context">${escapeHtml(block.context)}</p>
    <h1>${escapeHtml(block.title)}</h1>
  </div>
  <div class="toolbar-actions">
${indent(actions, 4)}
  </div>
</section>`
}

function renderFiltersBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleFiltersBlock
  catalog: Map<string, string>
}) {
  const tabs = block.tabs.map((tab) =>
    `<button class="tab${tab.active ? ' active' : ''}" type="button">${escapeHtml(tab.label)}</button>`,
  ).join('\n')
  const selects = block.selects.map((select) =>
    `<label
  class="select-filter"
  ${surfaceAttrs({
    catalog,
    component: select.component,
    props: { label: select.label },
  })}
>
  <span>${escapeHtml(select.label)}</span>
  <select disabled>
    <option>${escapeHtml(select.value)}</option>
  </select>
</label>`,
  ).join('\n')

  return `<section
  class="filter-bar"
  ${surfaceAttrs({ catalog, component: block.component })}
>
  <label
    class="search-field"
    ${surfaceAttrs({ catalog, component: block.search.component })}
  >
    <span>Search</span>
    <input value="${escapeAttribute(block.search.value)}" readonly />
  </label>
  <div
    class="tabs"
    ${surfaceAttrs({ catalog, component: 'SegmentedControl' })}
  >
${indent(tabs, 4)}
  </div>
${indent(selects, 2)}
  <div
    class="switch-filter"
    ${surfaceAttrs({
      catalog,
      component: block.toggle.component,
      props: { checked: block.toggle.checked },
    })}
  >
    <span>${escapeHtml(block.toggle.label)}</span>
    <span class="switch" aria-hidden="true"><span></span></span>
  </div>
</section>`
}

function renderSummaryBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleSummaryBlock
  catalog: Map<string, string>
}) {
  const metrics = block.metrics.map((metric) =>
    `<div
  class="metric"
  ${surfaceAttrs({ catalog, component: metric.component })}
>
  <strong>${escapeHtml(metric.value)}</strong>
  <span>${escapeHtml(metric.label)}</span>
</div>`,
  ).join('\n')

  return `<section
  class="summary-strip"
  ${surfaceAttrs({ catalog, component: block.component })}
>
${indent(metrics, 2)}
</section>`
}

function renderReleaseTableBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleReleaseTableBlock
  catalog: Map<string, string>
}) {
  const head = renderTableHead(block.columns)
  const rows = block.rows
    .map((row) => renderReleaseRow({ catalog, row }))
    .join('\n')

  return `<section
  class="release-table"
  ${surfaceAttrs({ catalog, component: block.component })}
>
${indent(head, 2)}
${indent(rows, 2)}
</section>`
}

function renderBatchBarBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleBatchBarBlock
  catalog: Map<string, string>
}) {
  const actions = block.actions.map((action) =>
    `<button
  class="button ${escapeHtml(action.props.variant)}"
  ${surfaceAttrs({
    catalog,
    component: action.component,
    props: action.props,
  })}
>${escapeHtml(action.label)}</button>`,
  ).join('\n')

  return `<section
  class="batch-bar"
  ${surfaceAttrs({ catalog, component: block.component })}
>
  <strong>${block.selectedCount} selected</strong>
  <div class="batch-actions">
${indent(actions, 4)}
  </div>
</section>`
}

function renderTableHead(columns: string[]) {
  return `<div class="table-row table-head" role="row">
${indent(columns.map((column) => `<span>${escapeHtml(column)}</span>`).join('\n'), 2)}
</div>`
}

function renderReleaseRow({
  catalog,
  row,
}: {
  catalog: Map<string, string>
  row: DesignSystemSampleReleaseRow
}) {
  return `<div
  class="table-row release-row"
  data-state="${escapeAttribute(row.status.toLowerCase().replace(/\s+/g, '-'))}"
  data-selected="${row.selected ? 'true' : 'false'}"
  ${row.selected ? 'data-preview-default-target="true"\n  ' : ''}${surfaceAttrs({
    catalog,
    component: 'ReleaseRow',
    source: row.source,
    props: {
      risk: row.risk,
      status: row.status,
    },
  })}
>
  <span><input ${row.checked ? 'checked ' : ''}disabled type="checkbox" /></span>
  <span class="component-name">${escapeHtml(row.component)}</span>
  <span class="source-path">${escapeHtml(row.source)}</span>
  <span>${escapeHtml(row.owner)}</span>
  <span class="risk ${escapeHtml(row.risk.toLowerCase())}">${escapeHtml(row.risk)}</span>
  <span>${escapeHtml(row.checks)}</span>
  <span
    class="status ${escapeHtml(row.status.toLowerCase().replace(/\s+/g, '-'))}"
    ${surfaceAttrs({
      catalog,
      component: 'StatusBadge',
      props: { status: row.status },
    })}
  >${escapeHtml(row.status)}</span>
  <span>${escapeHtml(row.updated)}</span>
</div>`
}

function surfaceAttrs({
  catalog,
  component,
  source,
}: {
  catalog: Map<string, string>
  component: string
  props?: Record<string, boolean | number | string>
  source?: string
}) {
  const attrs = [
    'data-surface-kind="html"',
    `data-surface-component="${escapeAttribute(component)}"`,
    `data-surface-source="${escapeAttribute(source ?? catalog.get(component) ?? '')}"`,
  ]

  return attrs.join('\n  ')
}

function indent(value: string, spaces: number) {
  const prefix = ' '.repeat(spaces)

  return value
    .split('\n')
    .map((line) => line.length > 0 ? `${prefix}${line}` : line)
    .join('\n')
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttribute(value: boolean | number | string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}
