// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA_s6bx74EC8BDghrRrE47fEWZDJ_2_npw",
  authDomain: "inventory-management-6ce62.firebaseapp.com",
  projectId: "inventory-management-6ce62",
  storageBucket: "inventory-management-6ce62.appspot.com",
  messagingSenderId: "24925948350",
  appId: "1:24925948350:web:8cc7afb92b5a7c04fc91ef",
  measurementId: "G-355CFZC2LX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

export { firestore };