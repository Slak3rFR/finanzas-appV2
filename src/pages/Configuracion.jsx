import { useState } from 'react'
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Layout from '../components/layout/Layout'
import { User, Lock, LogOut, Download, Shield, ChevronRight } from 'lucide-react'
import { getFinances } from '../services/financeService'
import { getLoans } from '../services/loanService'
import { getFixedExpenses } from '../services/fixedExpenseService'
import { getInstallments } from '../services/installmentService'

const Section = ({ title, children }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
    <div className="px-5 py-4 border-b border-zinc-800">
      <h2 className="font-semibold text-white">{title}</h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
)

const Configuracion = () => {
  const { user } = useAuth()
  const { addToast } = useToast()

  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loadingPass, setLoadingPass] = useState(false)
  const [loadingExport, setLoadingExport] = useState(false)

  const handleLogout = async () => {
    await signOut(auth)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) {
      addToast('Las contraseñas no coinciden.', 'error')
      return
    }
    if (newPass.length < 6) {
      addToast('La contraseña debe tener al menos 6 caracteres.', 'error')
      return
    }
    setLoadingPass(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPass)
      addToast('Contraseña actualizada correctamente.', 'success')
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (err) {
      addToast(err.code === 'auth/wrong-password'
        ? 'Contraseña actual incorrecta.'
        : 'Error al cambiar la contraseña. Intentá nuevamente.',
        'error'
      )
    } finally {
      setLoadingPass(false)
    }
  }

  const handleExport = async () => {
    setLoadingExport(true)
    try {
      const [finances, loans, fixed, installments] = await Promise.all([
        getFinances(), getLoans(), getFixedExpenses(), getInstallments()
      ])

      const data = { finances, loans, gastosFijos: fixed, cuotas: installments }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finanzas-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      addToast('Datos exportados correctamente.', 'success')
    } catch {
      addToast('Error al exportar los datos.', 'error')
    } finally {
      setLoadingExport(false)
    }
  }

  return (
    <Layout>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-zinc-400 text-sm mt-1">Gestioná tu cuenta y preferencias.</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Perfil */}
        <Section title="Perfil">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20
              flex items-center justify-center">
              <User size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{user?.displayName || 'Usuario'}</p>
              <p className="text-zinc-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </Section>

        {/* Cambiar contraseña */}
        <Section title="Cambiar contraseña">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm block mb-1.5">Contraseña actual</label>
              <input
                type="password"
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                  text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-1.5">Nueva contraseña</label>
              <input
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                  text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5
                  text-white text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="Repetí la nueva contraseña"
              />
            </div>
            <button
              type="submit"
              disabled={loadingPass}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50
                text-black font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              {loadingPass ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </Section>

        {/* Exportar datos */}
        <Section title="Exportar datos">
          <p className="text-zinc-400 text-sm mb-4">
            Descargá todos tus datos financieros en formato JSON como respaldo.
          </p>
          <button
            onClick={handleExport}
            disabled={loadingExport}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700
              disabled:opacity-50 transition px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Download size={16} />
            {loadingExport ? 'Exportando...' : 'Descargar mis datos'}
          </button>
        </Section>

        {/* Seguridad */}
        <Section title="Seguridad">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Shield size={16} className="text-emerald-400 shrink-0" />
            <p>Tus datos se almacenan de forma segura en Firebase. Cada usuario solo puede ver sus propios datos.</p>
          </div>
        </Section>

        {/* Cerrar sesión */}
        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between bg-red-500/10 hover:bg-red-500/20
              border border-red-500/20 text-red-400 transition px-5 py-4 rounded-2xl"
          >
            <span className="font-medium">Cerrar sesión</span>
            <div className="flex items-center gap-2">
              <LogOut size={16} />
            </div>
          </button>
        </div>

      </div>
    </Layout>
  )
}

export default Configuracion
