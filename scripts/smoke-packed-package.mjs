import { spawn } from 'node:child_process'
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises'
import { isBuiltin } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const temporaryRoot = await mkdtemp(join(tmpdir(), 'canvas-package-smoke-'))
const packDirectory = join(temporaryRoot, 'pack')
const consumerDirectory = join(temporaryRoot, 'consumer')

try {
  await Promise.all([
    mkdir(packDirectory, { recursive: true }),
    mkdir(consumerDirectory, { recursive: true }),
  ])

  const sourceManifest = await readJson(join(root, 'package.json'))
  const peerVersions = await resolveInstalledPeerVersions(sourceManifest)
  const packOutput = await runCaptured(
    'npm',
    [
      'pack',
      '--json',
      '--ignore-scripts',
      '--pack-destination',
      packDirectory,
    ],
    root,
  )
  const packReport = JSON.parse(packOutput)
  const tarballName = packReport[0]?.filename

  if (typeof tarballName !== 'string') {
    throw new Error(`npm pack did not report a tarball:\n${packOutput}`)
  }

  const tarballPath = join(packDirectory, tarballName)
  await access(tarballPath)
  await writeJson(join(consumerDirectory, 'package.json'), {
    name: 'canvas-package-smoke-consumer',
    private: true,
    type: 'module',
    dependencies: {
      [sourceManifest.name]: `file:${tarballPath}`,
      ...peerVersions,
    },
    devDependencies: {
      '@types/react': await readInstalledVersion('@types/react'),
      '@types/react-dom': await readInstalledVersion('@types/react-dom'),
      typescript: await readInstalledVersion('typescript'),
    },
  })

  await runCaptured(
    'npm',
    [
      'install',
      '--strict-peer-deps',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ],
    consumerDirectory,
  )
  await runCaptured('npm', ['ls', '--all'], consumerDirectory)

  const installedPackageRoot = join(
    consumerDirectory,
    'node_modules',
    ...sourceManifest.name.split('/'),
  )
  const installedManifest = await readJson(
    join(installedPackageRoot, 'package.json'),
  )
  const publicExports = inspectPublicExports(installedManifest)

  await assertExportTargetsExist(installedPackageRoot, publicExports.targets)
  await assertRuntimeDependenciesDeclared(
    installedPackageRoot,
    installedManifest,
  )
  await assertPeersInstalled(consumerDirectory, installedManifest)

  await writeFile(
    join(consumerDirectory, 'runtime-smoke.mjs'),
    createRuntimeSmoke(publicExports.runtime, publicExports.styles),
  )
  await run('node', ['runtime-smoke.mjs'], consumerDirectory)

  await writeFile(
    join(consumerDirectory, 'types-smoke.ts'),
    createTypesSmoke(publicExports.types),
  )
  await writeJson(join(consumerDirectory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2023',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      lib: ['ES2023', 'DOM', 'DOM.Iterable'],
      strict: true,
      noEmit: true,
      skipLibCheck: false,
    },
    files: ['types-smoke.ts'],
  })
  await run(
    'node',
    [join(consumerDirectory, 'node_modules/typescript/bin/tsc'), '-p', '.'],
    consumerDirectory,
  )

  console.log(
    [
      `clean package smoke passed for ${tarballName}`,
      `${publicExports.runtime.length} runtime exports`,
      `${publicExports.types.length} type exports`,
      `${publicExports.styles.length} style exports`,
    ].join(' · '),
  )
} finally {
  await rm(temporaryRoot, { force: true, recursive: true })
}

function inspectPublicExports(manifest) {
  const runtime = []
  const styles = []
  const types = []
  const targets = []

  for (const [subpath, entry] of Object.entries(manifest.exports ?? {})) {
    const specifier =
      subpath === '.' ? manifest.name : `${manifest.name}${subpath.slice(1)}`
    const conditions = typeof entry === 'string' ? { default: entry } : entry

    for (const [condition, target] of Object.entries(conditions)) {
      if (typeof target === 'string') {
        targets.push({ condition, specifier, target })
      }
    }

    if (typeof conditions.types === 'string') {
      types.push(specifier)
    }

    const runtimeTarget = conditions.import ?? conditions.default

    if (typeof runtimeTarget !== 'string') {
      continue
    }

    if (runtimeTarget.endsWith('.css')) {
      styles.push(specifier)
    } else {
      runtime.push(specifier)
    }
  }

  return { runtime, styles, targets, types }
}

async function assertExportTargetsExist(packageRoot, targets) {
  for (const { condition, specifier, target } of targets) {
    const absoluteTarget = resolve(packageRoot, target)
    const relativeTarget = relative(packageRoot, absoluteTarget)

    if (relativeTarget.startsWith(`..${sep}`) || relativeTarget === '..') {
      throw new Error(
        `package export escapes the tarball for ${specifier} (${condition}): ${target}`,
      )
    }

    await access(absoluteTarget).catch((error) => {
      throw new Error(
        `missing packed export for ${specifier} (${condition}): ${target}`,
        { cause: error },
      )
    })
  }
}

async function assertRuntimeDependenciesDeclared(packageRoot, manifest) {
  const declared = new Set([
    manifest.name,
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ])
  const importedPackages = new Map()

  for (const path of await listJavaScriptFiles(packageRoot)) {
    const source = await readFile(path, 'utf8')

    for (const specifier of findBareSpecifiers(source, path)) {
      const dependencyName = packageNameFromSpecifier(specifier)

      if (!importedPackages.has(dependencyName)) {
        importedPackages.set(dependencyName, relative(packageRoot, path))
      }
    }
  }

  for (const [dependencyName, importer] of importedPackages) {
    if (!declared.has(dependencyName)) {
      throw new Error(
        `undeclared runtime dependency ${dependencyName} imported by ${importer}`,
      )
    }
  }
}

async function assertPeersInstalled(consumerRoot, manifest) {
  for (const peerName of Object.keys(manifest.peerDependencies ?? {})) {
    if (manifest.peerDependenciesMeta?.[peerName]?.optional) {
      continue
    }

    await access(
      join(consumerRoot, 'node_modules', ...peerName.split('/'), 'package.json'),
    ).catch((error) => {
      throw new Error(`required peer dependency was not installed: ${peerName}`, {
        cause: error,
      })
    })
  }
}

function createRuntimeSmoke(runtimeSpecifiers, styleSpecifiers) {
  return [
    "import { readFile } from 'node:fs/promises'",
    '',
    `const runtimeSpecifiers = ${JSON.stringify(runtimeSpecifiers)}`,
    `const styleSpecifiers = ${JSON.stringify(styleSpecifiers)}`,
    '',
    'for (const specifier of runtimeSpecifiers) {',
    '  await import(specifier)',
    '}',
    '',
    'for (const specifier of styleSpecifiers) {',
    '  const resolved = import.meta.resolve(specifier)',
    "  if (!resolved.startsWith('file:')) {",
    '    throw new Error(`style export did not resolve to a file: ${specifier}`)',
    '  }',
    '  const css = await readFile(new URL(resolved), \'utf8\')',
    '  if (css.trim().length === 0) {',
    '    throw new Error(`style export is empty: ${specifier}`)',
    '  }',
    '}',
    '',
  ].join('\n')
}

function createTypesSmoke(typeSpecifiers) {
  return [
    ...typeSpecifiers.map(
      (specifier, index) =>
        `type PublicModule${index} = typeof import(${JSON.stringify(specifier)})`,
    ),
    '',
    `type PublicModules = [${typeSpecifiers
      .map((_specifier, index) => `PublicModule${index}`)
      .join(', ')}]`,
    'declare const publicModules: PublicModules',
    'void publicModules',
    '',
  ].join('\n')
}

async function resolveInstalledPeerVersions(manifest) {
  const versions = {}

  for (const name of Object.keys(manifest.peerDependencies ?? {})) {
    if (!manifest.peerDependenciesMeta?.[name]?.optional) {
      versions[name] = await readInstalledVersion(name)
    }
  }

  return versions
}

async function readInstalledVersion(packageName) {
  const manifest = await readJson(
    join(root, 'node_modules', ...packageName.split('/'), 'package.json'),
  ).catch((error) => {
    throw new Error(
      `cannot pin clean-consumer dependency ${packageName}; install the root dependencies first`,
      { cause: error },
    )
  })

  return manifest.version
}

async function listJavaScriptFiles(directory) {
  const files = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await listJavaScriptFiles(path)))
    } else if (entry.isFile() && path.endsWith('.js')) {
      files.push(path)
    }
  }

  return files
}

function findBareSpecifiers(source, path) {
  const specifiers = new Set()
  const sourceFile = ts.createSourceFile(
    path,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  )

  const visit = (node) => {
    let moduleSpecifier

    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      moduleSpecifier = node.moduleSpecifier.text
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      moduleSpecifier = node.arguments[0].text
    }

    if (
      moduleSpecifier &&
      !moduleSpecifier.startsWith('.') &&
      !moduleSpecifier.startsWith('/') &&
      !moduleSpecifier.startsWith('#') &&
      !isBuiltin(moduleSpecifier) &&
      !moduleSpecifier.includes(':')
    ) {
      specifiers.add(moduleSpecifier)
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return specifiers
}

function packageNameFromSpecifier(specifier) {
  const [scopeOrName, scopedName] = specifier.split('/')

  return scopeOrName.startsWith('@')
    ? `${scopeOrName}/${scopedName}`
    : scopeOrName
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}

async function run(command, arguments_, cwd) {
  await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, arguments_, { cwd, stdio: 'inherit' })

    child.on('error', rejectPromise)
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise()
      } else {
        rejectPromise(
          new Error(
            `${command} ${arguments_.join(' ')} failed (${signal ?? code})`,
          ),
        )
      }
    })
  })
}

async function runCaptured(command, arguments_, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, arguments_, { cwd })
    let stdout = ''
    let stderr = ''

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', rejectPromise)
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise(stdout)
      } else {
        rejectPromise(
          new Error(
            [
              `${command} ${arguments_.join(' ')} failed (${signal ?? code})`,
              stdout,
              stderr,
            ]
              .filter(Boolean)
              .join('\n'),
          ),
        )
      }
    })
  })
}
