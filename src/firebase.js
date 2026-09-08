import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ==========================================
// DEBUG - CHECK ENVIRONMENT VARIABLES
// ==========================================

console.log("🔥 Firebase Config Check:");
console.log("API Key:", firebaseConfig.apiKey ? "Loaded" : "Missing");
console.log("Auth Domain:", firebaseConfig.authDomain || "Missing");
console.log("Project ID:", firebaseConfig.projectId || "Missing");
console.log(
  "Storage Bucket:",
  firebaseConfig.storageBucket || "Missing"
);
console.log(
  "Messaging Sender ID:",
  firebaseConfig.messagingSenderId || "Missing"
);
console.log("App ID:", firebaseConfig.appId ? "Loaded" : "Missing");
console.log(
  "Measurement ID:",
  firebaseConfig.measurementId || "Missing"
);

// ==========================================
// VALIDATE FIREBASE CONFIG
// ==========================================

if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  console.error(
    "❌ Firebase configuration incomplete!"
  );

  console.error(
    "👉 Check your frontend .env file."
  );
}

// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);

console.log("✅ Firebase App initialized");

// ==========================================
// FIREBASE AUTHENTICATION
// ==========================================

const auth = getAuth(app);

console.log("✅ Firebase Authentication initialized");

// ==========================================
// FIRESTORE DATABASE
// ==========================================

const db = getFirestore(app);

console.log("✅ Firestore initialized");

// ==========================================
// FIREBASE ANALYTICS
// ==========================================

let analytics = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);

      console.log(
        "✅ Firebase Analytics initialized"
      );
    } else {
      console.log(
        "ℹ️ Firebase Analytics is not supported in this browser."
      );
    }
  })
  .catch((error) => {
    console.warn(
      "⚠️ Firebase Analytics initialization failed:",
      error
    );
  });

// ==========================================
// EXPORT
// ==========================================

export {
  app,
  auth,
  db,
  analytics,
};