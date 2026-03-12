import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserSearch,
  RefreshCw,
  Mail,
  FileBarChart,
  Settings,
  HelpCircle,
  Info,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useUIStore } from '../stores/ui.store'
import { useAuthStore } from '../stores/auth.store'
import { useSyncStore } from '../stores/sync.store'

const NAV_GROUPS = [
  {
    label: 'MENU',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'ALUMNI',
    items: [
      { to: '/alumni', icon: Users, label: 'Directory' },
      { to: '/profiling', icon: UserSearch, label: 'Profiling' },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/sync', icon: RefreshCw, label: 'Data Sync', badge: true },
      { to: '/email', icon: Mail, label: 'Email' },
      { to: '/reports', icon: FileBarChart, label: 'Reports' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/help', icon: HelpCircle, label: 'Help' },
      { to: '/about', icon: Info, label: 'About' },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { logout } = useAuthStore()
  const { status } = useSyncStore()
  const pendingCount = status?.pendingCount ?? 0

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-card-border bg-sidebar-bg transition-all duration-200',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo area */}
      <div className="flex h-16 items-center border-b border-card-border px-4">
        {!sidebarCollapsed && (
          <span className="text-lg font-bold text-sidebar-text-active">Alumni DB</span>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-text hover:bg-sidebar-hover',
            sidebarCollapsed ? 'mx-auto' : 'ml-auto'
          )}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
                {group.label}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to)

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-sidebar-accent-bg/20 text-sidebar-text-active font-semibold'
                          : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active',
                        sidebarCollapsed && 'justify-center px-0'
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon size={20} className="shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="flex-1">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.badge && pendingCount > 0 && (
                        <span className="rounded-full bg-warning px-2 py-0.5 text-xs font-bold text-gray-900">
                          {pendingCount}
                        </span>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout button */}
      <div className="border-t border-card-border p-3">
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-text transition-colors hover:bg-error/10 hover:text-error',
            sidebarCollapsed && 'justify-center px-0'
          )}
          title="Log out"
        >
          <LogOut size={20} className="shrink-0" />
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
