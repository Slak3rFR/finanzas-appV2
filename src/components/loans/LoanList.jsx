import { useState } from 'react'
import { deleteLoan, updateLoan } from '../../services/loanService'
import { useToast } from '../../contexts/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash2, ChevronRight, Landmark } from 'lucide-react'

const LoanList = ({ loans, reloadLoans }) => {
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás este préstamo?')) return
    setDeletingId(id)
    try {
      await deleteLoan(id)
      addToast('Préstamo eliminado.', 'success')
      reloadLoans()
    } catch {
      addToast('Error al eliminar.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePayInstallment = async (loan) => {
    if (loan.paidInstallments >= loan.installments) {
      addToast('Este préstamo ya está completamente pagado.', 'info')
      return
    }
    setUpdatingId(loan.id)
    try {
      const paidInstallments = (loan.paidInstallments || 0) + 1
      const remainingAmount = loan.totalAmount - (paidInstallments * loan.installmentAmount)
      await updateLoan(loan.id, {
        paidInstallments,
        remainingAmount: Math.max(remainingAmount, 0),
      })
      addToast(`Cuota ${paidInstallments}/${loan.installments} registrada.`, 'success')
      reloadLoans()
    } catch {
      addToast('Error al actualizar.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {loans.map(loan => {
        const paid = loan.paidInstallments || 0
        const total = loan.installments || 1
        const progress = Math.min((paid / total) * 100, 100)
        const isFinished = paid >= total
        const remaining = loan.remainingAmount ?? loan.totalAmount

        return (
          <div key={loan.id}
            className={`bg-zinc-900 border rounded-2xl p-5
              ${isFinished ? 'border-emerald-800/40 opacity-70' : 'border-zinc-800'}`}>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Landmark size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{loan.entity}</h3>
                    {isFinished && (
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                        Pagado
                      </span>
                    )}
                  </div>
                  {loan.interestRate > 0 && (
                    <p className="text-zinc-500 text-xs">TNA: {loan.interestRate}%</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isFinished && (
                  <button
                    onClick={() => handlePayInstallment(loan)}
                    disabled={updatingId === loan.id}
                    className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700
                      disabled:opacity-40 transition px-2.5 py-1.5 rounded-lg font-medium"
                  >
                    <ChevronRight size={13} />
                    Pagar cuota
                  </button>
                )}
                <button
                  onClick={() => handleDelete(loan.id)}
                  disabled={deletingId === loan.id}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10
                    rounded-lg transition disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                <span>{paid} de {total} cuotas pagadas</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500
                    ${isFinished ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Montos */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/60 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-0.5">Total</p>
                <p className="font-bold text-sm text-white">{formatCurrency(loan.totalAmount)}</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-0.5">Cuota/mes</p>
                <p className="font-bold text-sm text-blue-400">{formatCurrency(loan.installmentAmount)}</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-0.5">Restante</p>
                <p className={`font-bold text-sm ${isFinished ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>

          </div>
        )
      })}
    </div>
  )
}

export default LoanList
