import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, Users, UserPlus,
  MessageSquare, MapPin, Zap,
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/search',    icon: Search,          label: 'Find Leads'  },
  { to: '/leads',     icon: Users,           label: 'All Leads'   },
  { to: '/add',       icon: UserPlus,        label: 'Add Lead'    },
  { to: '/templates', icon: MessageSquare,   label: 'Templates'   },
]

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600
                          flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Student Lead</p>
            <p className="font-bold text-white text-sm leading-tight">Generator</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <MapPin size={12} className="text-brand-400" />
          <span className="text-xs text-gray-400">Nagpur, Maharashtra</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="glass-card p-3 rounded-xl">
          <p className="text-xs text-gray-400 font-medium">IT Courses</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {['Python', 'Java', 'Data Analytics', 'MIM', 'Web Dev'].map(c => (
              <span key={c} className="text-[10px] bg-brand-600/20 text-brand-300 px-2 py-0.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
