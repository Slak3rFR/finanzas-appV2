import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'
import FinanceForm from '../components/finances/FinanceForm'
import FinanceTable from '../components/finances/FinanceTable'
import { addFinance, getFinances } from '../services/financeService'
import { formatCurrency } from '../utils/formatCurrency'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

const Finanzas = () => {
  const [finances, setFinances] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const loadFinances = async () => {
    try {
      const data = await getFinances()
      setFinances(data || [])
    } catch (err) {
      console.error('Error cargando finanzas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadFinances() }, [])

  const handleAdd = async (finance) => {
    await addFinance(finance)
    await loadFinances()
  }

  // Navegación de mes
  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
    else setSelectedMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
    else setSelectedMonth(m => m + 1)
  }

  // Filtrar por mes/año
  const filteredFinances = useMemo(() => {
    return finances.filter(item => {
      if (!item.date) return false
      const [year, month] = item.date.split('-').map(Number)
      return (month - 1) === selectedMonth && year === selectedYear
    })
  }, [finances, selectedMonth, selectedYear])

  // Totales (comparación case-insensitive para robustez)
  const incomeTotal = filteredFinances
    .filter(i => i.type?.toLowerCase() === 'ingreso')
    .reduce((acc, i) => acc + Number(i.amount || 0), 0)

  const expenseTotal = filteredFinances
    .filter(i => i.type?.toLowerCase() === 'gasto')
    .reduce((acc, i) => acc + Number(i.amount || 0), 0)

  const balance = incomeTotal - expenseTotal

  return (
    <Layout>

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Finanzas</h1>
          <p className="text-zinc-400 text-sm mt-1">Ingresos y gastos del mes</p>
        </div>

        {/* Navegación de mes */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold px-2 min-w-32 text-center">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-lg transition">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6">
          <p className="text-zinc-400 text-xs md:text-sm mb-1">Balance</p>
          <h2 className={`text-lg md:text-3xl font-bold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(balance)}
          </h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6">
          <p className="text-zinc-400 text-xs md:text-sm mb-1">Ingresos</p>
          <h2 className="text-lg md:text-3xl font-bold text-emerald-400">
            {formatCurrency(incomeTotal)}
          </h2>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6">
          <p className="text-zinc-400 text-xs md:text-sm mb-1">Gastos</p>
          <h2 className="text-lg md:text-3xl font-bold text-red-400">
            {formatCurrency(expenseTotal)}
          </h2>
        </div>
      </div>

      {/* Formulario nuevo movimiento */}
      <FinanceForm onAdd={handleAdd} />

      {/* Tabla / Lista */}
      {loading ? (
        <div className="text-zinc-500 text-sm text-center py-8">Cargando movimientos...</div>
      ) : (
        <FinanceTable
          finances={filteredFinances}
          onReload={loadFinances}
        />
      )}

    </Layout>
  )
}

export default Finanzas
