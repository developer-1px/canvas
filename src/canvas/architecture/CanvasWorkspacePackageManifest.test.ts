import { describe, expect, it } from 'vitest'

type WorkspacePackageJson = {
  exports?: Record<
    string,
    | WorkspacePackageExportEntry
    | WorkspacePackageStyleExportEntry
    | string
  >
  files?: string[]
  name?: string
  peerDependencies?: Record<string, string>
  private?: boolean
  publishConfig?: {
    access?: string
    provenance?: boolean
    registry?: string
  }
  scripts?: Record<string, string>
  sideEffects?: boolean | string[]
  types?: string
  version?: string
}

type WorkspacePackageExportEntry = {
  default: string
  import: string
  types: string
}

type WorkspacePackageStyleExportEntry = {
  default: string
}

const workspacePackageModules = import.meta.glob(
  '../../../packages/*/package.json',
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const workspacePackages = Object.fromEntries(
  Object.entries(workspacePackageModules).map(([path, source]) => {
    const packageJson = JSON.parse(source) as WorkspacePackageJson

    return [packageJson.name, { packageJson, path }]
  }),
) as Record<string, {
  packageJson: WorkspacePackageJson
  path: string
}>

describe('Canvas workspace package manifests', () => {
  it('keeps every workspace package on built package entries', () => {
    expect(Object.keys(workspacePackages).sort()).toEqual([
      '@interactive-os/dom-edit-affordance',
      '@interactive-os/figma-clone',
      '@interactive-os/slide-edit-affordance',
    ])

    for (const { packageJson, path } of Object.values(workspacePackages)) {
      expect(packageJson.types, path).toMatch(/^\.\/dist\/.+\.d\.ts$/)
      expect(packageJson.files, path).toEqual(['dist'])
      expect(getWorkspacePackageExportTargets(packageJson), path)
        .not.toEqual(expect.arrayContaining([
          expect.stringMatching(/^\.\/src\//),
        ]))

      if (packageJson.private === true) {
        expect(packageJson.publishConfig, path).toBeUndefined()
        continue
      }

      expect(packageJson.private, path).toBe(false)
      expect(packageJson.version, path).toMatch(/^\d+\.\d+\.\d+/)
      expect(packageJson.publishConfig, path).toEqual({
        access: 'public',
        provenance: true,
        registry: 'https://registry.npmjs.org/',
      })
    }
  })

  it('makes slide-edit-affordance a built npm-ready affordance package', () => {
    const packageJson =
      workspacePackages['@interactive-os/slide-edit-affordance'].packageJson

    expect(packageJson).toMatchObject({
      name: '@interactive-os/slide-edit-affordance',
      private: false,
      sideEffects: false,
      types: './dist/index.d.ts',
      files: ['dist'],
      peerDependencies: {
        '@interactive-os/canvas': '^0.1.1',
      },
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
          default: './dist/index.js',
        },
      },
    })
  })

  it('makes dom-edit-affordance a built npm-ready React and CSS package', () => {
    const packageJson =
      workspacePackages['@interactive-os/dom-edit-affordance'].packageJson

    expect(packageJson).toMatchObject({
      name: '@interactive-os/dom-edit-affordance',
      private: false,
      types: './dist/index.d.ts',
      files: ['dist'],
      sideEffects: ['**/*.css'],
      peerDependencies: {
        '@interactive-os/interaction': '^0.1.0',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'react-moveable': '^0.56.0',
      },
      exports: {
        '.': createWorkspacePackageExportEntry('./dist/index'),
        './metadata': createWorkspacePackageExportEntry('./dist/metadata'),
        './react': createWorkspacePackageExportEntry('./dist/react'),
        './canvas': createWorkspacePackageExportEntry('./dist/canvas'),
        './interaction': createWorkspacePackageExportEntry(
          './dist/interaction',
        ),
        './style.css': {
          default: './dist/style.css',
        },
      },
    })
  })

  it('keeps figma-clone as a private built demo app package', () => {
    const packageJson =
      workspacePackages['@interactive-os/figma-clone'].packageJson

    expect(packageJson).toMatchObject({
      name: '@interactive-os/figma-clone',
      private: true,
      types: './dist/index.d.ts',
      files: ['dist'],
      sideEffects: ['**/*.css'],
      scripts: {
        build: 'rm -rf dist && tsc -p tsconfig.package.json && node ../../scripts/copy-package-assets.mjs src dist && node ../../scripts/resolve-package-imports.mjs dist',
        'pack:dry-run': 'npm pack --dry-run',
      },
      dependencies: {
        '@interactive-os/dom-edit-affordance': 'workspace:*',
        '@interactive-os/json-document': '^1.0.0',
        zod: '^4.0.0',
      },
      peerDependencies: {
        '@interactive-os/canvas': '^0.1.1',
        react: '^19.0.0',
        'react-dom': '^19.0.0',
      },
      exports: {
        '.': createWorkspacePackageExportEntry('./dist/index'),
        './dom-editor': createWorkspacePackageExportEntry(
          './dist/dom-editor/index',
        ),
        './style.css': {
          default: './dist/FigmaCloneApp.css',
        },
      },
    })
  })
})

function getWorkspacePackageExportTargets(
  packageJson: WorkspacePackageJson,
): string[] {
  return Object.values(packageJson.exports ?? {}).flatMap((entry) => {
    if (typeof entry === 'string') {
      return [entry]
    }

    if ('types' in entry) {
      return [entry.types, entry.import, entry.default]
    }

    return [entry.default]
  })
}

function createWorkspacePackageExportEntry(
  pathWithoutExtension: string,
): WorkspacePackageExportEntry {
  return {
    types: `${pathWithoutExtension}.d.ts`,
    import: `${pathWithoutExtension}.js`,
    default: `${pathWithoutExtension}.js`,
  }
}
