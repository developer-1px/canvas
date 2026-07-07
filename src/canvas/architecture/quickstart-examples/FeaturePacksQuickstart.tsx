import '@interactive-os/canvas/style.css'
import {
  CanvasApp,
  type CanvasAppProps,
  type CanvasCustomItem,
} from '@interactive-os/canvas'
import {
  defineCanvasAppCustomItemModule,
  resolveCanvasAppFeaturePacks,
} from '@interactive-os/canvas/app/authoring'

const kpiCardModule = defineCanvasAppCustomItemModule({
  customCreationTools: [{
    createItem: ({ currentWorld }) => ({
      data: { value: '0%' },
      h: 96,
      title: 'KPI',
      w: 180,
      x: currentWorld.x,
      y: currentWorld.y,
    }),
    enterTextEdit: true,
    id: 'kpi-card-tool',
    label: 'K',
    shortcut: { key: 'k' },
    title: 'KPI card',
  }],
  id: 'kpi-card',
  presentation: 'kpi-card',
  renderItem: ({ item }) => (
    <div>
      <strong>{item.title}</strong>
      <span>{String(item.data.value)}</span>
    </div>
  ),
  textTarget: {
    canEdit: () => true,
    commitsOnEnter: () => true,
    getCommittedValue: ({ value }) => value,
    getEditorBounds: (item) => ({ h: item.h, w: item.w, x: item.x, y: item.y }),
    getValue: (item) => String(item.data.value ?? ''),
    planCommitUpdates: (_item, text) => [
      { field: 'data/value', operation: 'replace', value: text },
    ],
  },
  validateItem: (item): item is CanvasCustomItem =>
    item.type === 'custom' && item.kind === 'kpi-card',
})

const kpiCardItem: CanvasCustomItem = {
  data: { value: '42%' },
  h: 96,
  id: 'kpi-1',
  kind: 'kpi-card',
  presentation: 'kpi-card',
  title: 'Revenue',
  type: 'custom',
  w: 180,
  x: 80,
  y: 80,
}

const canvasWithFeaturePacksProps = {
  assemblyInput: {
    customItemModules: [kpiCardModule],
    featurePackManifests: resolveCanvasAppFeaturePacks([
      'minimap',
      'find-replace',
    ]),
    initialItems: [kpiCardItem],
    initialSelection: [kpiCardItem.id],
  },
} satisfies CanvasAppProps

export function CanvasWithFeaturePacks() {
  return <CanvasApp {...canvasWithFeaturePacksProps} />
}
