import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import BottomNav from './BottomNav'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white overflow-hidden">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">

        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
          {children}
        </main>

      </div>

      {/* Mobile bottom navigation */}
      <BottomNav onMenuOpen={() => setSidebarOpen(true)} />

    </div>
  )
}

export default Layout
