import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const cardsRef = collection(db, 'cards')

const getUid = () => auth.currentUser?.uid

// OBTENER (filtrado por usuario)
export const getCards = async () => {
  const uid = getUid()
  if (!uid) return []

  const q = query(
    cardsRef,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}

// AGREGAR (uid ya viene desde CardForm)
export const addCard = async (card) => {
  const uid = getUid()
  if (!uid) return
  return await addDoc(cardsRef, { ...card, uid })
}

// ELIMINAR
export const deleteCard = async (id) => {
  await deleteDoc(doc(db, 'cards', id))
}
