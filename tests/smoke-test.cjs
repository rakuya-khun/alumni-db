/**
 * Smoke test: Validates the entire project setup
 * Run: node tests/smoke-test.cjs
 */

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
let passed = 0
let failed = 0
const issues = []

function check(name, condition, fix) {
  if (condition) {
    console.log(`  ✅ ${name}`)
    passed++
  } else {
    console.log(`  ❌ ${name}`)
    if (fix) issues.push({ name, fix })
    failed++
  }
}

function fileExists(rel) {
  return fs.existsSync(path.join(root, rel))
}

function fileNotEmpty(rel) {
  const p = path.join(root, rel)
  return fs.existsSync(p) && fs.statSync(p).size > 0
}

function fileContains(rel, text) {
  const p = path.join(root, rel)
  if (!fs.existsSync(p)) return false
  return fs.readFileSync(p, 'utf-8').includes(text)
}

// ─── 1. Critical Files ───
console.log('\n🔍 1. Critical files exist and have content\n')

const criticalFiles = [
  'package.json',
  'electron.vite.config.ts',
  'tsconfig.json',
  'tsconfig.renderer.json',
  'tsconfig.electron.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'electron-builder.yml',
  'index.html',
  '.gitignore',
  '.prettierrc',
  'electron/main.ts',
  'electron/preload.ts',
  'src/main.tsx',
  'src/App.tsx',
  'src/styles/globals.css',
  'src/vite-env.d.ts'
]

for (const f of criticalFiles) {
  check(f, fileNotEmpty(f), `File ${f} is missing or empty`)
}

// ─── 2. Package.json validation ───
console.log('\n🔍 2. package.json validation\n')

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))

check('main field points to out/', pkg.main && pkg.main.includes('out/'), 'Set "main": "./out/main/index.js"')
check('has dev script', !!pkg.scripts?.dev, 'Add dev script')
check('has build script', !!pkg.scripts?.build, 'Add build script')
check('has build:exe script', !!pkg.scripts?.['build:exe'], 'Add build:exe script')
check('dev uses electron-vite', pkg.scripts?.dev?.includes('electron-vite'), 'Use electron-vite in dev script')
check('build:exe uses electron-builder', pkg.scripts?.['build:exe']?.includes('electron-builder'), 'Use electron-builder in build:exe')

// ─── 3. Core dependencies ───
console.log('\n🔍 3. Core dependencies present\n')

const requiredDeps = ['react', 'react-dom', 'sql.js', 'zod', 'zustand', 'react-router-dom']
const requiredDevDeps = ['electron', 'electron-vite', 'electron-builder', 'vite', 'typescript', 'tailwindcss']

for (const d of requiredDeps) {
  check(`dep: ${d}`, !!pkg.dependencies?.[d], `Add ${d} to dependencies`)
}
for (const d of requiredDevDeps) {
  check(`devDep: ${d}`, !!pkg.devDependencies?.[d], `Add ${d} to devDependencies`)
}

// ─── 4. node_modules installed ───
console.log('\n🔍 4. node_modules installed\n')

check('node_modules exists', fileExists('node_modules'), 'Run: pnpm install')
check('electron binary', fileExists('node_modules/electron/dist'), 'Run: pnpm rebuild')
check('sql-wasm.wasm exists', fileExists('node_modules/sql.js/dist/sql-wasm.wasm'), 'Run: pnpm install')

// ─── 5. Config file content checks ───
console.log('\n🔍 5. Config content validation\n')

check(
  'electron.vite.config has 3 targets',
  fileContains('electron.vite.config.ts', 'main:') &&
  fileContains('electron.vite.config.ts', 'preload:') &&
  fileContains('electron.vite.config.ts', 'renderer:'),
  'electron.vite.config.ts must define main, preload, and renderer'
)

check(
  'electron-builder includes renderer files',
  !fileContains('electron-builder.yml', '!out/renderer'),
  'Remove "!out/renderer/**/*" from electron-builder.yml files — renderer is needed in production'
)

check(
  'index.html has root div',
  fileContains('index.html', 'id="root"'),
  'index.html needs <div id="root"></div>'
)

check(
  'index.html loads main.tsx',
  fileContains('index.html', 'src/main.tsx'),
  'index.html needs <script type="module" src="/src/main.tsx">'
)

check(
  'tailwind darkMode: class',
  fileContains('tailwind.config.ts', "darkMode: 'class'"),
  'tailwind.config.ts needs darkMode: "class"'
)

check(
  'globals.css has tailwind directives',
  fileContains('src/styles/globals.css', '@tailwind base'),
  'globals.css needs @tailwind base/components/utilities'
)

check(
  'preload uses contextBridge',
  fileContains('electron/preload.ts', 'contextBridge'),
  'preload.ts must use contextBridge for secure IPC'
)

check(
  'main.ts has contextIsolation: true',
  fileContains('electron/main.ts', 'contextIsolation: true'),
  'main.ts must set contextIsolation: true for security'
)

check(
  'main.ts has nodeIntegration: false',
  fileContains('electron/main.ts', 'nodeIntegration: false'),
  'main.ts must set nodeIntegration: false for security'
)

check(
  'tsconfig.renderer includes src and shared',
  fileContains('tsconfig.renderer.json', '"src"') &&
  fileContains('tsconfig.renderer.json', '"shared"'),
  'tsconfig.renderer.json must include "src" and "shared"'
)

check(
  'tsconfig.electron includes electron + shared',
  fileContains('tsconfig.electron.json', '"electron"') &&
  fileContains('tsconfig.electron.json', '"shared"'),
  'tsconfig.electron.json must include "electron" and "shared"'
)

// ─── 6. Key implementation checks ───
console.log('\n🔍 6. Key implementation checks\n')

check(
  'main.ts calls initDb',
  fileContains('electron/main.ts', 'initDb'),
  'main.ts must call initDb() during startup'
)

check(
  'main.ts calls registerIpcHandlers',
  fileContains('electron/main.ts', 'registerIpcHandlers'),
  'main.ts must call registerIpcHandlers()'
)

check(
  'ipc-channels.ts exports IPC_CHANNELS',
  fileContains('shared/ipc-channels.ts', 'IPC_CHANNELS'),
  'shared/ipc-channels.ts must export IPC_CHANNELS'
)

check(
  'router.tsx exports router',
  fileContains('src/app/router.tsx', 'export') && fileContains('src/app/router.tsx', 'createHashRouter'),
  'src/app/router.tsx must export a router created with createHashRouter'
)

const storeFiles = [
  'src/stores/auth.store.ts',
  'src/stores/alumni.store.ts',
  'src/stores/analytics.store.ts',
  'src/stores/profiling.store.ts',
  'src/stores/settings.store.ts',
  'src/stores/sync.store.ts',
  'src/stores/ui.store.ts'
]

for (const s of storeFiles) {
  check(`store: ${s}`, fileNotEmpty(s), `Store ${s} is empty — implement it`)
}

const routeDirs = [
  'src/routes/login',
  'src/routes/dashboard',
  'src/routes/alumni',
  'src/routes/profiling',
  'src/routes/sync',
  'src/routes/email',
  'src/routes/reports',
  'src/routes/settings',
  'src/routes/help',
  'src/routes/about'
]

for (const r of routeDirs) {
  const idx = path.join(r, 'index.tsx')
  check(`route: ${idx}`, fileNotEmpty(idx), `Route page ${idx} is empty — implement it`)
}

// ─── 9. PEO wiring ───
console.log('\n🔍 9. PEO wiring\n')

const peoFiles = [
  'shared/types/peo.types.ts',
  'shared/schemas/peo.schema.ts',
  'electron/database/peo.repository.ts',
  'electron/services/peo.service.ts',
  'electron/ipc/peo.ipc.ts',
  'src/stores/peo.store.ts',
  'src/routes/dashboard/-hooks/use-peo.ts',
  'src/routes/dashboard/-components/peo/peo-cards-row.tsx',
  'src/routes/dashboard/-components/peo/peo-accordion.tsx',
  'src/routes/dashboard/-components/peo/peo-filters.tsx',
  'src/routes/dashboard/-components/peo/peo-tabs.tsx',
  'src/routes/dashboard/-components/peo/peo-tab-content.tsx',
  'src/routes/dashboard/-components/peo/peo-stat-card.tsx',
  'src/routes/dashboard/-components/peo/peo-indicator-row.tsx',
  'src/routes/dashboard/-components/peo/cohort-card.tsx',
  'src/routes/dashboard/-components/peo/data-fields-used.tsx',
  'src/routes/dashboard/-components/peo/processing-logic.tsx',
  'src/routes/dashboard/-components/peo/insufficient-data-badge.tsx',
]
for (const f of peoFiles) {
  check(`peo: ${f}`, fileNotEmpty(f), `PEO file ${f} missing or empty`)
}

check(
  'ipc-channels has PEO group',
  fileContains('shared/ipc-channels.ts', 'PEO:') &&
    fileContains('shared/ipc-channels.ts', "'peo:compute'") &&
    fileContains('shared/ipc-channels.ts', "'peo:getOutcomeRates'"),
  'shared/ipc-channels.ts must declare PEO.COMPUTE and PEO.GET_OUTCOME_RATES'
)

check(
  'preload allowlist includes PEO channels',
  fileContains('electron/preload.ts', "'peo:compute'") &&
    fileContains('electron/preload.ts', "'peo:getOutcomeRates'"),
  'electron/preload.ts ALLOWED_CHANNELS must include peo:compute and peo:getOutcomeRates'
)

check(
  'preload allowlist includes PEO export channels',
  fileContains('electron/preload.ts', "'export:peoPdf'") &&
    fileContains('electron/preload.ts', "'export:peoDocx'"),
  'electron/preload.ts ALLOWED_CHANNELS must include export:peoPdf and export:peoDocx'
)

check(
  'ipc index registers PEO handlers',
  fileContains('electron/ipc/index.ts', 'registerPeoHandlers'),
  'electron/ipc/index.ts must call registerPeoHandlers()'
)

check(
  'ipc-client exposes peo namespace',
  fileContains('src/data/ipc-client.ts', 'peo:') &&
    fileContains('src/data/ipc-client.ts', 'compute') &&
    fileContains('src/data/ipc-client.ts', 'getOutcomeRates'),
  'src/data/ipc-client.ts must expose peo.compute and peo.getOutcomeRates'
)

check(
  'ipc-client exposes peo export methods',
  fileContains('src/data/ipc-client.ts', 'peoPdf') &&
    fileContains('src/data/ipc-client.ts', 'peoDocx'),
  'src/data/ipc-client.ts must expose export.peoPdf and export.peoDocx'
)

check(
  'export service has PEO methods',
  fileContains('electron/services/export.service.ts', 'peoToPdf') &&
    fileContains('electron/services/export.service.ts', 'peoToDocx'),
  'electron/services/export.service.ts must implement peoToPdf and peoToDocx'
)

check(
  'export ipc registers PEO handlers',
  fileContains('electron/ipc/export.ipc.ts', 'PEO_PDF') &&
    fileContains('electron/ipc/export.ipc.ts', 'PEO_DOCX'),
  'electron/ipc/export.ipc.ts must register PEO_PDF and PEO_DOCX handlers'
)

check(
  'dashboard page integrates PEO',
  fileContains('src/routes/dashboard/index.tsx', 'PeoCardsRow') &&
    fileContains('src/routes/dashboard/index.tsx', 'PeoAccordion'),
  'src/routes/dashboard/index.tsx must render PeoCardsRow and PeoAccordion'
)

check(
  'reports page has PEO export cards',
  fileContains('src/routes/reports/index.tsx', 'peo-pdf') &&
    fileContains('src/routes/reports/index.tsx', 'peo-docx'),
  'src/routes/reports/index.tsx must include peo-pdf and peo-docx export cards'
)

check(
  'use-export hook handles peo formats',
  fileContains('src/routes/reports/-hooks/use-export.ts', "'peo-pdf'") &&
    fileContains('src/routes/reports/-hooks/use-export.ts', "'peo-docx'"),
  'src/routes/reports/-hooks/use-export.ts ExportFormat union must include peo-pdf and peo-docx'
)

check(
  'preload PEO and export PEO channels documented',
  fileContains('shared/ipc-channels.ts', 'PEO_PDF') &&
    fileContains('shared/ipc-channels.ts', 'PEO_DOCX'),
  'shared/ipc-channels.ts EXPORT group must declare PEO_PDF and PEO_DOCX'
)

// ─── 7. Build output check ───
console.log('\n🔍 7. Build output (run pnpm build first)\n')

check('out/main/index.js', fileExists('out/main/index.js'), 'Run: pnpm build')
check('out/preload/index.js', fileExists('out/preload/index.js'), 'Run: pnpm build')
check('out/renderer/index.html', fileExists('out/renderer/index.html'), 'Run: pnpm build')

if (fileExists('out/main/index.js')) {
  const mainOut = fs.readFileSync(path.join(root, 'out/main/index.js'), 'utf-8')
  check(
    'built main loads renderer/index.html',
    mainOut.includes('../renderer/index.html'),
    'main.ts production path must point to ../renderer/index.html'
  )
}

// ─── 8. Project structure ───
console.log('\n🔍 8. Project structure\n')

const requiredDirs = [
  'electron',
  'electron/database',
  'electron/services',
  'electron/ipc',
  'electron/integrations',
  'electron/utils',
  'electron/config',
  'src/routes',
  'src/stores',
  'src/hooks',
  'src/styles',
  'src/components',
  'shared',
  'shared/types',
  'shared/schemas'
]

for (const d of requiredDirs) {
  check(`dir: ${d}/`, fs.existsSync(path.join(root, d)) && fs.statSync(path.join(root, d)).isDirectory(), `Create directory: ${d}`)
}

// ─── Summary ───
console.log('\n' + '═'.repeat(50))
console.log(`\n  Total: ${passed + failed} checks`)
console.log(`  ✅ Passed: ${passed}`)
console.log(`  ❌ Failed: ${failed}`)

if (issues.length > 0) {
  console.log('\n  Fixes needed:')
  for (const i of issues) {
    console.log(`    → ${i.fix}`)
  }
}

console.log('\n  Verdict: ' + (failed === 0 ? '🟢 ALL CLEAR — Template is ready' : `🔴 ${failed} issue(s) must be fixed`))
console.log()

process.exit(failed > 0 ? 1 : 0)
