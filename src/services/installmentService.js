import {
  addDoc, collection, deleteDoc, doc, getDocs, updateDoc, query, where,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const installmentsRef = collection(db, 'installments')
const getUid = () => auth.currentUser?.uid

export const addInstallment = async (installment) => {
  const uid = getUid()
  if (!uid) return
  return await addDoc(installmentsRef, {
    ...installment, uid, createdAt: Date.now(), currentInstallment: 1,
  })
}

export const getInstallments = async () => {
  const uid = getUid()
  if (!uid) return []
  const q = query(installmentsRef, where('uid', '==', uid))
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const deleteInstallment = async (id) => {
  await deleteDoc(doc(db, 'installments', id))
}

export const updateInstallment = async (id, data) => {
  await updateDoc(doc(db, 'installments', id), data)
}
