import type { CanvasCustomItem } from '../../../canvas'
import {
  createDesignSystemSampleArtifact,
  renderDesignSystemSampleArtifact,
  type DesignSystemSampleArtifact,
} from './DesignSystemSampleArtifact'

export type HtmlSpecimenData = {
  artifact?: DesignSystemSampleArtifact
  css: string
  html: string
  viewportHeight: number
  viewportWidth: number
}

export function isHtmlSpecimenItem(
  item: unknown,
): item is CanvasCustomItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    item.type === 'custom' &&
    'kind' in item &&
    item.kind === 'html-specimen'
  )
}

export function isHtmlSpecimenData(value: unknown): value is HtmlSpecimenData {
  return (
    isRecord(value) &&
    typeof value.html === 'string' &&
    value.html.trim().length > 0 &&
    typeof value.css === 'string' &&
    isPositiveNumber(value.viewportWidth) &&
    isPositiveNumber(value.viewportHeight)
  )
}

export function getHtmlSpecimenData(item: CanvasCustomItem): HtmlSpecimenData {
  return isHtmlSpecimenData(item.data)
    ? item.data
    : {
        css: '',
        html: '<main></main>',
        viewportHeight: item.h,
        viewportWidth: item.w,
      }
}

export function createButtonSpecimenData(): HtmlSpecimenData {
  return {
    viewportHeight: 188,
    viewportWidth: 360,
    html: `<main
  class="specimen"
  data-surface-kind="react"
  data-surface-component="ButtonSpecimen"
  data-surface-source="src/components/Button.stories.tsx"
>
  <button
    class="button primary"
    data-surface-component="Button"
    data-surface-source="src/components/Button.tsx"
    data-surface-props='{"variant":"primary"}'
  >Create project</button>
  <button
    class="button secondary"
    data-surface-component="Button"
    data-surface-source="src/components/Button.tsx"
    data-surface-props='{"variant":"secondary"}'
  >Invite team</button>
  <button
    class="button danger"
    data-surface-component="Button"
    data-surface-source="src/components/Button.tsx"
    data-surface-props='{"variant":"danger"}'
  >Delete</button>
</main>`,
    css: `.specimen {
  display: grid;
  min-height: 100vh;
  align-content: center;
  gap: 12px;
  padding: 24px;
  background: #f8fafc;
}
.button {
  height: 42px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: 700 14px/1 system-ui;
}
.primary {
  color: #ffffff;
  background: #2563eb;
}
.secondary {
  color: #172033;
  background: #ffffff;
  border-color: #d8dee8;
}
.danger {
  color: #991b1b;
  background: #fee2e2;
  border-color: #fecaca;
}`,
  }
}

export function createInternalAdminAppSpecimenData(): HtmlSpecimenData {
  return {
    viewportHeight: 620,
    viewportWidth: 960,
    html: `<main
  class="admin-app"
  data-surface-kind="react"
  data-surface-component="CustomerOnboardingAdmin"
  data-surface-source="src/features/onboarding/CustomerOnboardingAdmin.tsx"
>
  <header
    class="app-header"
    data-surface-component="AdminHeader"
    data-surface-source="src/features/onboarding/AdminHeader.tsx"
  >
    <div>
      <p class="eyebrow">Internal ops</p>
      <h1>Customer onboarding</h1>
    </div>
    <div class="header-actions">
      <button
        class="button secondary"
        data-surface-component="Button"
        data-surface-source="src/design-system/Button.tsx"
        data-surface-props='{"variant":"secondary"}'
      >Sync CRM</button>
      <button
        class="button primary"
        data-surface-component="Button"
        data-surface-source="src/design-system/Button.tsx"
        data-surface-props='{"variant":"primary"}'
      >Ship update</button>
    </div>
  </header>

  <section class="workspace">
    <section
      class="queue-panel"
      data-preview-default-target="true"
      data-surface-component="OnboardingQueue"
      data-surface-source="src/features/onboarding/OnboardingQueue.tsx"
    >
      <div class="panel-title">
        <div>
          <p class="eyebrow">Review queue</p>
          <h2>Accounts needing changes</h2>
        </div>
        <span class="status-pill warning">4 waiting</span>
      </div>

      <div class="queue-table" role="table">
        <div class="queue-row queue-head" role="row">
          <span>Account</span>
          <span>Owner</span>
          <span>Risk</span>
          <span>State</span>
        </div>
        <div
          class="queue-row blocked"
          data-row="acme"
          role="row"
        >
          <strong>Acme Finance</strong>
          <span>Mina</span>
          <span>Security blocker</span>
          <span class="status-pill danger">Blocked</span>
        </div>
        <div class="queue-row" data-row="northstar" role="row">
          <strong>Northstar Bank</strong>
          <span>Jules</span>
          <span>Data mapping</span>
          <span class="status-pill review">Review</span>
        </div>
        <div class="queue-row" data-row="cargo" role="row">
          <strong>CargoCloud</strong>
          <span>Ari</span>
          <span>Owner missing</span>
          <span class="status-pill ready">Ready</span>
        </div>
      </div>
    </section>

    <aside
      class="account-panel"
      data-surface-component="AccountSummary"
      data-surface-source="src/features/onboarding/AccountSummary.tsx"
    >
      <p class="eyebrow">Selected account</p>
      <h2>Acme Finance</h2>
      <dl class="summary-list">
        <div><dt>Plan</dt><dd>Enterprise</dd></div>
        <div><dt>Region</dt><dd>EMEA</dd></div>
        <div><dt>Users</dt><dd>1,280</dd></div>
      </dl>
      <label
        class="field"
        data-surface-component="OwnerField"
        data-surface-source="src/features/onboarding/OwnerField.tsx"
      >
        <span>Owner</span>
        <input name="owner" value="Mina" readonly />
      </label>
      <label
        class="field"
        data-surface-component="StageField"
        data-surface-source="src/features/onboarding/StageField.tsx"
      >
        <span>Stage</span>
        <select name="stage" disabled>
          <option>Security review</option>
        </select>
      </label>
    </aside>

    <section
      class="activity-panel"
      data-surface-component="ActivityFeed"
      data-surface-source="src/features/onboarding/ActivityFeed.tsx"
    >
      <div class="panel-title">
        <div>
          <p class="eyebrow">Activity</p>
          <h2>Recent changes</h2>
        </div>
        <button
          class="button ghost"
          data-surface-component="Button"
          data-surface-source="src/design-system/Button.tsx"
          data-surface-props='{"variant":"ghost"}'
        >View all</button>
      </div>
      <ol class="activity-list">
        <li><strong>Marcus</strong><span>added security evidence</span></li>
        <li><strong>Priya</strong><span>changed owner to Mina</span></li>
        <li><strong>System</strong><span>flagged duplicate company ID</span></li>
      </ol>
    </section>

    <section
      class="release-panel"
      data-surface-component="ReleaseChecklist"
      data-surface-source="src/features/onboarding/ReleaseChecklist.tsx"
    >
      <p class="eyebrow">Release checklist</p>
      <label><input type="checkbox" checked readonly /> CRM sync verified</label>
      <label><input type="checkbox" checked readonly /> Owner assigned</label>
      <label><input type="checkbox" readonly /> Security exception resolved</label>
    </section>
  </section>
</main>`,
    css: `.admin-app {
  --app-bg: #f3f7f5;
  --panel: #ffffff;
  --line: #d8e3dc;
  --ink: #172033;
  --muted: #68758a;
  --primary: #2563eb;
  --success: #0f8f63;
  --warning: #a15c00;
  --danger: #b42318;
  display: grid;
  grid-template-rows: 68px minmax(0, 1fr);
  min-height: 100%;
  color: var(--ink);
  background: var(--app-bg);
  font: 600 14px/1.35 system-ui;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 14px 22px;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.78);
}
.eyebrow {
  margin: 0 0 4px;
  color: var(--muted);
  font: 760 11px/1 system-ui;
  letter-spacing: 0;
  text-transform: uppercase;
}
h1,
h2 {
  margin: 0;
  letter-spacing: 0;
}
h1 {
  font: 760 22px/1.1 system-ui;
}
h2 {
  font: 740 16px/1.15 system-ui;
}
.header-actions,
.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.button {
  height: 34px;
  padding: 0 13px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: 720 13px/1 system-ui;
}
.button.primary {
  color: #ffffff;
  background: var(--primary);
}
.button.secondary,
.button.ghost {
  color: var(--ink);
  border-color: #cfd9d4;
  background: #ffffff;
}
.button.ghost {
  height: 30px;
  color: var(--success);
}
.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(260px, 0.8fr);
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 14px;
  min-height: 0;
  padding: 16px;
}
.queue-panel,
.account-panel,
.activity-panel,
.release-panel {
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  box-shadow: 0 14px 28px rgba(23, 32, 51, 0.08);
}
.queue-panel {
  display: grid;
  gap: 14px;
  min-height: 0;
  padding: 16px;
}
.queue-table {
  display: grid;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e3ebe7;
  border-radius: 7px;
}
.queue-row {
  display: grid;
  grid-template-columns: 1.1fr 0.7fr 1fr 86px;
  align-items: center;
  gap: 12px;
  min-height: 54px;
  padding: 0 13px;
  border-top: 1px solid #e8efeb;
  color: #344154;
}
.queue-row:first-child {
  border-top: 0;
}
.queue-head {
  min-height: 38px;
  color: var(--muted);
  background: #f8faf9;
  font: 760 11px/1 system-ui;
  text-transform: uppercase;
}
.queue-row.blocked {
  background: #fff7f6;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font: 760 11px/1 system-ui;
}
.status-pill.ready {
  color: #07553d;
  background: #dff7eb;
}
.status-pill.review,
.status-pill.warning {
  color: var(--warning);
  background: #fff1d6;
}
.status-pill.danger {
  color: var(--danger);
  background: #fee4e2;
}
.account-panel,
.activity-panel,
.release-panel {
  display: grid;
  align-content: start;
  gap: 13px;
  padding: 16px;
}
.summary-list {
  display: grid;
  gap: 8px;
  margin: 0;
}
.summary-list div,
.field {
  display: grid;
  gap: 5px;
}
.summary-list dt,
.field span {
  color: var(--muted);
  font: 720 11px/1 system-ui;
}
.summary-list dd {
  margin: 0;
  color: var(--ink);
  font: 740 14px/1.2 system-ui;
}
input,
select {
  width: 100%;
  height: 34px;
  border: 1px solid #cfd9d4;
  border-radius: 6px;
  padding: 0 10px;
  color: var(--ink);
  background: #ffffff;
  font: 650 13px/1 system-ui;
}
.activity-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.activity-list li {
  display: grid;
  gap: 3px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8efeb;
}
.activity-list li:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}
.activity-list span,
.release-panel label {
  color: #526075;
}
.release-panel {
  grid-column: 1 / -1;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
}
.release-panel .eyebrow {
  grid-column: 1 / -1;
}
.release-panel label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.release-panel input {
  width: 14px;
  height: 14px;
  accent-color: var(--success);
}`,
  }
}

export function createDesignSystemSpecimenData(): HtmlSpecimenData {
  const artifact = createDesignSystemSampleArtifact()

  return {
    ...renderDesignSystemSampleArtifact(artifact),
    artifact,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}
