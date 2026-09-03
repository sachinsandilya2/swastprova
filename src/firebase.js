import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAur__22cu7lSbUq_ZNUCfFxSVs-GdTQys",
  authDomain: "swastprova-fab04.firebaseapp.com",
  projectId: "swastprova-fab04",
  storageBucket: "swastprova-fab04.firebasestorage.app",
  messagingSenderId: "234784748051",
  appId: "1:234784748051:web:9be75480149da6827145e6",
  measurementId: "G-VM4Y6GDPH1",
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };