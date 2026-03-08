<#
.SYNOPSIS
    Alumni DB — Scaffold Generator (Structure + Dependencies)

.DESCRIPTION
    Creates the complete directory structure and package.json for the
    Alumni DB Management System based on the documented architecture.
    All source files are created as empty placeholders.

    Run from the project root:  .\scaffold.ps1

.NOTES
    SAFE — only creates NEW files/folders. Will NOT overwrite existing files.
#>

param([string]$Root = $PSScriptRoot)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Helpers ───

function New-Dir([string]$Path) {
    $full = Join-Path $Root $Path
    if (-not (Test-Path $full)) {
        New-Item -ItemType Directory -Path $full -Force | Out-Null
        Write-Host "  [DIR]  $Path" -ForegroundColor DarkCyan
    }
}

function New-File([string]$Path, [string]$Content = "") {
    $full = Join-Path $Root $Path
    $dir  = Split-Path $full -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    if (-not (Test-Path $full)) {
        [System.IO.File]::WriteAllText($full, $Content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  [FILE] $Path" -ForegroundColor Green
    }
    else {
        Write-Host "  [SKIP] $Path (exists)" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "  Alumni DB - Scaffold Generator" -ForegroundColor Cyan
Write-Host "  Root: $Root" -ForegroundColor Yellow
Write-Host ""

# ═══════════════════════════════════════════
# 1. Empty directories (with .gitkeep)
# ═══════════════════════════════════════════
Write-Host "-- Empty directories --" -ForegroundColor Magenta

$emptyDirs = @(
    "src/assets",
    "src/components/ui",
    "src/components/shared",
    "src/constants",
    "src/contexts",
    "src/utils",
    "resources"
)

foreach ($d in $emptyDirs) {
    New-Dir $d
    New-File "$d/.gitkeep"
}

# ═══════════════════════════════════════════
# 2. All project files (empty placeholders)
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "-- Root config --" -ForegroundColor Magenta

$rootConfigs = @(
    ".env.example",
    ".eslintrc.cjs",
    ".prettierrc",
    ".gitignore",
    "tsconfig.json",
    "tsconfig.renderer.json",
    "tsconfig.electron.json",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
    "electron-builder.yml",
    "index.html",
    "README.md"
)

foreach ($f in $rootConfigs) { New-File $f }

# ── Shared layer ──
Write-Host ""
Write-Host "-- Shared layer --" -ForegroundColor Magenta

$sharedFiles = @(
    "shared/ipc-channels.ts",

    "shared/schemas/alumni.schema.ts",
    "shared/schemas/login.schema.ts",
    "shared/schemas/account.schema.ts",
    "shared/schemas/settings.schema.ts",

    "shared/types/alumni.types.ts",
    "shared/types/auth.types.ts",
    "shared/types/analytics.types.ts",
    "shared/types/settings.types.ts",
    "shared/types/sync.types.ts",
    "shared/types/profiling.types.ts"
)

foreach ($f in $sharedFiles) { New-File $f }

# ── Electron main process ──
Write-Host ""
Write-Host "-- Electron main process --" -ForegroundColor Magenta

$electronFiles = @(
    # Entry
    "electron/main.ts",
    "electron/preload.ts",

    # Config
    "electron/config/constants.ts",
    "electron/config/paths.ts",
    "electron/config/env.ts",

    # Database
    "electron/database/db-manager.ts",
    "electron/database/schema.ts",
    "electron/database/alumni.repository.ts",
    "electron/database/alumni-history.repository.ts",
    "electron/database/analytics.repository.ts",
    "electron/database/settings.repository.ts",
    "electron/database/email-history.repository.ts",
    "electron/database/sync-queue.repository.ts",
    "electron/database/migrations/index.ts",

    # Services
    "electron/services/auth.service.ts",
    "electron/services/alumni.service.ts",
    "electron/services/alumni-history.service.ts",
    "electron/services/analytics.service.ts",
    "electron/services/email.service.ts",
    "electron/services/sync.service.ts",
    "electron/services/auto-sync.service.ts",
    "electron/services/conflict.service.ts",
    "electron/services/export.service.ts",
    "electron/services/settings.service.ts",

    # IPC handlers
    "electron/ipc/index.ts",
    "electron/ipc/auth.ipc.ts",
    "electron/ipc/alumni.ipc.ts",
    "electron/ipc/profiling.ipc.ts",
    "electron/ipc/analytics.ipc.ts",
    "electron/ipc/email.ipc.ts",
    "electron/ipc/sync.ipc.ts",
    "electron/ipc/export.ipc.ts",
    "electron/ipc/settings.ipc.ts",
    "electron/ipc/system.ipc.ts",

    # Integrations
    "electron/integrations/google-sheets/client.ts",
    "electron/integrations/google-sheets/sheets.adapter.ts",
    "electron/integrations/google-sheets/accounts.adapter.ts",
    "electron/integrations/google-sheets/mapper.ts",
    "electron/integrations/smtp/transport.ts",
    "electron/integrations/smtp/templates.ts",

    # Utils
    "electron/utils/logger.ts",
    "electron/utils/error-handler.ts",
    "electron/utils/crypto.ts",
    "electron/utils/network.ts",
    "electron/utils/updater.ts",

    # Types
    "electron/types/ipc.types.ts",
    "electron/types/database.types.ts",
    "electron/types/auth.types.ts"
)

foreach ($f in $electronFiles) { New-File $f }

# ── Renderer: app shell, layouts, styles ──
Write-Host ""
Write-Host "-- Renderer app shell --" -ForegroundColor Magenta

$appShellFiles = @(
    "src/main.tsx",
    "src/App.tsx",
    "src/app/router.tsx",
    "src/app/providers.tsx",
    "src/app/guards/auth-guard.tsx",
    "src/app/guards/settings-guard.tsx",
    "src/layouts/root-layout.tsx",
    "src/layouts/sidebar.tsx",
    "src/layouts/top-bar.tsx",
    "src/styles/globals.css",
    "src/styles/print.css"
)

foreach ($f in $appShellFiles) { New-File $f }

# ── Renderer: shared modules ──
Write-Host ""
Write-Host "-- Renderer shared modules --" -ForegroundColor Magenta

$sharedModules = @(
    # Data
    "src/data/ipc-client.ts",

    # Hooks
    "src/hooks/use-ipc.ts",
    "src/hooks/use-network.ts",
    "src/hooks/use-toast.ts",
    "src/hooks/use-debounce.ts",
    "src/hooks/use-auth.ts",

    # Lib
    "src/lib/template-engine.ts",
    "src/lib/formatters.ts",
    "src/lib/cn.ts",

    # Stores
    "src/stores/auth.store.ts",
    "src/stores/alumni.store.ts",
    "src/stores/profiling.store.ts",
    "src/stores/analytics.store.ts",
    "src/stores/settings.store.ts",
    "src/stores/sync.store.ts",
    "src/stores/ui.store.ts",

    # Types
    "src/types/auth.types.ts",
    "src/types/alumni.types.ts",
    "src/types/email.types.ts",
    "src/types/sync.types.ts",
    "src/types/settings.types.ts",
    "src/types/export.types.ts",
    "src/types/ipc.types.ts"
)

foreach ($f in $sharedModules) { New-File $f }

# ── Renderer: routes ──
Write-Host ""
Write-Host "-- Routes --" -ForegroundColor Magenta

$routeFiles = @(
    # Login
    "src/routes/login/index.tsx",
    "src/routes/login/-components/login-form.tsx",
    "src/routes/login/-components/lockout-timer.tsx",
    "src/routes/login/-components/offline-badge.tsx",
    "src/routes/login/-components/login-error.tsx",
    "src/routes/login/-hooks/use-login.ts",
    "src/routes/login/-hooks/use-lockout.ts",
    "src/routes/login/-hooks/use-auth-mode.ts",
    "src/routes/login/-schemas/login.schema.ts",
    "src/routes/login/-types/auth.types.ts",

    # Dashboard
    "src/routes/dashboard/index.tsx",
    "src/routes/dashboard/-components/total-responses-card.tsx",
    "src/routes/dashboard/-components/program-respondent-boxes.tsx",
    "src/routes/dashboard/-components/board-passers-card.tsx",
    "src/routes/dashboard/-components/employed-card.tsx",
    "src/routes/dashboard/-components/field-related-card.tsx",
    "src/routes/dashboard/-components/supervisory-card.tsx",
    "src/routes/dashboard/-components/survey-response-table.tsx",
    "src/routes/dashboard/-components/curriculum-relevance-table.tsx",
    "src/routes/dashboard/-components/competencies-table.tsx",
    "src/routes/dashboard/-components/advance-studies-table.tsx",
    "src/routes/dashboard/-components/employment-status-table.tsx",
    "src/routes/dashboard/-components/work-assignment-table.tsx",
    "src/routes/dashboard/-components/industry-sector-table.tsx",
    "src/routes/dashboard/-components/first-job-table.tsx",
    "src/routes/dashboard/-components/challenges-table.tsx",
    "src/routes/dashboard/-components/program-dist-chart.tsx",
    "src/routes/dashboard/-components/year-trend-chart.tsx",
    "src/routes/dashboard/-components/employment-chart.tsx",
    "src/routes/dashboard/-components/recent-activity.tsx",
    "src/routes/dashboard/-hooks/use-dashboard-stats.ts",
    "src/routes/dashboard/-hooks/use-survey-analytics.ts",
    "src/routes/dashboard/-types/analytics.types.ts",

    # Alumni
    "src/routes/alumni/index.tsx",
    "src/routes/alumni/add.tsx",
    "src/routes/alumni/edit.tsx",
    "src/routes/alumni/-components/alumni-table.tsx",
    "src/routes/alumni/-components/alumni-form.tsx",
    "src/routes/alumni/-components/alumni-form-fields.tsx",
    "src/routes/alumni/-components/delete-confirm-dialog.tsx",
    "src/routes/alumni/-components/sync-badge.tsx",
    "src/routes/alumni/-components/alumni-table-toolbar.tsx",
    "src/routes/alumni/-components/view-profile-button.tsx",
    "src/routes/alumni/-hooks/use-alumni.ts",
    "src/routes/alumni/-hooks/use-alumni-filters.ts",
    "src/routes/alumni/-hooks/use-alumni-form.ts",
    "src/routes/alumni/-schemas/alumni.schema.ts",
    "src/routes/alumni/-constants/index.ts",

    # Profiling
    "src/routes/profiling/index.tsx",
    "src/routes/profiling/profile.tsx",
    "src/routes/profiling/-components/alumni-profile-card.tsx",
    "src/routes/profiling/-components/alumni-history-timeline.tsx",
    "src/routes/profiling/-components/history-diff-viewer.tsx",
    "src/routes/profiling/-components/latest-updates-view.tsx",
    "src/routes/profiling/-components/full-history-view.tsx",
    "src/routes/profiling/-components/profile-search.tsx",
    "src/routes/profiling/-components/display-view-tabs.tsx",
    "src/routes/profiling/-hooks/use-alumni-profile.ts",
    "src/routes/profiling/-hooks/use-alumni-history.ts",
    "src/routes/profiling/-types/profiling.types.ts",

    # Email
    "src/routes/email/index.tsx",
    "src/routes/email/compose.tsx",
    "src/routes/email/history.tsx",
    "src/routes/email/received.tsx",
    "src/routes/email/-components/recipient-filter.tsx",
    "src/routes/email/-components/recipient-count.tsx",
    "src/routes/email/-components/email-composer.tsx",
    "src/routes/email/-components/gform-link-toggle.tsx",
    "src/routes/email/-components/template-var-helper.tsx",
    "src/routes/email/-components/email-preview.tsx",
    "src/routes/email/-components/send-progress.tsx",
    "src/routes/email/-components/email-history-table.tsx",
    "src/routes/email/-components/received-emails-table.tsx",
    "src/routes/email/-hooks/use-email-send.ts",
    "src/routes/email/-hooks/use-email-history.ts",
    "src/routes/email/-hooks/use-received-emails.ts",
    "src/routes/email/-hooks/use-recipients.ts",
    "src/routes/email/-schemas/email.schema.ts",

    # Sync
    "src/routes/sync/index.tsx",
    "src/routes/sync/-components/sync-actions.tsx",
    "src/routes/sync/-components/sync-status.tsx",
    "src/routes/sync/-components/sync-progress.tsx",
    "src/routes/sync/-components/pending-changes-list.tsx",
    "src/routes/sync/-components/conflict-list.tsx",
    "src/routes/sync/-components/conflict-resolver.tsx",
    "src/routes/sync/-components/network-status.tsx",
    "src/routes/sync/-components/unpushed-notification.tsx",
    "src/routes/sync/-components/auto-sync-config.tsx",
    "src/routes/sync/-hooks/use-sync.ts",
    "src/routes/sync/-hooks/use-sync-status.ts",
    "src/routes/sync/-hooks/use-conflicts.ts",
    "src/routes/sync/-hooks/use-auto-sync.ts",
    "src/routes/sync/-hooks/use-unpushed-alert.ts",
    "src/routes/sync/-types/sync.types.ts",

    # Reports
    "src/routes/reports/index.tsx",
    "src/routes/reports/-components/export-card.tsx",
    "src/routes/reports/-components/export-filter-form.tsx",
    "src/routes/reports/-components/export-progress.tsx",
    "src/routes/reports/-components/print-preview.tsx",
    "src/routes/reports/-hooks/use-export.ts",
    "src/routes/reports/-hooks/use-export-filters.ts",
    "src/routes/reports/-schemas/export-filter.schema.ts",

    # Settings
    "src/routes/settings/index.tsx",
    "src/routes/settings/-components/smtp-form.tsx",
    "src/routes/settings/-components/smtp-test-button.tsx",
    "src/routes/settings/-components/google-sheets-config.tsx",
    "src/routes/settings/-components/sheets-test-button.tsx",
    "src/routes/settings/-components/auto-sync-config.tsx",
    "src/routes/settings/-components/gform-link-config.tsx",
    "src/routes/settings/-components/sync-db-info.tsx",
    "src/routes/settings/-components/accounts-management.tsx",
    "src/routes/settings/-components/account-form-dialog.tsx",
    "src/routes/settings/-components/preferences-form.tsx",
    "src/routes/settings/-components/dark-mode-toggle.tsx",
    "src/routes/settings/-hooks/use-settings.ts",
    "src/routes/settings/-hooks/use-accounts.ts",
    "src/routes/settings/-hooks/use-dark-mode.ts",
    "src/routes/settings/-schemas/settings.schema.ts",
    "src/routes/settings/-schemas/account.schema.ts",
    "src/routes/settings/-types/settings.types.ts",

    # About
    "src/routes/about/index.tsx",
    "src/routes/about/-components/system-info-section.tsx",
    "src/routes/about/-components/core-features-section.tsx",
    "src/routes/about/-components/user-manual-section.tsx",
    "src/routes/about/-components/feature-summary-card.tsx",
    "src/routes/about/-components/manual-step.tsx",
    "src/routes/about/-components/faq-accordion.tsx",
    "src/routes/about/-hooks/use-app-version.ts"
)

foreach ($f in $routeFiles) { New-File $f }

# ═══════════════════════════════════════════
# 3. package.json (with all dependencies)
# ═══════════════════════════════════════════
Write-Host ""
Write-Host "-- package.json --" -ForegroundColor Magenta

$pkg = [ordered]@{
    name            = "alumni-db"
    version         = "0.0.0"
    private         = $true
    description     = "Alumni DB Management System"
    main            = "dist/electron/main.js"
    scripts         = [ordered]@{
        dev     = "electron-vite dev"
        build   = "electron-vite build"
        preview = "electron-vite preview"
        lint    = "eslint . --ext .ts,.tsx"
        format  = "prettier --write ."
    }
    dependencies    = [ordered]@{
        "react"                     = "^18.3.1"
        "react-dom"                 = "^18.3.1"
        "react-router-dom"          = "^6.28.0"
        "zustand"                   = "^4.5.5"
        "react-hook-form"           = "^7.54.0"
        "@hookform/resolvers"       = "^3.9.1"
        "zod"                       = "^3.24.1"
        "sql.js"                    = "^1.11.0"
        "googleapis"                = "^144.0.0"
        "nodemailer"                = "^6.9.16"
        "bcryptjs"                  = "^2.4.3"
        "jspdf"                     = "^2.5.2"
        "jspdf-autotable"           = "^3.8.4"
        "docx"                      = "^9.1.1"
        "exceljs"                   = "^4.4.0"
        "recharts"                  = "^2.15.0"
        "clsx"                      = "^2.1.1"
        "tailwind-merge"            = "^2.6.0"
        "class-variance-authority"  = "^0.7.1"
    }
    devDependencies = [ordered]@{
        "typescript"                       = "^5.7.2"
        "vite"                             = "^6.0.0"
        "@vitejs/plugin-react"             = "^4.3.4"
        "electron"                         = "^33.2.0"
        "electron-builder"                 = "^25.1.8"
        "electron-vite"                    = "^2.3.0"
        "tailwindcss"                      = "^3.4.17"
        "postcss"                          = "^8.4.49"
        "autoprefixer"                     = "^10.4.20"
        "eslint"                           = "^9.16.0"
        "@typescript-eslint/eslint-plugin" = "^8.18.0"
        "@typescript-eslint/parser"        = "^8.18.0"
        "eslint-plugin-react"              = "^7.37.2"
        "eslint-plugin-react-hooks"        = "^5.1.0"
        "eslint-config-prettier"           = "^9.1.0"
        "prettier"                         = "^3.4.2"
        "@types/react"                     = "^18.3.12"
        "@types/react-dom"                 = "^18.3.1"
        "@types/node"                      = "^22.10.1"
        "@types/bcryptjs"                  = "^2.4.6"
        "@types/nodemailer"                = "^6.4.17"
    }
}

$pkgPath = Join-Path $Root "package.json"
if (-not (Test-Path $pkgPath)) {
    $pkgJson = $pkg | ConvertTo-Json -Depth 4
    [System.IO.File]::WriteAllText($pkgPath, $pkgJson, [System.Text.UTF8Encoding]::new($false))
    Write-Host "  [FILE] package.json" -ForegroundColor Green
}
else {
    Write-Host "  [SKIP] package.json (exists)" -ForegroundColor DarkGray
}

# ═══════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════

$totalFiles = $rootConfigs.Count + $sharedFiles.Count + $electronFiles.Count +
              $appShellFiles.Count + $sharedModules.Count + $routeFiles.Count +
              $emptyDirs.Count + 1  # .gitkeep files + package.json

Write-Host ""
Write-Host "  Scaffold complete!" -ForegroundColor Green
Write-Host "  ~$totalFiles files across electron/, src/, shared/" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next: pnpm install" -ForegroundColor Yellow
Write-Host ""
