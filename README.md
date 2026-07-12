# Canvas

Reusable canvas package with a minimal affordance engine demo.

## Run

```sh
pnpm install
pnpm dev
```

Default route `/` opens the minimal engine verification demo for pan/zoom,
object selection, toolbar actions, sticky notes, text editing, and drawing.
Route `/engine` remains available as the same demo path for existing checks.

## Check

```sh
pnpm verify
```

`verify` runs lint, the full Vitest suite, the app and package builds, the
repository-local package smoke, and a clean tarball consumer smoke. The clean
smoke creates the actual npm `.tgz`, installs it with its peers in an empty
temporary project, checks every public runtime, type, and style export plus
runtime dependency declarations, and removes the temporary artifact afterward.

Run the browser suite separately with `pnpm test:e2e`. CI uses a frozen
lockfile and requires both `pnpm verify` and the existing browser suite on pull
requests.

## Quickstart

### Basic app

```tsx
import '@interactive-os/canvas/style.css'
import { CanvasApp, type CanvasAppProps } from '@interactive-os/canvas'

const basicCanvasProps = {
  assemblyInput: {
    initialItems: [],
  },
} satisfies CanvasAppProps

export function BasicCanvas() {
  return <CanvasApp {...basicCanvasProps} />
}
```

### Feature packs and a custom item

```tsx
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
    requiredCapability: 'editDocument',
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
```

### Custom feature pack

```tsx
import '@interactive-os/canvas/style.css'
import { CanvasApp } from '@interactive-os/canvas'
import { defineCanvasAppFeaturePack } from '@interactive-os/canvas/app/authoring'

const analyticsFeaturePack = defineCanvasAppFeaturePack({
  id: 'analytics',
  label: 'Analytics',
  extensions: {
    customCommands: [{
      id: 'log-selection',
      isEnabled: ({ selection }) => selection.length > 0,
      label: 'Log selection',
      requiredCapability: 'view',
      run: ({ selection }) => {
        console.info('Selected canvas items', selection)
      },
      title: 'Log selected canvas item ids',
    }],
  },
})

export function CanvasWithCustomFeaturePack() {
  return (
    <CanvasApp
      assemblyInput={{
        additionalFeaturePackManifests: [analyticsFeaturePack],
      }}
    />
  )
}
```
