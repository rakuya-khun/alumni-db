import { ipcMain, dialog, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { exportService } from '../services/export.service'

const CH = IPC_CHANNELS.EXPORT

export function registerExportHandlers(): void {
  ipcMain.handle(CH.PDF, async (_event, filters?: Record<string, unknown>) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No active window' }

      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: 'Export PDF Report',
        defaultPath: 'alumni-report.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'Export cancelled' }

      await exportService.toPdf(filePath, filters)
      return { success: true, data: filePath }
    } catch (error) {
      logger.error('ipc', `${CH.PDF} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.DOCX, async (_event, filters?: Record<string, unknown>) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No active window' }

      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: 'Export DOCX Report',
        defaultPath: 'alumni-report.docx',
        filters: [{ name: 'Word Document', extensions: ['docx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'Export cancelled' }

      await exportService.toDocx(filePath, filters)
      return { success: true, data: filePath }
    } catch (error) {
      logger.error('ipc', `${CH.DOCX} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.EXCEL, async (_event, filters?: Record<string, unknown>) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return { success: false, error: 'No active window' }

      const { canceled, filePath } = await dialog.showSaveDialog(win, {
        title: 'Export Excel Report',
        defaultPath: 'alumni-report.xlsx',
        filters: [{ name: 'Excel Spreadsheet', extensions: ['xlsx'] }]
      })
      if (canceled || !filePath) return { success: false, error: 'Export cancelled' }

      await exportService.toExcel(filePath, filters)
      return { success: true, data: filePath }
    } catch (error) {
      logger.error('ipc', `${CH.EXCEL} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}
