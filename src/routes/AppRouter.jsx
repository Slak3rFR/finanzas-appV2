import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import Login from '../pages/Login'
import Dashboard from '../pages/Dashboard'
import Finanzas from '../pages/Finanzas'
import Tarjetas from '../pages/Tarjetas'
import Cuotas from '../pages/Cuotas'
import GastosFijos from '../pages/GastosFijos'
import Prestamos from '../pages/Prestamos'
import Configuracion from '../pages/Configuracion'

const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/" replace />
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/finanzas" element={<PrivateRoute><Finanzas /></PrivateRoute>} />
        <Route path="/tarjetas" element={<PrivateRoute><Tarjetas /></PrivateRoute>} />
        <Route path="/cuotas" element={<PrivateRoute><Cuotas /></PrivateRoute>} />
        <Route path="/gastos-fijos" element={<PrivateRoute><GastosFijos /></PrivateRoute>} />
        <Route path="/prestamos" element={<PrivateRoute><Prestamos /></PrivateRoute>} />
        <Route path="/configuracion" element={<PrivateRoute><Configuracion /></PrivateRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
