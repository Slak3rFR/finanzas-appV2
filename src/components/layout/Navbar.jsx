import { Menu, Bell, LogOut } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuth()

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-xl
      flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">

      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-800
            rounded-lg transition"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:block">
          <h2 className="text-base font-semibold text-white">Panel financiero</h2>
        </div>

        {/* Mobile: show brand */}
        <div className="md:hidden">
          <h2 className="text-base font-bold text-white">Finanzas</h2>
        </div>
      </div>

      {/* Right: user info + actions */}
      <div className="flex items-center gap-2">

        {/* User email (desktop only) */}
        {user?.email && (
          <span className="hidden md:block text-xs text-zinc-500 mr-2">
            {user.email}
          </span>
        )}

        <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800
          rounded-lg transition relative">
          <Bell size={18} />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700
            transition px-3 py-2 rounded-xl text-sm font-medium text-white"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">Salir</span>
        </button>

      </div>
    </header>
  )
}

export default Navbar
