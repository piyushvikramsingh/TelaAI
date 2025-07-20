import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration pulled from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

// Check if all Firebase environment variables are present and not placeholders
const areFirebaseVarsPresent = 
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_firebase_api_key' &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

if (areFirebaseVarsPresent) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
} else {
  console.warn(
    "Firebase environment variables are missing or are placeholders. " +
    "Firebase will not be initialized. Please create a .env file based on .env.example and add your credentials."
  );
}

export { app, analytics };
