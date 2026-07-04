import { access, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const packageJson = JSON.parse(
  await readFile(join(root, 'package.json'), 'utf8'),
)

if (packageJson.name !== '@interactive-os/canvas') {
  throw new Error(`unexpected package name: ${packageJson.name}`)
}

if (packageJson.private !== false) {
  throw new Error('package must be publishable: private must be false')
}

for (const [name, specifier] of Object.entries(packageJson.dependencies ?? {})) {
  if (/^(link:|file:|workspace:)/.test(specifier)) {
    throw new Error(`dependency ${name} is not publishable: ${specifier}`)
  }
}

for (const [subpath, entry] of Object.entries(packageJson.exports ?? {})) {
  if (typeof entry === 'string') {
    await assertFile(entry, subpath)
    await importJavaScriptExport(entry, subpath)
    continue
  }

  if ('types' in entry) {
    await assertFile(entry.types, `${subpath} types`)
  }

  if ('import' in entry) {
    await assertFile(entry.import, `${subpath} import`)
    await importJavaScriptExport(entry.import, `${subpath} import`)
  }

  if ('default' in entry) {
    await assertFile(entry.default, `${subpath} default`)
  }
}

await assertHeadlessEngineExport()

async function assertFile(relativePath, label) {
  await access(join(root, relativePath)).catch((error) => {
    throw new Error(`missing package export file for ${label}: ${relativePath}`, {
      cause: error,
    })
  })
}

async function assertHeadlessEngineExport() {
  const engineEntry = packageJson.exports?.['./engine']?.import

  if (typeof engineEntry !== 'string') {
    throw new Error('missing package engine import export')
  }

  const engine = await import(pathToFileURL(join(root, engineEntry)).href)
  const expectedFunctions = [
    'assertCanvasAffordanceConfig',
    'createCanvasAffordanceConfig',
    'createCanvasSceneAdapter',
    'getCanvasCommandAvailability',
    'getCanvasCommandSelectionState',
    'getCanvasMarqueeSelection',
    'getCanvasPointerGesture',
    'getCanvasWheelViewport',
    'moveCanvasSelection',
    'resizeCanvasSelection',
  ]

  for (const name of expectedFunctions) {
    if (typeof engine[name] !== 'function') {
      throw new Error(`missing headless engine export: ${name}`)
    }
  }

  engine.assertCanvasAffordanceConfig(engine.createCanvasAffordanceConfig({}))
}

async function importJavaScriptExport(relativePath, label) {
  if (!relativePath.endsWith('.js')) {
    return
  }

  await import(pathToFileURL(join(root, relativePath)).href).catch((error) => {
    throw new Error(`package export is not importable for ${label}`, {
      cause: error,
    })
  })
}
