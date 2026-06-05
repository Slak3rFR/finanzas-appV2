import { useState } from 'react'
import { deleteFinance } from '../../services/financeService'
import { useToast } from '../../contexts/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react'

// Badge de tipo
const TypeBadge = ({ type }) => {
  const isIncome = type?.toLowerCase() === 'ingreso'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full
      ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
      {isIncome ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {type}
    </span>
  )
}

const FinanceTable = ({ finances, onReload }) => {
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás este movimiento?')) return
    setDeletingId(id)
    try {
      await deleteFinance(id)
      addToast('Movimiento eliminado.', 'success')
      onReload()   // ← callback en lugar de window.location.reload()
    } catch {
      addToast('Error al eliminar. Intentá nuevamente.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (finances.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <p className="text-zinc-500 text-sm">Sin movimientos para este mes.</p>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="font-semibold">Movimientos</h2>
        <span className="text-zinc-500 text-xs">{finances.length} registros</span>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
              <th className="text-left px-5 py-3 font-medium">Fecha</th>
              <th className="text-left px-5 py-3 font-medium">Descripción</th>
              <th className="text-left px-5 py-3 font-medium">Categoría</th>
              <th className="text-left px-5 py-3 font-medium">Tipo</th>
              <th className="text-right px-5 py-3 font-medium">Monto</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {finances.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition
                  ${idx === finances.length - 1 ? 'border-b-0' : ''}`}
              >
                <td className="px-5 py-3.5 text-zinc-400 whitespace-nowrap">
                  {item.date}
                </td>
                <td className="px-5 py-3.5 font-medium max-w-44 truncate">
                  {item.description}
                </td>
                <td className="px-5 py-3.5 text-zinc-400">
                  {item.category || '—'}
                </td>
                <td className="px-5 py-3.5">
                  <TypeBadge type={item.type} />
                </td>
                <td className={`px-5 py-3.5 text-right font-semibold whitespace-nowrap
                  ${item.type?.toLowerCase() === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.type?.toLowerCase() === 'gasto' ? '-' : '+'}
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10
                      rounded-lg transition disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden divide-y divide-zinc-800/50">
        {finances.map(item => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-3.5">
            {/* Icono tipo */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
              ${item.type?.toLowerCase() === 'ingreso'
                ? 'bg-emerald-500/10'
                : 'bg-red-500/10'
              }`}>
              {item.type?.toLowerCase() === 'ingreso'
                ? <TrendingUp size={16} className="text-emerald-400" />
                : <TrendingDown size={16} className="text-red-400" />
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.description}</p>
              <p className="text-zinc-500 text-xs">
                {item.date}
                {item.category ? ` · ${item.category}` : ''}
              </p>
            </div>

            {/* Monto */}
            <div className="text-right shrink-0">
              <p className={`font-bold text-sm
                ${item.type?.toLowerCase() === 'ingreso' ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.type?.toLowerCase() === 'gasto' ? '-' : '+'}
                {formatCurrency(item.amount)}
              </p>
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10
                rounded-lg transition disabled:opacity-40 shrink-0"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FinanceTable
