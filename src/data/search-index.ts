/**
 * Global search index — all searchable items across the entire app.
 * Each entry has a category, label, description, keywords, and a route to navigate to.
 */

export interface SearchEntry {
  id: string
  category: 'page' | 'action' | 'setting' | 'help' | 'faq' | 'troubleshoot'
  label: string
  description: string
  keywords: string
  route: string
  /** Optional hash to scroll/tab to a section (e.g., ?tab=faq) */
  query?: string
}

export const SEARCH_INDEX: SearchEntry[] = [
  // ─── Pages ───────────────────────────────────────────
  { id: 'p-dashboard', category: 'page', label: 'Dashboard', description: 'KPI statistics, charts, survey tables', keywords: 'dashboard home overview stats kpi board passers employed charts', route: '/' },
  { id: 'p-alumni', category: 'page', label: 'Alumni Directory', description: 'Browse, search, filter, and manage alumni records', keywords: 'alumni directory list table records browse filter sort search', route: '/alumni' },
  { id: 'p-alumni-add', category: 'page', label: 'Add Alumni', description: 'Create a new alumni record', keywords: 'add create new alumni record form', route: '/alumni/add' },
  { id: 'p-profiling', category: 'page', label: 'Alumni Profiling', description: 'View alumni profiles, history, and timelines', keywords: 'profiling profile history timeline updates view alumni', route: '/profiling' },
  { id: 'p-sync', category: 'page', label: 'Data Sync', description: 'Synchronize data with Google Sheets', keywords: 'sync pull push upload download google sheets synchronize data', route: '/sync' },
  { id: 'p-email', category: 'page', label: 'Email Hub', description: 'Send emails, view history, received messages', keywords: 'email send compose message hub history received', route: '/email' },
  { id: 'p-email-compose', category: 'page', label: 'Compose Email', description: 'Write and send emails to alumni', keywords: 'compose write send email alumni template', route: '/email/compose' },
  { id: 'p-email-history', category: 'page', label: 'Email History', description: 'View previously sent emails', keywords: 'email history sent log previous', route: '/email/history' },
  { id: 'p-email-received', category: 'page', label: 'Received Emails', description: 'View received email responses', keywords: 'email received inbox responses', route: '/email/received' },
  { id: 'p-reports', category: 'page', label: 'Reports & Exports', description: 'Export data to PDF, Word, or Excel', keywords: 'reports export pdf docx xlsx word excel print', route: '/reports' },
  { id: 'p-settings', category: 'page', label: 'Settings', description: 'Configure SMTP, Google Sheets, accounts, preferences', keywords: 'settings configuration preferences setup smtp google sheets accounts', route: '/settings' },
  { id: 'p-help', category: 'page', label: 'Help', description: 'User manual, FAQ, and troubleshooting guides', keywords: 'help support guide manual faq troubleshoot', route: '/help' },
  { id: 'p-about', category: 'page', label: 'About', description: 'System information, features, and version', keywords: 'about system info version features', route: '/about' },

  // ─── Actions ──────────────────────────────────────────
  { id: 'a-add-alumni', category: 'action', label: 'Add New Alumni Record', description: 'Open the form to add a new alumni', keywords: 'add new create alumni record', route: '/alumni/add' },
  { id: 'a-compose-email', category: 'action', label: 'Compose New Email', description: 'Write and send an email to alumni', keywords: 'compose write new email send', route: '/email/compose' },
  { id: 'a-export-pdf', category: 'action', label: 'Export to PDF', description: 'Generate a PDF report of alumni data', keywords: 'export pdf generate report', route: '/reports' },
  { id: 'a-export-docx', category: 'action', label: 'Export to Word', description: 'Generate a DOCX report of alumni data', keywords: 'export word docx generate report document', route: '/reports' },
  { id: 'a-export-xlsx', category: 'action', label: 'Export to Excel', description: 'Generate an Excel spreadsheet of alumni data', keywords: 'export excel xlsx spreadsheet generate', route: '/reports' },
  { id: 'a-sync-now', category: 'action', label: 'Sync Data Now', description: 'Run a full data sync with Google Sheets', keywords: 'sync now full push pull upload data', route: '/sync' },

  // ─── Settings ─────────────────────────────────────────
  { id: 's-smtp', category: 'setting', label: 'SMTP Email Configuration', description: 'Set up the email server (host, port, user, password)', keywords: 'smtp email server host port user password configuration setup', route: '/settings', query: 'section=smtp' },
  { id: 's-sheets', category: 'setting', label: 'Google Sheets Configuration', description: 'Set up spreadsheet ID and service account key', keywords: 'google sheets spreadsheet id service account key configuration setup', route: '/settings', query: 'section=sheets' },
  { id: 's-gform', category: 'setting', label: 'Google Form Link', description: 'Set the Google Form URL for alumni surveys', keywords: 'google form link url survey questionnaire', route: '/settings', query: 'section=sheets' },
  { id: 's-accounts', category: 'setting', label: 'Account Management', description: 'Create, edit, and manage user accounts', keywords: 'accounts users create edit manage dean chair password role', route: '/settings', query: 'section=accounts' },
  { id: 's-darkmode', category: 'setting', label: 'Dark Mode', description: 'Toggle between light and dark theme', keywords: 'dark mode light theme toggle appearance', route: '/settings', query: 'section=preferences' },
  { id: 's-autosync', category: 'setting', label: 'Auto-Sync Settings', description: 'Enable automatic data synchronization', keywords: 'auto sync automatic interval schedule', route: '/settings', query: 'section=sync' },
  { id: 's-preferences', category: 'setting', label: 'Preferences', description: 'Personal display preferences and theme', keywords: 'preferences display theme personal appearance', route: '/settings', query: 'section=preferences' },
  { id: 's-database', category: 'setting', label: 'Database Info', description: 'View database file, size, and backup info', keywords: 'database size file backup info storage', route: '/settings', query: 'section=sync' },

  // ─── Help / User Manual ───────────────────────────────
  { id: 'h-open-app', category: 'help', label: 'How to open the application', description: 'Find and double-click the Alumni DB icon', keywords: 'open start launch application desktop icon', route: '/help', query: 'tab=manual' },
  { id: 'h-login', category: 'help', label: 'How to log in', description: 'Enter username and password to access the system', keywords: 'login sign in username password credentials', route: '/help', query: 'tab=manual' },
  { id: 'h-dashboard', category: 'help', label: 'Using the Dashboard', description: 'View statistics, charts, and KPI summary', keywords: 'dashboard statistics charts kpi overview program filter', route: '/help', query: 'tab=manual' },
  { id: 'h-search-alumni', category: 'help', label: 'How to search alumni', description: 'Use the search bar and filters in the Directory', keywords: 'search alumni find filter directory records name', route: '/help', query: 'tab=manual' },
  { id: 'h-add-alumni', category: 'help', label: 'How to add an alumni record', description: 'Fill out the 7-section alumni form and save', keywords: 'add alumni record form create new 7 sections', route: '/help', query: 'tab=manual' },
  { id: 'h-edit-alumni', category: 'help', label: 'How to edit an alumni record', description: 'Find the record, click Edit, make changes, save', keywords: 'edit alumni record update change modify', route: '/help', query: 'tab=manual' },
  { id: 'h-profiling', category: 'help', label: 'How to view alumni profiles', description: 'Browse profiles and view history timelines', keywords: 'profiling profile view history timeline details', route: '/help', query: 'tab=manual' },
  { id: 'h-sync', category: 'help', label: 'How to sync data', description: 'Pull, push, or full sync with Google Sheets', keywords: 'sync data pull push full google sheets upload download', route: '/help', query: 'tab=manual' },
  { id: 'h-email', category: 'help', label: 'How to send emails', description: 'Compose, filter recipients, and send emails', keywords: 'send email compose recipients filter template', route: '/help', query: 'tab=manual' },
  { id: 'h-export', category: 'help', label: 'How to export reports', description: 'Generate PDF, Word, or Excel reports', keywords: 'export reports pdf word excel generate download', route: '/help', query: 'tab=manual' },
  { id: 'h-settings', category: 'help', label: 'How to configure settings', description: 'Set up SMTP, Google Sheets, and manage accounts', keywords: 'settings configure setup smtp google sheets accounts', route: '/help', query: 'tab=manual' },
  { id: 'h-dark-mode', category: 'help', label: 'How to switch dark/light mode', description: 'Use the toggle in Settings or the top bar', keywords: 'dark mode light toggle switch theme', route: '/help', query: 'tab=manual' },

  // ─── FAQ ──────────────────────────────────────────────
  { id: 'f-cant-login', category: 'faq', label: 'What if I can\'t log in?', description: 'Check username/password, wait if locked out, contact Dean', keywords: 'login fail cant locked out password wrong', route: '/help', query: 'tab=faq' },
  { id: 'f-change-password', category: 'faq', label: 'Can I change my password?', description: 'Contact the Dean — they can update it in Settings', keywords: 'change password update reset', route: '/help', query: 'tab=faq' },
  { id: 'f-offline', category: 'faq', label: 'What if the internet is down?', description: 'You can still work offline. Sync when back online', keywords: 'offline internet down no connection work', route: '/help', query: 'tab=faq' },
  { id: 'f-multiple-users', category: 'faq', label: 'Can multiple people use the app?', description: 'Yes, each on their own computer. Sync regularly', keywords: 'multiple users simultaneous concurrent', route: '/help', query: 'tab=faq' },
  { id: 'f-pending-sync', category: 'faq', label: 'What does "Pending Sync" mean?', description: 'Local changes not yet uploaded to the spreadsheet', keywords: 'pending sync meaning upload changes', route: '/help', query: 'tab=faq' },
  { id: 'f-conflict', category: 'faq', label: 'What is a sync conflict?', description: 'Same record edited in two places. Choose which to keep', keywords: 'conflict sync resolve same record edited', route: '/help', query: 'tab=faq' },
  { id: 'f-see-all-programs', category: 'faq', label: 'Why can\'t I see all programs?', description: 'Your role limits which programs you can access', keywords: 'programs access role limited cant see all', route: '/help', query: 'tab=faq' },
  { id: 'f-export-difference', category: 'faq', label: 'What\'s the difference between PDF, Word, Excel?', description: 'PDF for printing, Word for editing, Excel for data analysis', keywords: 'pdf word excel difference export format', route: '/help', query: 'tab=faq' },
  { id: 'f-data-safe', category: 'faq', label: 'Is my data safe?', description: 'Data is stored locally + backed up to Google Sheets', keywords: 'data safe secure backup local storage', route: '/help', query: 'tab=faq' },

  // ─── Troubleshooting ──────────────────────────────────
  { id: 't-no-open', category: 'troubleshoot', label: 'App doesn\'t open', description: 'Reinstall the application. Data is stored separately', keywords: 'app doesnt open start launch crash startup', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-blank-screen', category: 'troubleshoot', label: 'Blank white screen', description: 'Close and reopen. Delete cache folder if it persists', keywords: 'blank white screen empty nothing display', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-db-error', category: 'troubleshoot', label: 'Database error on startup', description: 'App will auto-recover. Restore backup if it fails', keywords: 'database error startup damaged corrupted backup', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-invalid-creds', category: 'troubleshoot', label: 'Invalid credentials error', description: 'Double-check username and password (case-sensitive)', keywords: 'invalid credentials wrong password username case sensitive', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-locked-out', category: 'troubleshoot', label: 'Account locked for 5 minutes', description: 'Wait 5 minutes after 3 failed login attempts', keywords: 'locked out 5 minutes wait failed attempts', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-deactivated', category: 'troubleshoot', label: 'Account is deactivated', description: 'Contact the Dean to reactivate your account', keywords: 'account deactivated disabled inactive dean', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-offline-login', category: 'troubleshoot', label: 'Can\'t log in offline', description: 'You must log in online at least once first', keywords: 'offline login cant no cache first time', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-sync-fail', category: 'troubleshoot', label: 'Sync keeps failing', description: 'Check internet, Sheets config, and service account permissions', keywords: 'sync fail error sheets config internet permissions', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-email-fail', category: 'troubleshoot', label: 'Emails not sending', description: 'Check SMTP settings and verify with Test button', keywords: 'email not sending smtp fail error test', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-export-fail', category: 'troubleshoot', label: 'Export not working', description: 'Check disk space and try a different format', keywords: 'export fail error pdf word excel disk space', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-slow', category: 'troubleshoot', label: 'App running slowly', description: 'Close other programs. Large datasets may take time', keywords: 'slow lag performance speed hang freeze', route: '/help', query: 'tab=troubleshoot' },
  { id: 't-dark-mode-stuck', category: 'troubleshoot', label: 'Dark mode not applying', description: 'Toggle it off and on in Settings. Restart if needed', keywords: 'dark mode stuck not working theme toggle', route: '/help', query: 'tab=troubleshoot' },
]

const CATEGORY_LABELS: Record<SearchEntry['category'], string> = {
  page: 'Pages',
  action: 'Quick Actions',
  setting: 'Settings',
  help: 'User Manual',
  faq: 'FAQ',
  troubleshoot: 'Troubleshooting',
}

export function getCategoryLabel(category: SearchEntry['category']): string {
  return CATEGORY_LABELS[category]
}
