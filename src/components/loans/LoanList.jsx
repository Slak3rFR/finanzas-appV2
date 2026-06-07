import { useState } from 'react'
import { deleteLoan, updateLoan } from '../../services/loanService'
import { useToast } from '../../contexts/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash2, ChevronRight, Landmark, TrendingDown, Minus, Pencil, X, Check } from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCuotaActual = (loan, k) => {
  const extra = Number(loan.extraFees || 0)
  if (loan.sistema === 'aleman') {
    const amort = loan.fixedPrincipal ?? (loan.totalAmount / loan.installments)
    const r     = loan.monthlyRate ?? 0
    const saldo = loan.totalAmount - (k - 1) * amort
    return amort + saldo * r + extra
  }
  // Francés: usa override si existe, sino el calculado
  return Number(loan.installmentOverride || loan.installmentAmount || 0) + extra
}

const SistemaBadge = ({ sistema }) =>
  sistema === 'aleman' ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
      <TrendingDown size={10} /> Alemán
    </span>
  ) : sistema === 'frances' ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
      <Minus size={10} /> Francés
    </span>
  ) : null

// ─── Formulario de edición inline ────────────────────────────────────────────

const EditForm = ({ loan, onSave, onCancel }) => {
  const [fields, setFields] = useState({
    entity:              loan.entity || '',
    installmentOverride: loan.installmentOverride ?? '',
    fixedPrincipal:      loan.fixedPrincipal ?? '',
    monthlyRate:         loan.monthlyRate != null ? (loan.monthlyRate * 12 * 100).toFixed(2) : '',
    extraFees:           loan.extraFees ?? '',
  })

  const set = (k, v) => setFields(prev => ({ ...prev, [k]: v }))

  const inp = 'w-full bg-zinc-900 border border-zinc-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 transition'
  const lbl = 'text-zinc-400 text-xs mb-1 block'

  const handleSave = () => {
    const updates = { entity: fields.entity }

    if (loan.sistema === 'frances') {
      // Override de cuota fija
      updates.installmentOverride = fields.installmentOverride !== ''
        ? Number(fields.installmentOverride)
        : null
    }

    if (loan.sistema === 'aleman') {
      // Recalcular con los nuevos valores si se cambian
      if (fields.fixedPrincipal !== '') updates.fixedPrincipal = Number(fields.fixedPrincipal)
      if (fields.monthlyRate !== '')    updates.monthlyRate = Number(fields.monthlyRate) / 100 / 12
    }

    // Gastos extra (seguros, etc.) — aplica a ambos sistemas
    updates.extraFees = fields.extraFees !== '' ? Number(fields.extraFees) : 0

    onSave(updates)
  }

  return (
    <div className="mt-4 bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 space-y-3">
      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Editar préstamo</p>

      <div>
        <label className={lbl}>Entidad / Banco</label>
        <input value={fields.entity} onChange={e => set('entity', e.target.value)} className={inp} />
      </div>

      {loan.sistema === 'frances' && (
        <div>
          <label className={lbl}>Cuota real del banco ($)</label>
          <input
            type="number" min="0" step="0.01"
            value={fields.installmentOverride}
            onChange={e => set('installmentOverride', e.target.value)}
            placeholder={`Calculada: ${formatCurrency(loan.installmentAmount)}`}
            className={inp}
          />
          <p className="text-zinc-600 text-xs mt-1">
            Dejá vacío para usar el valor calculado.
          </p>
        </div>
      )}

      {loan.sistema === 'aleman' && (
        <>
          <div>
            <label className={lbl}>Amortización mensual ($)</label>
            <input
              type="number" min="0" step="0.01"
              value={fields.fixedPrincipal}
              onChange={e => set('fixedPrincipal', e.target.value)}
              placeholder={formatCurrency(loan.fixedPrincipal)}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>TNA real del banco (%)</label>
            <input
              type="number" min="0" step="0.01"
              value={fields.monthlyRate}
              onChange={e => set('monthlyRate', e.target.value)}
              placeholder={loan.interestRate ? `${loan.interestRate}` : '0'}
              className={inp}
            />
          </div>
        </>
      )}

      <div>
        <label className={lbl}>Gastos adicionales por cuota ($)</label>
        <input
          type="number" min="0" step="0.01"
          value={fields.extraFees}
          onChange={e => set('extraFees', e.target.value)}
          placeholder="0"
          className={inp}
        />
        <p className="text-zinc-600 text-xs mt-1">
          Seguros, gastos administrativos, etc. Se suma a cada cuota.
        </p>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600
            text-black font-semibold py-2 rounded-xl text-sm transition">
          <Check size={15} /> Guardar
        </button>
        <button onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-700 hover:bg-zinc-600
            text-white font-semibold py-2 rounded-xl text-sm transition">
          <X size={15} /> Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── Lista principal ──────────────────────────────────────────────────────────

const LoanList = ({ loans, reloadLoans }) => {
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [editingId,  setEditingId]  = useState(null)

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
      const cuotaPagada      = getCuotaActual(loan, paidInstallments)
      const amort = loan.fixedPrincipal ?? (loan.totalAmount / loan.installments)
      const remainingAmount  = Math.max((loan.remainingAmount ?? loan.totalAmount) - amort, 0)
      await updateLoan(loan.id, { paidInstallments, remainingAmount })
      addToast(`Cuota ${paidInstallments}/${loan.installments} pagada (${formatCurrency(cuotaPagada)}).`, 'success')
      reloadLoans()
    } catch {
      addToast('Error al actualizar.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSaveEdit = async (loan, updates) => {
    try {
      await updateLoan(loan.id, updates)
      addToast('Préstamo actualizado.', 'success')
      setEditingId(null)
      reloadLoans()
    } catch {
      addToast('Error al guardar los cambios.', 'error')
    }
  }

  return (
    <div className="space-y-4">
      {loans.map(loan => {
        const paid       = loan.paidInstallments || 0
        const total      = loan.installments || 1
        const progress   = Math.min((paid / total) * 100, 100)
        const isFinished = paid >= total
        const remaining  = loan.remainingAmount ?? loan.totalAmount
        const nextCuota  = isFinished ? null : getCuotaActual(loan, paid + 1)
        const isEditing  = editingId === loan.id

        // Etiqueta de cuota para sistema francés
        const cuotaLabel = loan.installmentOverride
          ? `${formatCurrency(loan.installmentOverride)}${loan.extraFees > 0 ? ` + ${formatCurrency(loan.extraFees)} gastos` : ''}`
          : loan.extraFees > 0
            ? `${formatCurrency(loan.installmentAmount)} + ${formatCurrency(loan.extraFees)} gastos`
            : null

        return (
          <div key={loan.id}
            className={`bg-zinc-900 border rounded-2xl p-5
              ${isFinished ? 'border-emerald-800/40 opacity-70' : 'border-zinc-800'}`}>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <Landmark size={18} className="text-blue-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{loan.entity}</h3>
                    {isFinished
                      ? <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Pagado</span>
                      : <SistemaBadge sistema={loan.sistema} />
                    }
                  </div>
                  {loan.interestRate > 0 && (
                    <p className="text-zinc-500 text-xs">TNA: {loan.interestRate}%</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Botón editar */}
                <button
                  onClick={() => setEditingId(isEditing ? null : loan.id)}
                  className={`p-1.5 rounded-lg transition
                    ${isEditing
                      ? 'text-emerald-400 bg-emerald-400/10'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>

                {!isFinished && (
                  <button
                    onClick={() => handlePayInstallment(loan)}
                    disabled={updatingId === loan.id}
                    className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700
                      disabled:opacity-40 transition px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap">
                    <ChevronRight size={13} />
                    Pagar cuota
                  </button>
                )}

                <button
                  onClick={() => handleDelete(loan.id)}
                  disabled={deletingId === loan.id}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition disabled:opacity-40">
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

            {/* Próxima cuota */}
            {!isFinished && nextCuota && (
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-3 mb-3 flex justify-between items-center">
                <div>
                  <p className="text-zinc-400 text-xs">Próxima cuota (nº {paid + 1})</p>
                  {loan.sistema === 'aleman' && (
                    <p className="text-zinc-600 text-xs">Decrece cada mes</p>
                  )}
                  {cuotaLabel && (
                    <p className="text-zinc-600 text-xs">{cuotaLabel}</p>
                  )}
                </div>
                <p className="text-blue-400 font-bold text-lg">{formatCurrency(nextCuota)}</p>
              </div>
            )}

            {/* Rango alemán */}
            {loan.sistema === 'aleman' && !isFinished && (
              <div className="flex justify-between text-xs text-zinc-500 mb-3 px-1">
                <span>Primera: {formatCurrency(getCuotaActual(loan, 1))}</span>
                <span>Última: {formatCurrency(getCuotaActual(loan, loan.installments))}</span>
              </div>
            )}

            {/* Montos */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/60 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-0.5">Capital</p>
                <p className="font-bold text-sm text-white">{formatCurrency(loan.totalAmount)}</p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-0.5">
                  {loan.sistema === 'aleman' ? 'Amortización' : 'Cuota fija'}
                </p>
                <p className="font-bold text-sm text-blue-400">
                  {loan.sistema === 'aleman'
                    ? formatCurrency(loan.fixedPrincipal ?? loan.totalAmount / loan.installments)
                    : formatCurrency(loan.installmentOverride || loan.installmentAmount)
                  }
                </p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3">
                <p className="text-zinc-500 text-xs mb-0.5">Saldo</p>
                <p className={`font-bold text-sm ${isFinished ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(remaining)}
                </p>
              </div>
            </div>

            {loan.totalPagar && (
              <div className="flex justify-between text-xs text-zinc-500 mt-3 px-1">
                <span>Total a pagar: {formatCurrency(loan.totalPagar)}</span>
                {loan.interesTotal > 0 && (
                  <span className="text-amber-500">Interés: {formatCurrency(loan.interesTotal)}</span>
                )}
              </div>
            )}

            {/* Formulario de edición inline */}
            {isEditing && (
              <EditForm
                loan={loan}
                onSave={(updates) => handleSaveEdit(loan, updates)}
                onCancel={() => setEditingId(null)}
              />
            )}

          </div>
        )
      })}
    </div>
  )
}

export default LoanList

export default LoanList
