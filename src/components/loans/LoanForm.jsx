import { useState, useMemo } from 'react'
import { addLoan } from '../../services/loanService'
import { useToast } from '../../contexts/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { PlusCircle, Landmark, Info } from 'lucide-react'

// ─── Fórmulas de amortización ────────────────────────────────────────────────

// Sistema Francés: cuota fija durante todo el préstamo
const calcFrances = (principal, tna, n) => {
  if (!principal || !n) return null
  const r = tna / 100 / 12
  if (r === 0) {
    const cuota = principal / n
    return { cuota, primera: cuota, ultima: cuota, totalPagar: cuota * n }
  }
  const cuota = (principal * r) / (1 - Math.pow(1 + r, -n))
  return {
    cuota,
    primera: cuota,
    ultima: cuota,
    totalPagar: cuota * n,
    interesTotal: cuota * n - principal,
  }
}

// Sistema Alemán: amortización fija, intereses decrecientes
const calcAleman = (principal, tna, n) => {
  if (!principal || !n) return null
  const r = tna / 100 / 12
  const amort = principal / n
  const primera = amort + principal * r
  const ultima  = amort + amort * r
  const totalPagar = Array.from({ length: n }, (_, i) => {
    const saldo = principal - i * amort
    return amort + saldo * r
  }).reduce((a, b) => a + b, 0)
  return {
    cuota: primera,          // la más alta (para guardar referencia)
    primera,
    ultima,
    amort,
    totalPagar,
    interesTotal: totalPagar - principal,
    monthlyRate: r,
  }
}

// ─── Componente ──────────────────────────────────────────────────────────────

const SISTEMAS = [
  {
    id: 'frances',
    label: 'Sistema Francés',
    desc: 'Cuotas iguales todos los meses. El más común en bancos y fintechs.',
  },
  {
    id: 'aleman',
    label: 'Sistema Alemán',
    desc: 'Primera cuota más cara, luego van bajando. Pagás menos interés total.',
  },
]

const LoanForm = ({ reloadLoans }) => {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sistema, setSistema] = useState('frances')
  const [form, setForm] = useState({
    entity: '',
    totalAmount: '',
    installments: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Preview del cálculo
  const preview = useMemo(() => {
    const principal = Number(form.totalAmount)
    const n        = Number(form.installments)
    const tna      = Number(form.interestRate) || 0
    if (!principal || !n) return null
    return sistema === 'frances'
      ? calcFrances(principal, tna, n)
      : calcAleman(principal, tna, n)
  }, [form.totalAmount, form.installments, form.interestRate, sistema])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.entity || !form.totalAmount || !form.installments) {
      addToast('Completá entidad, monto y cantidad de cuotas.', 'error')
      return
    }
    if (!preview) return
    setLoading(true)
    try {
      await addLoan({
        entity:              form.entity,
        totalAmount:         Number(form.totalAmount),
        installments:        Number(form.installments),
        interestRate:        Number(form.interestRate) || 0,
        startDate:           form.startDate,
        sistema,
        // Datos calculados
        installmentAmount:   preview.primera,
        lastInstallmentAmount: preview.ultima,
        fixedPrincipal:      preview.amort ?? null,
        monthlyRate:         preview.monthlyRate ?? ((Number(form.interestRate) || 0) / 100 / 12),
        totalPagar:          preview.totalPagar,
        interesTotal:        preview.interesTotal,
        // Estado de pago
        paidInstallments:    0,
        remainingAmount:     Number(form.totalAmount),
      })
      addToast('Préstamo registrado correctamente.', 'success')
      setForm({ entity: '', totalAmount: '', installments: '', interestRate: '', startDate: new Date().toISOString().split('T')[0] })
      reloadLoans()
    } catch {
      addToast('Error al guardar. Intentá nuevamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const lbl = 'text-zinc-400 text-xs font-medium block mb-1.5'
  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Landmark size={18} className="text-blue-400" />
        <h2 className="font-semibold">Nuevo préstamo</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Selector de sistema */}
        <div>
          <label className={lbl}>Sistema de amortización</label>
          <div className="flex flex-col gap-2">
            {SISTEMAS.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSistema(s.id)}
                className={`text-left px-4 py-3 rounded-xl border transition
                  ${sistema === s.id
                    ? 'bg-blue-500/10 border-blue-500/40 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}
              >
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Entidad */}
        <div>
          <label className={lbl}>Entidad / Banco</label>
          <input name="entity" value={form.entity} onChange={handleChange}
            placeholder="Ej: Banco Galicia" className={inp} />
        </div>

        {/* Monto y cuotas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={lbl}>Monto solicitado ($)</label>
            <input name="totalAmount" type="number" min="0" value={form.totalAmount}
              onChange={handleChange} placeholder="0" className={inp} />
          </div>
          <div>
            <label className={lbl}>Cantidad de cuotas</label>
            <input name="installments" type="number" min="1" value={form.installments}
              onChange={handleChange} placeholder="0" className={inp} />
          </div>
        </div>

        {/* TNA */}
        <div>
          <label className={lbl}>Tasa Nominal Anual - TNA (%)</label>
          <input name="interestRate" type="number" min="0" step="0.01" value={form.interestRate}
            onChange={handleChange} placeholder="Ej: 85" className={inp} />
          <p className="text-zinc-600 text-xs mt-1 flex items-center gap-1">
            <Info size={11} /> Dejá en 0 si no tiene interés.
          </p>
        </div>

        {/* Preview del cálculo */}
        {preview && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-2">
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-3">
              Resumen del préstamo
            </p>

            {sistema === 'frances' ? (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Cuota fija</span>
                <span className="text-blue-400 font-bold text-lg">
                  {formatCurrency(preview.cuota)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Primera cuota</span>
                  <span className="text-red-400 font-bold">{formatCurrency(preview.primera)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Última cuota</span>
                  <span className="text-emerald-400 font-bold">{formatCurrency(preview.ultima)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 text-sm">Amortización fija</span>
                  <span className="text-white text-sm font-medium">{formatCurrency(preview.amort)}</span>
                </div>
              </>
            )}

            <div className="h-px bg-zinc-700 my-1" />

            <div className="flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Total a pagar</span>
              <span className="text-white font-semibold">{formatCurrency(preview.totalPagar)}</span>
            </div>
            {preview.interesTotal > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 text-sm">Interés total</span>
                <span className="text-amber-400 text-sm font-medium">
                  {formatCurrency(preview.interesTotal)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Fecha de inicio */}
        <div>
          <label className={lbl}>Fecha de inicio</label>
          <input name="startDate" type="date" value={form.startDate}
            onChange={handleChange} className={inp} />
        </div>

        <button type="submit" disabled={loading || !preview}
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
