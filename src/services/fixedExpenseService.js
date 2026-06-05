import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const fixedExpensesRef = collection(db, 'fixedExpenses')

const getUid = () => auth.currentUser?.uid

// AGREGAR (uid ya viene desde el form)
export const addFixedExpense = async (expense) => {
  const uid = getUid()
  if (!uid) return

  return await addDoc(fixedExpensesRef, { ...expense, uid })
}

// OBTENER (filtrado por usuario)
export const getFixedExpenses = async () => {
  const uid = getUid()
  if (!uid) return []

  const q = query(
    fixedExpensesRef,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ELIMINAR
export const deleteFixedExpense = async (id) => {
  await deleteDoc(doc(db, 'fixedExpenses', id))
}
