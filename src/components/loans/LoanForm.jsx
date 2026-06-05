import { useState } from 'react'
import { addLoan } from '../../services/loanService'
import { useToast } from '../../contexts/ToastContext'
import { PlusCircle, Landmark } from 'lucide-react'

const LoanForm = ({ reloadLoans }) => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    entity: '',
    totalAmount: '',
    installments: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
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
    if (!form.entity || !form.totalAmount || !form.installments) {
      addToast('Completá entidad, monto y cuotas.', 'error')
      return
    }
    setLoading(true)
    try {
      await addLoan({
        ...form,
        totalAmount: Number(form.totalAmount),
        installments: Number(form.installments),
        installmentAmount: Number(installmentAmount),
        interestRate: Number(form.interestRate) || 0,
        paidInstallments: 0,
        remainingAmount: Number(form.totalAmount),
      })
      addToast('Préstamo registrado.', 'success')
      setForm({ entity: '', totalAmount: '', installments: '', interestRate: '', startDate: new Date().toISOString().split('T')[0] })
      reloadLoans()
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
        <Landmark size={18} className="text-blue-400" />
        <h2 className="font-semibold">Nuevo préstamo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Entidad / Banco</label>
          <input name="entity" value={form.entity} onChange={handleChange}
            placeholder="Ej: Banco Galicia" className={input} />
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

        <div>
          <label className={label}>Tasa de interés anual (%)</label>
          <input name="interestRate" type="number" min="0" step="0.1" value={form.interestRate}
            onChange={handleChange} placeholder="0" className={input} />
        </div>

        {installmentAmount && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5">
            <p className="text-blue-400 text-sm font-semibold">
              Cuota estimada: ${Number(installmentAmount).toLocaleString('es-AR')}
            </p>
          </div>
        )}

        <div>
          <label className={label}>Fecha de inicio</label>
          <input name="startDate" type="date" value={form.startDate}
            onChange={handleChange} className={input} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60
            text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2">
          <PlusCircle size={16} />
          {loading ? 'Guardando...' : 'Registrar préstamo'}
        </button>
      </form>
    </div>
  )
}

export default LoanForm
