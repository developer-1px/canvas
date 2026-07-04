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
pnpm lint
pnpm build
```

## Quickstart

### Basic app

```tsx
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
  id: 'kpi-card',
  presentation: 'kpi-card',
  renderItem: ({ item }) => (
    <div>
      <strong>{item.title}</strong>
      <span>{String(item.data.value)}</span>
    </div>
  ),
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
