import { emailHistoryRepository } from '../database/email-history.repository'
import { safeSave } from '../database/db-manager'
import { logger } from '../utils/logger'
import { settingsService } from './settings.service'
import { createTransport } from '../integrations/smtp/transport'

export const emailService = {
  async send(payload: {
    subject: string
    body: string
    recipients: string[]
    gformLink?: string
  }): Promise<{ sent: number; failed: number; errors: string[] }> {
    const smtpConfig = settingsService.getSmtpConfig()
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
      throw new Error('SMTP is not configured. Please configure SMTP settings first.')
    }

    const transport = createTransport(smtpConfig as { host: string; port: number; user: string; pass: string })
    const from = smtpConfig.from || smtpConfig.user

    // Append Google Form link if provided
    let body = payload.body
    if (payload.gformLink) {
      body += `\n\n---\nPlease complete the alumni survey: ${payload.gformLink}`
    }

    // Log the email before sending
    const id = emailHistoryRepository.create({
      subject: payload.subject,
      body,
      recipients: JSON.stringify(payload.recipients),
      recipientCount: payload.recipients.length,
      status: 'sending'
    })
    safeSave()

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const recipient of payload.recipients) {
      try {
        await transport.sendMail({
          from,
          to: recipient,
          subject: payload.subject,
          html: body
        })
        sent++
      } catch (error) {
        failed++
        errors.push(`${recipient}: ${(error as Error).message}`)
        logger.warn('email', `Failed to send to ${recipient}`, {
          error: (error as Error).message
        })
      }
    }

    const status = failed === 0 ? 'sent' : sent === 0 ? 'failed' : 'partial'
    emailHistoryRepository.updateStatus(
      id,
      status,
      failed > 0 ? `${failed} of ${payload.recipients.length} failed` : undefined
    )
    safeSave()

    logger.info('email', `Email sent: ${sent}/${payload.recipients.length}`, {
      subject: payload.subject
    })

    return { sent, failed, errors }
  },

  getHistory() {
    return emailHistoryRepository.getAll()
  },

  getReceived() {
    // Received emails are not tracked locally — this is a placeholder
    // for manual response logging in a future iteration
    return []
  },

  async testConnection(): Promise<void> {
    await settingsService.testSmtp()
  }
}
