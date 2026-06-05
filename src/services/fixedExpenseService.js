import {
  addDoc, collection, deleteDoc, doc, getDocs, query, where,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const fixedExpensesRef = collection(db, 'fixedExpenses')
const getUid = () => auth.currentUser?.uid

export const getFixedExpenses = async () => {
  const uid = getUid()
  if (!uid) return []
  const q = query(fixedExpensesRef, where('uid', '==', uid))
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const addFixedExpense = async (expense) => {
  const uid = getUid()
  if (!uid) return
  return await addDoc(fixedExpensesRef, { ...expense, uid })
}

export const deleteFixedExpense = async (id) => {
  await deleteDoc(doc(db, 'fixedExpenses', id))
}
