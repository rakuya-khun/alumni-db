import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { TopBar } from './top-bar'
import { cn } from '../lib/cn'
import { useUIStore } from '../stores/ui.store'
import { ToastContainer } from '../components/shared/toast-container'

export function RootLayout() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="min-h-screen bg-surface-secondary">
      <Sidebar />
      <TopBar />
      <main
        className={cn(
          'pt-16 transition-all duration-200',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}
