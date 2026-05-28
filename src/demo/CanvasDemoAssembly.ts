import {
  CanvasHost,
  createCanvasAppAssembly,
  type CanvasAppAssemblyInput,
  type CanvasWorkspaceStorage,
  type CanvasWorkspaceStorageProvider,
} from '../canvas'
import { DEMO_CANVAS_SEED_ITEMS } from './CanvasDemoSeedItems'
import { DEMO_CUSTOM_ITEM_MODULES } from './custom-items'

const DEMO_CANVAS_INITIAL_WORKSPACE = JSON.stringify({
  items: DEMO_CANVAS_SEED_ITEMS,
  selection: [],
  version: 1,
  viewport: {
    scale: 0.88,
    x: 80,
    y: 8,
  },
})

const DEMO_CANVAS_STORAGE: CanvasWorkspaceStorage = {
  getItem: () => DEMO_CANVAS_INITIAL_WORKSPACE,
  setItem: () => undefined,
}

const DEMO_CANVAS_STORAGE_PROVIDER: CanvasWorkspaceStorageProvider = () =>
  DEMO_CANVAS_STORAGE

const DEMO_REPORT_COMPONENT_TEMPLATES = [
  {
    id: 'command-center',
    label: 'S',
    title: 'Command center',
    body: 'Workspace operating state',
    columns: ['Run', 'Trace', 'Gate'],
    items: ['Review', '6 warnings', '78%', 'risk claims', 'Open', 'owner gap'],
    w: 560,
    h: 210,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#ff8a4c',
    presentation: 'command-center',
  },
  {
    id: 'scorecard',
    label: 'M',
    title: 'Scorecard',
    body: 'Outcome summary',
    columns: ['Signal', 'Risk', 'Ready'],
    items: ['47', 'events', '6', 'warnings', '82%', 'confidence'],
    w: 430,
    h: 164,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#7fb7ff',
    presentation: 'metric-scorecard',
  },
  {
    id: 'gate-strip',
    label: 'G',
    title: 'Gate strip',
    body: 'Quality gate summary',
    columns: ['Schema', 'Evidence', 'Layout'],
    items: ['Pass', '0 invalid', 'Review', '4 claims', 'Pass', '0 overlaps'],
    w: 430,
    h: 150,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#ff8a4c',
    presentation: 'gate-strip',
  },
  {
    id: 'timeline',
    label: 'F',
    title: 'Timeline',
    checkedItems: [0, 1],
    items: ['Brief', 'Generate', 'Review', 'Publish'],
    w: 430,
    h: 126,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#0f8f63',
    presentation: 'workflow-timeline',
  },
  {
    id: 'queue',
    label: 'Q',
    title: 'Queue',
    checkedItems: [0],
    items: ['Resolve duplicate', 'Assign owner', 'Approve publish'],
    w: 430,
    h: 166,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#7fb7ff',
    presentation: 'review-board',
  },
  {
    id: 'review-board',
    label: 'R',
    title: 'Review board',
    checkedItems: [0],
    items: ['Resolve duplicate', 'Assign owner', 'Approve publish'],
    w: 430,
    h: 166,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#7fb7ff',
    presentation: 'review-board',
  },
  {
    id: 'evidence',
    label: 'E',
    title: 'Evidence',
    columns: ['Source', 'Signal', 'State'],
    items: [
      'CRM',
      'Expansion risk',
      'verified',
      'Support',
      'Security blocker',
      'linked',
    ],
    w: 430,
    h: 152,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#0f8f63',
    presentation: 'evidence-map',
  },
  {
    id: 'evidence-map',
    label: 'T',
    title: 'Trace map',
    columns: ['Source', 'Signal', 'State'],
    items: [
      'CRM',
      'Expansion risk',
      'verified',
      'Support',
      'Security blocker',
      'linked',
    ],
    w: 430,
    h: 152,
    fill: '#ffffff',
    stroke: '#dfe5ee',
    accent: '#0f8f63',
    presentation: 'evidence-map',
  },
] satisfies readonly CanvasHost.CanvasComponentTemplate[]

const DEMO_CANVAS_COMPONENT_LIBRARY = CanvasHost.createCanvasComponentLibrary({
  templates: [
    ...CanvasHost.DEFAULT_CANVAS_COMPONENT_TEMPLATES,
    ...DEMO_REPORT_COMPONENT_TEMPLATES,
  ],
})

export const DEMO_CANVAS_APP_ASSEMBLY_INPUT = {
  affordanceConfig: {
    overlays: {
      componentPalette: false,
      emoteControls: false,
      imageControls: false,
      presence: false,
      sessionTimer: false,
      spotlight: false,
      status: false,
      votingSession: false,
    },
    tools: {
      comment: false,
      diamond: false,
      ellipse: false,
      eraser: false,
      highlight: false,
      laser: false,
      marker: false,
    },
  },
  componentLibrary: DEMO_CANVAS_COMPONENT_LIBRARY,
  customItemModules: DEMO_CUSTOM_ITEM_MODULES,
  initialItems: DEMO_CANVAS_SEED_ITEMS,
  initialSelection: [],
  workspaceStorageProvider: DEMO_CANVAS_STORAGE_PROVIDER,
} satisfies CanvasAppAssemblyInput

export const DEMO_CANVAS_APP_ASSEMBLY = createCanvasAppAssembly(
  DEMO_CANVAS_APP_ASSEMBLY_INPUT,
)
