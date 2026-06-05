import { useState } from 'react'
import { deleteCard } from '../../services/cardService'
import { useToast } from '../../contexts/ToastContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { Trash2, CreditCard, Calendar } from 'lucide-react'

const BRAND_COLORS = {
  Visa: 'from-blue-600 to-blue-800',
  Mastercard: 'from-red-600 to-orange-600',
  'American Express': 'from-slate-600 to-slate-800',
  Cabal: 'from-emerald-600 to-emerald-800',
  Naranja: 'from-orange-500 to-orange-700',
  Otro: 'from-zinc-600 to-zinc-800',
}

const CardList = ({ cards, reloadCards }) => {
  const { addToast } = useToast()
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminás esta tarjeta y todas sus cuotas asociadas?')) return
    setDeletingId(id)
    try {
      await deleteCard(id)
      addToast('Tarjeta eliminada.', 'success')
      reloadCards()
    } catch {
      addToast('Error al eliminar.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map(card => {
        const gradient = BRAND_COLORS[card.type] || BRAND_COLORS.Otro
        return (
          <div key={card.id}
            className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-5
              overflow-hidden shadow-lg`}>

            {/* Círculos decorativos */}
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/5" />
            <div className="absolute -right-2 -bottom-8 w-36 h-36 rounded-full bg-white/5" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-white/70 text-xs font-medium">{card.bank || 'Banco'}</p>
                  <h3 className="text-white font-bold text-lg mt-0.5">{card.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/10 text-white/80 text-xs px-2 py-1 rounded-lg font-medium">
                    {card.type}
                  </span>
                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={deletingId === card.id}
                    className="p-1.5 text-white/50 hover:text-white hover:bg-white/10
                      rounded-lg transition disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Límite */}
              <div className="mb-4">
                <p className="text-white/50 text-xs mb-0.5">Límite de crédito</p>
                <p className="text-white font-bold text-xl">
                  {formatCurrency(card.creditLimit)}
                </p>
              </div>

              {/* Días */}
              {(card.closingDay || card.dueDay) && (
                <div className="flex gap-4">
                  {card.closingDay && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-white/50" />
                      <span className="text-white/70 text-xs">Cierre: día {card.closingDay}</span>
                    </div>
                  )}
                  {card.dueDay && (
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={12} className="text-white/50" />
                      <span className="text-white/70 text-xs">Vence: día {card.dueDay}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CardList
