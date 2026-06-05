import {
  collection, addDoc, getDocs, deleteDoc, doc, query, where,
} from 'firebase/firestore'
import { db, auth } from '../firebase/config'

const cardsRef = collection(db, 'cards')
const getUid = () => auth.currentUser?.uid

export const getCards = async () => {
  const uid = getUid()
  if (!uid) return []
  const q = query(cardsRef, where('uid', '==', uid))
  const snapshot = await getDocs(q)
  const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export const addCard = async (card) => {
  const uid = getUid()
  if (!uid) return
  return await addDoc(cardsRef, { ...card, uid })
}

export const deleteCard = async (id) => {
  await deleteDoc(doc(db, 'cards', id))
}
