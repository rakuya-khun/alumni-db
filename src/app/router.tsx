import { createHashRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './guards/auth-guard'
import { SettingsGuard } from './guards/settings-guard'
import { RootLayout } from '../layouts/root-layout'

// Lazy-load route pages — react-router lazy expects { Component }
const lazyPage = (imp: Promise<{ default: React.ComponentType }>) =>
  imp.then((m) => ({ Component: m.default }))

const LoginPage = () => lazyPage(import('../routes/login/index'))
const DashboardPage = () => lazyPage(import('../routes/dashboard/index'))
const AlumniDirectoryPage = () => lazyPage(import('../routes/alumni/index'))
const AlumniAddPage = () => lazyPage(import('../routes/alumni/add'))
const AlumniEditPage = () => lazyPage(import('../routes/alumni/edit'))
const ProfilingListPage = () => lazyPage(import('../routes/profiling/index'))
const ProfileDetailPage = () => lazyPage(import('../routes/profiling/profile'))
const SyncPage = () => lazyPage(import('../routes/sync/index'))
const EmailHubPage = () => lazyPage(import('../routes/email/index'))
const EmailComposePage = () => lazyPage(import('../routes/email/compose'))
const EmailHistoryPage = () => lazyPage(import('../routes/email/history'))
const EmailReceivedPage = () => lazyPage(import('../routes/email/received'))
const ReportsPage = () => lazyPage(import('../routes/reports/index'))
const SettingsPage = () => lazyPage(import('../routes/settings/index'))
const HelpPage = () => lazyPage(import('../routes/help/index'))
const AboutPage = () => lazyPage(import('../routes/about/index'))

export const router = createHashRouter([
  {
    path: '/login',
    lazy: LoginPage,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <SettingsGuard />,
        children: [
          {
            element: <RootLayout />,
            children: [
              { index: true, lazy: DashboardPage },
              { path: 'alumni', lazy: AlumniDirectoryPage },
              { path: 'alumni/add', lazy: AlumniAddPage },
              { path: 'alumni/edit/:id', lazy: AlumniEditPage },
              { path: 'profiling', lazy: ProfilingListPage },
              { path: 'profiling/:id', lazy: ProfileDetailPage },
              { path: 'sync', lazy: SyncPage },
              { path: 'email', lazy: EmailHubPage },
              { path: 'email/compose', lazy: EmailComposePage },
              { path: 'email/history', lazy: EmailHistoryPage },
              { path: 'email/received', lazy: EmailReceivedPage },
              { path: 'reports', lazy: ReportsPage },
              { path: 'settings', lazy: SettingsPage },
              { path: 'help', lazy: HelpPage },
              { path: 'about', lazy: AboutPage },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
