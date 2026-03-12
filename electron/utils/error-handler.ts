import { app, dialog } from 'electron'
import { logger } from './logger'
import { isProd } from '../config/env'

/**
 * Install global error handlers. Call once at startup, before any async work.
 */
export function setupErrorHandlers(): void {
  process.on('uncaughtException', (error) => {
    logger.error('uncaughtException', error.message, { stack: error.stack })
    if (isProd()) {
      dialog.showErrorBox(
        'Unexpected Error',
        'An unexpected error occurred. The application will close.\n\n' +
          'Please restart Alumni DB. If this keeps happening, contact support.'
      )
      app.quit()
    }
  })

  process.on('unhandledRejection', (reason) => {
    const message = reason instanceof Error ? reason.message : String(reason)
    const stack = reason instanceof Error ? reason.stack : undefined
    logger.error('unhandledRejection', message, { stack })
  })

  logger.info('app', 'Error handlers installed')
}
