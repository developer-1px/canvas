import { cp, mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const sourceRoot = join(root, 'src', 'canvas')
const outputRoot = join(root, 'dist', 'package', 'canvas')

await copyCssFiles(sourceRoot)

async function copyCssFiles(directory) {
  const entries = await readdir(directory)

  for (const entry of entries) {
    const sourcePath = join(directory, entry)
    const entryStat = await stat(sourcePath)

    if (entryStat.isDirectory()) {
      await copyCssFiles(sourcePath)
      continue
    }

    if (!entry.endsWith('.css')) {
      continue
    }

    const outputPath = join(outputRoot, relative(sourceRoot, sourcePath))
    await mkdir(dirname(outputPath), { recursive: true })
    await cp(sourcePath, outputPath)
  }
}
