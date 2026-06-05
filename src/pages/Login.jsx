import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import { TrendingUp } from 'lucide-react'

const Login = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96
          bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center
            justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <TrendingUp size={28} className="text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">Finanzas</h1>
          <p className="text-zinc-400 text-sm mt-1">Control financiero personal</p>
        </div>

        <LoginForm />

      </div>
    </div>
  )
}

export default Login
