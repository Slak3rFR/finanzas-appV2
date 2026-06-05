import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Landmark,
  Menu,
} from 'lucide-react'

const bottomItems = [
  { name: 'Inicio',    path: '/dashboard', icon: <LayoutDashboard size={22} /> },
  { name: 'Finanzas', path: '/finanzas',  icon: <Wallet size={22} /> },
  { name: 'Cuotas',   path: '/cuotas',    icon: <Receipt size={22} /> },
  { name: 'Préstamos',path: '/prestamos', icon: <Landmark size={22} /> },
]

const BottomNav = ({ onMenuOpen }) => {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30
      bg-zinc-950 border-t border-zinc-800/80 flex items-stretch">

      {bottomItems.map(item => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-1
              transition-colors text-xs font-medium
              ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`}
          >
            <span className={isActive
              ? 'text-emerald-400'
              : 'text-zinc-500'}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        )
      })}

      {/* More / Menu button */}
      <button
        onClick={onMenuOpen}
        className="flex-1 flex flex-col items-center justify-center py-2 gap-1
          text-zinc-500 hover:text-white transition-colors text-xs font-medium"
      >
        <Menu size={22} />
        <span>Menú</span>
      </button>

    </nav>
  )
}

export default BottomNav
