import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your verified Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBEwv5mdD6dkfkU7zH-f06bVo-qZJOt5Js",
  authDomain: "hackathon-98b63.firebaseapp.com",
  projectId: "hackathon-98b63",
  storageBucket: "hackathon-98b63.firebasestorage.app",
  messagingSenderId: "726732825103",
  appId: "1:726732825103:web:78e0b6885b6d6e8e98f97a",
  measurementId: "G-JNWFK75XD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services for your Auth and Data Architects
export const auth = getAuth(app);
export const db = getFirestore(app);