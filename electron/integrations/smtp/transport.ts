import * as nodemailer from 'nodemailer'
import { logger } from '../../utils/logger'

interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
}

/**
 * Create a nodemailer transport from SMTP settings.
 */
export function createTransport(config: SmtpConfig): nodemailer.Transporter {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass
    },
    tls: {
      rejectUnauthorized: true
    }
  })

  logger.info('smtp', `Transport created: ${config.host}:${config.port}`)
  return transport
}
