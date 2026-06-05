import { useState } from 'react'
import { deleteInstallment, updateInstallment } from '../../services/installmentService'
import { useToast } from '../../contexts/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash2, ChevronRight } from 'lucide-react'

const InstallmentList = ({ installments, reloadInstallments }) => {
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás esta cuota?')) return
    setDeletingId(id)
    try {
      await deleteInstallment(id)
      addToast('Cuota eliminada.', 'success')
      reloadInstallments()
    } catch {
      addToast('Error al eliminar.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleNextMonth = async (inst) => {
    if (inst.currentInstallment >= inst.installments) {
      addToast('Esta cuota ya está completamente pagada.', 'info')
      return
    }
    setUpdatingId(inst.id)
    try {
      const next = inst.currentInstallment + 1
      await updateInstallment(inst.id, {
        currentInstallment: next,
        remainingInstallments: inst.installments - next,
      })
      addToast(`Cuota ${next}/${inst.installments} registrada.`, 'success')
      reloadInstallments()
    } catch {
      addToast('Error al actualizar.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {installments.map(inst => {
        const paid = inst.currentInstallment || 1
        const total = inst.installments || 1
        const progress = Math.min((paid / total) * 100, 100)
        const isFinished = paid >= total

        return (
          <div key={inst.id}
            className={`bg-zinc-900 border rounded-2xl p-5 transition
              ${isFinished ? 'border-emerald-800/40 opacity-70' : 'border-zinc-800'}`}>

            <div className="flex items-start justify-between gap-3 mb-3">
              {/* Info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm truncate">{inst.description}</h3>
                  {isFinished && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      Pagada
                    </span>
                  )}
                </div>
                {inst.cardName && (
                  <p className="text-zinc-500 text-xs mt-0.5">{inst.cardName}</p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 shrink-0">
                {!isFinished && (
                  <button
                    onClick={() => handleNextMonth(inst)}
                    disabled={updatingId === inst.id}
                    className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700
                      disabled:opacity-40 transition px-2.5 py-1.5 rounded-lg font-medium"
                  >
                    <ChevronRight size={13} />
                    Siguiente
                  </button>
                )}
                <button
                  onClick={() => handleDelete(inst.id)}
                  disabled={deletingId === inst.id}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10
                    rounded-lg transition disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Progreso */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span>Cuota {paid} de {total}</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500
                    ${isFinished ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Montos */}
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-xs">
                Total: {formatCurrency(inst.totalAmount)}
              </span>
              <span className={`font-bold text-sm ${isFinished ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatCurrency(inst.installmentAmount)}/mes
              </span>
            </div>

          </div>
        )
      })}
    </div>
  )
}

export default InstallmentList
