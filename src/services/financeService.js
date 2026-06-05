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

const financesRef = collection(db, 'finances')

const getUid = () => auth.currentUser?.uid

// OBTENER (filtrado por usuario)
export const getFinances = async () => {
  const uid = getUid()
  if (!uid) return []

  const q = query(
    financesRef,
    where('uid', '==', uid),
    orderBy('date', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }))
}

// AGREGAR (con UID)
export const addFinance = async (finance) => {
  const uid = getUid()
  if (!uid) return

  await addDoc(financesRef, {
    ...finance,
    uid,
    createdAt: Date.now(),
  })
}

// ELIMINAR
export const deleteFinance = async (id) => {
  await deleteDoc(doc(db, 'finances', id))
}

// EDITAR
export const updateFinance = async (id, data) => {
  await updateDoc(doc(db, 'finances', id), data)
}
