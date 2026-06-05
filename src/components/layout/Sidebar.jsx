import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Receipt,
  Landmark,
  Settings,
  TrendingUp,
  X,
  CalendarDays,
} from 'lucide-react'

const menuItems = [
  { name: 'Dashboard',     path: '/dashboard',    icon: <LayoutDashboard size={20} /> },
  { name: 'Finanzas',      path: '/finanzas',     icon: <Wallet size={20} /> },
  { name: 'Tarjetas',      path: '/tarjetas',     icon: <CreditCard size={20} /> },
  { name: 'Cuotas',        path: '/cuotas',       icon: <Receipt size={20} /> },
  { name: 'Gastos Fijos',  path: '/gastos-fijos', icon: <CalendarDays size={20} /> },
  { name: 'Préstamos',     path: '/prestamos',    icon: <Landmark size={20} /> },
  { name: 'Configuración', path: '/configuracion',icon: <Settings size={20} /> },
]

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 w-72 bg-zinc-950 border-r border-zinc-800/80
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:flex md:h-auto md:min-h-screen
        `}
      >
        {/* Logo */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp size={16} className="text-black" />
              </div>
              <h1 className="text-xl font-bold text-white">Finanzas</h1>
            </div>
            <p className="text-zinc-500 text-xs ml-10">Control financiero</p>
          </div>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-zinc-500 hover:text-white transition rounded-lg hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-px bg-zinc-800/80 mx-4 mb-4" />

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium
                  ${isActive
                    ? 'bg-emerald-500 text-black'
                    : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
                  }
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom info */}
        <div className="p-4 mt-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p className="text-xs text-zinc-500 text-center">
              Control financiero personal
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
