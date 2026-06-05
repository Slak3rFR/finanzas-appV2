import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import LoanForm from '../components/loans/LoanForm'
import LoanList from '../components/loans/LoanList'
import { getLoans } from '../services/loanService'
import { formatCurrency } from '../utils/formatCurrency'

const Prestamos = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  const loadLoans = async () => {
    try {
      const data = await getLoans()
      setLoans(data || [])
    } catch (err) {
      console.error('Error cargando préstamos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLoans() }, [])

  const totalMensual = loans.reduce(
    (acc, l) => acc + Number(l.installmentAmount || 0), 0
  )
  const totalDeuda = loans.reduce(
    (acc, l) => acc + Number(l.totalAmount || 0), 0
  )

  return (
    <Layout>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Préstamos</h1>
          <p className="text-zinc-400 text-sm mt-1">Seguimiento de préstamos y deudas.</p>
        </div>

        {loans.length > 0 && (
          <div className="flex gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <p className="text-xs text-zinc-400 mb-0.5">Cuota mensual</p>
              <p className="text-lg font-bold text-blue-400">{formatCurrency(totalMensual)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <p className="text-xs text-zinc-400 mb-0.5">Deuda total</p>
              <p className="text-lg font-bold text-red-400">{formatCurrency(totalDeuda)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div>
          <LoanForm reloadLoans={loadLoans} />
        </div>

        <div className="xl:col-span-2">
          {loading ? (
            <div className="text-zinc-500 text-sm text-center py-8">Cargando préstamos...</div>
          ) : loans.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-500">No tenés préstamos registrados.</p>
            </div>
          ) : (
            <LoanList loans={loans} reloadLoans={loadLoans} />
          )}
        </div>
      </div>

    </Layout>
  )
}

export default Prestamos
