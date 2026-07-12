import { spawn } from 'node:child_process'
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const temporaryRoot = await mkdtemp(
  join(tmpdir(), 'canvas-packed-workspace-consumers-'),
)
const packDirectory = join(temporaryRoot, 'pack')
const fixtureDirectory = join(temporaryRoot, 'fixture')
const consumerDirectory = join(fixtureDirectory, 'consumers')
const consumerPackages = [
  'dom-edit-affordance',
  'figma-clone',
  'slide-edit-affordance',
]

try {
  await Promise.all([
    mkdir(packDirectory, { recursive: true }),
    mkdir(consumerDirectory, { recursive: true }),
  ])

  for (const packageName of consumerPackages) {
    const targetDirectory = join(consumerDirectory, packageName)

    await mkdir(targetDirectory, { recursive: true })
    await cp(
      join(root, 'packages', packageName, 'src'),
      join(targetDirectory, 'src'),
      { recursive: true },
    )
  }

  const sourceManifest = await readJson(join(root, 'package.json'))
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
  await writeJson(join(fixtureDirectory, 'package.json'), {
    name: 'canvas-packed-workspace-consumer-fixture',
    private: true,
    type: 'module',
    dependencies: {
      [sourceManifest.name]: `file:${tarballPath}`,
      'lucide-react': await readInstalledVersion('lucide-react'),
      react: await readInstalledVersion('react'),
      'react-dom': await readInstalledVersion('react-dom'),
      'react-moveable': await readInstalledVersion('react-moveable'),
      zod: await readInstalledVersion('zod'),
    },
    devDependencies: {
      '@types/react': await readInstalledVersion('@types/react'),
      '@types/react-dom': await readInstalledVersion('@types/react-dom'),
      typescript: await readInstalledVersion('typescript'),
    },
  })

  await run(
    'npm',
    [
      'install',
      '--strict-peer-deps',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--no-package-lock',
    ],
    fixtureDirectory,
  )

  await assertPackedCanvasIsOutsideRepository(
    fixtureDirectory,
    sourceManifest.name,
  )
  await writeFile(
    join(fixtureDirectory, 'consumer-styles.d.ts'),
    "declare module '*.css'\n",
  )
  await writeFile(
    join(fixtureDirectory, 'consumer-entry.ts'),
    createConsumerEntry(),
  )
  await writeJson(join(fixtureDirectory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2023',
      lib: ['ES2023', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      moduleResolution: 'Bundler',
      jsx: 'react-jsx',
      outDir: './build',
      noEmitOnError: true,
      skipLibCheck: true,
      verbatimModuleSyntax: true,
      moduleDetection: 'force',
      noFallthroughCasesInSwitch: true,
      paths: {
        '@interactive-os/dom-edit-affordance': [
          './consumers/dom-edit-affordance/src/index.ts',
        ],
        '@interactive-os/dom-edit-affordance/*': [
          './consumers/dom-edit-affordance/src/*',
        ],
      },
    },
    include: [
      './consumer-entry.ts',
      './consumer-styles.d.ts',
      './consumers/dom-edit-affordance/src/**/*.ts',
      './consumers/dom-edit-affordance/src/**/*.tsx',
      './consumers/figma-clone/src/**/*.ts',
      './consumers/figma-clone/src/**/*.tsx',
      './consumers/slide-edit-affordance/src/**/*.ts',
      './consumers/slide-edit-affordance/src/**/*.tsx',
    ],
    exclude: [
      './consumers/**/*.test.ts',
      './consumers/**/*.test.tsx',
    ],
  })

  await run(
    'node',
    [
      join(fixtureDirectory, 'node_modules', 'typescript', 'bin', 'tsc'),
      '-p',
      'tsconfig.json',
    ],
    fixtureDirectory,
  )

  console.log(
    `packed workspace consumer deletion test passed for ${tarballName}`,
  )
} finally {
  await rm(temporaryRoot, { force: true, recursive: true })
}

function createConsumerEntry() {
  return [
    "import * as DomEdit from './consumers/dom-edit-affordance/src/index'",
    "import * as DomEditReact from './consumers/dom-edit-affordance/src/react'",
    "import * as FigmaClone from './consumers/figma-clone/src/index'",
    "import * as SlideEdit from './consumers/slide-edit-affordance/src/index'",
    '',
    'void [DomEdit, DomEditReact, FigmaClone, SlideEdit]',
    '',
  ].join('\n')
}

async function assertPackedCanvasIsOutsideRepository(
  fixtureRoot,
  packageName,
) {
  const installedRoot = await realpath(join(
    fixtureRoot,
    'node_modules',
    ...packageName.split('/'),
  ))
  const relativeToRepository = relative(root, installedRoot)

  if (
    relativeToRepository === '' ||
    (!relativeToRepository.startsWith(`..${sep}`) &&
      relativeToRepository !== '..')
  ) {
    throw new Error(
      `fixture resolved Canvas inside the repository: ${installedRoot}`,
    )
  }
}

async function readInstalledVersion(packageName) {
  const manifest = await readJson(
    join(root, 'node_modules', ...packageName.split('/'), 'package.json'),
  ).catch((error) => {
    throw new Error(
      `cannot pin fixture dependency ${packageName}; install root dependencies first`,
      { cause: error },
    )
  })

  return manifest.version
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
        rejectPromise(new Error(
          `${command} ${arguments_.join(' ')} failed (${signal ?? code})\n${stderr}`,
        ))
      }
    })
  })
}
