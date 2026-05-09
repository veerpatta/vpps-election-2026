import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListChecks, LogOut, Power, Trophy, Users, Vote } from 'lucide-react'
import { useAuth } from '../../context/auth'
import { cn } from '../../lib/utils'
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
  const { logout } = useAuth()

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
              <p className="text-xs text-slate-500">VPPS Election 2026</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="rounded-2xl px-3 py-2 text-sm font-black text-vpps-navy hover:bg-vpps-navy/5">
            Logout
          </button>
        </div>
      </header>
      <main className="pb-24 lg:ml-72 lg:pb-0">
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
