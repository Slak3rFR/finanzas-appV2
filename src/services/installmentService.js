import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const installmentsRef = collection(db, 'installments')

const getUid = () => auth.currentUser?.uid

// AGREGAR
export const addInstallment = async (installment) => {
  const uid = getUid()
  if (!uid) return

  return await addDoc(installmentsRef, {
    ...installment,
    uid,
    createdAt: Date.now(),
    currentInstallment: 1,
  })
}

// OBTENER (filtrado por usuario)
export const getInstallments = async () => {
  const uid = getUid()
  if (!uid) return []

  const q = query(
    installmentsRef,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ELIMINAR
export const deleteInstallment = async (id) => {
  await deleteDoc(doc(db, 'installments', id))
}

// ACTUALIZAR
export const updateInstallment = async (id, data) => {
  await updateDoc(doc(db, 'installments', id), data)
}
