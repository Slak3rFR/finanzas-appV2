/**
 * Exporta datos como archivo CSV o JSON
 */

export const exportToCSV = (data, filename = 'finanzas') => {
  if (!data || data.length === 0) return

  const keys = Object.keys(data[0]).filter(k => !['id', 'uid'].includes(k))
  const header = keys.join(',')
  const rows = data.map(row =>
    keys.map(k => {
      const val = row[k] ?? ''
      return typeof val === 'string' && val.includes(',')
        ? `"${val}"`
        : val
    }).join(',')
  )

  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}-${getDate()}.csv`)
}

export const exportToJSON = (data, filename = 'finanzas') => {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: 'application/json' }
  )
  downloadBlob(blob, `${filename}-${getDate()}.json`)
}

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const getDate = () => new Date().toISOString().split('T')[0]
