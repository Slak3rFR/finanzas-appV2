import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const loansRef = collection(db, 'loans')
const getUid = () => auth.currentUser?.uid

export const getLoans = async () => {
  const uid = getUid()
  if (!uid) return []
  const q = query(loansRef, where('uid', '==', uid))
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const addLoan = async (loan) => {
  const uid = getUid()
  if (!uid) return
  return await addDoc(loansRef, { ...loan, uid, createdAt: Date.now() })
}

export const deleteLoan = async (id) => {
  await deleteDoc(doc(db, 'loans', id))
}

export const updateLoan = async (id, data) => {
  await updateDoc(doc(db, 'loans', id), data)
}
