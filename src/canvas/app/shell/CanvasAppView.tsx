import type { ComponentProps } from 'react'
import { CanvasStage } from '../../ui/stage/CanvasStage'
import { CanvasComponentPalette } from '../../ui/palette/CanvasComponentPalette'
import { CanvasObjectInspector } from '../../ui/inspector/CanvasObjectInspector'
import { CanvasTextEditor } from '../../ui/text/CanvasTextEditor'
import { CanvasToolbar } from '../../ui/toolbar/CanvasToolbar'
import { CanvasStatus } from '../../ui/status/CanvasStatus'
import { ZoomControls } from '../../ui/zoom/ZoomControls'
import type { CanvasAffordanceConfig } from '../../engine/affordance/CanvasAffordances'
import type { CanvasCommandAvailability } from '../../engine/command/CanvasCommandEngine'

type StageProps = ComponentProps<typeof CanvasStage>
type ToolbarProps = ComponentProps<typeof CanvasToolbar>
type TextEditorProps = ComponentProps<typeof CanvasTextEditor>
type InspectorProps = ComponentProps<typeof CanvasObjectInspector>
type PaletteInsert = ComponentProps<typeof CanvasComponentPalette>['onInsert']

type CanvasAppViewProps = {
  activeMode: StageProps['activeMode']
  blurTextEditor: () => void
  commandAvailability: CanvasCommandAvailability
  config: CanvasAffordanceConfig
  editing: TextEditorProps['editing']
  editorRef: TextEditorProps['editorRef']
  editorStyle: TextEditorProps['style']
  fitToItems: (ids?: string[]) => void
  gesture: StageProps['gesture']
  inspector: InspectorProps
  insertComponent: PaletteInsert
  items: StageProps['items']
  overlays: StageProps['overlays']
  selected: StageProps['selected']
  selection: string[]
  svgRef: StageProps['svgRef']
  tool: ToolbarProps['tool']
  viewport: StageProps['viewport']
  onAlign: ToolbarProps['onAlign']
  onCancelTextEdit: TextEditorProps['onCancel']
  onChangeEditing: TextEditorProps['onChange']
  onCommitText: TextEditorProps['onCommit']
  onDelete: ToolbarProps['onDelete']
  onDistribute: ToolbarProps['onDistribute']
  onDuplicate: ToolbarProps['onDuplicate']
  onGroup: ToolbarProps['onGroup']
  onItemPointerDown: StageProps['onItemPointerDown']
  onLock: ToolbarProps['onLock']
  onPointerCancel: StageProps['onPointerCancel']
  onPointerDown: StageProps['onCanvasPointerDown']
  onPointerMove: StageProps['onPointerMove']
  onPointerUp: StageProps['onPointerUp']
  onRedo: ToolbarProps['onRedo']
  onResetViewport: () => void
  onResizePointerDown: StageProps['onResizePointerDown']
  onTextDoubleClick: StageProps['onTextDoubleClick']
  onToolChange: ToolbarProps['onToolChange']
  onUndo: ToolbarProps['onUndo']
  onUngroup: ToolbarProps['onUngroup']
  onUnlockAll: ToolbarProps['onUnlockAll']
  onZoomBy: (multiplier: number) => void
}

export function CanvasAppView({
  activeMode,
  blurTextEditor,
  commandAvailability,
  config,
  editing,
  editorRef,
  editorStyle,
  fitToItems,
  gesture,
  inspector,
  insertComponent,
  items,
  overlays,
  selected,
  selection,
  svgRef,
  tool,
  viewport,
  onAlign,
  onCancelTextEdit,
  onChangeEditing,
  onCommitText,
  onDelete,
  onDistribute,
  onDuplicate,
  onGroup,
  onItemPointerDown,
  onLock,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onRedo,
  onResetViewport,
  onResizePointerDown,
  onTextDoubleClick,
  onToolChange,
  onUndo,
  onUngroup,
  onUnlockAll,
  onZoomBy,
}: CanvasAppViewProps) {
  return (
    <main className="canvas-app">
      {config.overlays.toolbar ? (
        <CanvasToolbar
          canDelete={commandAvailability.delete}
          canDuplicate={commandAvailability.duplicate}
          canDistribute={selection.length > 2}
          canGroup={commandAvailability.group}
          canAlign={selection.length > 1}
          canLock={commandAvailability.lockSelection}
          canUngroup={commandAvailability.ungroup}
          canRedo={commandAvailability.redo}
          canUndo={commandAvailability.undo}
          config={config}
          tool={tool}
          onDelete={onDelete}
          onAlign={onAlign}
          onDistribute={onDistribute}
          onDuplicate={onDuplicate}
          onGroup={onGroup}
          onLock={onLock}
          onRedo={onRedo}
          onToolChange={onToolChange}
          onUndo={onUndo}
          onUngroup={onUngroup}
          onUnlockAll={onUnlockAll}
        />
      ) : null}

      <CanvasComponentPalette onInsert={insertComponent} />

      <CanvasStage
        activeMode={activeMode}
        gesture={gesture}
        items={items}
        overlays={overlays}
        selected={selected}
        svgRef={svgRef}
        viewport={viewport}
        onCanvasPointerDown={(event) => {
          blurTextEditor()
          onPointerDown(event)
        }}
        onContextMenu={(event) => event.preventDefault()}
        onItemPointerDown={(event, itemId) => {
          blurTextEditor()
          onItemPointerDown(event, itemId)
        }}
        onPointerCancel={onPointerCancel}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onResizePointerDown={onResizePointerDown}
        onTextDoubleClick={onTextDoubleClick}
      />

      <CanvasTextEditor
        editing={editing}
        editorRef={editorRef}
        style={editorStyle}
        onBlur={onCommitText}
        onCancel={onCancelTextEdit}
        onChange={onChangeEditing}
        onCommit={onCommitText}
      />

      {config.overlays.zoomControls ? (
        <ZoomControls
          config={config}
          scale={viewport.scale}
          onFit={() => fitToItems(selection.length > 0 ? selection : undefined)}
          onReset={onResetViewport}
          onZoomIn={() => onZoomBy(1.25)}
          onZoomOut={() => onZoomBy(0.8)}
        />
      ) : null}

      <CanvasObjectInspector {...inspector} />

      {config.overlays.status ? (
        <CanvasStatus
          gesture={gesture}
          scale={viewport.scale}
          selectionLength={selection.length}
          tool={tool}
        />
      ) : null}
    </main>
  )
}
