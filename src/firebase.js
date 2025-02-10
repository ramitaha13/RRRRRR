// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfNUdqGhUjbcKlF2v1p8x-ErSSQ_YcKw4",
  authDomain: "simplerami.firebaseapp.com",
  projectId: "simplerami",
  storageBucket: "simplerami.firebasestorage.app",
  messagingSenderId: "828142698490",
  appId: "1:828142698490:web:48ab9f8b7c9198bfcdae43",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
