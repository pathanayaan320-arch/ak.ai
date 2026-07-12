import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0544951037",
  appId: "1:57163089505:web:43a5397819a437b12bcc20",
  apiKey: "AIzaSyDv4MltFkX80le4Z5w9CKdTukFlDEY7hTU",
  authDomain: "gen-lang-client-0544951037.firebaseapp.com",
  storageBucket: "gen-lang-client-0544951037.firebasestorage.app",
  messagingSenderId: "57163089505"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the custom database ID from the config
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, "ai-studio-202efb3e-5c3c-405d-8ae9-a1800651bc5d");

const auth = getAuth(app);

export { app, db, auth };
