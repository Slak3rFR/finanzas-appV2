import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const loansRef = collection(db, 'loans')

const getUid = () => auth.currentUser?.uid

// AGREGAR
export const addLoan = async (loan) => {
  const uid = getUid()
  if (!uid) return

  return await addDoc(loansRef, {
    ...loan,
    uid,
    createdAt: Date.now(),
  })
}

// OBTENER (filtrado en Firestore, no en cliente)
export const getLoans = async () => {
  const uid = getUid()
  if (!uid) return []

  const q = query(
    loansRef,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ELIMINAR
export const deleteLoan = async (id) => {
  await deleteDoc(doc(db, 'loans', id))
}

// ACTUALIZAR
export const updateLoan = async (id, data) => {
  await updateDoc(doc(db, 'loans', id), data)
}
