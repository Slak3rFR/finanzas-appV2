import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { useToast } from '../../contexts/ToastContext'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

const InputField = ({ label, type, value, onChange, placeholder, toggle, showPass, onToggle }) => (
  <div>
    <label className="text-zinc-400 text-sm block mb-1.5">{label}</label>
    <div className="relative">
      <input
        type={toggle && showPass ? 'text' : type}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3
          text-white text-sm focus:outline-none focus:border-emerald-500
          transition placeholder:text-zinc-600 pr-10"
      />
      {toggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
        >
          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  </div>
)

const LoginForm = () => {
  const { addToast } = useToast()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password)
        addToast('¡Cuenta creada correctamente!', 'success')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'No existe una cuenta con ese email.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-email': 'El formato del email no es válido.',
        'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/too-many-requests': 'Demasiados intentos. Intentá más tarde.',
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
      }
      addToast(messages[err.code] || 'Ocurrió un error. Intentá nuevamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

      <h2 className="text-lg font-bold mb-1">
        {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
      </h2>
      <p className="text-zinc-500 text-sm mb-6">
        {isRegister
          ? 'Completá tus datos para registrarte.'
          : 'Ingresá con tu cuenta para continuar.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="correo@ejemplo.com"
        />
        <InputField
          label="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={isRegister ? 'Mínimo 6 caracteres' : '••••••••'}
          toggle
          showPass={showPass}
          onToggle={() => setShowPass(p => !p)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60
            text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
          {loading
            ? 'Cargando...'
            : isRegister ? 'Crear cuenta' : 'Iniciar sesión'
          }
        </button>
      </form>

      <p className="text-center text-sm text-zinc-500 mt-4">
        {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
        <button
          onClick={() => setIsRegister(p => !p)}
          className="text-emerald-400 hover:text-emerald-300 font-medium transition"
        >
          {isRegister ? 'Iniciar sesión' : 'Registrarse'}
        </button>
      </p>

    </div>
  )
}

export default LoginForm
