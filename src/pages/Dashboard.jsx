import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import Layout from '../components/layout/Layout'
import { getFinances } from '../services/financeService'
import { getInstallments } from '../services/installmentService'
import { getLoans } from '../services/loanService'
import { formatCurrency } from '../utils/formatCurrency'
import { TrendingUp, TrendingDown, Scale, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

const COLORS = ['#10b981','#ef4444','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#14b8a6']

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#18181b',
  border: '1px solid #3f3f46',
  borderRadius: '12px',
  color: '#fff',
}

const SummaryCard = ({ label, value, color, icon }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-zinc-400 text-sm font-medium">{label}</p>
      <div className={`p-2 rounded-xl ${color === 'emerald' ? 'bg-emerald-500/10' : color === 'red' ? 'bg-red-500/10' : 'bg-zinc-800'}`}>
        {icon}
      </div>
    </div>
    <h2 className={`text-2xl font-bold ${
      color === 'emerald' ? 'text-emerald-400' :
      color === 'red' ? 'text-red-400' : 'text-white'
    }`}>
      {value}
    </h2>
  </div>
)

const Dashboard = () => {
  const [finances, setFinances] = useState([])
  const [installments, setInstallments] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fin, inst, ln] = await Promise.all([
          getFinances(),
          getInstallments(),
          getLoans(),
        ])
        setFinances(fin || [])
        setInstallments(inst || [])
        setLoans(ln || [])
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Navegar mes
  const prevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1) }
    else setSelectedMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1) }
    else setSelectedMonth(m => m + 1)
  }

  // Finanzas filtradas por mes/año
  const filteredFinances = useMemo(() => {
    return finances.filter(item => {
      if (!item.date) return false
      const [year, month] = item.date.split('-').map(Number)
      return (month - 1) === selectedMonth && year === selectedYear
    })
  }, [finances, selectedMonth, selectedYear])

  // Totales
  const totalIncome = filteredFinances
    .filter(i => i.type?.toLowerCase() === 'ingreso')
    .reduce((acc, i) => acc + Number(i.amount || 0), 0)

  const totalNormalExpenses = filteredFinances
    .filter(i => i.type?.toLowerCase() === 'gasto')
    .reduce((acc, i) => acc + Number(i.amount || 0), 0)

  // Cuotas y préstamos (costo mensual)
  const totalInstallments = installments.reduce(
    (acc, i) => acc + Number(i.installmentAmount || 0), 0
  )
  const totalLoans = loans.reduce(
    (acc, l) => acc + Number(l.installmentAmount || 0), 0
  )

  const totalExpenses = totalNormalExpenses + totalInstallments + totalLoans
  const balance = totalIncome - totalExpenses

  // Datos para gráfico distribución de gastos
  const expenseChartData = [
    { name: 'Gastos', value: totalNormalExpenses },
    { name: 'Cuotas', value: totalInstallments },
    { name: 'Préstamos', value: totalLoans },
  ].filter(d => d.value > 0)

  // Datos para gráfico por categoría
  const categoryData = useMemo(() => {
    const cats = {}
    filteredFinances
      .filter(i => i.type?.toLowerCase() === 'gasto')
      .forEach(i => {
        const cat = i.category || 'Otros'
        cats[cat] = (cats[cat] || 0) + Number(i.amount || 0)
      })
    return Object.entries(cats).map(([name, value]) => ({ name, value }))
  }, [filteredFinances])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64 text-zinc-500">
          Cargando datos...
        </div>
      </Layout>
    )
  }

  return (
    <Layout>

      {/* Header + Selector de mes */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Resumen financiero</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          label="Balance"
          value={formatCurrency(balance)}
          color={balance >= 0 ? 'emerald' : 'red'}
          icon={<Scale size={16} className={balance >= 0 ? 'text-emerald-400' : 'text-red-400'} />}
        />
        <SummaryCard
          label="Ingresos"
          value={formatCurrency(totalIncome)}
          color="emerald"
          icon={<TrendingUp size={16} className="text-emerald-400" />}
        />
        <SummaryCard
          label="Egresos"
          value={formatCurrency(totalExpenses)}
          color="red"
          icon={<TrendingDown size={16} className="text-red-400" />}
        />
      </div>

      {/* Desglose de egresos */}
      {(totalInstallments > 0 || totalLoans > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-400 text-xs font-medium mb-1">Gastos directos</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(totalNormalExpenses)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-400 text-xs font-medium mb-1">Cuotas tarjetas</p>
            <p className="text-lg font-bold text-amber-400">{formatCurrency(totalInstallments)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-400 text-xs font-medium mb-1">Cuotas préstamos</p>
            <p className="text-lg font-bold text-blue-400">{formatCurrency(totalLoans)}</p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Distribución de egresos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Distribución de egresos</h2>
          {expenseChartData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {expenseChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v) => formatCurrency(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-zinc-500 text-sm">
              Sin datos para este mes
            </div>
          )}
        </div>

        {/* Gastos por categoría */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Gastos por categoría</h2>
          {categoryData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#71717a', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v) => formatCurrency(v)}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-zinc-500 text-sm">
              Sin gastos este mes
            </div>
          )}
        </div>

      </div>

    </Layout>
  )
}

export default Dashboard
