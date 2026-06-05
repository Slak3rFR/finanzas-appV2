import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import CardForm from '../components/cards/CardForm'
import CardList from '../components/cards/CardList'
import { getCards } from '../services/cardService'

const Tarjetas = () => {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  const loadCards = async () => {
    try {
      const data = await getCards()
      setCards(data || [])
    } catch (err) {
      console.error('Error cargando tarjetas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCards() }, [])

  return (
    <Layout>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Tarjetas</h1>
        <p className="text-zinc-400 text-sm mt-1">Administrá tus tarjetas y límites.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div>
          <CardForm reloadCards={loadCards} />
        </div>

        <div className="xl:col-span-2">
          {loading ? (
            <div className="text-zinc-500 text-sm text-center py-8">Cargando tarjetas...</div>
          ) : cards.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
              <p className="text-zinc-500">No tenés tarjetas registradas.</p>
            </div>
          ) : (
            <CardList cards={cards} reloadCards={loadCards} />
          )}
        </div>
      </div>

    </Layout>
  )
}

export default Tarjetas
