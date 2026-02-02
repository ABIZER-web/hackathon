// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);