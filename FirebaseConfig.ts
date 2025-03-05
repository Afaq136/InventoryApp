// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpJnNVbJcplUYYTYLJVGdPL4Sp1ZXtkgQ",
  authDomain: "invo-6bd7f.firebaseapp.com",
  projectId: "invo-6bd7f",
  storageBucket: "invo-6bd7f.firebasestorage.app",
  messagingSenderId: "458181400134",
  appId: "1:458181400134:web:f9ec149f199ca93d8b1c47",
  measurementId: "G-XHK5L1PWVH"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const db = getFirestore(FIREBASE_APP);
