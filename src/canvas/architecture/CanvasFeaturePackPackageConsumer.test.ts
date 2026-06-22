import { describe, expect, it } from 'vitest'
import * as CanvasFeaturePacks from '@interactive-os/canvas/app/feature-packs'
import * as AiLabsFeaturePack from '@interactive-os/canvas/app/feature-packs/ai-labs'
import * as ArrowRoutingInspectorFeaturePack from '@interactive-os/canvas/app/feature-packs/arrow-routing-inspector'
import * as BoardIoFeaturePack from '@interactive-os/canvas/app/feature-packs/board-io'
import * as ChecklistInspectorFeaturePack from '@interactive-os/canvas/app/feature-packs/checklist-inspector'
import * as CommandPaletteFeaturePack from '@interactive-os/canvas/app/feature-packs/command-palette'
import * as ComponentAuthoringFeaturePack from '@interactive-os/canvas/app/feature-packs/component-authoring'
import * as ComponentInspectorFeaturePack from '@interactive-os/canvas/app/feature-packs/component-inspector'
import * as ComponentLibraryFeaturePack from '@interactive-os/canvas/app/feature-packs/component-library'
import * as ComponentSourceOutlineFeaturePack from '@interactive-os/canvas/app/feature-packs/component-source-outline'
import * as ComponentSyncFeaturePack from '@interactive-os/canvas/app/feature-packs/component-sync'
import * as CursorChatFeaturePack from '@interactive-os/canvas/app/feature-packs/cursor-chat'
import * as DomEditStyleFeaturePack from '@interactive-os/canvas/app/feature-packs/dom-edit-style'
import * as DrawingToolsFeaturePack from '@interactive-os/canvas/app/feature-packs/drawing-tools'
import * as FacilitationFeaturePack from '@interactive-os/canvas/app/feature-packs/facilitation'
import * as FindReplaceFeaturePack from '@interactive-os/canvas/app/feature-packs/find-replace'
import * as ImageIoFeaturePack from '@interactive-os/canvas/app/feature-packs/image-io'
import * as KanbanInspectorFeaturePack from '@interactive-os/canvas/app/feature-packs/kanban-inspector'
import * as MediaImportFeaturePack from '@interactive-os/canvas/app/feature-packs/media-import'
import * as MinimapFeaturePack from '@interactive-os/canvas/app/feature-packs/minimap'
import * as ShapeAuthoringFeaturePack from '@interactive-os/canvas/app/feature-packs/shape-authoring'
import * as ShortcutHelpFeaturePack from '@interactive-os/canvas/app/feature-packs/shortcut-help'
import * as StampAuthoringFeaturePack from '@interactive-os/canvas/app/feature-packs/stamp-authoring'
import * as StatusBarFeaturePack from '@interactive-os/canvas/app/feature-packs/status-bar'
import * as StoryCanvasFeaturePack from '@interactive-os/canvas/app/feature-packs/story-canvas'
import * as StoryImportFeaturePack from '@interactive-os/canvas/app/feature-packs/story-import'
import * as StoryPreviewFeaturePack from '@interactive-os/canvas/app/feature-packs/story-preview'
import * as TableImportFeaturePack from '@interactive-os/canvas/app/feature-packs/table-import'
import * as TextPasteImportFeaturePack from '@interactive-os/canvas/app/feature-packs/text-paste-import'
import * as ToolbarFeaturePack from '@interactive-os/canvas/app/feature-packs/toolbar'
import * as ZoomControlsFeaturePack from '@interactive-os/canvas/app/feature-packs/zoom-controls'

const featurePackSubpathModules = {
  'ai-labs': AiLabsFeaturePack,
  'arrow-routing-inspector': ArrowRoutingInspectorFeaturePack,
  'board-io': BoardIoFeaturePack,
  'checklist-inspector': ChecklistInspectorFeaturePack,
  'command-palette': CommandPaletteFeaturePack,
  'component-authoring': ComponentAuthoringFeaturePack,
  'component-inspector': ComponentInspectorFeaturePack,
  'component-library': ComponentLibraryFeaturePack,
  'component-source-outline': ComponentSourceOutlineFeaturePack,
  'component-sync': ComponentSyncFeaturePack,
  'cursor-chat': CursorChatFeaturePack,
  'dom-edit-style': DomEditStyleFeaturePack,
  'drawing-tools': DrawingToolsFeaturePack,
  facilitation: FacilitationFeaturePack,
  'find-replace': FindReplaceFeaturePack,
  'image-io': ImageIoFeaturePack,
  'kanban-inspector': KanbanInspectorFeaturePack,
  'media-import': MediaImportFeaturePack,
  minimap: MinimapFeaturePack,
  'shape-authoring': ShapeAuthoringFeaturePack,
  'shortcut-help': ShortcutHelpFeaturePack,
  'stamp-authoring': StampAuthoringFeaturePack,
  'status-bar': StatusBarFeaturePack,
  'story-canvas': StoryCanvasFeaturePack,
  'story-import': StoryImportFeaturePack,
  'story-preview': StoryPreviewFeaturePack,
  'table-import': TableImportFeaturePack,
  'text-paste-import': TextPasteImportFeaturePack,
  toolbar: ToolbarFeaturePack,
  'zoom-controls': ZoomControlsFeaturePack,
} as const

describe('Canvas feature pack package consumer imports', () => {
  it('keeps the feature pack registry available as a public package subpath', () => {
    expect(CanvasFeaturePacks.DEFAULT_CANVAS_APP_FEATURE_PACKS.length)
      .toBeGreaterThan(0)
    expect(CanvasFeaturePacks.DEFAULT_CANVAS_APP_FEATURE_PACK_MANIFESTS.length)
      .toBeGreaterThan(0)
  })

  it('keeps every installable feature pack folder available as a public package subpath', () => {
    for (const [slug, module] of Object.entries(featurePackSubpathModules)) {
      expect(Object.keys(module), slug).not.toHaveLength(0)
    }
  })
})
