import { useState } from 'react'
import { useToast } from '../../contexts/ToastContext'
import { PlusCircle } from 'lucide-react'

const CATEGORIES = [
  'Alimentación', 'Transporte', 'Salud', 'Educación',
  'Entretenimiento', 'Hogar', 'Ropa', 'Tecnología', 'Otros',
]

const FinanceForm = ({ onAdd }) => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: 'Gasto',
    description: '',
    amount: '',
    category: 'Otros',
    date: new Date().toISOString().split('T')[0],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description || !form.amount || !form.date) {
      addToast('Completá todos los campos.', 'error')
      return
    }
    setLoading(true)
    try {
      await onAdd({ ...form, amount: Number(form.amount) })
      addToast(`${form.type} registrado correctamente.`, 'success')
      setForm(prev => ({ ...prev, description: '', amount: '' }))
    } catch {
      addToast('Error al guardar. Intentá nuevamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const label = 'text-zinc-400 text-xs font-medium block mb-1.5'
  const input = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
      <h2 className="font-semibold mb-4">Nuevo movimiento</h2>

      <form onSubmit={handleSubmit}>

        {/* Tipo */}
        <div className="flex gap-2 mb-4">
          {['Gasto', 'Ingreso'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(prev => ({ ...prev, type: t }))}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition
                ${form.type === t
                  ? t === 'Ingreso'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-red-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Descripción</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ej: Supermercado"
              className={input}
            />
          </div>

          <div>
            <label className={label}>Monto ($)</label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0"
              className={input}
            />
          </div>

          {form.type === 'Gasto' && (
            <div>
              <label className={label}>Categoría</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={input}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={label}>Fecha</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className={input}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60
            text-black font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          <PlusCircle size={17} />
          {loading ? 'Guardando...' : 'Agregar movimiento'}
        </button>

      </form>
    </div>
  )
}

export default FinanceForm
