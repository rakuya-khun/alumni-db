import { useSettings } from './-hooks/use-settings'
import { useAuth } from '@/hooks/use-auth'
import { useSettingsStore } from '@/stores/settings.store'
import { useNavigate } from 'react-router-dom'
import { SmtpForm } from './-components/smtp-form'
import { GoogleSheetsConfig } from './-components/google-sheets-config'
import { SyncDbInfo } from './-components/sync-db-info'
import { AutoSyncConfig } from './-components/auto-sync-config'
import { AccountsManagement } from './-components/accounts-management'
import { PreferencesForm } from './-components/preferences-form'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const { config, isConfigured, loading, save, testSmtp, testSheets } = useSettings()
  const { role } = useAuth()
  const isDean = role === 'Dean'
  const skipConfig = useSettingsStore((s) => s.skipConfig)
  const navigate = useNavigate()

  const [autoSyncEnabled, setAutoSyncEnabled] = useState(config.auto_sync_enabled === 'true')
  const [syncInterval, setSyncInterval] = useState(Number(config.auto_sync_interval) || 30)

  const handleSaveAutoSync = async (enabled: boolean, interval: number) => {
    setAutoSyncEnabled(enabled)
    setSyncInterval(interval)
    await save({ auto_sync_enabled: String(enabled), auto_sync_interval: String(interval) })
  }

  // Only show full-page loader on initial load when we have no config yet
  const hasConfig = Object.keys(config).length > 0
  if (loading && !hasConfig) {
    return <p className="text-sm text-text-secondary">Loading settings...</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary">Configure the application</p>
      </div>

      {!isConfigured && isDean && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              Google Sheets is not configured yet.
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Data Sync, Account Management, and other core features require the Google Sheets connection.
              Please configure it below to get started.
            </p>
          </div>
          <button
            onClick={() => {
              skipConfig()
              navigate('/')
            }}
            className="shrink-0 rounded-lg border border-card-border bg-card px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            Skip for now
          </button>
        </div>
      )}

      {isDean && (
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <SmtpForm config={config} onSave={save} onTestSmtp={testSmtp} />
        </div>
      )}

      {isDean && (
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <GoogleSheetsConfig config={config} onSave={save} onTestSheets={testSheets} />
        </div>
      )}

      {isDean && (
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <SyncDbInfo config={config} />
          <div className="mt-6 border-t border-card-border pt-6">
            <AutoSyncConfig
              enabled={autoSyncEnabled}
              interval={syncInterval}
              onToggle={(e) => handleSaveAutoSync(e, syncInterval)}
              onIntervalChange={(i) => handleSaveAutoSync(autoSyncEnabled, i)}
            />
          </div>
        </div>
      )}

      {isDean && (
        <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
          <AccountsManagement />
        </div>
      )}

      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <PreferencesForm />
      </div>
    </div>
  )
}
