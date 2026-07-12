import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";

// Configure Firebase purely from environment variables or dynamically resolved local metadata config
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigData.appId,
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigData.authDomain,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigData.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigData.messagingSenderId
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore using database ID from environment variables or fallback local configuration
const databaseId = metaEnv.VITE_FIREBASE_DATABASE_ID || firebaseConfigData.firestoreDatabaseId;

const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, databaseId);

const auth = getAuth(app);

export { app, db, auth };
