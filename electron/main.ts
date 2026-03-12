import { app, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { setupErrorHandlers } from './utils/error-handler'
import { logger } from './utils/logger'
import { initDb, flushDb } from './database/db-manager'
import { registerIpcHandlers } from './ipc/index'

// Install global error handlers before anything else
setupErrorHandlers()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // sandbox: false is required for sql.js WASM loading and preload require()
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Security: prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault()
  })

  // Security: prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  // HMR for renderer in dev, file load in production
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  logger.info('app', 'Application starting')

  try {
    // Phase 3: Initialize database (load or create alumni.db)
    await initDb()
  } catch (error) {
    logger.error('app', 'Database initialization failed', {
      error: error instanceof Error ? error.message : String(error)
    })
    dialog.showErrorBox(
      'Database Error',
      'Failed to initialize the database. The application will close.\n\n' +
        (error instanceof Error ? error.message : String(error))
    )
    app.quit()
    return
  }

  // Phase 4: Register all IPC handlers
  registerIpcHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  logger.info('app', 'Application shutting down — flushing database')
  flushDb()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

