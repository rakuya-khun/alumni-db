import { emailHistoryRepository } from '../database/email-history.repository'
import { safeSave } from '../database/db-manager'
import { logger } from '../utils/logger'
import { settingsService } from './settings.service'
import { createTransport } from '../integrations/smtp/transport'

function substituteVars(template: string, vars: Record<string, string> = {}): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const v = vars[key]
    return v !== undefined && v !== null ? String(v) : ''
  })
}

function toHtml(text: string): string {
  // Preserve line breaks when sending as HTML
  return text.replace(/\r\n|\r|\n/g, '<br>')
}

export const emailService = {
  async send(payload: {
    subject: string
    body: string
    recipients: Array<{ email: string; vars?: Record<string, string>; gformLink?: string }>
  }): Promise<{ sent: number; failed: number; errors: string[] }> {
    const smtpConfig = settingsService.getSmtpConfig()
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.user || !smtpConfig.pass) {
      throw new Error('SMTP is not configured. Please configure SMTP settings first.')
    }

    const transport = createTransport(smtpConfig as { host: string; port: number; user: string; pass: string })
    const from = smtpConfig.from || smtpConfig.user

    const emails = payload.recipients.map((r) => r.email)

    // Log the email before sending (store the un-substituted template body as composed)
    const id = emailHistoryRepository.create({
      subject: payload.subject,
      body: payload.body,
      recipients: JSON.stringify(emails),
      recipientCount: emails.length,
      status: 'sending'
    })
    safeSave()

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const recipient of payload.recipients) {
      const vars = recipient.vars || {}
      const personalSubject = substituteVars(payload.subject, vars)
      let personalBody = substituteVars(payload.body, vars)
      const link = recipient.gformLink
      if (link) {
        personalBody += `\n\n---\nPlease complete the alumni survey: ${link}`
      }

      try {
        await transport.sendMail({
          from,
          to: recipient.email,
          subject: personalSubject,
          html: toHtml(personalBody)
        })
        sent++
      } catch (error) {
        failed++
        errors.push(`${recipient.email}: ${(error as Error).message}`)
        logger.warn('email', `Failed to send to ${recipient.email}`, {
          error: (error as Error).message
        })
      }
    }

    const status = failed === 0 ? 'sent' : sent === 0 ? 'failed' : 'partial'
    emailHistoryRepository.updateStatus(
      id,
      status,
      failed > 0 ? `${failed} of ${emails.length} failed` : undefined
    )
    safeSave()

    logger.info('email', `Email sent: ${sent}/${emails.length}`, {
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
