import { readFileSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  CanvasApp,
  type CanvasAppProps,
  type CanvasCustomItem,
} from '@interactive-os/canvas'
import {
  createCanvasAppAssembly,
  defineCanvasAppCustomItemModule,
  defineCanvasAppFeaturePack,
  resolveCanvasAppFeaturePacks,
} from '@interactive-os/canvas/app/authoring'

const QUICKSTART_BASIC_CANVAS_SOURCE = `import { CanvasApp, type CanvasAppProps } from '@interactive-os/canvas'

const basicCanvasProps = {
  assemblyInput: {
    initialItems: [],
  },
} satisfies CanvasAppProps

export function BasicCanvas() {
  return <CanvasApp {...basicCanvasProps} />
}`

const QUICKSTART_FEATURE_PACKS_SOURCE = `import {
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
}`

const QUICKSTART_CUSTOM_FEATURE_PACK_SOURCE = `import { CanvasApp } from '@interactive-os/canvas'
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
}`

const basicCanvasProps = {
  assemblyInput: {
    initialItems: [],
  },
} satisfies CanvasAppProps

function BasicCanvas() {
  return <CanvasApp {...basicCanvasProps} />
}

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

function CanvasWithFeaturePacks() {
  return <CanvasApp {...canvasWithFeaturePacksProps} />
}

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

function CanvasWithCustomFeaturePack() {
  return (
    <CanvasApp
      assemblyInput={{
        additionalFeaturePackManifests: [analyticsFeaturePack],
      }}
    />
  )
}

describe('Canvas quickstart examples', () => {
  it('keeps README quickstart snippets identical to tested sources', () => {
    const readme = readFileSync('README.md', 'utf8')

    for (const source of [
      QUICKSTART_BASIC_CANVAS_SOURCE,
      QUICKSTART_FEATURE_PACKS_SOURCE,
      QUICKSTART_CUSTOM_FEATURE_PACK_SOURCE,
    ]) {
      expect(readme).toContain(`\`\`\`tsx\n${source}\n\`\`\``)
    }
  })

  it('renders the basic top-level CanvasApp quickstart', () => {
    expect(renderToString(<BasicCanvas />)).toEqual(expect.any(String))
    expect(
      createCanvasAppAssembly(basicCanvasProps.assemblyInput).initialItems,
    ).toEqual([])
  })

  it('assembles feature pack IDs and a custom item module quickstart', () => {
    const assembly = createCanvasAppAssembly(
      canvasWithFeaturePacksProps.assemblyInput,
    )

    expect(renderToString(<CanvasWithFeaturePacks />)).toEqual(
      expect.any(String),
    )
    expect(assembly.installedFeaturePackIds).toEqual([
      'minimap',
      'find-replace',
    ])
    expect(assembly.customItemValidators['kpi-card']?.(kpiCardItem)).toBe(true)
  })

  it('assembles a custom feature pack quickstart', () => {
    const assembly = createCanvasAppAssembly({
      additionalFeaturePackManifests: [analyticsFeaturePack],
    })

    expect(renderToString(<CanvasWithCustomFeaturePack />)).toEqual(
      expect.any(String),
    )
    expect(assembly.customCommands.map((command) => command.id)).toContain(
      'log-selection',
    )
  })
})
