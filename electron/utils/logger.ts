import { appendFileSync, statSync, renameSync } from 'fs'
import { getLogPath } from '../config/paths'
import { LOG_MAX_SIZE_BYTES } from '../config/constants'

type LogLevel = 'INFO' | 'WARN' | 'ERROR'

function formatTimestamp(): string {
  return new Date().toISOString()
}

function rotateIfNeeded(logPath: string): void {
  try {
    const stats = statSync(logPath)
    if (stats.size >= LOG_MAX_SIZE_BYTES) {
      renameSync(logPath, logPath + '.old')
    }
  } catch {
    // File doesn't exist yet — nothing to rotate
  }
}

function write(level: LogLevel, category: string, message: string, meta?: unknown): void {
  const logPath = getLogPath()
  rotateIfNeeded(logPath)

  const entry = {
    timestamp: formatTimestamp(),
    level,
    category,
    message,
    ...(meta !== undefined ? { meta } : {})
  }

  try {
    appendFileSync(logPath, JSON.stringify(entry) + '\n', 'utf-8')
  } catch {
    // Last resort: write to stderr if log file fails
    console.error(`[${level}] ${category}: ${message}`)
  }
}

export const logger = {
  info(category: string, message: string, meta?: unknown): void {
    write('INFO', category, message, meta)
  },

  warn(category: string, message: string, meta?: unknown): void {
    write('WARN', category, message, meta)
  },

  error(category: string, message: string, meta?: unknown): void {
    write('ERROR', category, message, meta)
    // Also print errors to console during development
    console.error(`[ERROR] ${category}: ${message}`, meta ?? '')
  }
}
