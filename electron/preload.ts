import { contextBridge, ipcRenderer } from 'electron'

// Allowed IPC channels — must match shared/ipc-channels.ts
// This allowlist prevents a compromised renderer from invoking arbitrary handlers
const ALLOWED_CHANNELS = [
  // Auth
  'auth:login', 'auth:logout', 'auth:getSession',
  'auth:getAccounts', 'auth:createAccount', 'auth:updateAccount',
  // Alumni
  'alumni:getAll', 'alumni:getById', 'alumni:create',
  'alumni:update', 'alumni:delete', 'alumni:search',
  'alumni:getSpecializations', 'alumni:getWorkRegions', 'alumni:getEmploymentPositions',
  // Analytics
  'analytics:getDashboard', 'analytics:getSurveyData', 'analytics:getWeightedMeans',
  // Profiling
  'profiling:getProfile', 'profiling:getHistory', 'profiling:getSnapshot',
  // Export
  'export:pdf', 'export:docx', 'export:excel',
  // Email
  'email:send', 'email:getHistory', 'email:getReceived', 'email:testConnection',
  // Sync
  'sync:pull', 'sync:push', 'sync:full', 'sync:getStatus',
  'sync:resolveConflict', 'sync:autoSyncStart', 'sync:autoSyncStop',
  // Settings
  'settings:get', 'settings:save', 'settings:testSmtp', 'settings:testSheets',
  // System
  'system:getVersion', 'system:getInfo'
]

function isAllowedChannel(channel: string): boolean {
  return ALLOWED_CHANNELS.includes(channel)
}

contextBridge.exposeInMainWorld('electronAPI', {
  invoke: (channel: string, ...args: unknown[]) => {
    if (!isAllowedChannel(channel)) {
      return Promise.reject(new Error(`IPC channel "${channel}" is not allowed`))
    }
    return ipcRenderer.invoke(channel, ...args)
  },
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    if (!isAllowedChannel(channel)) {
      throw new Error(`IPC channel "${channel}" is not allowed`)
    }
    const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
      callback(...args)
    ipcRenderer.on(channel, subscription)
    return () => ipcRenderer.removeListener(channel, subscription)
  }
})
