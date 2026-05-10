import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, LogOut, Power, Trophy, Users, Vote } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { cn } from '../../lib/utils'
import { dataMode } from '../../services/electionService'
import { BrandLogo } from '../brand/BrandLogo'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/candidates', label: 'Candidates', icon: Vote },
  { to: '/admin/voters', label: 'Voters', icon: Users },
  { to: '/admin/control', label: 'Voting Control', icon: ListChecks },
  { to: '/admin/results', label: 'Results', icon: Trophy },
]

export function AdminShell() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-vpps-soft text-vpps-navy">
      <aside className="no-print fixed left-0 top-0 z-20 hidden h-screen w-72 flex-col border-r border-white/70 bg-vpps-navy p-5 text-white shadow-2xl lg:flex">
        <div className="flex items-center gap-3">
          <BrandLogo variant="icon" className="h-12 w-12" showFallbackText={false} />
          <div>
            <p className="text-sm font-black text-vpps-gold">VPPS</p>
            <p className="text-xs text-white/70">Election Control Room</p>
            <p className="mt-1 max-w-48 truncate text-[0.7rem] font-semibold text-white/60">
              {user?.email}
            </p>
          </div>
        </div>
        <nav className="mt-8 grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn('flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition', isActive ? 'bg-vpps-gold text-vpps-navy' : 'text-white/80 hover:bg-white/10 hover:text-white')
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <div className="mt-auto grid gap-2">
          <div
            className={cn(
              'rounded-2xl px-3 py-2 text-xs font-bold ring-1',
              dataMode.isLive ? 'bg-emerald-400/10 text-emerald-100 ring-emerald-300/20' : 'bg-orange-400/10 text-orange-100 ring-orange-300/25',
            )}
          >
            <p>Data Mode: {dataMode.label}</p>
            <p className="mt-1 font-medium opacity-75">{dataMode.warning}</p>
          </div>
          <button type="button" onClick={() => navigate('/vote')} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">
            <Power size={18} />
            Voting Screen
          </button>
          <button type="button" onClick={handleLogout} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
      <header className="no-print sticky top-0 z-10 border-b border-white/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="icon" className="h-12 w-12" showFallbackText={false} />
          <div>
            <p className="text-sm font-black">Control Room</p>
            <p className="max-w-44 truncate text-xs text-slate-500">{user?.email}</p>
            <p className={cn('mt-1 text-[0.65rem] font-bold', dataMode.isLive ? 'text-emerald-700' : 'text-orange-700')}>
              Data Mode: {dataMode.label}
            </p>
          </div>
          </div>
          <button type="button" onClick={handleLogout} className="rounded-2xl px-3 py-2 text-sm font-black text-vpps-navy hover:bg-vpps-navy/5">
            Logout
          </button>
        </div>
      </header>
      <main className="pb-24 lg:ml-72 lg:pb-0">
        <header className="no-print sticky top-0 z-10 hidden items-center justify-between border-b border-white/70 bg-white/90 px-8 py-3 shadow-sm backdrop-blur lg:flex">
          <div>
            <p className="text-sm font-black text-vpps-navy">Election Control Room</p>
            <p className="text-xs font-semibold text-slate-500">{user?.email}</p>
            <p className={cn('mt-1 text-[0.7rem] font-bold', dataMode.isLive ? 'text-emerald-700' : 'text-orange-700')}>
              Data Mode: {dataMode.label} · {dataMode.warning}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate('/vote')} className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-vpps-richGold/40 bg-white px-4 text-sm font-bold text-vpps-navy shadow-sm hover:border-vpps-richGold">
              <Power size={17} />
              Voting Screen
            </button>
            <button type="button" onClick={handleLogout} className="inline-flex min-h-10 items-center gap-2 rounded-2xl px-4 text-sm font-bold text-vpps-navy hover:bg-vpps-navy/5">
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>
        <Outlet />
      </main>
      <nav className="no-print fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-white/80 bg-white/95 px-2 py-2 shadow-2xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn('grid place-items-center gap-1 rounded-2xl px-1 py-2 text-[0.65rem] font-black', isActive ? 'bg-vpps-gold text-vpps-navy' : 'text-slate-500')}
            >
              <Icon size={18} />
              {item.label.replace('Voting ', '')}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
