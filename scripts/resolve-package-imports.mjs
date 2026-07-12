import { existsSync } from 'node:fs'
import { readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const packageRoot = join(root, 'dist', 'package', 'canvas')
const sourceExtensions = new Set(['.js', '.d.ts'])

const files = await listSourceFiles(packageRoot)

for (const filePath of files) {
  const source = await readFile(filePath, 'utf8')
  const rewritten = filePath.endsWith('.d.ts')
    ? removeRuntimeStyleImports(rewriteModuleSpecifiers(filePath, source))
    : rewriteModuleSpecifiers(filePath, source)

  if (rewritten !== source) {
    await writeFile(filePath, rewritten)
  }
}

function removeRuntimeStyleImports(source) {
  return source.replace(
    /^\s*import\s*['"][^'"]+\.css['"];?\s*$/gm,
    '',
  )
}

async function listSourceFiles(directory) {
  const entries = await readdir(directory)
  const files = []

  for (const entry of entries) {
    const entryPath = join(directory, entry)
    const entryStat = await stat(entryPath)

    if (entryStat.isDirectory()) {
      files.push(...(await listSourceFiles(entryPath)))
      continue
    }

    if (sourceExtensions.has(getSourceExtension(entryPath))) {
      files.push(entryPath)
    }
  }

  return files
}

function getSourceExtension(filePath) {
  if (filePath.endsWith('.d.ts')) {
    return '.d.ts'
  }

  return extname(filePath)
}

function rewriteModuleSpecifiers(filePath, source) {
  let rewritten = source

  rewritten = rewritten.replace(
    /(\bfrom\s*['"])(\.{1,2}(?:\/[^'"]*)?)(['"])/g,
    (_match, prefix, specifier, suffix) =>
      `${prefix}${resolveModuleSpecifier(filePath, specifier)}${suffix}`,
  )

  rewritten = rewritten.replace(
    /(\bimport\s*\(\s*['"])(\.{1,2}(?:\/[^'"]*)?)(['"]\s*\))/g,
    (_match, prefix, specifier, suffix) =>
      `${prefix}${resolveModuleSpecifier(filePath, specifier)}${suffix}`,
  )

  rewritten = rewritten.replace(
    /(\bimport\s*['"])(\.{1,2}(?:\/[^'"]*)?)(['"])/g,
    (_match, prefix, specifier, suffix) =>
      `${prefix}${resolveModuleSpecifier(filePath, specifier)}${suffix}`,
  )

  return rewritten
}

function resolveModuleSpecifier(filePath, specifier) {
  if (hasExplicitExtension(specifier)) {
    return specifier
  }

  const directory = dirname(filePath)
  const target = resolve(directory, specifier)

  if (fileExists(`${target}.js`) || fileExists(`${target}.d.ts`)) {
    return `${specifier}.js`
  }

  if (
    fileExists(join(target, 'index.js')) ||
    fileExists(join(target, 'index.d.ts'))
  ) {
    return `${specifier}/index.js`
  }

  throw new Error(
    `unable to resolve package import "${specifier}" from ${filePath}`,
  )
}

function hasExplicitExtension(specifier) {
  const lastSegment = specifier.split('/').at(-1) ?? ''
  return extname(lastSegment) !== ''
}

function fileExists(filePath) {
  return existsSync(filePath)
}
