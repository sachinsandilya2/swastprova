import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAv63qAmqkQWoLoifmjKsAVDCJfcW0DUaE",
  authDomain: "swastprova-b24f6.firebaseapp.com",
  projectId: "swastprova-b24f6",
  storageBucket: "swastprova-b24f6.firebasestorage.app",
  messagingSenderId: "780042498235",
  appId: "1:780042498235:web:4d05a5923bd0c6ac17b99e",
  measurementId: "G-RTK4FLR530",
};

const app = initializeApp(firebaseConfig);

// Firebase services
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };