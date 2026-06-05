import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import FixedExpenseForm from '../components/fixedExpenses/FixedExpenseForm'
import FixedExpenseList from '../components/fixedExpenses/FixedExpenseList'
import { getFixedExpenses } from '../services/fixedExpenseService'
import { formatCurrency } from '../utils/formatCurrency'

const GastosFijos = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const loadExpenses = async () => {
    try {
      const data = await getFixedExpenses()
      setExpenses(data || [])
    } catch (err) {
      console.error('Error cargando gastos fijos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadExpenses() }, [])

  const totalMensual = expenses.reduce(
    (acc, e) => acc + Number(e.amount || 0), 0
  )

  return (
    <Layout>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gastos Fijos</h1>
          <p className="text-zinc-400 text-sm mt-1">Servicios y gastos recurrentes.</p>
        </div>
        {expenses.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <p className="text-xs text-zinc-400 mb-0.5">Total mensual</p>
            <p className="text-lg font-bold text-blue-400">{formatCurrency(totalMensual)}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div>
          <FixedExpenseForm reloadExpenses={loadExpenses} />
        </div>

        <div className="xl:col-span-2">
          {loading ? (
            <div className="text-zinc-500 text-sm text-center py-8">Cargando gastos fijos...</div>
          ) : expenses.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-500">No tenés gastos fijos registrados.</p>
            </div>
          ) : (
            <FixedExpenseList expenses={expenses} reloadExpenses={loadExpenses} />
          )}
        </div>
      </div>

    </Layout>
  )
}

export default GastosFijos
