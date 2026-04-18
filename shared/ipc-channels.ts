/**
 * IPC channel name constants organized by domain.
 * Used by both main process (handlers) and renderer (invoke).
 * Must match the allowlist in electron/preload.ts.
 */
export const IPC_CHANNELS = {
  AUTH: {
    LOGIN: 'auth:login',
    LOGOUT: 'auth:logout',
    GET_SESSION: 'auth:getSession',
    GET_ACCOUNTS: 'auth:getAccounts',
    CREATE_ACCOUNT: 'auth:createAccount',
    UPDATE_ACCOUNT: 'auth:updateAccount'
  },
  ALUMNI: {
    GET_ALL: 'alumni:getAll',
    GET_BY_ID: 'alumni:getById',
    CREATE: 'alumni:create',
    UPDATE: 'alumni:update',
    DELETE: 'alumni:delete',
    SEARCH: 'alumni:search',
    GET_SPECIALIZATIONS: 'alumni:getSpecializations',
    GET_WORK_REGIONS: 'alumni:getWorkRegions',
    GET_EMPLOYMENT_POSITIONS: 'alumni:getEmploymentPositions'
  },
  ANALYTICS: {
    GET_DASHBOARD: 'analytics:getDashboard',
    GET_SURVEY_DATA: 'analytics:getSurveyData',
    GET_WEIGHTED_MEANS: 'analytics:getWeightedMeans'
  },
  PROFILING: {
    GET_PROFILE: 'profiling:getProfile',
    GET_HISTORY: 'profiling:getHistory',
    GET_SNAPSHOT: 'profiling:getSnapshot'
  },
  EXPORT: {
    PDF: 'export:pdf',
    DOCX: 'export:docx',
    EXCEL: 'export:excel',
    DASHBOARD_PDF: 'export:dashboardPdf',
    DASHBOARD_DOCX: 'export:dashboardDocx'
  },
  EMAIL: {
    SEND: 'email:send',
    GET_HISTORY: 'email:getHistory',
    GET_RECEIVED: 'email:getReceived',
    TEST_CONNECTION: 'email:testConnection'
  },
  SYNC: {
    PULL: 'sync:pull',
    PUSH: 'sync:push',
    FULL: 'sync:full',
    GET_STATUS: 'sync:getStatus',
    RESOLVE_CONFLICT: 'sync:resolveConflict',
    AUTO_SYNC_START: 'sync:autoSyncStart',
    AUTO_SYNC_STOP: 'sync:autoSyncStop'
  },
  SETTINGS: {
    GET: 'settings:get',
    SAVE: 'settings:save',
    TEST_SMTP: 'settings:testSmtp',
    TEST_SHEETS: 'settings:testSheets'
  },
  SYSTEM: {
    GET_VERSION: 'system:getVersion',
    GET_INFO: 'system:getInfo'
  }
} as const
