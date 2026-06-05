/**
 * Formatea un número como moneda ARS
 * Ej: 1500.5 → "$1.501"
 */
export const formatCurrency = (amount) => {
  const num = Number(amount || 0)
  return `$${num.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

/**
 * Formatea un número con decimales
 * Ej: 1500.55 → "$1.500,55"
 */
export const formatCurrencyDecimals = (amount) => {
  const num = Number(amount || 0)
  return `$${num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Parsea un string de moneda a número
 * Ej: "$1.500" → 1500
 */
export const parseCurrency = (str) => {
  return Number(String(str).replace(/[^0-9,-]/g, '').replace(',', '.')) || 0
}
