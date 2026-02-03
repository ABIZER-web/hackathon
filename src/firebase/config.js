import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Add this import

const firebaseConfig = {
  apiKey: "AIzaSyBEwv5mdD6dkfkU7zH-f06bVo-qZJOt5Js",
  authDomain: "hackathon-98b63.firebaseapp.com",
  projectId: "hackathon-98b63",
  storageBucket: "hackathon-98b63.firebasestorage.app",
  messagingSenderId: "726732825103",
  appId: "1:726732825103:web:78e0b6885b6d6e8e98f97a",
  measurementId: "G-JNWFK75XD3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // 2. Add this export