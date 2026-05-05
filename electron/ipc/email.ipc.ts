import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { emailService } from '../services/email.service'
import { alumniService } from '../services/alumni.service'
import { settingsService } from '../services/settings.service'
import { scopeFilters } from '../utils/rbac'
import { z } from 'zod'

const emailSendSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(500),
  body: z.string().min(1, 'Body is required').max(50000),
  recipientFilters: z.record(z.unknown()).optional(),
  recipients: z.array(z.string().email()).optional(),
  recipientVars: z.record(z.string()).optional(),
  includeGformLink: z.boolean().optional(),
  gformLink: z.string().url().optional(),
})

const CH = IPC_CHANNELS.EMAIL

export function registerEmailHandlers(): void {
  ipcMain.handle(CH.SEND, async (_event, payload: Record<string, unknown>) => {
    try {
      const validated = emailSendSchema.parse(payload)

      // Resolve recipients: explicit array or query from filters
      let recipientList: Array<{ email: string; vars: Record<string, string> }> = []

      if (validated.recipients && validated.recipients.length > 0) {
        // Manual list — apply shared recipientVars to each
        const sharedVars = validated.recipientVars || {}
        recipientList = validated.recipients.map((email) => ({ email, vars: sharedVars }))
      } else if (validated.recipientFilters) {
        const scoped = scopeFilters(validated.recipientFilters)
        const alumni = await alumniService.getAll(scoped)
        recipientList = alumni
          .filter((a) => Boolean(a.gmail_address))
          .map((a) => {
            const fullName = String(a.full_name || '')
            const nameParts = fullName.trim().split(/\s+/)
            const firstName = nameParts[0] || ''
            const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''
            return {
              email: String(a.gmail_address),
              vars: {
                fullName,
                firstName,
                lastName,
                program: String(a.program || ''),
                yearGraduated: String(a.year_graduated ?? ''),
                gmailAddress: String(a.gmail_address)
              }
            }
          })
      }

      if (recipientList.length === 0) {
        return { success: false, error: 'No recipients found matching the selected filters.' }
      }

      // Resolve per-recipient gform link by program if requested
      let recipientsWithLinks: Array<{ email: string; vars: Record<string, string>; gformLink?: string }> = recipientList

      if (validated.includeGformLink) {
        const urlCe = (settingsService.get('gform_url_ce') || '').trim()
        const urlCpe = (settingsService.get('gform_url_cpe') || '').trim()
        const urlEe = (settingsService.get('gform_url_ee') || '').trim()

        // If user supplied an explicit link in payload, that wins for everyone
        const explicit = validated.gformLink

        if (!explicit && !urlCe && !urlCpe && !urlEe) {
          return {
            success: false,
            error: 'Google Form link is enabled, but no Google Form URL is configured. Please set the URLs in Settings → Google Sheets, or uncheck "Include Google Form link in email".'
          }
        }

        // Pick a fallback URL for unknown/missing programs (any configured URL)
        const fallback = explicit || urlCe || urlCpe || urlEe || undefined

        recipientsWithLinks = recipientList.map((r) => {
          if (explicit) return { ...r, gformLink: explicit }
          const program = String(r.vars.program || '').trim()
          let link: string | undefined
          if (program === 'BSCE') link = urlCe || fallback
          else if (program === 'BSCpE') link = urlCpe || fallback
          else if (program === 'BSEE') link = urlEe || fallback
          else link = fallback
          return { ...r, gformLink: link }
        })
      }

      const result = await emailService.send({
        subject: validated.subject,
        body: validated.body,
        recipients: recipientsWithLinks
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
