export type DesignSystemSampleArtifact = {
  schemaVersion: 1
  kind: 'design-system-sample'
  viewport: {
    width: number
    height: number
  }
  catalog: {
    primitives: string[]
    components: DesignSystemSampleComponent[]
  }
  surface: {
    component: string
    source: string
    blocks: DesignSystemSampleBlock[]
  }
}

export type DesignSystemSampleComponent = {
  id: string
  source: string
}

export type DesignSystemSampleBlock =
  | DesignSystemSampleToolbarBlock
  | DesignSystemSampleFormPanelBlock
  | DesignSystemSampleStatusPanelBlock
  | DesignSystemSampleTableBlock

export type DesignSystemSampleToolbarBlock = {
  kind: 'toolbar'
  eyebrow: string
  title: string
  actions: DesignSystemSampleButton[]
}

export type DesignSystemSampleButton = {
  component: 'Button'
  label: string
  props: {
    variant: 'primary' | 'secondary' | 'danger'
    size: 'sm' | 'md'
  }
}

export type DesignSystemSampleFormPanelBlock = {
  kind: 'form-panel'
  component: 'ControlPanel'
  fields: Array<{
    component: 'TextField' | 'SelectField'
    label: string
    value: string
  }>
  switch: {
    component: 'Switch'
    label: string
    checked: boolean
  }
}

export type DesignSystemSampleStatusPanelBlock = {
  kind: 'status-panel'
  component: 'StatusPanel'
  badges: Array<{
    component: 'Badge'
    label: string
    tone: 'success' | 'warning'
  }>
  alert: {
    component: 'InlineAlert'
    title: string
    body: string
    tone: 'info'
  }
  stats: Array<{
    label: string
    value: string
  }>
}

export type DesignSystemSampleTableBlock = {
  kind: 'data-table'
  component: 'DataTable'
  columns: string[]
  rows: string[][]
}

export type RenderedDesignSystemSampleArtifact = {
  css: string
  html: string
  viewportHeight: number
  viewportWidth: number
}

export function createDesignSystemSampleArtifact(): DesignSystemSampleArtifact {
  return {
    schemaVersion: 1,
    kind: 'design-system-sample',
    viewport: {
      width: 760,
      height: 486,
    },
    catalog: {
      primitives: [
        'box',
        'text',
        'button',
        'input',
        'select',
        'switch',
        'badge',
        'table',
      ],
      components: [
        component(
          'DesignSystemSpecimen',
          'src/design-system/DesignSystem.stories.tsx',
        ),
        component('Toolbar', 'src/design-system/Toolbar.tsx'),
        component('Button', 'src/design-system/Button.tsx'),
        component('ControlPanel', 'src/features/settings/ControlPanel.tsx'),
        component('TextField', 'src/design-system/TextField.tsx'),
        component('SelectField', 'src/design-system/SelectField.tsx'),
        component('Switch', 'src/design-system/Switch.tsx'),
        component('StatusPanel', 'src/features/release/StatusPanel.tsx'),
        component('Badge', 'src/design-system/Badge.tsx'),
        component('InlineAlert', 'src/design-system/InlineAlert.tsx'),
        component('DataTable', 'src/design-system/DataTable.tsx'),
      ],
    },
    surface: {
      component: 'DesignSystemSpecimen',
      source: 'src/design-system/DesignSystem.stories.tsx',
      blocks: [
        {
          kind: 'toolbar',
          eyebrow: 'Design system',
          title: 'Workspace controls',
          actions: [
            {
              component: 'Button',
              label: 'Export',
              props: { size: 'md', variant: 'secondary' },
            },
            {
              component: 'Button',
              label: 'Publish',
              props: { size: 'md', variant: 'primary' },
            },
          ],
        },
        {
          kind: 'form-panel',
          component: 'ControlPanel',
          fields: [
            {
              component: 'TextField',
              label: 'Project name',
              value: 'Enterprise onboarding',
            },
            {
              component: 'SelectField',
              label: 'Environment',
              value: 'Production',
            },
          ],
          switch: {
            checked: true,
            component: 'Switch',
            label: 'Review gate',
          },
        },
        {
          kind: 'status-panel',
          component: 'StatusPanel',
          badges: [
            {
              component: 'Badge',
              label: 'Ready',
              tone: 'success',
            },
            {
              component: 'Badge',
              label: 'Review',
              tone: 'warning',
            },
          ],
          alert: {
            component: 'InlineAlert',
            title: 'Release checks',
            body: 'Schema, tokens, and states are mapped.',
            tone: 'info',
          },
          stats: [
            { label: 'Tokens', value: '42' },
            { label: 'Nodes', value: '11' },
          ],
        },
        {
          kind: 'data-table',
          component: 'DataTable',
          columns: ['Component', 'State', 'Owner'],
          rows: [
            ['Button', 'Stable', 'Core'],
            ['TextField', 'Review', 'Forms'],
            ['Badge', 'Stable', 'Core'],
          ],
        },
      ],
    },
  }
}

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

function component(id: string, source: string): DesignSystemSampleComponent {
  return { id, source }
}

function renderSurface({
  artifact,
  catalog,
}: {
  artifact: DesignSystemSampleArtifact
  catalog: Map<string, string>
}) {
  const toolbarBlocks = artifact.surface.blocks
    .filter((block) => block.kind === 'toolbar')
    .map((block) => renderBlock({ block, catalog }))
    .join('\n\n')
  const gridBlocks = artifact.surface.blocks
    .filter((block) => block.kind !== 'toolbar')
    .map((block) => renderBlock({ block, catalog }))
    .join('\n\n')

  return `<main
  class="specimen"
  data-surface-kind="react"
  ${surfaceAttrs({
    catalog,
    component: artifact.surface.component,
    source: artifact.surface.source,
  })}
>
${indent(toolbarBlocks, 2)}

  <section class="grid">
${indent(gridBlocks, 4)}
  </section>
</main>`
}

function renderBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleBlock
  catalog: Map<string, string>
}) {
  if (block.kind === 'toolbar') {
    return renderToolbarBlock({ block, catalog })
  }

  if (block.kind === 'form-panel') {
    return renderFormPanelBlock({ block, catalog })
  }

  if (block.kind === 'status-panel') {
    return renderStatusPanelBlock({ block, catalog })
  }

  return renderTableBlock({ block, catalog })
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
  class="toolbar"
  ${surfaceAttrs({ catalog, component: 'Toolbar' })}
>
  <div>
    <p class="eyebrow">${escapeHtml(block.eyebrow)}</p>
    <h1>${escapeHtml(block.title)}</h1>
  </div>
  <div class="toolbar-actions">
${indent(actions, 4)}
  </div>
</section>`
}

function renderFormPanelBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleFormPanelBlock
  catalog: Map<string, string>
}) {
  const fields = block.fields.map((field) => {
    const control = field.component === 'SelectField'
      ? `<select disabled>
  <option>${escapeHtml(field.value)}</option>
</select>`
      : `<input value="${escapeAttribute(field.value)}" readonly />`

    return `<label
  class="field"
  ${surfaceAttrs({
    catalog,
    component: field.component,
    props: { label: field.label },
  })}
>
  <span>${escapeHtml(field.label)}</span>
${indent(control, 2)}
</label>`
  }).join('\n')

  return `<article
  class="panel controls"
  ${surfaceAttrs({ catalog, component: block.component })}
>
${indent(fields, 2)}
  <div
    class="switch-row"
    ${surfaceAttrs({
      catalog,
      component: block.switch.component,
      props: { checked: block.switch.checked },
    })}
  >
    <span>${escapeHtml(block.switch.label)}</span>
    <span class="switch" aria-hidden="true"><span></span></span>
  </div>
</article>`
}

function renderStatusPanelBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleStatusPanelBlock
  catalog: Map<string, string>
}) {
  const badges = block.badges.map((badge) =>
    `<span
  class="badge ${escapeHtml(badge.tone)}"
  ${surfaceAttrs({
    catalog,
    component: badge.component,
    props: { tone: badge.tone },
  })}
>${escapeHtml(badge.label)}</span>`,
  ).join('\n')
  const stats = block.stats.map((stat) =>
    `<div><strong>${escapeHtml(stat.value)}</strong><span>${escapeHtml(stat.label)}</span></div>`,
  ).join('\n')

  return `<article
  class="panel status"
  ${surfaceAttrs({ catalog, component: block.component })}
>
  <div class="status-head">
${indent(badges, 4)}
  </div>
  <div
    class="alert"
    ${surfaceAttrs({
      catalog,
      component: block.alert.component,
      props: { tone: block.alert.tone },
    })}
  >
    <strong>${escapeHtml(block.alert.title)}</strong>
    <span>${escapeHtml(block.alert.body)}</span>
  </div>
  <div class="stats">
${indent(stats, 4)}
  </div>
</article>`
}

function renderTableBlock({
  block,
  catalog,
}: {
  block: DesignSystemSampleTableBlock
  catalog: Map<string, string>
}) {
  const head = renderTableRow(block.columns, 'table-row table-head')
  const rows = block.rows
    .map((row) => renderTableRow(row, 'table-row'))
    .join('\n')

  return `<article
  class="panel table"
  ${surfaceAttrs({ catalog, component: block.component })}
>
${indent(head, 2)}
${indent(rows, 2)}
</article>`
}

function renderTableRow(cells: string[], className: string) {
  return `<div class="${className}">
${indent(cells.map((cell) => `<span>${escapeHtml(cell)}</span>`).join('\n'), 2)}
</div>`
}

function surfaceAttrs({
  catalog,
  component,
  props,
  source,
}: {
  catalog: Map<string, string>
  component: string
  props?: Record<string, boolean | number | string>
  source?: string
}) {
  const attrs = [
    `data-surface-component="${escapeAttribute(component)}"`,
    `data-surface-source="${escapeAttribute(source ?? catalog.get(component) ?? '')}"`,
  ]

  if (props) {
    attrs.push(`data-surface-props="${escapeAttribute(JSON.stringify(props))}"`)
  }

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
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function escapeAttribute(value: string) {
  return escapeHtml(value)
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const DESIGN_SYSTEM_SAMPLE_CSS = `.specimen {
  --ds-bg: #f4f6f8;
  --ds-surface: #ffffff;
  --ds-border: #dbe1ea;
  --ds-text: #172033;
  --ds-muted: #64748b;
  --ds-primary: #2563eb;
  --ds-success: #0f8f63;
  display: grid;
  min-height: 100%;
  gap: 14px;
  padding: 18px;
  color: var(--ds-text);
  background: var(--ds-bg);
}
.toolbar,
.panel {
  border: 1px solid var(--ds-border);
  border-radius: 8px;
  background: var(--ds-surface);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 16px 18px;
}
.eyebrow {
  margin: 0 0 6px;
  color: var(--ds-muted);
  font: 700 11px/1.1 system-ui;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  font: 760 22px/1.15 system-ui;
  letter-spacing: 0;
}
.toolbar-actions,
.status-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.button {
  height: 36px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: 720 13px/1 system-ui;
}
.primary {
  color: #ffffff;
  background: var(--ds-primary);
}
.secondary {
  color: var(--ds-text);
  background: #ffffff;
  border-color: #cfd8e3;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.panel {
  min-width: 0;
  padding: 16px;
}
.controls {
  display: grid;
  gap: 12px;
}
.field {
  display: grid;
  gap: 6px;
}
.field span,
.switch-row {
  color: #334155;
  font: 700 12px/1.2 system-ui;
}
input,
select {
  width: 100%;
  height: 36px;
  border: 1px solid #cfd8e3;
  border-radius: 6px;
  padding: 0 10px;
  color: var(--ds-text);
  background: #ffffff;
  font: 650 13px/1 system-ui;
}
.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
}
.switch {
  position: relative;
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: var(--ds-success);
}
.switch span {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ffffff;
}
.status {
  display: grid;
  gap: 14px;
}
.badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  font: 760 11px/1 system-ui;
}
.success {
  color: #07553d;
  background: #dff7eb;
}
.warning {
  color: #7a3a00;
  background: #ffe8c7;
}
.alert {
  display: grid;
  gap: 4px;
  border: 1px solid #b9d8ff;
  border-radius: 7px;
  padding: 12px;
  color: #12325f;
  background: #eef6ff;
}
.alert strong {
  font: 760 13px/1.2 system-ui;
}
.alert span,
.stats span {
  color: var(--ds-muted);
  font: 600 12px/1.3 system-ui;
}
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.stats div {
  display: grid;
  gap: 3px;
  border: 1px solid #edf1f5;
  border-radius: 7px;
  padding: 10px;
  background: #fbfcfd;
}
.stats strong {
  font: 780 20px/1 system-ui;
}
.table {
  grid-column: 1 / -1;
  padding: 0;
  overflow: hidden;
}
.table-row {
  display: grid;
  grid-template-columns: 1.2fr .8fr .8fr;
  min-height: 38px;
  align-items: center;
  border-top: 1px solid #edf1f5;
  padding: 0 14px;
  color: #334155;
  font: 650 13px/1.2 system-ui;
}
.table-row:first-child {
  border-top: 0;
}
.table-head {
  color: var(--ds-muted);
  background: #f8fafc;
  font-size: 12px;
  text-transform: uppercase;
}`
