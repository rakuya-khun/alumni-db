export interface IpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type { ElectronAPI } from './electron.d'
