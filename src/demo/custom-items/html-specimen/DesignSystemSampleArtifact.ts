export type DesignSystemSampleArtifact = {
  schemaVersion: 1
  kind: 'design-system-release-queue'
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
  | DesignSystemSampleFiltersBlock
  | DesignSystemSampleSummaryBlock
  | DesignSystemSampleReleaseTableBlock
  | DesignSystemSampleBatchBarBlock

export type DesignSystemSampleToolbarBlock = {
  kind: 'app-toolbar'
  context: string
  title: string
  actions: DesignSystemSampleButton[]
}

export type DesignSystemSampleButton = {
  component: 'Button'
  label: string
  props: {
    variant: 'primary' | 'secondary'
  }
}

export type DesignSystemSampleFiltersBlock = {
  kind: 'filters'
  component: 'FilterBar'
  search: {
    component: 'SearchField'
    value: string
  }
  tabs: Array<{
    active: boolean
    label: string
  }>
  selects: Array<{
    component: 'SelectField'
    label: string
    value: string
  }>
  toggle: {
    checked: boolean
    component: 'Switch'
    label: string
  }
}

export type DesignSystemSampleSummaryBlock = {
  kind: 'summary-strip'
  component: 'SummaryStrip'
  metrics: Array<{
    component: 'SummaryMetric'
    label: string
    value: string
  }>
}

export type DesignSystemSampleReleaseTableBlock = {
  kind: 'release-table'
  component: 'ReleaseTable'
  columns: string[]
  rows: DesignSystemSampleReleaseRow[]
}

export type DesignSystemSampleReleaseRow = {
  id: string
  checked: boolean
  selected: boolean
  component: string
  source: string
  owner: string
  risk: 'High' | 'Low' | 'Medium'
  checks: string
  status: 'Blocked' | 'Needs review' | 'Ready'
  updated: string
}

export type DesignSystemSampleBatchBarBlock = {
  kind: 'batch-bar'
  component: 'BatchBar'
  selectedCount: number
  actions: DesignSystemSampleButton[]
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
    kind: 'design-system-release-queue',
    viewport: {
      width: 920,
      height: 560,
    },
    catalog: {
      primitives: [
        'text',
        'button',
        'input',
        'select',
        'switch',
        'checkbox',
        'table',
        'badge',
      ],
      components: [
        component('DesignSystemReleaseQueue', 'src/app/design-system/ReleaseQueue.tsx'),
        component('QueueToolbar', 'src/app/design-system/QueueToolbar.tsx'),
        component('Button', 'src/app/design-system/Button.tsx'),
        component('FilterBar', 'src/app/design-system/FilterBar.tsx'),
        component('SearchField', 'src/app/design-system/SearchField.tsx'),
        component('SegmentedControl', 'src/app/design-system/SegmentedControl.tsx'),
        component('SelectField', 'src/app/design-system/SelectField.tsx'),
        component('Switch', 'src/app/design-system/Switch.tsx'),
        component('SummaryStrip', 'src/app/design-system/SummaryStrip.tsx'),
        component('SummaryMetric', 'src/app/design-system/SummaryMetric.tsx'),
        component('ReleaseTable', 'src/app/design-system/ReleaseTable.tsx'),
        component('ReleaseRow', 'src/app/design-system/ReleaseRow.tsx'),
        component('StatusBadge', 'src/app/design-system/StatusBadge.tsx'),
        component('BatchBar', 'src/app/design-system/BatchBar.tsx'),
      ],
    },
    surface: {
      component: 'DesignSystemReleaseQueue',
      source: 'src/app/design-system/ReleaseQueue.tsx',
      blocks: [
        {
          kind: 'app-toolbar',
          context: 'Atlas UI / May train',
          title: 'Release queue',
          actions: [
            {
              component: 'Button',
              label: 'Export CSS',
              props: { variant: 'secondary' },
            },
            {
              component: 'Button',
              label: 'Re-run checks',
              props: { variant: 'secondary' },
            },
            {
              component: 'Button',
              label: 'Approve selected',
              props: { variant: 'primary' },
            },
          ],
        },
        {
          kind: 'filters',
          component: 'FilterBar',
          search: {
            component: 'SearchField',
            value: 'Search components, owners, source',
          },
          tabs: [
            { active: true, label: 'Needs review' },
            { active: false, label: 'Ready' },
            { active: false, label: 'Blocked' },
            { active: false, label: 'All' },
          ],
          selects: [
            {
              component: 'SelectField',
              label: 'Package',
              value: '@atlas/ui',
            },
            {
              component: 'SelectField',
              label: 'Risk',
              value: 'Medium+',
            },
          ],
          toggle: {
            checked: true,
            component: 'Switch',
            label: 'Changed tokens',
          },
        },
        {
          kind: 'summary-strip',
          component: 'SummaryStrip',
          metrics: [
            { component: 'SummaryMetric', label: 'Queued', value: '18' },
            { component: 'SummaryMetric', label: 'Blocked', value: '3' },
            { component: 'SummaryMetric', label: 'Coverage', value: '94%' },
            { component: 'SummaryMetric', label: 'Visual diffs', value: '7' },
          ],
        },
        {
          kind: 'release-table',
          component: 'ReleaseTable',
          columns: [
            '',
            'Component',
            'Source',
            'Owner',
            'Risk',
            'Checks',
            'Status',
            'Updated',
          ],
          rows: [
            {
              id: 'button-primary',
              checked: true,
              selected: true,
              component: 'Button / primary',
              source: 'src/app/design-system/Button.tsx',
              owner: 'Core UI',
              risk: 'Medium',
              checks: 'A11y pass / Visual diff',
              status: 'Needs review',
              updated: '14m ago',
            },
            {
              id: 'combobox-density',
              checked: false,
              selected: false,
              component: 'Combobox / dense',
              source: 'src/app/design-system/Combobox.tsx',
              owner: 'Forms',
              risk: 'High',
              checks: 'Keyboard fail',
              status: 'Blocked',
              updated: '38m ago',
            },
            {
              id: 'toast-success',
              checked: false,
              selected: false,
              component: 'Toast / success',
              source: 'src/app/feedback/Toast.tsx',
              owner: 'Platform',
              risk: 'Low',
              checks: 'Pass',
              status: 'Ready',
              updated: '1h ago',
            },
            {
              id: 'table-row-hover',
              checked: false,
              selected: false,
              component: 'DataTable / row hover',
              source: 'src/app/data-table/DataTable.tsx',
              owner: 'Data Apps',
              risk: 'Medium',
              checks: 'Visual diff',
              status: 'Needs review',
              updated: '2h ago',
            },
            {
              id: 'toast-warning',
              checked: false,
              selected: false,
              component: 'Toast / warning',
              source: 'src/app/feedback/Toast.tsx',
              owner: 'Platform',
              risk: 'Low',
              checks: 'Pass',
              status: 'Ready',
              updated: '3h ago',
            },
          ],
        },
        {
          kind: 'batch-bar',
          component: 'BatchBar',
          selectedCount: 1,
          actions: [
            {
              component: 'Button',
              label: 'Assign',
              props: { variant: 'secondary' },
            },
            {
              component: 'Button',
              label: 'Mark ready',
              props: { variant: 'secondary' },
            },
            {
              component: 'Button',
              label: 'Approve selected',
              props: { variant: 'primary' },
            },
          ],
        },
      ],
    },
  }
}

export { renderDesignSystemSampleArtifact } from './DesignSystemSampleRenderer'

function component(id: string, source: string): DesignSystemSampleComponent {
  return { id, source }
}
