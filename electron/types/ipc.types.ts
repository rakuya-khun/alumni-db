export interface IpcResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type IpcHandler<TPayload = unknown, TResult = unknown> = (
  event: Electron.IpcMainInvokeEvent,
  payload: TPayload
) => Promise<IpcResponse<TResult>>
