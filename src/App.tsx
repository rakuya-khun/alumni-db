import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Providers } from './app/providers'
import { router } from './app/router'
import { useAuthStore } from './stores/auth.store'
import { useSettingsStore } from './stores/settings.store'

function AppInit() {
  const restoreSession = useAuthStore((s) => s.restoreSession)
  const loadSettings = useSettingsStore((s) => s.loadSettings)

  useEffect(() => {
    restoreSession()
    loadSettings()
  }, [restoreSession, loadSettings])

  return null
}

function App() {
  return (
    <Providers>
      <AppInit />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-surface-secondary">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-text-secondary">Loading...</p>
            </div>
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </Providers>
  )
}

export default App
