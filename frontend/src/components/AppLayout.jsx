import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Activity,
  LogOut,
  Menu,
  Layers,
  Settings,
  ChevronDown,
} from 'lucide-react';

const navItems = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'projects', label: 'Projects', icon: FolderKanban },
  { page: 'team', label: 'Team', icon: Users },
  { page: 'activity', label: 'Activity', icon: Activity },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ currentPage, onNavigate, children }) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200/60">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900">
          <Layers className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">Nexus</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => {
                onNavigate(item.page);
                setMobileOpen(false);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <item.icon className={cn('h-[18px] w-[18px]', active ? 'text-white' : 'text-slate-400')} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/60 p-3">
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-100"
          >
            <Avatar name={user?.name || 'User'} src={user?.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.jobTitle || 'Team Member'}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-slate-200 bg-white shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => {
                    signOut();
                    setUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4 text-slate-400" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
        {navContent}
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:hidden animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">Nexus</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
