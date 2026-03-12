import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { emailService } from '../services/email.service'
import { alumniService } from '../services/alumni.service'
import { settingsService } from '../services/settings.service'

const CH = IPC_CHANNELS.EMAIL

export function registerEmailHandlers(): void {
  ipcMain.handle(CH.SEND, async (_event, payload: {
    subject: string
    body: string
    recipientFilters?: Record<string, unknown>
    recipients?: string[]
    includeGformLink?: boolean
    gformLink?: string
  }) => {
    try {
      // Resolve recipients: explicit array or query from filters
      let recipients = payload.recipients
      if (!recipients || recipients.length === 0) {
        if (payload.recipientFilters) {
          const alumni = await alumniService.getAll(payload.recipientFilters)
          recipients = alumni
            .map((a) => a.gmail_address as string)
            .filter(Boolean)
        }
      }
      if (!recipients || recipients.length === 0) {
        return { success: false, error: 'No recipients found matching the selected filters.' }
      }

      // Resolve gformLink from settings if requested
      let gformLink = payload.gformLink
      if (payload.includeGformLink && !gformLink) {
        // Use CE form URL as the default link (or pick by program filter if available)
        gformLink = settingsService.get('gform_url_ce')
          || settingsService.get('gform_url_cpe')
          || settingsService.get('gform_url_ee')
          || undefined
      }

      const result = await emailService.send({
        subject: payload.subject,
        body: payload.body,
        recipients,
        gformLink
      })
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.SEND} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_HISTORY, async () => {
    try {
      const result = emailService.getHistory()
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_HISTORY} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_RECEIVED, async () => {
    try {
      const result = emailService.getReceived()
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_RECEIVED} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.TEST_CONNECTION, async () => {
    try {
      await emailService.testConnection()
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.TEST_CONNECTION} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}
