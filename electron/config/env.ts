import { app } from 'electron'

/** True when running the packaged .exe (production) */
export function isProd(): boolean {
  return app.isPackaged
}

/** True when running via `pnpm dev` (development) */
export function isDev(): boolean {
  return !app.isPackaged
}
