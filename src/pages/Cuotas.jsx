import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import InstallmentForm from '../components/cards/InstallmentForm'
import InstallmentList from '../components/cards/InstallmentList'
import { getInstallments } from '../services/installmentService'
import { getCards } from '../services/cardService'
import { formatCurrency } from '../utils/formatCurrency'

const Cuotas = () => {
  const [installments, setInstallments] = useState([])
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [inst, cds] = await Promise.all([
        getInstallments(),
        getCards(),
      ])
      setInstallments(inst || [])
      setCards(cds || [])
    } catch (err) {
      console.error('Error cargando cuotas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Total mensual de cuotas activas
  const totalMensual = installments.reduce(
    (acc, i) => acc + Number(i.installmentAmount || 0), 0
  )

  return (
    <Layout>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cuotas</h1>
          <p className="text-zinc-400 text-sm mt-1">Compras financiadas con tarjeta.</p>
        </div>
        {installments.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
            <p className="text-xs text-zinc-400 mb-0.5">Costo mensual total</p>
            <p className="text-lg font-bold text-amber-400">{formatCurrency(totalMensual)}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div>
          <InstallmentForm cards={cards} reloadInstallments={loadData} />
        </div>

        <div className="xl:col-span-2">
          {loading ? (
            <div className="text-zinc-500 text-sm text-center py-8">Cargando cuotas...</div>
          ) : installments.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-500">No tenés cuotas registradas.</p>
            </div>
          ) : (
            <InstallmentList
              installments={installments}
              cards={cards}
              reloadInstallments={loadData}
            />
          )}
        </div>
      </div>

    </Layout>
  )
}

export default Cuotas
