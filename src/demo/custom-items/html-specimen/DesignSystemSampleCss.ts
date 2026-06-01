export const DESIGN_SYSTEM_SAMPLE_CSS = `.release-queue {
  --ds-bg: #ffffff;
  --ds-plane: #f2f2f0;
  --ds-plane-soft: #f8f8f6;
  --ds-active: #eef3ff;
  --ds-text: #1d2028;
  --ds-secondary: #3d4450;
  --ds-muted: #737986;
  --ds-line: #e2e3df;
  --ds-primary: #2457c5;
  --ds-success: #0f8f63;
  --ds-warning: #b45309;
  --ds-danger: #d94b45;
  display: grid;
  grid-template-rows: auto auto auto minmax(0, 1fr) auto;
  min-height: 100%;
  gap: 10px;
  padding: 18px;
  color: var(--ds-text);
  background: var(--ds-bg);
  font: 500 12px/1.3 Inter, ui-sans-serif, system-ui, sans-serif;
}
.queue-toolbar,
.filter-bar,
.summary-strip,
.batch-bar {
  min-width: 0;
}
.queue-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.context {
  margin: 0 0 2px;
  color: var(--ds-muted);
  font: 520 11px/1.2 Inter, ui-sans-serif, system-ui, sans-serif;
}
h1 {
  margin: 0;
  font: 650 21px/1.1 Inter, ui-sans-serif, system-ui, sans-serif;
  letter-spacing: 0;
}
.toolbar-actions,
.batch-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.button {
  height: 30px;
  padding: 0 11px;
  border: 0;
  border-radius: 5px;
  font: 600 12px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.button.primary {
  color: #ffffff;
  background: var(--ds-primary);
}
.button.secondary {
  color: var(--ds-secondary);
  background: var(--ds-plane);
}
.filter-bar {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) auto auto auto auto;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: var(--ds-plane-soft);
}
.search-field,
.select-filter {
  display: grid;
  min-width: 0;
  gap: 3px;
}
.search-field span,
.select-filter span {
  color: var(--ds-muted);
  font: 520 10px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
input,
select {
  width: 100%;
  height: 28px;
  min-width: 0;
  border: 0;
  border-radius: 4px;
  padding: 0 9px;
  color: var(--ds-secondary);
  background: var(--ds-bg);
  font: 500 12px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.tabs {
  display: flex;
  gap: 2px;
  padding: 2px;
  border-radius: 5px;
  background: var(--ds-bg);
}
.tab {
  height: 26px;
  border: 0;
  border-radius: 4px;
  padding: 0 9px;
  color: var(--ds-muted);
  background: transparent;
  font: 540 11px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.tab.active {
  color: var(--ds-text);
  background: var(--ds-active);
}
.switch-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ds-secondary);
  font: 540 11px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.switch {
  position: relative;
  width: 34px;
  height: 20px;
  border-radius: 999px;
  background: var(--ds-success);
}
.switch span {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: #ffffff;
}
.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}
.metric {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: baseline;
  gap: 7px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 5px;
  background: var(--ds-plane);
}
.metric strong {
  font: 620 16px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.metric span {
  overflow: hidden;
  color: var(--ds-muted);
  font: 500 11px/1.1 Inter, ui-sans-serif, system-ui, sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.release-table {
  display: grid;
  align-content: start;
  min-height: 0;
  overflow: hidden;
  border-radius: 6px;
  background: var(--ds-plane-soft);
}
.table-row {
  display: grid;
  grid-template-columns: 28px 1.2fr 1.55fr .72fr .58fr 1.1fr .82fr .58fr;
  align-items: center;
  min-width: 0;
  min-height: 42px;
  padding: 0 10px;
  color: var(--ds-secondary);
  font: 500 12px/1.2 Inter, ui-sans-serif, system-ui, sans-serif;
}
.table-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.table-head {
  min-height: 32px;
  color: var(--ds-muted);
  background: var(--ds-plane);
  font: 540 10px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.release-row {
  margin: 2px 6px 0;
  border-radius: 5px;
  background: var(--ds-bg);
}
.release-row[data-selected="true"] {
  color: var(--ds-text);
  background: var(--ds-active);
}
.component-name {
  font-weight: 620;
}
.source-path {
  color: var(--ds-muted);
}
input[type="checkbox"] {
  width: 15px;
  height: 15px;
  padding: 0;
  accent-color: var(--ds-primary);
}
.risk,
.status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  justify-self: start;
  height: 20px;
  border-radius: 4px;
  padding: 0 4px;
  color: var(--ds-secondary);
  background: transparent;
  font: 560 10px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
.risk::before,
.status::before {
  width: 5px;
  height: 5px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--ds-muted);
  content: "";
}
.risk.medium,
.status.needs-review {
  color: color-mix(in srgb, var(--ds-warning) 84%, var(--ds-text));
}
.risk.medium::before,
.status.needs-review::before {
  background: var(--ds-warning);
}
.risk.high,
.status.blocked {
  color: color-mix(in srgb, var(--ds-danger) 84%, var(--ds-text));
}
.risk.high::before,
.status.blocked::before {
  background: var(--ds-danger);
}
.risk.low,
.status.ready {
  color: color-mix(in srgb, var(--ds-success) 82%, var(--ds-text));
}
.risk.low::before,
.status.ready::before {
  background: var(--ds-success);
}
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 42px;
  padding: 6px 8px 6px 12px;
  border-radius: 6px;
  background: var(--ds-plane);
}
.batch-bar strong {
  font: 600 12px/1 Inter, ui-sans-serif, system-ui, sans-serif;
}
@media (max-width: 760px) {
  .release-queue {
    padding: 12px;
  }
  .queue-toolbar,
  .filter-bar,
  .batch-bar {
    align-items: stretch;
  }
  .queue-toolbar,
  .batch-bar {
    flex-direction: column;
  }
  .filter-bar,
  .summary-strip {
    grid-template-columns: minmax(0, 1fr);
  }
  .table-row {
    grid-template-columns: 24px 1.3fr 1fr .8fr;
  }
  .table-row span:nth-child(3),
  .table-row span:nth-child(6),
  .table-row span:nth-child(8) {
    display: none;
  }
}`
