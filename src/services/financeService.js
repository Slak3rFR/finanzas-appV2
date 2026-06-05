import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const financesRef = collection(db, 'finances')
const getUid = () => auth.currentUser?.uid

export const getFinances = async () => {
  const uid = getUid()
  if (!uid) return []
  const q = query(financesRef, where('uid', '==', uid))
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date)
    return (b.createdAt || 0) - (a.createdAt || 0)
  })
}

export const addFinance = async (finance) => {
  const uid = getUid()
  if (!uid) return
  await addDoc(financesRef, { ...finance, uid, createdAt: Date.now() })
}

export const deleteFinance = async (id) => {
  await deleteDoc(doc(db, 'finances', id))
}

export const updateFinance = async (id, data) => {
  await updateDoc(doc(db, 'finances', id), data)
}
