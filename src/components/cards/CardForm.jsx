import { useState } from 'react'
import { addCard } from '../../services/cardService'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { PlusCircle, CreditCard } from 'lucide-react'

const CARD_TYPES = ['Visa', 'Mastercard', 'American Express', 'Cabal', 'Naranja', 'Otro']

const CardForm = ({ reloadCards }) => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    bank: '',
    type: 'Visa',
    creditLimit: '',
    closingDay: '',
    dueDay: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.creditLimit) {
      addToast('Completá nombre y límite de crédito.', 'error')
      return
    }
    setLoading(true)
    try {
      await addCard({
        ...form,
        creditLimit: Number(form.creditLimit),
        closingDay: Number(form.closingDay) || null,
        dueDay: Number(form.dueDay) || null,
        uid: user.uid,
        createdAt: Date.now(),
      })
      addToast('Tarjeta agregada.', 'success')
      setForm({ name: '', bank: '', type: 'Visa', creditLimit: '', closingDay: '', dueDay: '' })
      reloadCards()
    } catch {
      addToast('Error al guardar la tarjeta.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const label = 'text-zinc-400 text-xs font-medium block mb-1.5'
  const input = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={18} className="text-emerald-400" />
        <h2 className="font-semibold">Nueva tarjeta</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Nombre / Alias</label>
          <input name="name" value={form.name} onChange={handleChange}
            placeholder="Ej: Visa Galicia" className={input} />
        </div>

        <div>
          <label className={label}>Banco</label>
          <input name="bank" value={form.bank} onChange={handleChange}
            placeholder="Ej: Galicia" className={input} />
        </div>

        <div>
          <label className={label}>Tipo</label>
          <select name="type" value={form.type} onChange={handleChange} className={input}>
            {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className={label}>Límite de crédito ($)</label>
          <input name="creditLimit" type="number" min="0" value={form.creditLimit}
            onChange={handleChange} placeholder="0" className={input} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Día de cierre</label>
            <input name="closingDay" type="number" min="1" max="31" value={form.closingDay}
              onChange={handleChange} placeholder="Día" className={input} />
          </div>
          <div>
            <label className={label}>Día de vencimiento</label>
            <input name="dueDay" type="number" min="1" max="31" value={form.dueDay}
              onChange={handleChange} placeholder="Día" className={input} />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60
            text-black font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
          <PlusCircle size={16} />
          {loading ? 'Guardando...' : 'Agregar tarjeta'}
        </button>
      </form>
    </div>
  )
}

export default CardForm
