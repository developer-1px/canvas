import { describe, expect, it } from 'vitest'

import {
  getSourceFile,
  sourceFiles,
} from './CanvasArchitectureTestSources'

describe('Canvas App folder structure', () => {
  it('keeps app source grouped by the current feature map', () => {
    const appTopLevelFolders = Array.from(
      new Set(
        sourceFiles
          .filter((file) => file.path.startsWith('src/canvas/app/'))
          .filter((file) => file.path.split('/').length > 4)
          .map((file) => file.path.split('/')[3])
          .filter((folder): folder is string => folder !== undefined),
      ),
    ).sort()

    expect(appTopLevelFolders).toEqual([
      'affordances',
      'authoring',
      'extensions',
      'feature-packs',
      'rendering',
      'shell',
      'workflow',
      'workspace',
    ])
  })


  it('keeps optional App feature packs installable by folder', () => {
    const featurePackFolders = Array.from(
      new Set(
        sourceFiles
          .filter((file) =>
            file.path.startsWith('src/canvas/app/feature-packs/'),
          )
          .filter((file) => file.path.split('/').length > 5)
          .map((file) => file.path.split('/')[4])
          .filter((folder): folder is string => folder !== undefined),
      ),
    ).sort()

    expect(featurePackFolders).toEqual([
      'ai-labs',
      'arrow-routing-inspector',
      'board-io',
      'checklist-inspector',
      'command-palette',
      'component-authoring',
      'component-inspector',
      'component-library',
      'component-source-outline',
      'component-sync',
      'cursor-chat',
      'dom-edit-style',
      'drawing-tools',
      'facilitation',
      'find-replace',
      'image-io',
      'kanban-inspector',
      'media-import',
      'minimap',
      'shortcut-help',
      'stamp-authoring',
      'status-bar',
      'story-import',
      'story-preview',
      'table-import',
      'text-paste-import',
      'toolbar',
      'zoom-controls',
    ])

    for (const folder of featurePackFolders) {
      const indexPath = `src/canvas/app/feature-packs/${folder}/index.ts`

      expect(
        sourceFiles.some((file) =>
          file.path === indexPath,
        ),
      ).toBe(true)
      expect(getSourceFile(indexPath).source).toMatch(
        /FeaturePackManifest|createCanvasAppFeaturePackManifest|createCanvasStoryPreviewItemsFeaturePack/,
      )
    }
  })


  it('keeps App feature pack install registry at the feature-packs root', () => {
    const rootFeaturePackFiles = sourceFiles
      .filter((file) => file.path.startsWith('src/canvas/app/feature-packs/'))
      .filter((file) => file.path.split('/').length === 5)
      .map((file) => file.path)
      .sort()
    const defaultAssemblyFile = getSourceFile(
      'src/canvas/app/workflow/CanvasAppDefaultAssembly.ts',
    )
    const shellViewFile = getSourceFile(
      'src/canvas/app/shell/CanvasAppView.tsx',
    )
    const appModelFile = getSourceFile(
      'src/canvas/app/workflow/useCanvasAppModel.ts',
    )
    const runtimeModelFile = getSourceFile(
      'src/canvas/app/feature-packs/CanvasAppFeaturePackRuntimeModel.ts',
    )
    const manifestContractFile = getSourceFile(
      'src/canvas/app/feature-packs/CanvasAppFeaturePackManifests.ts',
    )
    const defaultExtensionCatalogFile = getSourceFile(
      'src/canvas/app/feature-packs/CanvasAppDefaultFeaturePacks.ts',
    )
    const viewContractFile = getSourceFile(
      'src/canvas/app/feature-packs/CanvasAppFeaturePackViews.tsx',
    )
    const defaultViewCatalogFile = getSourceFile(
      'src/canvas/app/feature-packs/CanvasAppDefaultViewFeaturePacks.ts',
    )

    expect(rootFeaturePackFiles).toEqual([
      'src/canvas/app/feature-packs/CanvasAppDefaultFeaturePackManifests.ts',
      'src/canvas/app/feature-packs/CanvasAppDefaultFeaturePackSuites.ts',
      'src/canvas/app/feature-packs/CanvasAppDefaultFeaturePacks.ts',
      'src/canvas/app/feature-packs/CanvasAppDefaultViewFeaturePacks.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackActions.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackActions.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackCatalog.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackCatalog.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackInstallPlan.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackInstallPlan.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackManifests.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackPartialUpdatePlan.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackPartialUpdatePlan.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackProfileActions.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackProfileActions.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackProfiles.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackRuntimeModel.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackStateTransitionPlan.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackStateTransitionPlan.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackSuiteActions.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackSuiteActions.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackSuites.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePackViews.tsx',
      'src/canvas/app/feature-packs/CanvasAppFeaturePacks.test.ts',
      'src/canvas/app/feature-packs/CanvasAppFeaturePacks.ts',
      'src/canvas/app/feature-packs/index.ts',
    ])
    expect(defaultAssemblyFile.source).toContain(
      "from '../feature-packs'",
    )
    expect(defaultAssemblyFile.source).toContain(
      'DEFAULT_CANVAS_APP_FEATURE_PACK_EXTENSION_BUNDLE',
    )
    expect(defaultAssemblyFile.source).not.toContain(
      'CANVAS_LINK_PREVIEW_INSPECTOR_PANEL',
    )
    expect(defaultAssemblyFile.source).not.toContain(
      'CANVAS_ARROW_ROUTING_INSPECTOR_PANEL',
    )
    expect(defaultAssemblyFile.source).not.toContain(
      'CANVAS_CHECKLIST_INSPECTOR_PANEL',
    )
    expect(defaultAssemblyFile.source).not.toContain(
      'CANVAS_KANBAN_INSPECTOR_PANEL',
    )
    expect(shellViewFile.source).toContain("from '../feature-packs'")
    expect(shellViewFile.source).toContain(
      'DEFAULT_CANVAS_APP_FEATURE_PACK_VIEW_RENDERERS',
    )
    expect(
      shellViewFile.source.match(/from '..\/feature-packs\/[^']+'/g) ?? [],
    ).toEqual([])
    expect(appModelFile.source).toContain("from '../feature-packs'")
    expect(appModelFile.source).toContain(
      'useCanvasAppTransientFeaturePackModel',
    )
    expect(
      appModelFile.source.match(/from '..\/feature-packs\/[^']+'/g) ?? [],
    ).toEqual([])
    expect(viewContractFile.source).not.toContain(
      'createCanvasAppViewFeaturePack({',
    )
    expect(defaultViewCatalogFile.source).toContain(
      'DEFAULT_CANVAS_APP_VIEW_FEATURE_PACK_MANIFESTS',
    )
    expect(defaultViewCatalogFile.source).toContain(
      'getCanvasAppManifestViewFeaturePacks',
    )
    expect(defaultExtensionCatalogFile.source).toContain(
      'DEFAULT_CANVAS_APP_EXTENSION_FEATURE_PACK_MANIFESTS',
    )
    expect(defaultExtensionCatalogFile.source).toContain(
      'getCanvasAppManifestExtensionFeaturePacks',
    )
    expect(manifestContractFile.source).toContain(
      'createCanvasAppFeaturePackManifest',
    )
    expect(manifestContractFile.source).toContain(
      'getCanvasAppManifestViewFeaturePacks',
    )
    expect(
      sourceFiles
        .filter((file) => file.path.startsWith('src/canvas/app/workflow/'))
        .flatMap((file) =>
          (file.source.match(/from '..\/feature-packs\/[^']+'/g) ?? [])
            .map((specifier) => `${file.path}: ${specifier}`),
        ),
    ).toEqual([])
    expect(runtimeModelFile.source).toContain(
      'CANVAS_APP_CURSOR_CHAT_RUNTIME_FEATURE_PACK',
    )
    expect(runtimeModelFile.source).toContain(
      'CANVAS_APP_FACILITATION_RUNTIME_FEATURE_PACKS',
    )
    expect(runtimeModelFile.source).toContain('enabledFeaturePackIds')
    expect(runtimeModelFile.source).not.toContain(
      'viewRenderers[featurePack.viewRendererId]',
    )
    expect(runtimeModelFile.source).not.toContain('viewRendererId')
    expect(runtimeModelFile.source).not.toContain(
      'useCanvasCursorChatModel',
    )
    expect(runtimeModelFile.source).not.toContain(
      'useCanvasEmoteModel',
    )
  })


  it('keeps App extensions focused on the extension SDK, not installable packs', () => {
    const extensionFolders = Array.from(
      new Set(
        sourceFiles
          .filter((file) => file.path.startsWith('src/canvas/app/extensions/'))
          .filter((file) => file.path.split('/').length > 5)
          .map((file) => file.path.split('/')[4])
          .filter((folder): folder is string => folder !== undefined),
      ),
    ).sort()

    expect(extensionFolders).toEqual([
      'custom-commands',
      'custom-focus',
      'custom-item-modules',
      'custom-tools',
      'foundation-extensions',
      'inspector-panels',
      'items-change-transformers',
      'widgets',
    ])
  })


  it('keeps learned App affordances grouped under the internal affordance module', () => {
    const affordanceFolders = Array.from(
      new Set(
        sourceFiles
          .filter((file) =>
            file.path.startsWith('src/canvas/app/affordances/'),
          )
          .filter((file) => file.path.split('/').length > 5)
          .map((file) => file.path.split('/')[4])
          .filter((folder): folder is string => folder !== undefined),
      ),
    ).sort()

    expect(affordanceFolders).toEqual([
      'commands',
      'controls',
      'editing',
      'interaction',
    ])
  })
})
