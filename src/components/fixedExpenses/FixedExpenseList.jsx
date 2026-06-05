import { useState } from 'react'
import { deleteFixedExpense } from '../../services/fixedExpenseService'
import { useToast } from '../../contexts/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash2, CalendarDays } from 'lucide-react'

const CATEGORY_COLORS = {
  'Servicios': 'text-yellow-400 bg-yellow-400/10',
  'Internet/Telefonía': 'text-blue-400 bg-blue-400/10',
  'Streaming': 'text-purple-400 bg-purple-400/10',
  'Seguro': 'text-green-400 bg-green-400/10',
  'Alquiler': 'text-red-400 bg-red-400/10',
  'Expensas': 'text-orange-400 bg-orange-400/10',
  'Gimnasio': 'text-emerald-400 bg-emerald-400/10',
  'Suscripción': 'text-pink-400 bg-pink-400/10',
  'Otros': 'text-zinc-400 bg-zinc-400/10',
}

const FixedExpenseList = ({ expenses, reloadExpenses }) => {
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás este gasto fijo?')) return
    setDeletingId(id)
    try {
      await deleteFixedExpense(id)
      addToast('Gasto fijo eliminado.', 'success')
      reloadExpenses()
    } catch {
      addToast('Error al eliminar.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="divide-y divide-zinc-800/60">
        {expenses.map(expense => {
          const catStyle = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.Otros
          return (
            <div key={expense.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-800/30 transition">

              {/* Icono */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catStyle}`}>
                <CalendarDays size={18} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{expense.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${catStyle}`}>
                    {expense.category}
                  </span>
                  {expense.dueDay && (
                    <span className="text-zinc-500 text-xs">Día {expense.dueDay}</span>
                  )}
                </div>
              </div>

              {/* Monto */}
              <div className="text-right shrink-0">
                <p className="font-bold text-blue-400">{formatCurrency(expense.amount)}</p>
                <p className="text-zinc-500 text-xs">por mes</p>
              </div>

              {/* Delete */}
              <button
                onClick={() => handleDelete(expense.id)}
                disabled={deletingId === expense.id}
                className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10
                  rounded-lg transition disabled:opacity-40 shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FixedExpenseList
