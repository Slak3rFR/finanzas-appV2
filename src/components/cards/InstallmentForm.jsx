import { useState } from 'react'
import { addInstallment } from '../../services/installmentService'
import { useToast } from '../../contexts/ToastContext'
import { PlusCircle, Receipt } from 'lucide-react'

const InstallmentForm = ({ cards, reloadInstallments }) => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    totalAmount: '',
    installments: '',
    cardId: '',
    date: new Date().toISOString().split('T')[0],
  })

  const installmentAmount =
    form.totalAmount && form.installments
      ? (Number(form.totalAmount) / Number(form.installments)).toFixed(2)
      : null

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.description || !form.totalAmount || !form.installments) {
      addToast('Completá todos los campos requeridos.', 'error')
      return
    }
    setLoading(true)
    try {
      const selectedCard = cards.find(c => c.id === form.cardId)
      await addInstallment({
        ...form,
        totalAmount: Number(form.totalAmount),
        installments: Number(form.installments),
        installmentAmount: Number(installmentAmount),
        cardName: selectedCard?.name || 'Sin tarjeta',
        remainingInstallments: Number(form.installments),
      })
      addToast('Cuota registrada.', 'success')
      setForm({ description: '', totalAmount: '', installments: '', cardId: '', date: new Date().toISOString().split('T')[0] })
      reloadInstallments()
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
        <Receipt size={18} className="text-amber-400" />
        <h2 className="font-semibold">Nueva cuota</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Descripción</label>
          <input name="description" value={form.description} onChange={handleChange}
            placeholder="Ej: Smart TV Samsung" className={input} />
        </div>

        <div>
          <label className={label}>Tarjeta (opcional)</label>
          <select name="cardId" value={form.cardId} onChange={handleChange} className={input}>
            <option value="">Sin tarjeta</option>
            {cards.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Monto total ($)</label>
            <input name="totalAmount" type="number" min="0" value={form.totalAmount}
              onChange={handleChange} placeholder="0" className={input} />
          </div>
          <div>
            <label className={label}>Cantidad cuotas</label>
            <input name="installments" type="number" min="1" value={form.installments}
              onChange={handleChange} placeholder="0" className={input} />
          </div>
        </div>

        {installmentAmount && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5">
            <p className="text-amber-400 text-sm font-semibold">
              Cuota mensual: ${Number(installmentAmount).toLocaleString('es-AR')}
            </p>
          </div>
        )}

        <div>
          <label className={label}>Fecha de inicio</label>
          <input name="date" type="date" value={form.date} onChange={handleChange} className={input} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60
            text-black font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
          <PlusCircle size={16} />
          {loading ? 'Guardando...' : 'Agregar cuota'}
        </button>
      </form>
    </div>
  )
}

export default InstallmentForm
