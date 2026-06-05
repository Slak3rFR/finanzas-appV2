import { useState } from 'react'
import { addFixedExpense } from '../../services/fixedExpenseService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { PlusCircle, CalendarDays } from 'lucide-react'

const CATEGORIES = [
  'Servicios', 'Internet/Telefonía', 'Streaming', 'Seguro',
  'Alquiler', 'Expensas', 'Gimnasio', 'Suscripción', 'Otros',
]

const FixedExpenseForm = ({ reloadExpenses }) => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Servicios',
    dueDay: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description || !form.amount) {
      addToast('Completá descripción y monto.', 'error')
      return
    }
    setLoading(true)
    try {
      await addFixedExpense({
        ...form,
        amount: Number(form.amount),
        dueDay: Number(form.dueDay) || null,
        uid: user.uid,
        createdAt: Date.now(),
      })
      addToast('Gasto fijo registrado.', 'success')
      setForm({ description: '', amount: '', category: 'Servicios', dueDay: '' })
      reloadExpenses()
    } catch {
      addToast('Error al guardar. Intentá nuevamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const label = 'text-zinc-400 text-xs font-medium block mb-1.5'
  const input = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={18} className="text-blue-400" />
        <h2 className="font-semibold">Nuevo gasto fijo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Descripción</label>
          <input name="description" value={form.description} onChange={handleChange}
            placeholder="Ej: Netflix" className={input} />
        </div>

        <div>
          <label className={label}>Categoría</label>
          <select name="category" value={form.category} onChange={handleChange} className={input}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Monto mensual ($)</label>
            <input name="amount" type="number" min="0" step="0.01" value={form.amount}
              onChange={handleChange} placeholder="0" className={input} />
          </div>
          <div>
            <label className={label}>Día de débito</label>
            <input name="dueDay" type="number" min="1" max="31" value={form.dueDay}
              onChange={handleChange} placeholder="Día" className={input} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60
            text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
          <PlusCircle size={16} />
          {loading ? 'Guardando...' : 'Agregar gasto fijo'}
        </button>
      </form>
    </div>
  )
}

export default FixedExpenseForm
