import { db } from "./config";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

const collectionRef = collection(db, "foundItems");

export const addItem = (item) => addDoc(collectionRef, { ...item, createdAt: Date.now() });

export const getItems = async () => {
  const q = query(collectionRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteItem = (id) => deleteDoc(doc(db, "foundItems", id));